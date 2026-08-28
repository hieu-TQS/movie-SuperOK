// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var BASEURL = "https://phimapi.com";

function getManifest() {
    return JSON.stringify({
        "id": "hh3d",
        "name": "HH3D - Hoạt Hình 3D",
        "version": "1.0.0",
        "description": "Kho phim Hoạt Hình 3D Trung Quốc siêu hay, chất lượng FHD.",
        "info": "Kho phim Hoạt Hình 3D Trung Quốc siêu hay, chất lượng FHD.",
        "baseUrl": "https://phimapi.com",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/hh3d.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[hh3d] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[hh3d] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'hoat-hinh', title: 'Hoạt Hình 3D Mới Cập Nhật', type: 'Grid', path: 'danh-sach' },
        { slug: 'trung-quoc', title: 'Hoạt Hình Trung Quốc', type: 'Horizontal', path: 'quoc-gia' },
        { slug: 'tien-hiep', title: 'Tiên Hiệp 3D', type: 'Horizontal', path: 'the-loai' },
        { slug: 'huyen-huyen', title: 'Huyền Huyễn 3D', type: 'Horizontal', path: 'the-loai' },
        { slug: 'co-trang', title: 'Cổ Trang 3D', type: 'Horizontal', path: 'the-loai' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Hoạt Hình 3D', slug: 'hoat-hinh' },
        { name: 'Trung Quốc', slug: 'quoc-gia/trung-quoc' },
        { name: 'Tiên Hiệp', slug: 'the-loai/tien-hiep' },
        { name: 'Huyền Huyễn', slug: 'the-loai/huyen-huyen' },
        { name: 'Kiếm Hiệp', slug: 'the-loai/kiem-hiep' },
        { name: 'Cổ Trang', slug: 'the-loai/co-trang' },
        { name: 'Xuyên Không', slug: 'the-loai/xuyen-khong' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Trùng Sinh', slug: 'the-loai/trung-sinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        var baseUrl = "https://phimapi.com/v1/api";
        var finalPath = "";

        if (slug === 'hoat-hinh' || slug === 'phim-bo' || slug === 'phim-le') {
            finalPath = "/danh-sach/" + slug;
        } else if (slug === 'trung-quoc' || slug === 'quoc-gia/trung-quoc') {
            finalPath = "/quoc-gia/trung-quoc";
        } else if (slug.indexOf('the-loai/') === 0) {
            finalPath = "/the-loai/" + slug.replace('the-loai/', '');
        } else if (slug.indexOf('quoc-gia/') === 0) {
            finalPath = "/quoc-gia/" + slug.replace('quoc-gia/', '');
        } else if (filters.category) {
            finalPath = "/the-loai/" + filters.category;
        } else {
            finalPath = "/the-loai/" + slug;
        }

        var url = baseUrl + finalPath + "?page=" + page + "&limit=" + limit;

        if (slug !== 'hoat-hinh' && finalPath.indexOf('danh-sach') === -1) {
            url += "&category=hoat-hinh";
        }

        if (filters.sort) {
            url += "&sort_field=" + filters.sort;
        }

        return url;
    } catch (e) {
        return "https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&limit=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;
        return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword.trim()) + "&page=" + page + "&limit=" + limit;
    } catch (e) {
        return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=1&limit=24";
    }
}

function getUrlDetail(slug) {
    var cleanSlug = slug;
    if (cleanSlug.indexOf("http") === 0) {
        var parts = cleanSlug.split('/');
        cleanSlug = parts[parts.length - 1];
    }
    if (cleanSlug.startsWith("/")) cleanSlug = cleanSlug.substring(1);
    if (cleanSlug.startsWith("phim/")) cleanSlug = cleanSlug.substring(5);

    return "https://phimapi.com/v1/api/phim/" + cleanSlug;
}

function getUrlCategories() { return "https://phimapi.com/v1/api/the-loai"; }
function getUrlCountries() { return "https://phimapi.com/v1/api/quoc-gia"; }
function getUrlYears() { return "https://phimapi.com/v1/api/nam-phat-hanh"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = data.items || [];
        var params = data.params || {};
        var pagination = params.pagination || {};

        var movies = items.map(function (item) {
            var poster = item.poster_url || "";
            var thumb = item.thumb_url || "";
            if (poster && poster.indexOf("http") !== 0) poster = "https://phimimg.com/" + poster;
            if (thumb && thumb.indexOf("http") !== 0) thumb = "https://phimimg.com/" + thumb;

            return {
                id: item.slug,
                title: item.name,
                posterUrl: poster || thumb,
                backdropUrl: thumb || poster,
                year: item.year || 0,
                quality: item.quality || "FHD",
                episode_current: item.episode_current || "",
                lang: item.lang || "Vietsub"
            };
        });

        var totalItems = pagination.totalItems || movies.length;
        var perPage = pagination.totalItemsPerPage || 24;
        var totalPages = pagination.totalPages || Math.ceil(totalItems / perPage) || 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: perPage
            }
        });
    } catch (error) {
        log("parseListResponse error: " + error);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = (response.data && response.data.item) || response.movie || {};
        var rawEpisodes = (movie && movie.episodes) || response.episodes || [];

        var servers = [];
        for (var s = 0; s < rawEpisodes.length; s++) {
            var server = rawEpisodes[s];
            var episodes = [];
            if (server.server_data) {
                for (var e = 0; e < server.server_data.length; e++) {
                    var ep = server.server_data[e];
                    var epLink = ep.link_m3u8 || ep.link_embed || "";
                    if (epLink) {
                        episodes.push({
                            id: epLink,
                            name: ep.name || ("Tập " + (e + 1)),
                            slug: ep.slug || ("tap-" + (e + 1))
                        });
                    }
                }
            }
            if (episodes.length > 0) {
                servers.push({
                    name: server.server_name || ("Server " + (s + 1)),
                    episodes: episodes
                });
            }
        }

        var rating = 0;
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = movie.tmdb.vote_average;
        }

        var categories = [];
        if (movie.category) {
            for (var c = 0; c < movie.category.length; c++) {
                categories.push(movie.category[c].name);
            }
        }
        var countries = [];
        if (movie.country) {
            for (var ct = 0; ct < movie.country.length; ct++) {
                countries.push(movie.country[ct].name);
            }
        }

        var poster = movie.poster_url || "";
        var thumb = movie.thumb_url || "";
        if (poster && poster.indexOf("http") !== 0) poster = "https://phimimg.com/" + poster;
        if (thumb && thumb.indexOf("http") !== 0) thumb = "https://phimimg.com/" + thumb;

        return JSON.stringify({
            id: movie.slug,
            title: movie.name,
            originName: movie.origin_name || "",
            posterUrl: poster || thumb,
            backdropUrl: thumb || poster,
            description: (movie.content || "").replace(/<[^>]*>/g, ""),
            year: movie.year || 0,
            rating: rating || 9.0,
            quality: movie.quality || "FHD",
            servers: servers,
            episode_current: movie.episode_current || "",
            episode_total: movie.episode_total || "",
            lang: movie.lang || "Vietsub",
            status: movie.status || "",
            category: categories.join(", "),
            country: countries.join(", "),
            director: (movie.director && movie.director.length > 0) ? movie.director.join(", ") : "",
            casts: (movie.actor && movie.actor.length > 0) ? movie.actor.join(", ") : ""
        });
    } catch (error) {
        log("parseMovieDetail error: " + error);
        return JSON.stringify({ id: "error", title: "", servers: [] });
    }
}

function parseDetailResponse(apiResponseJson, requestedUrl) {
    try {
        var streamUrl = requestedUrl || "";

        if (streamUrl.indexOf("player.phimapi.com/player/?url=") !== -1) {
            var raw = streamUrl.split("player/?url=")[1];
            if (raw) {
                streamUrl = decodeURIComponent(raw);
            }
        } else if (streamUrl.indexOf("http") === 0) {
            // Direct link
        } else if (typeof apiResponseJson === 'string' && apiResponseJson.indexOf("http") === 0) {
            streamUrl = apiResponseJson;
        } else {
            var response = JSON.parse(apiResponseJson);
            var movie = (response.data && response.data.item) || response.movie || {};
            var episodes = (movie && movie.episodes) || response.episodes || [];
            if (episodes.length > 0 && episodes[0].server_data && episodes[0].server_data.length > 0) {
                var firstEp = episodes[0].server_data[0];
                streamUrl = firstEp.link_m3u8 || firstEp.link_embed || "";
                if (streamUrl.indexOf("player.phimapi.com/player/?url=") !== -1) {
                    var r = streamUrl.split("player/?url=")[1];
                    if (r) streamUrl = decodeURIComponent(r);
                }
            }
        }

        return JSON.stringify({
            url: streamUrl,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://phimapi.com/"
            },
            subtitles: []
        });
    } catch (error) {
        return JSON.stringify({
            url: requestedUrl || "",
            headers: {}
        });
    }
}

function parsePlayerUrl(apiResponseJson, requestedUrl) {
    return parseDetailResponse(apiResponseJson, requestedUrl);
}

function parseEpisodePlayer(apiResponseJson, requestedUrl) {
    return parseDetailResponse(apiResponseJson, requestedUrl);
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data && response.data.items ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: i.name, slug: "the-loai/" + i.slug }; }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
