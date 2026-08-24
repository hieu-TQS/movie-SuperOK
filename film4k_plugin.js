// =============================================================================
// Film4K Plugin (Tương thích 100% Rhino JS & Android TV)
// https://film4k.net/
// =============================================================================

var BASEURL = "https://film4k.net";
var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "film4k",
        "name": "Film4K",
        "description": "Kho phim lẻ và phim bộ chất lượng 4K",
        "version": "1.2.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://film4k.net/logo-64.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/home", "title": "Phim Mới", "type": "Grid" },
        { "slug": "/api/home?type=movie", "title": "Phim Lẻ", "type": "Grid" },
        { "slug": "/api/home?type=tv", "title": "Phim Bộ", "type": "Grid" },
        { "slug": "/api/home?genre=Phim%20H%C3%A0nh%20%C4%90%E1%BB%99ng", "title": "Hành Động", "type": "Grid" },
        { "slug": "/api/home?genre=Phim%20Ho%E1%BA%A1t%20H%C3%ACnh", "title": "Hoạt Hình", "type": "Grid" },
        { "slug": "/api/home?genre=Phim%20Kinh%20D%E1%BB%8B", "title": "Kinh Dị", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Tất cả", value: "" },
            { name: "Phim Lẻ", value: "movie" },
            { name: "Phim Bộ", value: "tv" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) _cachedCategories = buildDefaultCategories();
    return _cachedCategories;
}

function buildDefaultCategories() {
    var genres = [
        "Phim Hành Động", "Phim Hài", "Phim Kinh Dị", "Phim Viễn Tưởng", "Phim Hoạt Hình",
        "Phim Tài Liệu", "Phim Phiêu Lưu", "Phim Tình Cảm", "Phim Tâm Lý",
        "Phim Chính Kịch", "Phim Hình Sự", "Phim Bí Ẩn", "Phim Gia Đình", "Phim Võ Thuật",
        "Phim Chiến Tranh", "Khoa Học", "Cổ Trang", "Thể Thao", "Âm Nhạc"
    ];
    var menulist = [{ "slug": "/api/home", "name": "Tất Cả" }];
    for (var i = 0; i < genres.length; i++) {
        menulist.push({
            "slug": "/api/home?genre=" + encodeURIComponent(genres[i]),
            "name": genres[i]
        });
    }
    return menulist;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/api/home";
        
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
                    if (sVal === "movie" || sVal === "tv") {
                        path = "/api/home?type=" + sVal;
                    }
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
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
        
        if (page > 1) {
            if (url.indexOf("?") > -1) url += "&page=" + page;
            else url += "?page=" + page;
        }
        
        return url;
    } catch (e) {
        return BASEURL + "/api/home";
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
    return BASEURL + "/api/home?q=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        if (id.indexOf("/watch/") > -1) {
            id = id.split("/watch/")[1];
        } else if (id.indexOf("/movie/") > -1) {
            id = id.split("/movie/")[1];
        } else if (id.indexOf("/api/watch/") > -1) {
            id = id.split("/api/watch/")[1];
        } else {
            var parts = id.split("/");
            id = parts[parts.length - 1];
        }
    }
    if (id.indexOf("?") > -1) {
        id = id.split("?")[0];
    }
    if (id.indexOf("#") > -1) {
        id = id.split("#")[0];
    }
    if (id.indexOf("/") > -1) {
        id = id.split("/")[0];
    }
    return BASEURL + "/api/watch/" + id;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return BASEURL + "/api/genres"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var items = [];
        var list = json.list || json.top || json.hero || [];

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var title = item.title ? (item.title.vi || item.title.en || item.title) : "";
            if (!title && typeof item.title === "string") title = item.title;
            
            var posterUrl = item.poster ? (item.poster.vi || item.poster.en || item.poster) : "";
            if (typeof posterUrl !== "string") posterUrl = "";
            var backdropUrl = item.backdrop || posterUrl;
            if (typeof backdropUrl !== "string") backdropUrl = posterUrl;
            
            var quality = "4K";
            if (item.mediaType === "tv") quality = "Phim Bộ";
            else if (item.mediaType === "movie") quality = "Phim Lẻ";
            
            items.push({
                "id": item.slug,
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": backdropUrl,
                "year": item.year || 0,
                "quality": quality,
                "rating": item.score ? String(item.score) : ""
            });
        }
        
        var currentPage = json.page || 1;
        var hasNext = json.more === true;
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": 999, "hasNext": hasNext }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(jsonStr, url) { 
    return parseListResponse(jsonStr, url); 
}

function parseMovieDetail(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var movie = json.movie || {};

        var title = movie.title ? (movie.title.vi || movie.title.en || movie.title) : "";
        var originName = movie.title ? (movie.title.en || "") : "";
        var posterUrl = movie.poster ? (movie.poster.vi || movie.poster.en || movie.poster) : "";
        if (typeof posterUrl !== "string") posterUrl = "";
        var backdropUrl = movie.backdrop || posterUrl;
        if (typeof backdropUrl !== "string") backdropUrl = posterUrl;
        
        var description = movie.overview ? (movie.overview.vi || movie.overview.en || movie.overview) : "";
        if (typeof description !== "string") description = "";
        
        var category = "";
        if (movie.genres) {
            if (movie.genres.vi && Array.isArray(movie.genres.vi)) {
                category = movie.genres.vi.join(", ");
            } else if (movie.genres.en && Array.isArray(movie.genres.en)) {
                category = movie.genres.en.join(", ");
            }
        }

        var movieSlug = movie.slug || "";
        var serverEpisodes = [];
        var hasEpisodes = json.episodes && json.episodes.length > 0;

        if (hasEpisodes) {
            var serverMap = {};
            var maxSeason = 1;
            for (var k = 0; k < json.episodes.length; k++) {
                var sNum = json.episodes[k].season || 1;
                if (sNum > maxSeason) maxSeason = sNum;
            }

            for (var i = 0; i < json.episodes.length; i++) {
                var ep = json.episodes[i];
                var epNum = ep.episode || (i + 1);
                var epSeason = ep.season || 1;
                var epPrefix = maxSeason > 1 ? ("S" + epSeason + " · ") : "";
                var epName = epPrefix + "Tập " + epNum;
                if (ep.title && ep.title !== ("Tập " + epNum) && ep.title !== String(epNum)) {
                    epName += ": " + ep.title;
                }
                var epSlug = "s" + epSeason + "e" + epNum;
                
                if (ep.sources && ep.sources.length > 0) {
                    for (var j = 0; j < ep.sources.length; j++) {
                        var source = ep.sources[j];
                        var serverName = source.label || "Server " + (j + 1);
                        var epUrl = source.url;
                        if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + epUrl;
                        
                        if (!serverMap[serverName]) serverMap[serverName] = [];
                        serverMap[serverName].push({
                            "id": epUrl,
                            "name": epName,
                            "slug": epSlug
                        });
                    }
                } else {
                    var sName = "Server Film4K";
                    if (!serverMap[sName]) serverMap[sName] = [];
                    var epWatchUrl = BASEURL + "/api/hls/tiktok/" + movieSlug + "-" + epSlug + "/master.m3u8";
                    serverMap[sName].push({
                        "id": epWatchUrl,
                        "name": epName,
                        "slug": epSlug
                    });
                }
            }
            
            for (var sName in serverMap) {
                if (serverMap.hasOwnProperty(sName)) {
                    serverEpisodes.push({
                        "name": sName,
                        "episodes": serverMap[sName]
                    });
                }
            }
        } else {
            var serverMap = {};
            if (json.sources && json.sources.length > 0) {
                for (var j = 0; j < json.sources.length; j++) {
                    var source = json.sources[j];
                    var serverName = source.label || "Server " + (j + 1);
                    var epUrl = source.url;
                    if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + epUrl;
                    
                    if (!serverMap[serverName]) serverMap[serverName] = [];
                    serverMap[serverName].push({
                        "id": epUrl,
                        "name": "Full",
                        "slug": "full"
                    });
                }
            } else if (movie.hlsUrl) {
                var epUrl = movie.hlsUrl;
                if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + epUrl;
                serverMap["Server 1"] = [{
                    "id": epUrl,
                    "name": "Full",
                    "slug": "full"
                }];
            } else if (movieSlug) {
                serverMap["Server Film4K"] = [{
                    "id": BASEURL + "/api/hls/tiktok/" + movieSlug + "/master.m3u8",
                    "name": "Full",
                    "slug": "full"
                }];
            }
            
            if (movie.okruId) {
                serverMap["Server OK.ru"] = [{
                    "id": "https://ok.ru/videoembed/" + movie.okruId,
                    "name": "Full",
                    "slug": "full"
                }];
            }

            for (var sName in serverMap) {
                if (serverMap.hasOwnProperty(sName)) {
                    serverEpisodes.push({
                        "name": sName,
                        "episodes": serverMap[sName]
                    });
                }
            }
        }

        var episodeCurrent = hasEpisodes ? ("Tập " + json.episodes.length) : "Full";
        var episodeTotal = hasEpisodes ? String(json.episodes.length) : "1";

        return JSON.stringify({
            "id": movieSlug,
            "title": title,
            "originName": originName,
            "posterUrl": posterUrl,
            "backdropUrl": backdropUrl,
            "description": description,
            "year": movie.year || 0,
            "rating": movie.score || 0.0,
            "quality": "4K UHD",
            "category": category,
            "episode_current": episodeCurrent,
            "episode_total": episodeTotal,
            "servers": serverEpisodes
        });
    } catch(e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetail(jsonStr, url) {
    return parseMovieDetail(jsonStr, url);
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";
        
        // Handle ok.ru embed
        if (streamUrl.indexOf("ok.ru") > -1) {
            return JSON.stringify({
                "url": streamUrl,
                "isEmbed": true,
                "headers": {
                    "Referer": BASEURL + "/"
                }
            });
        }

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
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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
        var list = json.genres || [];
        var categories = [];
        for (var i = 0; i < list.length; i++) {
            var g = list[i];
            if (g && g.name) {
                categories.push({
                    "name": g.name,
                    "slug": "/api/home?genre=" + encodeURIComponent(g.name)
                });
            }
        }
        if (categories.length > 0) {
            _cachedCategories = categories;
            return JSON.stringify(categories);
        }
    } catch (e) {}
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
