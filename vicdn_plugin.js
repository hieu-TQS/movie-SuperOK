// =============================================================================
// ViCDN Plugin (Tương thích 100% Rhino JS & Android TV)
// https://vicdn.cc/
// =============================================================================

var BASEURL = "https://vicdn.cc";
var TMDB_IMG_POSTER = "https://image.tmdb.org/t/p/w400";
var TMDB_IMG_BANNER = "https://image.tmdb.org/t/p/w1280";
var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "vicdn",
        "name": "ViCDN",
        "description": "Kho phim Thuyết Minh, Phụ Đề Song Ngữ ViCDN.cc",
        "version": "1.0.1",
        "baseUrl": BASEURL,
        "iconUrl": "https://vicdn.cc/vicdn.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/update", "title": "Mới Cập Nhật", "type": "Grid" },
        { "slug": "/api/type/hanh-dong", "title": "Hành Động", "type": "Grid" },
        { "slug": "/api/type/hoat-hinh", "title": "Hoạt Hình", "type": "Grid" },
        { "slug": "/api/type/vien-tuong", "title": "Viễn Tưởng", "type": "Grid" },
        { "slug": "/api/type/hinh-su", "title": "Hình Sự", "type": "Grid" },
        { "slug": "/api/type/bi-an", "title": "Bí Ẩn", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Cập Nhật", value: "/api/update" },
            { name: "Hành Động", value: "/api/type/hanh-dong" },
            { name: "Hoạt Hình", value: "/api/type/hoat-hinh" },
            { name: "Viễn Tưởng", value: "/api/type/vien-tuong" },
            { name: "Hình Sự", value: "/api/type/hinh-su" },
            { name: "Bí Ẩn", value: "/api/type/bi-an" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) {
        _cachedCategories = [
            { "name": "Mới Cập Nhật", "slug": "/api/update" },
            { "name": "Hành Động", "slug": "/api/type/hanh-dong" },
            { "name": "Hoạt Hình", "slug": "/api/type/hoat-hinh" },
            { "name": "Viễn Tưởng", "slug": "/api/type/vien-tuong" },
            { "name": "Hình Sự", "slug": "/api/type/hinh-su" },
            { "name": "Bí Ẩn", "slug": "/api/type/bi-an" }
        ];
    }
    return _cachedCategories;
}

function formatImageUrl(path, isBanner) {
    if (!path) return "";
    var s = String(path).trim();
    if (s.indexOf("http://") === 0 || s.indexOf("https://") === 0) {
        return s;
    }
    var base = isBanner ? TMDB_IMG_BANNER : TMDB_IMG_POSTER;
    if (s.charAt(0) === "/") s = s.substring(1);
    if (s.indexOf(".jpg") === -1 && s.indexOf(".png") === -1 && s.indexOf(".webp") === -1) {
        s += ".jpg";
    }
    return base + "/" + s;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/api/update";

        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? filters.sort[0].value : "");
                    if (sVal) path = sVal;
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

        url = url.replace(/\/+$/, "");
        url = url.replace(/\/\d+$/, "");

        return url + "/" + page;
    } catch (e) {
        return BASEURL + "/api/update/1";
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
    var q = keyword ? encodeURIComponent(keyword) : "";
    return BASEURL + "/?search=" + q + "&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        if (id.indexOf("/api/info/") > -1) {
            id = id.split("/api/info/")[1];
        } else {
            var parts = id.split("/");
            id = parts[parts.length - 1];
        }
    }
    if (id.indexOf("?") > -1) id = id.split("?")[0];
    if (id.indexOf("#") > -1) id = id.split("#")[0];

    var m = id.match(/^((?:tv|mv)-\d+-\d+)(?:-\d+)?$/);
    if (m && m[1]) {
        id = m[1];
    }

    return BASEURL + "/api/info/" + id;
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
        var json = null;
        try {
            json = JSON.parse(jsonStr);
        } catch (e) {
            return parseSearchResponse(jsonStr, url);
        }

        var items = [];
        var list = (json.data && Array.isArray(json.data)) ? json.data : (Array.isArray(json) ? json : []);

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (!item || !item.slug) continue;

            var title = item.vname || item.ename || item.slug;
            var originName = item.ename || "";
            var posterUrl = formatImageUrl(item.poster, false);
            var backdropUrl = formatImageUrl(item.banner, true) || posterUrl;

            var quality = "Full HD";
            if (item.stt && item.total) {
                if (parseInt(item.stt, 10) === parseInt(item.total, 10)) {
                    quality = "Full (" + item.total + " tập)";
                } else {
                    quality = "Tập " + item.stt + "/" + item.total;
                }
            } else if (item.type === "tv") {
                quality = "Phim Bộ";
            } else if (item.type === "mv" || item.type === "movie") {
                quality = "Phim Lẻ";
            }

            items.push({
                "id": item.slug,
                "title": title,
                "originName": originName,
                "posterUrl": posterUrl,
                "backdropUrl": backdropUrl,
                "year": item.year || 0,
                "quality": quality,
                "rating": item.rate ? String(item.rate) : ""
            });
        }

        var pagination = json.pagination || {};
        var currentPage = pagination.current_page || 1;
        var totalPages = pagination.total_pages || 1;
        var hasNext = currentPage < totalPages;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
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

function parseSearchResponse(responseStr, url) {
    try {
        var items = [];
        var currentPage = 1;
        var totalPages = 1;
        var hasNext = false;

        var keyword = "";
        var pageParam = 1;
        if (url) {
            var mKw = url.match(/[?&]search=([^&]*)/);
            if (mKw) keyword = decodeURIComponent((mKw[1] || "").replace(/\+/g, " ")).toLowerCase().trim();
            var mPage = url.match(/[?&]page=(\d+)/);
            if (mPage) pageParam = parseInt(mPage[1], 10) || 1;
        }

        if (responseStr.indexOf("const allData =") > -1) {
            var m = responseStr.match(/const allData = (\[[\s\S]*?\]);/);
            if (m) {
                var allList = JSON.parse(m[1]);
                var filtered = [];
                for (var k = 0; k < allList.length; k++) {
                    var r = allList[k];
                    if (!r) continue;
                    if (!keyword) {
                        filtered.push(r);
                        continue;
                    }
                    var vname = (r.vname || "").toLowerCase();
                    var ename = (r.ename || "").toLowerCase();
                    var slug = (r.slug || "").toLowerCase();
                    var tmdb = (r.tmdb || "").toLowerCase();
                    if (vname.indexOf(keyword) > -1 || ename.indexOf(keyword) > -1 || slug.indexOf(keyword) > -1 || tmdb === keyword) {
                        filtered.push(r);
                    }
                }

                var perPage = 20;
                totalPages = Math.ceil(filtered.length / perPage) || 1;
                currentPage = pageParam;
                var startIndex = (currentPage - 1) * perPage;
                var pageItems = filtered.slice(startIndex, startIndex + perPage);
                hasNext = currentPage < totalPages;

                for (var i = 0; i < pageItems.length; i++) {
                    var item = pageItems[i];
                    var title = item.vname || item.ename || item.slug;
                    var originName = item.ename || "";
                    var posterUrl = formatImageUrl(item.poster, false);
                    var backdropUrl = formatImageUrl(item.banner, true) || posterUrl;

                    var quality = "Full HD";
                    if (item.stt && item.total) {
                        if (parseInt(item.stt, 10) === parseInt(item.total, 10)) {
                            quality = "Full (" + item.total + " tập)";
                        } else {
                            quality = "Tập " + item.stt + "/" + item.total;
                        }
                    } else if (item.type === "tv") {
                        quality = "Phim Bộ";
                    }

                    items.push({
                        "id": item.slug,
                        "title": title,
                        "originName": originName,
                        "posterUrl": posterUrl,
                        "backdropUrl": backdropUrl,
                        "year": item.year || 0,
                        "quality": quality,
                        "rating": item.rate ? String(item.rate) : ""
                    });
                }

                return JSON.stringify({
                    "items": items,
                    "pagination": {
                        "currentPage": currentPage,
                        "totalPages": totalPages,
                        "hasNext": hasNext
                    }
                });
            }
        }

        return parseListResponse(responseStr, url);
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}

function parseMovieDetail(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var data = json.data || json.movie || json;
        if (!data || !data.slug) {
            return JSON.stringify({ "id": url || "", "title": "Không tìm thấy phim", "servers": [] });
        }

        var movieSlug = data.slug || "";
        var title = data.vname || data.ename || movieSlug;
        var originName = data.ename || "";
        var posterUrl = formatImageUrl(data.poster, false);
        var backdropUrl = formatImageUrl(data.banner, true) || posterUrl;
        var description = data.content || "";
        var year = data.year || 0;
        var rating = parseFloat(data.rate) || 0.0;
        var duration = data.duration ? (data.duration + " phút") : "";

        var category = "";
        if (data.genre && Array.isArray(data.genre)) {
            category = data.genre.join(", ");
        } else if (typeof data.genre === "string") {
            category = data.genre;
        }

        var country = "";
        if (data.country && Array.isArray(data.country)) {
            country = data.country.join(", ");
        } else if (typeof data.country === "string") {
            country = data.country;
        }

        var actor = "";
        if (data.cast && Array.isArray(data.cast)) {
            var realCasts = [];
            for (var c = 0; c < data.cast.length; c++) {
                var castName = String(data.cast[c]).trim();
                if (castName && !/^\d+$/.test(castName)) {
                    realCasts.push(castName);
                }
            }
            actor = realCasts.join(", ");
        }

        var rawEpisodes = data.list_episodes || [];
        var epList = [];

        for (var i = 0; i < rawEpisodes.length; i++) {
            var rawEp = String(rawEpisodes[i]);
            var parts = rawEp.split("|");
            var epLabel = parts[0] ? parts[0].trim() : String(i + 1);
            var epUrl = parts[1] ? parts[1].trim() : parts[0].trim();

            var epName = epLabel;
            if (/^\d+$/.test(epName)) {
                epName = "Tập " + epName;
            }

            var epSlug = "tap-" + (i + 1);
            if (epUrl.indexOf(BASEURL) === 0) {
                var urlParts = epUrl.split("/");
                epSlug = urlParts[urlParts.length - 1];
            }

            epList.push({
                "id": epUrl,
                "name": epName,
                "slug": epSlug
            });
        }

        var serverEpisodes = [];
        if (epList.length > 0) {
            serverEpisodes.push({
                "name": "ViCDN VIP",
                "episodes": epList
            });
        }

        var episodeCurrent = data.stt ? ("Tập " + data.stt) : (data.type === "tv" ? "Đang cập nhật" : "Full");
        var episodeTotal = data.total ? String(data.total) : "1";

        return JSON.stringify({
            "id": movieSlug,
            "title": title,
            "originName": originName,
            "posterUrl": posterUrl,
            "backdropUrl": backdropUrl,
            "description": description,
            "year": year,
            "rating": rating,
            "duration": duration,
            "quality": "Full HD",
            "category": category,
            "country": country,
            "actor": actor,
            "episode_current": episodeCurrent,
            "episode_total": episodeTotal,
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
        var isEmbed = true;
        var mimeType = "text/html";

        if (streamUrl.indexOf(".m3u8") > -1) {
            isEmbed = false;
            mimeType = "application/x-mpegURL";
        } else if (streamUrl.indexOf(".mp4") > -1) {
            isEmbed = false;
            mimeType = "video/mp4";
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": {} });
    }
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
