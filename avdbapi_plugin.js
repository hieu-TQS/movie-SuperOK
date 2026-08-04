// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "avdbapi",
        "name": "AVDB JAV",
        "version": "1.0.3",
        "baseUrl": "https://avdbapi.com/api.php/provide/vod",
        "iconUrl": "https://avdbapi.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "layoutType": "HORIZONTAL",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: '1', title: 'Censored', type: 'Horizontal', path: 'category' },
        { slug: '2', title: 'Uncensored', type: 'Horizontal', path: 'category' },
        { slug: '3', title: 'Uncensored Leaked', type: 'Horizontal', path: 'category' },
        { slug: '4', title: 'Amateur', type: 'Horizontal', path: 'category' },
        { slug: '5', title: 'Chinese AV', type: 'Horizontal', path: 'category' },
        { slug: '6', title: 'Western', type: 'Horizontal', path: 'category' },
        { slug: 'latest', title: 'Mới Cập Nhật', type: 'Grid', path: 'latest' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Censored', slug: '1' },
        { name: 'Uncensored', slug: '2' },
        { name: 'Uncensored Leaked', slug: '3' },
        { name: 'Amateur', slug: '4' },
        { name: 'Chinese AV', slug: '5' },
        { name: 'Western', slug: '6' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'desc' },
            { name: 'Cũ nhất', value: 'asc' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

var BASE_API = "https://avdbapi.com/api.php/provide/vod";

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var url = BASE_API + "?ac=detail&pg=" + page + "&pagesize=24";

        if (/^[1-6]$/.test(slug)) {
            url += "&t=" + slug;
        } else if (slug === 'latest') {
            // Mới cập nhật - default sort
        } else if (filters.category) {
            url += "&t=" + filters.category;
        }

        if (filters.year) url += "&year=" + filters.year;
        if (filters.sort) url += "&sort_direction=" + filters.sort;

        return url;
    } catch (e) {
        return BASE_API + "?ac=detail&pg=1&pagesize=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    return BASE_API + "?ac=detail&wd=" + encodeURIComponent(keyword) + "&pg=" + page + "&pagesize=24";
}

// getUrlDetail nhận episodeId (chính là embed URL upload18)
// App sẽ fetch URL này → nhận HTML embed → truyền vào parseDetailResponse
function getUrlDetail(episodeId) {
    // episodeId = "https://upload18.org/play/index/xxx" (embed URL)
    // Trả về chính embed URL để app fetch HTML
    if (episodeId.indexOf("http") === 0) {
        return episodeId;
    }
    // Nếu là numeric id → dùng ids= parameter (chính xác nhất)
    if (/^\d+$/.test(episodeId)) {
        return BASE_API + "?ac=detail&ids=" + episodeId;
    }
    // Fallback: nếu là slug thì dùng code= parameter (tìm theo mã phim)
    return BASE_API + "?ac=detail&code=" + encodeURIComponent(episodeId) + "&pagesize=1";
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];

        var movies = list.map(function (item) {
            return {
                id: String(item.id || ""),  // Dùng numeric API id → getUrlDetail sẽ dùng ids= parameter
                title: item.name || "",
                posterUrl: item.poster_url || "",
                backdropUrl: item.thumb_url || "",
                year: parseInt(item.year) || 0,
                quality: item.quality || "HD",
                episode_current: item.status || "",
                lang: item.movie_code || ""  // Hiện mã phim dưới title
            };
        });

        var currentPage = parseInt(response.page) || 1;
        var totalItems = parseInt(response.total) || 0;
        var itemsPerPage = parseInt(response.limit) || 24;
        var totalPages = parseInt(response.pagecount) || Math.ceil(totalItems / itemsPerPage);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var list = response.list || [];
        if (list.length === 0) return "null";

        var movie = list[0];

        // Parse episodes từ cấu trúc AVDBAPI
        // episodes: { server_name: "VIP #1", server_data: { "Full": { slug, link_embed } } }
        var servers = [];
        var eps = movie.episodes;
        if (eps) {
            var serverEpisodes = [];
            var serverData = eps.server_data || {};

            for (var epName in serverData) {
                if (serverData.hasOwnProperty(epName)) {
                    var epInfo = serverData[epName];
                    var embedUrl = epInfo.link_embed || "";
                    if (embedUrl) {
                        // Episode ID = embed URL (upload18.org)
                        // App sẽ dùng ID này gọi getStreamLink → getUrlDetail → fetch embed → parseDetailResponse
                        serverEpisodes.push({
                            id: embedUrl,
                            name: epName,
                            slug: epInfo.slug || epName.toLowerCase()
                        });
                    }
                }
            }

            if (serverEpisodes.length > 0) {
                servers.push({
                    name: eps.server_name || "Server #1",
                    episodes: serverEpisodes
                });
            }
        }

        var categories = Array.isArray(movie.category)
            ? movie.category.join(", ")
            : (movie.category || "");
        var countries = Array.isArray(movie.country)
            ? movie.country.join(", ")
            : (movie.country || "");
        var directors = Array.isArray(movie.director)
            ? movie.director.filter(function (d) { return d !== "Updating"; }).join(", ")
            : (movie.director || "");
        var actors = Array.isArray(movie.actor)
            ? movie.actor.filter(function (a) { return a !== "Updating"; }).join(", ")
            : (movie.actor || "");

        return JSON.stringify({
            id: movie.slug || movie.movie_code || "",
            title: movie.name || "",
            originName: movie.origin_name || "",
            posterUrl: movie.poster_url || "",
            backdropUrl: movie.thumb_url || "",
            description: (movie.description || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year) || 0,
            rating: 0,
            quality: movie.quality || "HD",
            duration: movie.time || "",
            servers: servers,
            episode_current: movie.status || "",
            lang: "",
            category: categories,
            country: countries,
            director: directors,
            casts: actors,
            status: movie.status || ""
        });
    } catch (error) { return "null"; }
}

// =============================================================================
// STREAM LINK - parseDetailResponse
// Nhận HTML từ embed upload18.org → trả isEmbed + url token_hash
// =============================================================================

function parseDetailResponse(embedHtml, pageUrl) {
    try {
        // Nếu response là m3u8 content → trả pageUrl để AVPlayer play trực tiếp
        if (embedHtml.indexOf("#EXTM3U") !== -1 || embedHtml.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: false,
                headers: {
                    "Referer": "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }

        // Nếu là HTML embed page → trả isEmbed: true để iOS dùng WebView
        // WebView sẽ render JWPlayer bên trong, tự xử lý m3u8 + Cloudflare cookies
        if (embedHtml.indexOf("PLAYER_CONFIG") !== -1 || embedHtml.indexOf("jwplayer") !== -1) {
            return JSON.stringify({
                url: pageUrl || "",
                isEmbed: true,
                headers: {
                    "Referer": "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }

        // Fallback: tìm link m3u8 trực tiếp
        var fallbackMatch = embedHtml.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*?)["']/);
        if (fallbackMatch) {
            return JSON.stringify({
                url: fallbackMatch[1],
                isEmbed: false,
                headers: { "Referer": "https://upload18.org/" },
                subtitles: []
            });
        }

        // Fallback cuối: trả embed URL cho WebView load trực tiếp
        return JSON.stringify({
            url: pageUrl || "",
            isEmbed: true,
            headers: {
                "Referer": "https://upload18.org/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            },
            subtitles: []
        });
    } catch (error) { return "{}"; }
}

// =============================================================================
// parseEmbedResponse - Nhận response từ token_hash endpoint
// Response = m3u8 playlist text → ExoPlayer sẽ play trực tiếp từ URL
// =============================================================================

function parseEmbedResponse(m3u8Content, tokenUrl) {
    try {
        // tokenUrl = "https://upload18.org/play/token_hash?hash=xxx"
        // m3u8Content = nội dung m3u8 playlist
        // ExoPlayer cần URL, không phải content → trả tokenUrl là URL playable
        if (m3u8Content.indexOf("#EXTM3U") !== -1 || m3u8Content.indexOf("#EXT-X-") !== -1) {
            return JSON.stringify({
                url: tokenUrl,
                headers: {
                    "Referer": "https://upload18.org/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                },
                subtitles: []
            });
        }

        return "{}";
    } catch (error) { return "{}"; }
}

// =============================================================================
// CATEGORIES / COUNTRIES / YEARS
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Censored", slug: "1" },
        { name: "Uncensored", slug: "2" },
        { name: "Uncensored Leaked", slug: "3" },
        { name: "Amateur", slug: "4" },
        { name: "Chinese AV", slug: "5" },
        { name: "Western", slug: "6" }
    ]);
}

function parseCountriesResponse(apiResponseJson) {
    return JSON.stringify([
        { name: "Japan", value: "japan" },
        { name: "China", value: "china" },
        { name: "Western", value: "western" }
    ]);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2010; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}
