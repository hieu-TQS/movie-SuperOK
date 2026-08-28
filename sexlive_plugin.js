// =============================================================================
// SexLive.cc Plugin (Tương thích 100% Rhino JS & Android TV)
// https://sexlive.cc/
// =============================================================================

var BASEURL = "https://sexlive.cc";
var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "sexlive",
        "name": "SexLive",
        "description": "Kho video SexLive.cc (MMLive, QQLive, Stripchat, YYLive, FullLiveHot)",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://sexlive.cc/wp-content/uploads/2022/07/cropped-favicon-192x192.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/wp-json/wp/v2/posts?_embed=1", "title": "Mới Nhất", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=8&_embed=1", "title": "Stripchat", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=3&_embed=1", "title": "MMLive", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=6&_embed=1", "title": "YYLive", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=4&_embed=1", "title": "QQLive", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=7&_embed=1", "title": "Hot51 Live", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=13&_embed=1", "title": "FullLiveHot", "type": "Grid" },
        { "slug": "/wp-json/wp/v2/posts?categories=12&_embed=1", "title": "OnlyFans", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Nhất", value: "" },
            { name: "Stripchat", value: "8" },
            { name: "MMLive", value: "3" },
            { name: "YYLive", value: "6" },
            { name: "QQLive", value: "4" },
            { name: "Hot51 Live", value: "7" },
            { name: "FullLiveHot", value: "13" },
            { name: "Sexlive.biz", value: "608" },
            { name: "Sexlive.porn", value: "609" },
            { name: "OnlyFans", value: "12" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) {
        _cachedCategories = [
            { "name": "Tất Cả", "slug": "/wp-json/wp/v2/posts?_embed=1" },
            { "name": "Stripchat", "slug": "/wp-json/wp/v2/posts?categories=8&_embed=1" },
            { "name": "MMLive", "slug": "/wp-json/wp/v2/posts?categories=3&_embed=1" },
            { "name": "YYLive", "slug": "/wp-json/wp/v2/posts?categories=6&_embed=1" },
            { "name": "QQLive", "slug": "/wp-json/wp/v2/posts?categories=4&_embed=1" },
            { "name": "Hot51 Live", "slug": "/wp-json/wp/v2/posts?categories=7&_embed=1" },
            { "name": "FullLiveHot", "slug": "/wp-json/wp/v2/posts?categories=13&_embed=1" },
            { "name": "Sexlive.biz", "slug": "/wp-json/wp/v2/posts?categories=608&_embed=1" },
            { "name": "Sexlive.porn", "slug": "/wp-json/wp/v2/posts?categories=609&_embed=1" },
            { "name": "SexLiveMoi", "slug": "/wp-json/wp/v2/posts?categories=84&_embed=1" },
            { "name": "Hot Live", "slug": "/wp-json/wp/v2/posts?categories=78&_embed=1" },
            { "name": "Hot Idol", "slug": "/wp-json/wp/v2/posts?categories=79&_embed=1" },
            { "name": "OnlyFans", "slug": "/wp-json/wp/v2/posts?categories=12&_embed=1" },
            { "name": "789Live", "slug": "/wp-json/wp/v2/posts?categories=10&_embed=1" },
            { "name": "Bejeni Sweet", "slug": "/wp-json/wp/v2/posts?categories=22&_embed=1" },
            { "name": "Bé Ngọc", "slug": "/wp-json/wp/v2/posts?categories=14&_embed=1" },
            { "name": "Eira2004", "slug": "/wp-json/wp/v2/posts?categories=11&_embed=1" },
            { "name": "SwagLive", "slug": "/wp-json/wp/v2/posts?categories=19&_embed=1" },
            { "name": "Bigo Live", "slug": "/wp-json/wp/v2/posts?categories=80&_embed=1" },
            { "name": "Korean BJ", "slug": "/wp-json/wp/v2/posts?categories=2624&_embed=1" }
        ];
    }
    return _cachedCategories;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/wp-json/wp/v2/posts?_embed=1";

        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "number") {
                page = filtersJson;
            } else if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else if (typeof filtersJson === "object") {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? filters.sort[0].value : "");
                    if (sVal) {
                        path = "/wp-json/wp/v2/posts?categories=" + sVal + "&_embed=1";
                    }
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                }
            }
        }

        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) !== "/") url = "/" + url;
            url = BASEURL + url;
        }

        if (url.indexOf("per_page=") === -1) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "per_page=20";
        }
        if (url.indexOf("_embed") === -1) {
            url += "&_embed=1";
        }

        if (!/[?&]page=\d+/.test(url)) {
            url += "&page=" + page;
        } else {
            url = url.replace(/([?&])page=\d+/, "$1page=" + page);
        }

        return url;
    } catch (e) {
        return BASEURL + "/wp-json/wp/v2/posts?_embed=1&per_page=20&page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var filters = null;
        if (typeof filtersJson === "number") {
            page = filtersJson;
        } else if (typeof filtersJson === "string") {
            try { filters = JSON.parse(filtersJson); } catch (e) {}
        } else if (typeof filtersJson === "object") {
            filters = filtersJson;
        }
        if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
    }
    var q = keyword ? encodeURIComponent(keyword) : "";
    return BASEURL + "/wp-json/wp/v2/posts?search=" + q + "&_embed=1&per_page=20&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        return id;
    }
    if (id.charAt(0) !== "/") id = "/" + id;
    if (id.indexOf(".html") === -1 && id.indexOf("/wp-json/") === -1) {
        id += ".html";
    }
    return BASEURL + id;
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

function parseListResponse(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var items = [];
        var list = Array.isArray(json) ? json : (json.data || []);

        for (var i = 0; i < list.length; i++) {
            var post = list[i];
            if (!post) continue;

            var title = post.title ? (post.title.rendered || post.title) : "";
            if (typeof title === "string") {
                title = title.replace(/&#8211;/g, "-").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
            }

            var posterUrl = "";
            if (post._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]) {
                posterUrl = post._embedded["wp:featuredmedia"][0].source_url || "";
            }
            if (!posterUrl && post.featured_media_src_url) {
                posterUrl = post.featured_media_src_url;
            }

            var postLink = post.link || (post.slug ? (BASEURL + "/" + post.slug + ".html") : "");
            var year = 0;
            if (post.date) {
                var dMatch = String(post.date).match(/^(\d{4})/);
                if (dMatch) year = parseInt(dMatch[1], 10) || 0;
            }

            items.push({
                "id": postLink,
                "title": title || ("Video " + (post.id || (i + 1))),
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl,
                "year": year,
                "quality": "HD Live",
                "rating": ""
            });
        }

        var currentPage = 1;
        if (url) {
            var mPage = url.match(/[?&]page=(\d+)/);
            if (mPage) currentPage = parseInt(mPage[1], 10) || 1;
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": 999,
                "hasNext": items.length >= 20
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}

function parseSearchResponse(jsonStr, url) {
    return parseListResponse(jsonStr, url);
}

function parseMovieDetail(responseStr, url) {
    try {
        var title = "";
        var posterUrl = "";
        var description = "";
        var streamOrIframeUrl = "";

        if (responseStr.trim().charAt(0) === "{" || responseStr.trim().charAt(0) === "[") {
            try {
                var json = JSON.parse(responseStr);
                var post = Array.isArray(json) ? json[0] : (json.data || json);
                if (post) {
                    title = post.title ? (post.title.rendered || post.title) : "";
                    if (post._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]) {
                        posterUrl = post._embedded["wp:featuredmedia"][0].source_url || "";
                    }
                    description = post.content ? (post.content.rendered || post.content) : "";
                    streamOrIframeUrl = post.link || url;
                }
            } catch (je) {}
        }

        if (!title || !streamOrIframeUrl) {
            var tMatch = responseStr.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                         responseStr.match(/<meta property="og:title" content="([^"]*)"/i) ||
                         responseStr.match(/<title>([^<]*)<\/title>/i);
            if (tMatch) title = tMatch[1].replace(/<[^>]+>/g, "").trim();

            var imgMatch = responseStr.match(/<meta property="og:image" content="([^"]*)"/i) ||
                           responseStr.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]*)"/i);
            if (imgMatch) posterUrl = imgMatch[1].trim();

            var descMatch = responseStr.match(/<meta property="og:description" content="([^"]*)"/i) ||
                            responseStr.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
            if (descMatch) description = descMatch[1].replace(/<[^>]+>/g, " ").trim();

            var iframeMatch = responseStr.match(/<iframe\s+[^>]*src=["']([^"']+)["']/i);
            if (iframeMatch) {
                streamOrIframeUrl = iframeMatch[1].trim();
            } else {
                var mMeta = responseStr.match(/<meta\s+name=["']uuuu["']\s+content=["']([^"']+\.m3u8[^"']*)["']/i);
                if (mMeta) streamOrIframeUrl = mMeta[1].trim();
                else {
                    var mFile = responseStr.match(/["']file["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
                    if (mFile) streamOrIframeUrl = mFile[1].replace(/\\\//g, "/").trim();
                }
            }
        }

        if (!streamOrIframeUrl) {
            streamOrIframeUrl = url || "";
        }

        if (title) {
            title = title.replace(/&#8211;/g, "-").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").trim();
        }

        var epList = [{
            "id": streamOrIframeUrl,
            "name": "Full Live",
            "slug": "full"
        }];

        var serverEpisodes = [{
            "name": "SexLive Stream",
            "episodes": epList
        }];

        return JSON.stringify({
            "id": url || "",
            "title": title || "SexLive Video",
            "originName": "",
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "year": 2026,
            "rating": 5.0,
            "quality": "Full HD",
            "category": "Live Stream, Gái Xinh",
            "country": "Việt Nam",
            "episode_current": "Full",
            "episode_total": "1",
            "servers": serverEpisodes
        });
    } catch (e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetail(responseStr, url) {
    return parseMovieDetail(responseStr, url);
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";

        var mMeta = html.match(/<meta\s+name=["']uuuu["']\s+content=["']([^"']+\.m3u8[^"']*)["']/i);
        if (mMeta && mMeta[1]) {
            return JSON.stringify({
                "url": mMeta[1],
                "isEmbed": false,
                "mimeType": "application/x-mpegURL",
                "headers": {
                    "Referer": "https://go.qooglevideo.shop/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }

        var mFile = html.match(/sources:\s*\[\s*\{\s*["']file["']\s*:\s*["']([^"']+)["']/i) ||
                    html.match(/["']file["']\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
        if (mFile && mFile[1]) {
            var cleanUrl = mFile[1].replace(/\\\//g, "/");
            return JSON.stringify({
                "url": cleanUrl,
                "isEmbed": false,
                "mimeType": "application/x-mpegURL",
                "headers": {
                    "Referer": "https://go.qooglevideo.shop/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }

        var iframeMatch = html.match(/<iframe\s+[^>]*src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
            return JSON.stringify({
                "url": iframeMatch[1].trim(),
                "isEmbed": true,
                "mimeType": "text/html",
                "headers": {
                    "Referer": BASEURL + "/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }

        var isEmbed = streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1;
        var mimeType = isEmbed ? "text/html" : (streamUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4");

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": {} });
    }
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(response, url) {
    return parseDetailResponse(response, url);
}

function parsePlayerUrl(response, url) {
    return parseDetailResponse(response, url);
}

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
