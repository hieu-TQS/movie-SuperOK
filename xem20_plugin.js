// =============================================================================
// Xem20 Plugin (Tương thích 100% Mozilla Rhino JS & Android TV SuperOK)
// Phát trực tiếp ExoPlayer không quảng cáo qua Backend API VSMOV / Xem20
// Hỗ trợ Phim Lẻ, Phim Bộ, Hoạt Hình, Chiếu Rạp (HD/FHD/4K, Vietsub, Lồng Tiếng)
// =============================================================================

var BASEURL = "https://vsmov.com";
var BASEAPI = "https://vsmov.com/api";
var _cachedCategories = null;
var _cachedCountries = null;

function log(msg) {
    if (typeof console !== "undefined" && console.log) {
        console.log(msg);
    }
}

// =============================================================================
// MANIFEST & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "xem20",
        "name": "Nguồn Xem20",
        "description": "Kho phim Xem20 chất lượng cao (HD/FHD/4K, Vietsub, Thuyết Minh). Phát trực tiếp ExoPlayer không quảng cáo.",
        "info": "Kho phim Xem20 chất lượng cao, luồng phát HLS m3u8 trực tiếp không quảng cáo, load siêu nhanh trên Android TV.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/phimchill.ico",
        "isEnabled": true,
        "isAdult": false,
        "adblock": true,
        "debug": false,
        "layoutType": "HORIZONTAL",
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/danh-sach/phim-moi-cap-nhat", "title": "Mới Cập Nhật", "type": "Grid" },
        { "slug": "/api/danh-sach/phim-bo", "title": "Phim Bộ", "type": "Grid" },
        { "slug": "/api/danh-sach/phim-le", "title": "Phim Lẻ", "type": "Grid" },
        { "slug": "/api/danh-sach/phim-chieu-rap", "title": "Phim Chiếu Rạp", "type": "Grid" },
        { "slug": "/api/danh-sach/hoat-hinh", "title": "Hoạt Hình", "type": "Grid" },
        { "slug": "/api/danh-sach/tv-shows", "title": "TV Shows", "type": "Grid" },
        { "slug": "/api/danh-sach/subteam", "title": "Phim Subteam", "type": "Grid" }
    ]);
}

// =============================================================================
// CATEGORIES & FILTERS CONFIG
// =============================================================================

function getPrimaryCategories() {
    try {
        return JSON.stringify(getCachedCategories());
    } catch (e) {
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        return JSON.stringify({
            sort: [
                { name: "Mới Cập Nhật", value: "phim-moi-cap-nhat" },
                { name: "Phim Bộ", value: "phim-bo" },
                { name: "Phim Lẻ", value: "phim-le" },
                { name: "Chiếu Rạp", value: "phim-chieu-rap" },
                { name: "Hoạt Hình", value: "hoat-hinh" },
                { name: "TV Shows", value: "tv-shows" },
                { name: "Subteam", value: "subteam" }
            ],
            category: getCachedCategories(),
            country: getCachedCountries()
        });
    } catch (e) {
        return JSON.stringify({ category: [] });
    }
}

function getCachedCategories() {
    if (!_cachedCategories) {
        _cachedCategories = [
            { name: "Tất Cả", slug: "/api/danh-sach/phim-moi-cap-nhat" },
            { name: "Hành Động", slug: "/api/the-loai/hanh-dong" },
            { name: "Hoạt Hình", slug: "/api/the-loai/hoat-hinh" },
            { name: "Chính Kịch", slug: "/api/the-loai/chinh-kich" },
            { name: "Cổ Trang", slug: "/api/the-loai/co-trang" },
            { name: "Tình Cảm", slug: "/api/the-loai/lang-man" },
            { name: "Hài Hước", slug: "/api/the-loai/hai" },
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
    }
    return _cachedCategories;
}

function getCachedCountries() {
    if (!_cachedCountries) {
        _cachedCountries = [
            { name: "Trung Quốc", slug: "/api/quoc-gia/trung-quoc" },
            { name: "Hàn Quốc", slug: "/api/quoc-gia/han-quoc" },
            { name: "Âu Mỹ", slug: "/api/quoc-gia/au-my" },
            { name: "Nhật Bản", slug: "/api/quoc-gia/nhat-ban" },
            { name: "Hồng Kông", slug: "/api/quoc-gia/hong-kong" },
            { name: "Đài Loan", slug: "/api/quoc-gia/dai-loan" },
            { name: "Thái Lan", slug: "/api/quoc-gia/thai-lan" },
            { name: "Ấn Độ", slug: "/api/quoc-gia/an-do" },
            { name: "Việt Nam", slug: "/api/quoc-gia/viet-nam" }
        ];
    }
    return _cachedCountries;
}

// =============================================================================
// STREAM URL RESOLVER (CHUYỂN ĐỔI LINK THÀNH HLS M3U8 TRỰC TIẾP KHÔNG QUẢNG CÁO)
// =============================================================================

function cleanStreamUrl(rawUrl) {
    if (!rawUrl) return "";
    var url = String(rawUrl).trim();

    // Nếu đã là link m3u8
    if (url.indexOf(".m3u8") > -1) {
        return url;
    }

    // Chuyển đổi định dạng /video/{id} thành /stream/{id}/master.m3u8
    if (url.indexOf("/video/") > -1) {
        var clean = url.split("?")[0].split("#")[0];
        if (clean.charAt(clean.length - 1) === "/") {
            clean = clean.substring(0, clean.length - 1);
        }
        var parts = clean.split("/video/");
        if (parts.length === 2) {
            return parts[0] + "/stream/" + parts[1] + "/master.m3u8";
        }
    }

    return url;
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
                try {
                    filters = JSON.parse(filtersJson);
                } catch (e) {
                    var fixedJson = filtersJson
                        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                        .replace(/:,/g, ':');
                    try { filters = JSON.parse(fixedJson); } catch (e2) {}
                }
            } else {
                filters = filtersJson;
            }

            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.sort && typeof filters.sort === "string") {
                    path = "/api/danh-sach/" + filters.sort;
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                }
                if (filters.country && typeof filters.country === "string") {
                    path = filters.country;
                }
            }
        }

        // Đảm bảo có prefix /api nếu chưa có
        if (path.indexOf("http") === 0) {
            return path + (page > 1 ? (path.indexOf("?") > -1 ? "&page=" + page : "?page=" + page) : "");
        }

        if (path.indexOf("/api/") !== 0) {
            path = "/api" + (path.charAt(0) === "/" ? "" : "/") + path;
        }

        var resultUrl = BASEURL + path;
        if (page > 1) {
            resultUrl += (resultUrl.indexOf("?") === -1 ? "?page=" : "&page=") + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        return BASEAPI + "/danh-sach/phim-moi-cap-nhat";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else {
                filters = filtersJson;
            }
            if (filters && filters.page) {
                page = parseInt(filters.page, 10) || 1;
            }
        }

        var encoded = encodeURIComponent(keyword || "");
        var url = BASEAPI + "/tim-kiem?keyword=" + encoded;
        if (page > 1) {
            url += "&page=" + page;
        }
        return url;

    } catch (e) {
        return BASEAPI + "/tim-kiem?keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    try {
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
        if (id.indexOf("/") === 0) id = id.substring(1);

        return BASEAPI + "/phim/" + id;
    } catch (e) {
        return "";
    }
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return BASEAPI + "/the-loai"; }
function getUrlCountries() { return BASEAPI + "/quoc-gia"; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS (XỬ LÝ DỮ LIỆU JSON & STREAM M3U8 NATIVE)
// =============================================================================

function parseListResponse(jsonStr, url) {
    try {
        if (!jsonStr) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
        }

        var json = typeof jsonStr === "object" ? jsonStr : JSON.parse(jsonStr);
        var rawItems = [];

        if (json.items && Array.isArray(json.items)) {
            rawItems = json.items;
        } else if (json.data && json.data.items && Array.isArray(json.data.items)) {
            rawItems = json.data.items;
        } else if (json.data && Array.isArray(json.data)) {
            rawItems = json.data;
        }

        var items = [];
        for (var i = 0; i < rawItems.length; i++) {
            var item = rawItems[i];
            if (!item) continue;

            var slug = item.slug || item._id || "";
            var title = item.name || item.title || "";
            if (!slug || !title) continue;

            var posterUrl = item.poster_url || item.thumb_url || "";
            if (typeof posterUrl !== "string") posterUrl = "";

            var backdropUrl = item.thumb_url || item.poster_url || posterUrl;
            if (typeof backdropUrl !== "string") backdropUrl = posterUrl;

            var year = item.year || 0;
            var rating = "";
            if (item.tmdb && item.tmdb.vote_average) {
                rating = String(item.tmdb.vote_average);
            }
            var quality = item.quality || item.episode_current || "FHD";

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

function parseMovieDetail(jsonStr, url) {
    try {
        if (!jsonStr) {
            return JSON.stringify({ id: url || "", title: "Lỗi dữ liệu", servers: [] });
        }

        var json = typeof jsonStr === "object" ? jsonStr : JSON.parse(jsonStr);
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
            var rawServerName = serverObj.server_name || ("Server VIP #" + (i + 1));
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

                // Lấy link video và tự động tối ưu hóa thành HLS m3u8 trực tiếp
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
            "quality": movie.quality || "FHD",
            "category": category,
            "country": country,
            "casts": actor,
            "director": director,
            "duration": movie.time || "",
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

// =============================================================================
// PHÁT VIDEO TRỰC TIẾP (EXOPLAYER - KHÔNG QUẢNG CÁO)
// =============================================================================

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
                "Referer": "https://vsmov.com/",
                "Origin": "https://vsmov.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
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

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(html) {
    return JSON.stringify(getCachedCountries());
}

function parseYearsResponse(html) {
    return "[]";
}
