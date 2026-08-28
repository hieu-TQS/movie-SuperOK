// =============================================================================
// VSMOV Plugin (Tương thích 100% Rhino JS & Android TV)
// https://vsmov.com/
// =============================================================================

var BASEURL = "https://vsmov.com";
var _cachedCategories = null;
var _cachedCountries = null;

function getManifest() {
    return JSON.stringify({
        "id": "vsmov",
        "name": "VSMOV",
        "description": "Kho phim API VSMOV chất lượng cao (HD/4K, Vietsub, Lồng Tiếng).",
        "info": "Kho phim API VSMOV chất lượng cao (HD/4K, Vietsub, Lồng Tiếng).",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/vsmov.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/danh-sach/phim-moi-cap-nhat", "title": "Mới Cập Nhật", "type": "Grid" },
        { "slug": "/api/danh-sach/phim-bo", "title": "Phim Bộ", "type": "Grid" },
        { "slug": "/api/danh-sach/phim-le", "title": "Phim Lẻ", "type": "Grid" },
        { "slug": "/api/danh-sach/hoat-hinh", "title": "Hoạt Hình", "type": "Grid" },
        { "slug": "/api/danh-sach/tv-shows", "title": "TV Shows", "type": "Grid" },
        { "slug": "/api/danh-sach/subteam", "title": "Phim Subteam", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Cập Nhật", value: "phim-moi-cap-nhat" },
            { name: "Phim Bộ", value: "phim-bo" },
            { name: "Phim Lẻ", value: "phim-le" },
            { name: "Hoạt Hình", value: "hoat-hinh" },
            { name: "TV Shows", value: "tv-shows" },
            { name: "Subteam", value: "subteam" }
        ],
        category: getCachedCategories(),
        country: getCachedCountries()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) _cachedCategories = buildDefaultCategories();
    return _cachedCategories;
}

function getCachedCountries() {
    if (!_cachedCountries) _cachedCountries = buildDefaultCountries();
    return _cachedCountries;
}

function buildDefaultCategories() {
    var items = [
        { name: "Tất Cả", slug: "/api/danh-sach/phim-moi-cap-nhat" },
        { name: "Hành Động", slug: "/api/the-loai/hanh-dong" },
        { name: "Hoạt Hình", slug: "/api/the-loai/hoat-hinh" },
        { name: "Chính Kịch", slug: "/api/the-loai/chinh-kich" },
        { name: "Cổ Trang", slug: "/api/the-loai/co-trang" },
        { name: "Tình Cảm", slug: "/api/the-loai/lang-man" },
        { name: "Hài", slug: "/api/the-loai/hai" },
        { name: "Kinh Dị", slug: "/api/the-loai/kinh-di" },
        { name: "Phiêu Lưu", slug: "/api/the-loai/phieu-luu" },
        { name: "Giả Tưởng", slug: "/api/the-loai/gia-tuong" },
        { name: "Khoa Học Viễn Tưởng", slug: "/api/the-loai/khoa-hoc-vien-tuong" },
        { name: "Võ Thuật", slug: "/api/the-loai/vo-thuat" },
        { name: "Kiếm Hiệp", slug: "/api/the-loai/kiem-hiep" },
        { name: "Hình Sự", slug: "/api/the-loai/hinh-su" },
        { name: "Tội Phạm", slug: "/api/the-loai/toi-pham" },
        { name: "Bí Ẩn", slug: "/api/the-loai/bi-an" },
        { name: "Gia Đình", slug: "/api/the-loai/gia-dinh" },
        { name: "Học Đường", slug: "/api/the-loai/hoc-duong" },
        { name: "Chiến Tranh", slug: "/api/the-loai/chien-tranh" },
        { name: "Tiên Hiệp", slug: "/api/the-loai/tien-hiep" }
    ];
    return items;
}

function buildDefaultCountries() {
    var items = [
        { name: "Trung Quốc", slug: "/api/quoc-gia/trung-quoc" },
        { name: "Hàn Quốc", slug: "/api/quoc-gia/han-quoc" },
        { name: "Âu Mỹ", slug: "/api/quoc-gia/au-my" },
        { name: "Nhật Bản", slug: "/api/quoc-gia/nhat-ban" },
        { name: "Hồng Kông", slug: "/api/quoc-gia/hong-kong" },
        { name: "Đài Loan", slug: "/api/quoc-gia/dai-loan" },
        { name: "Việt Nam", slug: "/api/quoc-gia/viet-nam" },
        { name: "Thái Lan", slug: "/api/quoc-gia/thai-lan" },
        { name: "Ấn Độ", slug: "/api/quoc-gia/an-do" },
        { name: "Pháp", slug: "/api/quoc-gia/phap" },
        { name: "Đức", slug: "/api/quoc-gia/duc" }
    ];
    return items;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/api/danh-sach/phim-moi-cap-nhat";

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
                } else if (filters.country) {
                    if (Array.isArray(filters.country) && filters.country.length > 0) {
                        path = filters.country[0].slug || path;
                    } else if (typeof filters.country === "string") {
                        path = filters.country;
                    }
                } else if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? filters.sort[0].value : "");
                    if (sVal) {
                        if (sVal.indexOf("/") === 0) path = sVal;
                        else path = "/api/danh-sach/" + sVal;
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
        return BASEURL + "/api/danh-sach/phim-moi-cap-nhat";
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
    return BASEURL + "/api/tim-kiem?keyword=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        if (id.indexOf("/phim/") > -1) {
            id = id.split("/phim/")[1];
        } else if (id.indexOf("/api/phim/") > -1) {
            id = id.split("/api/phim/")[1];
        } else {
            var parts = id.split("/");
            id = parts[parts.length - 1];
        }
    }
    if (id.indexOf("?") > -1) id = id.split("?")[0];
    if (id.indexOf("#") > -1) id = id.split("#")[0];
    if (id.indexOf("/") > -1) id = id.split("/")[0];

    return BASEURL + "/api/phim/" + id;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return BASEURL + "/api/the-loai"; }
function getUrlCountries() { return BASEURL + "/api/quoc-gia"; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var items = [];
        var list = json.items || (json.data ? json.data.items : null) || json.list || json.data || [];
        var pathImage = json.pathImage || "";

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var slug = item.slug || item.id || item._id;
            if (!slug) continue;

            var title = item.name || item.title || "";
            var posterUrl = item.poster_url || item.thumb_url || item.poster || "";
            if (typeof posterUrl !== "string") posterUrl = "";
            if (posterUrl && posterUrl.indexOf("http") !== 0) {
                if (pathImage) posterUrl = pathImage + posterUrl;
                else posterUrl = BASEURL + (posterUrl.charAt(0) === '/' ? '' : '/') + posterUrl;
            }

            var backdropUrl = item.thumb_url || item.poster_url || posterUrl;
            if (typeof backdropUrl !== "string") backdropUrl = posterUrl;
            if (backdropUrl && backdropUrl.indexOf("http") !== 0) {
                if (pathImage) backdropUrl = pathImage + backdropUrl;
                else backdropUrl = BASEURL + (backdropUrl.charAt(0) === '/' ? '' : '/') + backdropUrl;
            }

            var year = item.year || 0;
            var rating = "";
            if (item.tmdb && item.tmdb.vote_average) {
                rating = String(item.tmdb.vote_average);
            }
            var quality = item.quality || item.episode_current || "";

            items.push({
                "id": String(slug),
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": backdropUrl,
                "year": year,
                "quality": quality,
                "rating": rating
            });
        }

        var pagination = json.pagination || (json.data ? json.data.pagination : null) || {};
        var currentPage = pagination.currentPage || json.currentPage || 1;
        var totalPages = pagination.totalPages || json.totalPages || 1;
        var hasNext = currentPage < totalPages;

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": totalPages, "hasNext": hasNext }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(jsonStr, url) {
    return parseListResponse(jsonStr, url);
}

function cleanStreamUrl(rawUrl) {
    if (!rawUrl) return "";
    var url = rawUrl;
    if (url.indexOf("/video/") > -1) {
        var clean = url.split("?")[0].split("#")[0];
        if (clean.charAt(clean.length - 1) === '/') {
            clean = clean.substring(0, clean.length - 1);
        }
        var parts = clean.split("/video/");
        if (parts.length === 2) {
            return parts[0] + "/stream/" + parts[1] + "/master.m3u8";
        }
    }
    return url;
}

function parseMovieDetail(jsonStr, url) {
    try {
        var json = JSON.parse(jsonStr);
        var movie = json.movie || json.data || {};

        var movieSlug = movie.slug || "";
        var title = movie.name || movie.title || "";
        var originName = movie.origin_name || "";

        var posterUrl = movie.poster_url || movie.thumb_url || "";
        if (typeof posterUrl !== "string") posterUrl = "";

        var backdropUrl = movie.thumb_url || movie.poster_url || posterUrl;
        if (typeof backdropUrl !== "string") backdropUrl = posterUrl;

        var description = movie.content || movie.description || "";
        if (typeof description !== "string") description = "";

        var category = "";
        if (movie.category && Array.isArray(movie.category)) {
            var catNames = [];
            for (var c = 0; c < movie.category.length; c++) {
                if (movie.category[c].name) catNames.push(movie.category[c].name);
            }
            category = catNames.join(", ");
        }

        var country = "";
        if (movie.country && Array.isArray(movie.country)) {
            var couNames = [];
            for (var k = 0; k < movie.country.length; k++) {
                if (movie.country[k].name) couNames.push(movie.country[k].name);
            }
            country = couNames.join(", ");
        }

        var actor = "";
        if (movie.actor && Array.isArray(movie.actor)) {
            actor = movie.actor.join(", ");
        } else if (typeof movie.actor === "string") {
            actor = movie.actor;
        }

        var director = "";
        if (movie.director && Array.isArray(movie.director)) {
            director = movie.director.join(", ");
        } else if (typeof movie.director === "string") {
            director = movie.director;
        }

        var rating = 0;
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = parseFloat(movie.tmdb.vote_average) || 0;
        }

        var serverEpisodes = [];
        var rawEpisodes = json.episodes || movie.episodes || [];

        for (var i = 0; i < rawEpisodes.length; i++) {
            var serverObj = rawEpisodes[i];
            var rawServerName = serverObj.server_name || ("Server " + (i + 1));
            var serverName = rawServerName.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
            var serverData = serverObj.server_data || [];

            var epList = [];
            for (var j = 0; j < serverData.length; j++) {
                var epItem = serverData[j];
                var epNum = epItem.name || (j + 1);
                var epName = String(epNum);
                if (epName.indexOf("Tập") !== 0 && epName !== "Full" && epName !== "FULL") {
                    epName = "Tập " + epName;
                }
                var epSlug = epItem.slug || ("tap-" + epNum);

                var rawEpUrl = epItem.link_m3u8 || epItem.link_embed || epItem.link || epItem.url || "";
                var finalEpUrl = cleanStreamUrl(rawEpUrl);

                epList.push({
                    "id": finalEpUrl,
                    "name": epName,
                    "slug": epSlug
                });
            }

            if (epList.length > 0) {
                serverEpisodes.push({
                    "name": serverName,
                    "episodes": epList
                });
            }
        }

        var episodeCurrent = movie.episode_current || (rawEpisodes.length > 0 && rawEpisodes[0].server_data ? "Tập " + rawEpisodes[0].server_data.length : "Full");
        var episodeTotal = movie.episode_total || "1";

        return JSON.stringify({
            "id": movieSlug,
            "title": title,
            "originName": originName,
            "posterUrl": posterUrl,
            "backdropUrl": backdropUrl,
            "description": description,
            "year": movie.year || 0,
            "rating": rating,
            "quality": movie.quality || "HD",
            "category": category,
            "country": country,
            "actor": actor,
            "director": director,
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
        var streamUrl = cleanStreamUrl(url || "");
        var isEmbed = streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf("streamvsmov.com") === -1;
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
        var list = (json.data && json.data.items) ? json.data.items : (json.items || []);
        var categories = [{ "slug": "/api/danh-sach/phim-moi-cap-nhat", "name": "Tất Cả" }];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item && item.name && item.slug) {
                categories.push({
                    "name": item.name,
                    "slug": "/api/the-loai/" + item.slug
                });
            }
        }
        if (categories.length > 1) {
            _cachedCategories = categories;
            return JSON.stringify(categories);
        }
    } catch (e) {}
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var json = JSON.parse(apiResponseJson);
        var list = (json.data && json.data.items) ? json.data.items : (json.items || []);
        var countries = [];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item && item.name && item.slug) {
                countries.push({
                    "name": item.name,
                    "slug": "/api/quoc-gia/" + item.slug
                });
            }
        }
        if (countries.length > 0) {
            _cachedCountries = countries;
            return JSON.stringify(countries);
        }
    } catch (e) {}
    return JSON.stringify(getCachedCountries());
}

function parseYearsResponse(html) { return "[]"; }
