// =============================================================================
// VideoCelebs Plugin (Tương thích 100% Rhino JS & Android TV)
// https://videocelebs.net/
// =============================================================================

var BASEURL = "https://videocelebs.net";

function getManifest() {
    return JSON.stringify({
        "id": "videocelebs",
        "name": "VideoCelebs",
        "description": "Kho cảnh nhạy cảm & người nổi tiếng VideoCelebs.net (HD Stream)",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://videocelebs.net/images/new2/logo.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Video Mới Nhất", "type": "Grid" },
        { "slug": "/top-rated", "title": "Đánh Giá Cao", "type": "Grid" },
        { "slug": "/most-popular", "title": "Xem Nhiều Nhất", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Nhất", value: "/" },
            { name: "Đánh Giá Cao", value: "/top-rated" },
            { name: "Xem Nhiều Nhất", value: "/most-popular" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    return [
        { name: "Nude", slug: "/tags/nude" },
        { name: "Sex", slug: "/tags/sex" },
        { name: "Topless", slug: "/tags/topless" },
        { name: "Butt", slug: "/tags/butt" },
        { name: "Explicit", slug: "/tags/explicit" },
        { name: "Lesbian", slug: "/tags/lesbian" }
    ];
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/";

        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                } else if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? filters.sort[0].value : "");
                    if (sVal) path = sVal;
                }
            }
        }

        if (page > 1) {
            if (path.charAt(path.length - 1) !== '/') path += '/';
            path += "page/" + page + "/";
        }

        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) !== "/") url = "/" + url;
            url = BASEURL + url;
        }

        return url;
    } catch (e) {
        return BASEURL + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var filters = null;
        if (typeof filtersJson === "string") {
            try { filters = JSON.parse(filtersJson); } catch (e) {}
        } else {
            filters = filtersJson;
        }
        if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
    }
    var safeKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
    if (page > 1) {
        return BASEURL + "/page/" + page + "/?s=" + safeKeyword;
    }
    return BASEURL + "/?s=" + safeKeyword;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var url = slug;
    if (url.indexOf("http") !== 0) {
        if (url.charAt(0) !== '/') url = '/' + url;
        url = BASEURL + url;
    }
    return url;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var seen = {};

        var regex = /<a[^>]+href=["'](https:\/\/videocelebs\.net\/[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = regex.exec(html)) !== null) {
            var href = match[1];
            var inner = match[2];

            if (seen[href] || href.indexOf("/embed/") > -1) continue;

            var imgMatch = inner.match(/src=["']([^"']+)["']/i) || inner.match(/data-src=["']([^"']+)["']/i);
            var titleMatch = inner.match(/alt=["']([^"']+)["']/i) || inner.match(/title=["']([^"']+)["']/i);

            var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : inner.replace(/<[^>]+>/g, '').trim();
            var poster = imgMatch ? imgMatch[1] : '';

            if (href && (title || poster)) {
                seen[href] = true;
                items.push({
                    "id": href,
                    "title": title || "VideoCelebs Item",
                    "posterUrl": poster,
                    "backdropUrl": poster,
                    "quality": "HD",
                    "year": 0
                });
            }
        }

        var currentPage = 1;
        var totalPages = 1;

        var pM = url ? url.match(/\/page\/(\d+)/) : null;
        if (pM) currentPage = parseInt(pM[1], 10);

        var maxPMatch = html.match(/page\/(\d+)/g) || [];
        for (var i = 0; i < maxPMatch.length; i++) {
            var num = parseInt(maxPMatch[i].replace(/\D/g, ''), 10);
            if (num && num > totalPages && num < 5000) totalPages = num;
        }
        if (currentPage > totalPages) totalPages = currentPage;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "VideoCelebs Item";

        var metaImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = metaImg ? metaImg[1] : "";

        var metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var description = metaDesc ? metaDesc[1].replace(/<[^>]+>/g, '').trim() : "";

        var models = "";
        var modelMatch = html.match(/video_models\s*:\s*['"]([^"']+)['"]/i);
        if (modelMatch) models = modelMatch[1];

        var tags = "";
        var tagMatch = html.match(/video_tags\s*:\s*['"]([^"']+)['"]/i);
        if (tagMatch) tags = tagMatch[1];

        var servers = [{
            "name": "Server VideoCelebs",
            "episodes": [{
                "id": url || BASEURL,
                "name": "Full Video",
                "slug": "full"
            }]
        }];

        return JSON.stringify({
            "id": url || "",
            "title": title,
            "originName": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "year": 0,
            "rating": 0,
            "quality": "HD",
            "category": tags || "Celeb, Nude",
            "country": "",
            "actor": models,
            "director": "",
            "episode_current": "Full",
            "episode_total": "1",
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

function parseDetailResponse(html, fetchedUrl) {
    try {
        var streamUrl = "";
        var vUrlMatch = html.match(/video_url\s*:\s*['"]([^"']+)['"]/i) ||
                        html.match(/video_alt_url\s*:\s*['"]([^"']+)['"]/i);

        if (vUrlMatch) {
            streamUrl = vUrlMatch[1];
        }

        if (!streamUrl) {
            var fileMatch = html.match(/(https?:\/\/[^\s"'<>]+\/get_file\/[^\s"'<>]+)/i) ||
                            html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i);
            if (fileMatch) streamUrl = fileMatch[1];
        }

        var isEmbed = false;
        var mimeType = "video/mp4";

        return JSON.stringify({
            "url": streamUrl || fetchedUrl,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": fetchedUrl || "", "isEmbed": false, "headers": {} });
    }
}

function parseEpisodePlayer(response, url) {
    return parseDetailResponse(response, url);
}

function parsePlayerUrl(response, url) {
    return parseDetailResponse(response, url);
}

function parseCategoriesResponse(apiResponseJson) { return JSON.stringify(getCachedCategories()); }
function parseCountriesResponse(apiResponseJson) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
