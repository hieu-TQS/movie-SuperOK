// =============================================================================
// ChineseAV Plugin (Tương thích 100% Rhino JS & Android TV)
// https://chineseav.xyz/
// =============================================================================

var API_BASE = "https://chavapi.freeaav.xyz";
var API_TOKEN = "chineseav_2026_secret";
var BASEURL = "https://chineseav.xyz";

var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "chineseav",
        "name": "強國AV (ChineseAV)",
        "description": "Nguồn phim Chinese AV tuyển chọn đặc sắc.",
        "info": "Nguồn phim Chinese AV tuyển chọn đặc sắc.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://chineseav.xyz/images/logo.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/videos?sort=newest", "title": "Mới Cập Nhật", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("麻豆传媒"), "title": "麻豆传媒 (Ma D豆)", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("91制片厂"), "title": "91制片厂", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("天美传媒"), "title": "天美传媒", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("果冻传媒"), "title": "果冻传媒", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("SWAG Live"), "title": "SWAG Live", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("Hong Kong Doll"), "title": "Hong Kong Doll", "type": "Grid" },
        { "slug": "/api/videos/by-category?cat=" + encodeURIComponent("吴梦梦频道"), "title": "吴梦梦频道", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Cập Nhật", value: "newest" },
            { name: "Xem Nhiều", value: "views" },
            { name: "Yêu Thích", value: "likes" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) {
        var defaultCats = [
            "麻豆传媒", "91制片厂", "天美传媒", "果冻传媒", "精东影业",
            "蜜桃传媒", "SWAG Live", "Hong Kong Doll", "吴梦梦频道",
            "SA国际传媒", "Pussy Hunter", "星空无限传媒", "皇家华人",
            "日本无码中字", "亞裔素人網紅", "國產AV"
        ];
        var list = [];
        for (var i = 0; i < defaultCats.length; i++) {
            list.push({
                "name": defaultCats[i],
                "slug": "/api/videos/by-category?cat=" + encodeURIComponent(defaultCats[i])
            });
        }
        _cachedCategories = list;
    }
    return _cachedCategories;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/api/videos?sort=newest";

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
                        path = "/api/videos?sort=" + sVal;
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
            url = API_BASE + url;
        }

        if (url.indexOf("token=") === -1) {
            url += (url.indexOf("?") > -1 ? "&" : "?") + "token=" + API_TOKEN;
        }

        if (!/[?&]page=\d+/.test(url)) {
            url += "&page=" + page;
        } else {
            url = url.replace(/([?&])page=\d+/, "$1page=" + page);
        }

        return url;
    } catch (e) {
        return API_BASE + "/api/videos?sort=newest&page=1&token=" + API_TOKEN;
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
    return API_BASE + "/api/search?q=" + q + "&token=" + API_TOKEN;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        if (id.indexOf("/api/video/") > -1) {
            id = id.split("/api/video/")[1];
        } else {
            var parts = id.split("/");
            id = parts[parts.length - 1];
        }
    }
    if (id.indexOf("?") > -1) id = id.split("?")[0];
    return API_BASE + "/api/video/" + id + "?token=" + API_TOKEN;
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

function formatDuration(seconds) {
    if (!seconds) return "";
    var sec = parseInt(seconds, 10) || 0;
    if (sec <= 0) return "";
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
}

function parseListResponse(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var items = [];
        var list = (json.data && Array.isArray(json.data)) ? json.data : (Array.isArray(json) ? json : []);

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (!item) continue;

            var id = item.id || item.rowid;
            if (!id) continue;

            var title = item.title || ("Video " + id);
            var posterUrl = item.thumbnail || "";
            var backdropUrl = posterUrl;
            var duration = formatDuration(item.duration);
            var quality = duration ? duration : (item.categories || "HD");

            items.push({
                "id": String(id),
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": backdropUrl,
                "year": 0,
                "quality": quality,
                "rating": item.likes ? String(item.likes) : ""
            });
        }

        var currentPage = 1;
        if (url) {
            var mPage = url.match(/[?&]page=(\d+)/);
            if (mPage) currentPage = parseInt(mPage[1], 10) || 1;
        }

        var hasNext = json.next ? true : (items.length >= 20);

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": 999,
                "hasNext": hasNext
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

function parseMovieDetail(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var item = (json.data && !Array.isArray(json.data)) ? json.data : json;

        var id = String(item.id || item.rowid || "");
        var title = item.title || "ChineseAV Video";
        var posterUrl = item.thumbnail || "";
        var backdropUrl = posterUrl;
        var description = item.description || "";
        var category = item.categories || item.tags || "國產AV";
        var videoUrl = item.video_url || "";
        var duration = formatDuration(item.duration);

        var epList = [{
            "id": videoUrl,
            "name": duration ? ("Full (" + duration + ")") : "Full Video",
            "slug": "full"
        }];

        var serverEpisodes = [{
            "name": "ChineseAV HD",
            "episodes": epList
        }];

        return JSON.stringify({
            "id": id,
            "title": title,
            "originName": "",
            "posterUrl": posterUrl,
            "backdropUrl": backdropUrl,
            "description": description,
            "year": 2026,
            "rating": parseFloat(item.likes) || 5.0,
            "quality": "Full HD 1080p",
            "category": category,
            "country": "Trung Quốc",
            "episode_current": "Full",
            "episode_total": "1",
            "servers": serverEpisodes
        });
    } catch (e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetail(jsonStr, url) {
    return parseMovieDetail(jsonStr, url);
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";
        var isEmbed = false;
        var mimeType = "video/mp4";

        if (streamUrl.indexOf(".m3u8") > -1) {
            mimeType = "application/x-mpegURL";
        }

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
        return JSON.stringify({ "url": url || "", "isEmbed": false, "headers": {} });
    }
}

function parseEpisodePlayer(response, url) {
    return parseDetailResponse(response, url);
}

function parsePlayerUrl(response, url) {
    return parseDetailResponse(response, url);
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var json = JSON.parse(apiResponseJson);
        var list = json.data || [];
        var cats = [];
        for (var i = 0; i < list.length; i++) {
            var cName = list[i];
            if (typeof cName === "string" && cName.length > 0) {
                cats.push({
                    "name": cName,
                    "slug": "/api/videos/by-category?cat=" + encodeURIComponent(cName)
                });
            }
        }
        if (cats.length > 0) {
            _cachedCategories = cats;
            return JSON.stringify(cats);
        }
    } catch (e) {}
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
