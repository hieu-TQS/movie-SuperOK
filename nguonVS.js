// =============================================================================
// NGUỒN VS — https://nguon.vsphim.com
// API tương thích MacCMS/OPhim (danh-sach, phim, tim-kiem, the-loai, quoc-gia, nam)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "vsphim",
        "name": "VSPhim",
        "version": "1.2.0",
        "baseUrl": "https://nguon.vsphim.com",
        "iconUrl": "",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    // Chỉ dùng các slug đã kiểm tra thực tế có phim:
    // - danh-sach/phim-moi-cap-nhat: toàn bộ 23.000+ phim (mới nhất trước)
    // - the-loai/vietsub (1.467 phim), the-loai/viet-sub (60 phim)
    // - nam/<năm>: 2026 = 6.448 phim
    // Các slug thể loại cũ (hanh-dong, tinh-cam...) trả 0 phim trên nguồn này.
    return JSON.stringify([
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' },
        { slug: 'vietsub', title: 'Vietsub', type: 'Horizontal', path: 'the-loai' },
        { slug: 'viet-sub', title: 'Viet Sub', type: 'Horizontal', path: 'the-loai' },
        { slug: 'nam-2026', title: 'Phim 2026', type: 'Horizontal', path: 'nam' },
        { slug: 'nam-2025', title: 'Phim 2025', type: 'Horizontal', path: 'nam' },
        { slug: 'nam-2024', title: 'Phim 2024', type: 'Horizontal', path: 'nam' },
        { slug: 'nam-2023', title: 'Phim 2023', type: 'Horizontal', path: 'nam' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(buildCategories());
}

// Thể loại thực tế có phim trên nguồn (đã xác minh qua API):
// mọi phim đều gắn 2 tag này; các tag khác trong /api/the-loai đa số trả 0 phim.
function buildCategories() {
    return [
        { name: 'Vietsub', slug: 'vietsub' },
        { name: 'Viet Sub', slug: 'viet-sub' }
    ];
}

function getFilterConfig() {
    var years = [];
    for (var y = 2026; y >= 2001; y--) {
        years.push({ name: String(y), value: String(y) });
    }
    return JSON.stringify({
        sort: [],
        type: [
            { name: 'Tất cả', value: '' },
            { name: 'Phim bộ', value: 'series' },
            { name: 'Phim lẻ', value: 'single' }
        ],
        years: years,
        category: buildCategories()
    });
}


// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlHome() {
    return "https://nguon.vsphim.com/api/danh-sach/phim-moi-cap-nhat";
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        // Ưu tiên bộ lọc người dùng chọn, sau đó mới tới slug của section
        var url = "";
        if (filters.year) {
            url = "https://nguon.vsphim.com/api/nam/" + encodeURIComponent(filters.year);
        } else if (filters.category) {
            url = "https://nguon.vsphim.com/api/the-loai/" + encodeURIComponent(filters.category);
        } else if (filters.country) {
            url = "https://nguon.vsphim.com/api/quoc-gia/" + encodeURIComponent(filters.country);
        } else if (slug === 'phim-moi-cap-nhat') {
            url = "https://nguon.vsphim.com/api/danh-sach/phim-moi-cap-nhat";
        } else if (slug && slug.indexOf('nam-') === 0) {
            url = "https://nguon.vsphim.com/api/nam/" + slug.substring(4);
        } else if (slug && slug !== 'danh-sach') {
            url = "https://nguon.vsphim.com/api/the-loai/" + slug;
        } else {
            url = "https://nguon.vsphim.com/api/danh-sach";
        }

        url += "?page=" + page + "&limit=" + limit;
        if (filters.type) url += "&type=" + encodeURIComponent(filters.type);
        if (filters.status) url += "&status=" + encodeURIComponent(filters.status);
        return url;
    } catch (e) {
        return "https://nguon.vsphim.com/api/danh-sach?page=1&limit=24";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch (e) {}
    var page = filters.page || 1;
    var limit = filters.limit || 24;
    return "https://nguon.vsphim.com/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=" + limit;
}

function getSearchUrl(keyword, pageOrFilters) {
    if (typeof pageOrFilters === 'object') {
        return getUrlSearch(keyword, JSON.stringify(pageOrFilters));
    }
    var page = pageOrFilters || 1;
    return "https://nguon.vsphim.com/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=24";
}

function getUrlDetail(slug) {
    return "https://nguon.vsphim.com/api/phim/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return "https://nguon.vsphim.com/api/the-loai"; }
function getUrlCountries() { return "https://nguon.vsphim.com/api/quoc-gia"; }
function getUrlYears() { return "https://nguon.vsphim.com/api/nam"; }

// =============================================================================
// LIST PARSER
// =============================================================================

function parseListResponse(apiResponseJson, url) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.items || [];
        var pag = response.pagination || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.poster_url || item.thumb_url),
                backdropUrl: getImageUrl(item.thumb_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        });

        var limit = parseInt(pag.totalItemsPerPage, 10) || 24;
        var currentPage = parseInt(pag.currentPage, 10) || 1;
        var totalPages = parseInt(pag.totalPages, 10) || 1;
        var hasNext = currentPage < totalPages;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: pag.totalItems || movies.length,
                itemsPerPage: limit,
                nextPage: hasNext ? currentPage + 1 : null,
                hasNext: hasNext,
                hasPrevious: currentPage > 1
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseList(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseSearchResult(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseHomeResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

// =============================================================================
// DETAIL PARSER
// =============================================================================

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || {};
        var rawEpisodes = response.episodes || [];

        var servers = [];
        for (var s = 0; s < rawEpisodes.length; s++) {
            var server = rawEpisodes[s];
            var episodes = [];
            if (server.server_data) {
                for (var e = 0; e < server.server_data.length; e++) {
                    var ep = server.server_data[e];
                    var link = ep.link_m3u8 || ep.link_embed || "";
                    if (link) {
                        episodes.push({ id: link, name: ep.name || "", slug: ep.slug || "" });
                    }
                }
            }
            if (episodes.length > 0) {
                servers.push({ name: server.server_name || "Server", episodes: episodes });
            }
        }

        var cats = [];
        if (movie.category) { for (var c = 0; c < movie.category.length; c++) cats.push(movie.category[c].name); }
        var cons = [];
        if (movie.country) { for (var k = 0; k < movie.country.length; k++) cons.push(movie.country[k].name); }
        var dirs = [];
        if (movie.director) { for (var d = 0; d < movie.director.length; d++) dirs.push(movie.director[d]); }
        var acts = [];
        if (movie.actor) { for (var a = 0; a < movie.actor.length; a++) acts.push(movie.actor[a]); }

        return JSON.stringify({
            id: movie.slug,
            title: movie.name,
            originName: movie.origin_name || "",
            posterUrl: getImageUrl(movie.poster_url || movie.thumb_url),
            backdropUrl: getImageUrl(movie.thumb_url || movie.poster_url),
            description: (movie.content || movie.name || "").replace(/<[^>]*>/g, ""),
            year: movie.year || 0,
            rating: 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            episode_total: movie.episode_total || "",
            lang: movie.lang || "",
            status: movie.status || "",
            type: movie.type || "",
            time: movie.time || "",
            category: cats.join(", "),
            country: cons.join(", "),
            director: dirs.join(", "),
            casts: acts.join(", "),
            trailerUrl: movie.trailer_url || ""
        });
    } catch (error) { return "null"; }
}

function parseDetail(apiResponseJson) {
    return parseMovieDetail(apiResponseJson);
}

// =============================================================================
// PLAYER RESOLUTION
// =============================================================================

// Kiểm tra URL có phải là file media trực tiếp (m3u8/mp4) hay là trang embed
function isDirectMedia(u) {
    if (!u) return false;
    var lower = u.toLowerCase();
    return lower.indexOf(".m3u8") > -1 || lower.indexOf(".mp4") > -1
        || lower.indexOf(".webm") > -1 || lower.indexOf("/master.m3u8") > -1
        || lower.indexOf("/index.m3u8") > -1;
}

// Tạo PlayerUrlInfo chuẩn cho app (url, headers, isEmbed, subtitles)
function buildPlayerInfo(url, referer) {
    if (!url) return JSON.stringify({ url: "", headers: {}, subtitles: [] });
    var isEmbed = !isDirectMedia(url);
    var ref = referer || "https://nguon.vsphim.com/";
    return JSON.stringify({
        url: url,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": ref
        },
        isEmbed: isEmbed,
        subtitles: []
    });
}

// Tải trang embed ngay trong JS (Rhino chạy trên Android nên gọi được Java)
// Giúp trả link m3u8 trực tiếp cho ExoPlayer, không phụ thuộc app.
function httpGet(url) {
    try {
        var conn = new java.net.URL(url).openConnection();
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        conn.setRequestProperty("Referer", "https://nguon.vsphim.com/");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        conn.connect();
        var is = conn.getInputStream();
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, "UTF-8"));
        var sb = new java.lang.StringBuilder();
        var line;
        while ((line = reader.readLine()) !== null) {
            sb.append(line).append("\n");
        }
        reader.close();
        return sb.toString();
    } catch (e) {
        return "";
    }
}

// Trích link media trực tiếp từ HTML trang embed (trả "" nếu không tìm thấy)
function extractStreamUrl(html) {
    if (!html) return "";
    var found = "";

    // 1) Link HLS .m3u8 trực tiếp (kể cả dạng JSON-escaped \/)
    var m3u8s = html.match(/https?:\\?\/\\?\/[^"'\s<>]+?\.m3u8[^"'\s<>]*/gi);
    if (m3u8s && m3u8s.length > 0) {
        found = m3u8s[0].replace(/\\\//g, "/");
    }

    // 2) sv3.streamvsphim.top: URL được ghép động
    //    const baseUrl = 'https://sv3.streamvsphim.top';
    //    const videoHash = '<hash>';
    //    playerSource = baseUrl + '/stream/' + videoHash + '/master.m3u8';
    if (!found) {
        var bm = html.match(/const\s+baseUrl\s*=\s*['"]([^'"]+)['"]/i);
        var hm = html.match(/const\s+videoHash\s*=\s*['"]([^'"]+)['"]/i);
        var dm = html.match(/data-hash=["']([^"']+)["']/i);
        if (bm && (hm || dm)) {
            var b = bm[1].replace(/\\\//g, "/");
            if (b.charAt(b.length - 1) === "/") b = b.substring(0, b.length - 1);
            var h = hm ? hm[1] : dm[1];
            found = b + "/stream/" + h + "/master.m3u8";
        }
    }

    // 3) file/src trong JSON nhúng (JWPlayer, Hls.js, Plyr...)
    if (!found) {
        var fm = html.match(/["'](file|src|url|vid)["']\s*:\s*["']([^"']+)["']/i);
        if (fm && fm[2]) {
            var v = fm[2].replace(/\\\//g, "/");
            if (v.indexOf("//") === 0) v = "https:" + v;
            if (v.indexOf("http") === 0) {
                var low = v.toLowerCase();
                if (low.indexOf(".js") === -1) found = v;
            }
        }
    }

    // 4) <video src> / <source src>
    if (!found) {
        var vs = html.match(/<source[^>]+src=["']([^"']+)["']/i)
                || html.match(/<video[^>]+src=["']([^"']+)["']/i);
        if (vs && vs[1]) {
            var vv = vs[1].replace(/\\\//g, "/");
            if (vv.indexOf("//") === 0) vv = "https:" + vv;
            found = vv;
        }
    }

    // 5) og:video
    if (!found) {
        var og = html.match(/property=["']og:video["'][^>]*content=["']([^"']+)["']/i)
                || html.match(/content=["']([^"']+)["'][^>]*property=["']og:video["']/i);
        if (og && og[1]) found = og[1];
    }

    return found;
}

function parseDetailResponse(apiResponseJson, streamUrl) {
    try {
        // Nếu đã có sẵn URL tập phim cụ thể (streamUrl):
        // - URL media trực tiếp (m3u8/mp4) → phát thẳng bằng ExoPlayer
        // - URL trang embed → tự tải trang ngay trong JS để giải ra m3u8 thật
        if (streamUrl && streamUrl.indexOf("http") === 0) {
            if (!isDirectMedia(streamUrl)) {
                var html = httpGet(streamUrl);
                var resolved = extractStreamUrl(html);
                if (resolved && isDirectMedia(resolved)) {
                    return buildPlayerInfo(resolved, streamUrl);
                }
            }
            return buildPlayerInfo(streamUrl);
        }

        // Fallback: phân giải từ JSON chi tiết (chọn server/episode đầu tiên)
        var response = JSON.parse(apiResponseJson);
        var episodes = response.episodes || [];

        var pickedUrl = "";
        if (episodes.length > 0) {
            var firstServer = episodes[0];
            if (firstServer.server_data && firstServer.server_data.length > 0) {
                var firstEp = firstServer.server_data[0];
                pickedUrl = firstEp.link_m3u8 || firstEp.link_embed || "";
            }
        }
        return buildPlayerInfo(pickedUrl);
    } catch (error) { return "{}"; }
}

function parsePlayerUrl(apiResponseJson, streamUrl) {
    return parseDetailResponse(apiResponseJson, streamUrl);
}

function parsePlayerResponse(apiResponseJson, streamUrl) {
    return parseDetailResponse(apiResponseJson, streamUrl);
}

function parseEpisodePlayer(apiResponseJson, streamUrl) {
    return parseDetailResponse(apiResponseJson, streamUrl);
}

// Phân giải trang embed để tìm link media trực tiếp (m3u8/mp4) nếu có
function parseEmbedResponse(html, url) {
    try {
        if (!html) return "{}";
        var found = extractStreamUrl(html);
        if (!found) return "{}";

        var isEmbed = !isDirectMedia(found);
        // Referer: dùng chính trang embed (sv3.streamvsphim.top) để CDN không chặn
        var ref = url || "https://sv3.streamvsphim.top/";
        return JSON.stringify({
            url: found,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": ref
            },
            isEmbed: isEmbed,
            subtitles: []
        });
    } catch (e) { return "{}"; }
}

// =============================================================================
// CATEGORIES / COUNTRIES / YEARS
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson);
        var items = (r.data && r.data.items) || r.items || [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (!it || !it.slug) continue;
            var name = it.name || it.slug;
            // Lọc bỏ tag rác dạng câu dài (API trả gần 10.000 tag, đa số không có phim)
            if (name.length > 50 || name.indexOf(",") > -1) continue;
            out.push({ name: name, slug: it.slug });
        }
        return JSON.stringify(out);
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson);
        var items = (r.data && r.data.items) || r.items || [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it && it.slug) {
                out.push({ name: it.name || it.slug, value: it.slug, slug: it.slug });
            }
        }
        return JSON.stringify(out);
    } catch (e) { return "[]"; }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var r = JSON.parse(apiResponseJson);
        var items = (r.data && r.data.items) || r.items || [];
        var out = [];
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (it && it.slug) {
                out.push({ name: it.name || it.slug, slug: it.slug });
            }
        }
        return JSON.stringify(out);
    } catch (e) { return "[]"; }
}

// =============================================================================
// HELPERS
// =============================================================================

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0 || path.indexOf("//") === 0) return path;
    if (path.charAt(0) === "/") return "https://nguon.vsphim.com" + path;
    return "https://nguon.vsphim.com/" + path;
}
