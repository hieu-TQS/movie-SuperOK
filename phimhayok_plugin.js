// =============================================================================
// VAAPP Plugin - PhimHayOK (Active API: https://api-client.phimhayok.net/api/movies)
// Tương thích 100% Mozilla Rhino JS & Android TV (SuperOK / SmartTube)
// =============================================================================

var BASE_URL = "https://phimhayok5.site";
var API_URL = "https://api-client.phimhayok.net/api/movies";

function getManifest() {
    return JSON.stringify({
        "id": "phimhayok",
        "name": "PhimHayOK",
        "description": "Nguồn xem phim Online ổn định",
        "version": "1.3.1",
        "baseUrl": BASE_URL,
        "iconUrl": "https://phimhayok5.site/icons/icon-192x192.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "all", "title": "Phim Mới Cập Nhật", "type": "Grid" },
        { "slug": "phim-le", "title": "Phim Lẻ", "type": "Grid" },
        { "slug": "phim-bo", "title": "Phim Bộ", "type": "Grid" },
        { "slug": "phim-ngan", "title": "Phim Ngắn", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Hành Động", "slug": "hanh-dong" },
        { "name": "Chính Kịch", "slug": "chinh-kich" },
        { "name": "Tâm Lý", "slug": "tam-ly" },
        { "name": "Tình Cảm", "slug": "tinh-cam" },
        { "name": "Hài Hước", "slug": "hai-huoc" },
        { "name": "Phiêu Lưu", "slug": "phieu-luu" },
        { "name": "Viễn Tưởng", "slug": "vien-tuong" },
        { "name": "Hình Sự", "slug": "hinh-su" },
        { "name": "Bí Ẩn", "slug": "bi-an" },
        { "name": "Khoa Học", "slug": "khoa-hoc" },
        { "name": "Kinh Dị", "slug": "kinh-di" },
        { "name": "Gia Đình", "slug": "gia-dinh" },
        { "name": "Cổ Trang", "slug": "co-trang" },
        { "name": "Hoạt Hình", "slug": "hoat-hinh" },
        { "name": "Lãng Mạn", "slug": "lang-man" },
        { "name": "Anime", "slug": "anime" },
        { "name": "Chiến Tranh", "slug": "chien-tranh" },
        { "name": "Lịch Sử", "slug": "lich-su" },
        { "name": "Báo Thù", "slug": "bao-thu" },
        { "name": "Tài Liệu", "slug": "tai-lieu" },
        { "name": "Âm Nhạc", "slug": "am-nhac" },
        { "name": "Võ Thuật", "slug": "vo-thuat" },
        { "name": "Giả Tưởng", "slug": "gia-tuong" },
        { "name": "Trả thù", "slug": "tra-thu" },
        { "name": "Tổng Tài", "slug": "tong-tai" },
        { "name": "Phản Bội", "slug": "phan-boi" },
        { "name": "Trùng Sinh", "slug": "trung-sinh" },
        { "name": "Nữ Cường Sự Nghiệp", "slug": "nu-cuong-su-nghiep" },
        { "name": "Cưới Trước Yêu Sau", "slug": "cuoi-truoc-yeu-sau" },
        { "name": "Trẻ Em", "slug": "tre-em" },
        { "name": "Học Đường", "slug": "hoc-duong" },
        { "name": "Tội Phạm", "slug": "toi-pham" },
        { "name": "LGBT", "slug": "lgbt" },
        { "name": "Ngoại Tình", "slug": "ngoai-tinh" },
        { "name": "Boy Love", "slug": "boy-love" }
    ]);
}

function getFilterConfig() {
    var genresList = JSON.parse(getPrimaryCategories());
    return JSON.stringify({
        sort: [
            { "name": "Tất cả", "value": "all" },
            { "name": "Phim Lẻ", "value": "phim-le" },
            { "name": "Phim Bộ", "value": "phim-bo" },
            { "name": "Phim Ngắn", "value": "phim-ngan" }
        ],
        genres: genresList,
        category: genresList,
        countries: [
            { "name": "Tất cả quốc gia", "slug": "" },
            { "name": "Âu Mỹ", "slug": "au-my" },
            { "name": "Trung Quốc", "slug": "trung-quoc" },
            { "name": "Hàn Quốc", "slug": "han-quoc" },
            { "name": "Nhật Bản", "slug": "nhat-ban" },
            { "name": "Anh", "slug": "anh" },
            { "name": "Thái Lan", "slug": "thai-lan" },
            { "name": "Hồng Kông", "slug": "hong-kong" },
            { "name": "Pháp", "slug": "phap" },
            { "name": "Canada", "slug": "canada" },
            { "name": "Ấn Độ", "slug": "an-do" },
            { "name": "Tây Ban Nha", "slug": "tay-ban-nha" },
            { "name": "Đức", "slug": "duc" },
            { "name": "Indonesia", "slug": "indonesia" },
            { "name": "Philippines", "slug": "philippines" },
            { "name": "Malaysia", "slug": "malaysia" },
            { "name": "Ba Lan", "slug": "ba-lan" },
            { "name": "Brazil", "slug": "brazil" },
            { "name": "Ireland", "slug": "ireland" },
            { "name": "Thụy Điển", "slug": "thuy-dien" }
        ],
        years: [
            { "name": "Tất cả năm", "slug": "" },
            { "name": "2026", "slug": "2026" },
            { "name": "2025", "slug": "2025" },
            { "name": "2024", "slug": "2024" },
            { "name": "2023", "slug": "2023" },
            { "name": "2022", "slug": "2022" },
            { "name": "2021", "slug": "2021" },
            { "name": "2020", "slug": "2020" },
            { "name": "2019", "slug": "2019" },
            { "name": "2018", "slug": "2018" },
            { "name": "2017", "slug": "2017" },
            { "name": "2016", "slug": "2016" }
        ]
    });
}

// =============================================================================
// URL BUILDERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var page = 1;
    var pageSize = 20;
    var categorySlug = "";
    var sortValue = "";
    var countrySlug = "";
    var yearVal = "";

    if (filtersJson) {
        var fixedJson = typeof filtersJson === "string" ?
            filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
        try {
            var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
            if (filters.page) page = parseInt(filters.page, 10) || 1;

            if (filters.category) {
                if (Array.isArray(filters.category) && filters.category.length > 0) {
                    categorySlug = filters.category[0].slug || "";
                } else if (typeof filters.category === "string") {
                    categorySlug = filters.category;
                }
            }
            if (filters.genres) {
                if (Array.isArray(filters.genres) && filters.genres.length > 0) {
                    categorySlug = filters.genres[0].slug || categorySlug;
                } else if (typeof filters.genres === "string") {
                    categorySlug = filters.genres;
                }
            }
            if (filters.country) {
                if (Array.isArray(filters.country) && filters.country.length > 0) {
                    countrySlug = filters.country[0].slug || "";
                } else if (typeof filters.country === "string") {
                    countrySlug = filters.country;
                }
            }
            if (filters.countries) {
                if (Array.isArray(filters.countries) && filters.countries.length > 0) {
                    countrySlug = filters.countries[0].slug || countrySlug;
                } else if (typeof filters.countries === "string") {
                    countrySlug = filters.countries;
                }
            }
            if (filters.year) {
                if (Array.isArray(filters.year) && filters.year.length > 0) {
                    yearVal = filters.year[0].slug || filters.year[0].name || "";
                } else if (typeof filters.year === "string" || typeof filters.year === "number") {
                    yearVal = String(filters.year);
                }
            }
            if (filters.years) {
                if (Array.isArray(filters.years) && filters.years.length > 0) {
                    yearVal = filters.years[0].slug || filters.years[0].name || yearVal;
                } else if (typeof filters.years === "string" || typeof filters.years === "number") {
                    yearVal = String(filters.years);
                }
            }
            if (filters.sort) {
                if (Array.isArray(filters.sort) && filters.sort.length > 0) {
                    sortValue = filters.sort[0].value || "";
                } else if (typeof filters.sort === "string") {
                    sortValue = filters.sort;
                }
            }
        } catch (jsonErr) {}
    }

    var pageIndex = page > 0 ? (page - 1) : 0;
    var target = sortValue || slug || "all";

    var url = API_URL + "?pageIndex=" + pageIndex + "&pageSize=" + pageSize;

    if (categorySlug && categorySlug !== "all") {
        url += "&genre=" + encodeURIComponent(categorySlug);
    }
    if (countrySlug) {
        url += "&country=" + encodeURIComponent(countrySlug);
    }
    if (yearVal) {
        url += "&releaseYear=" + encodeURIComponent(yearVal);
    }

    if (target === "phim-le" || target === "single") {
        url += "&type=single";
    } else if (target === "phim-bo" || target === "series") {
        url += "&type=series";
    } else if (target === "phim-ngan" || target === "short") {
        url += "&type=short";
    }

    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    var pageSize = 20;
    if (filtersJson) {
        var fixedJson = typeof filtersJson === "string" ?
            filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
        try {
            var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
            if (filters.page) page = parseInt(filters.page, 10) || 1;
        } catch (jsonErr) {}
    }

    var pageIndex = page > 0 ? (page - 1) : 0;
    var safeKeyword = encodeURIComponent(keyword || "");
    return API_URL + "?search=" + safeKeyword + "&pageIndex=" + pageIndex + "&pageSize=" + pageSize;
}

function getSearchUrl(keyword, page) {
    var p = parseInt(page || 1, 10);
    var pageIndex = p > 0 ? (p - 1) : 0;
    var safeKeyword = encodeURIComponent(keyword || "");
    return API_URL + "?search=" + safeKeyword + "&pageIndex=" + pageIndex + "&pageSize=20";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var s = slug.toString().trim();

    if (s.indexOf(API_URL) === 0) {
        return s;
    }

    var m = s.match(/\/phim\/([a-zA-Z0-9_-]+)/);
    if (m) {
        return API_URL + "/" + m[1];
    }

    if (s.indexOf("http") === 0) {
        var parts = s.split("/");
        var lastPart = parts[parts.length - 1] || parts[parts.length - 2];
        return API_URL + "/" + lastPart;
    }

    return API_URL + "/" + s;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(response, fetchedUrl) {
    try {
        var items = [];
        var total = 0;
        var pageIndex = 0;
        var pageSize = 20;

        var jsonStr = "";
        if (typeof response === "string") {
            var idx = response.indexOf("{");
            if (idx !== -1) {
                jsonStr = response.substring(idx);
            }
        }

        if (jsonStr) {
            var resObj = JSON.parse(jsonStr);
            var dataObj = resObj.data || {};
            var pageInfo = dataObj.pageInfo || {};
            total = pageInfo.total || 0;
            pageIndex = pageInfo.pageIndex || 0;
            pageSize = pageInfo.pageSize || 20;

            var rawItems = dataObj.items || (Array.isArray(dataObj) ? dataObj : []);
            for (var i = 0; i < rawItems.length; i++) {
                var item = rawItems[i];
                if (!item) continue;

                var thumb = item.poster || item.backdrop || "";
                var currentEp = item.currentEpisode || 1;
                var totalEp = item.totalEpisodes || 1;
                var statusStr = totalEp > 1 ? (currentEp + "/" + totalEp + " Tập") : (item.language || "Full HD");

                items.push({
                    "id": item.slug || item.id,
                    "title": item.title || item.originalTitle || "",
                    "posterUrl": thumb,
                    "backdropUrl": item.backdrop || thumb,
                    "year": item.releaseYear || 0,
                    "duration": item.duration ? (item.duration + " phút") : "",
                    "quality": statusStr,
                    "description": item.description ? item.description.replace(/<[^>]+>/g, '').trim() : ""
                });
            }
        }

        var currentPage = pageIndex + 1;
        var totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
        if (totalPages < 1) totalPages = 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}

function parseSearchResponse(response, fetchedUrl) {
    return parseListResponse(response, fetchedUrl);
}

function parseSearchResult(response, fetchedUrl) {
    return parseListResponse(response, fetchedUrl);
}

function parseList(response, fetchedUrl) {
    return parseListResponse(response, fetchedUrl);
}

function parseMovieDetail(response, fetchedUrl) {
    try {
        if (!response) return "null";

        var jsonStr = "";
        if (typeof response === "string") {
            var idx = response.indexOf("{");
            if (idx !== -1) {
                jsonStr = response.substring(idx);
            }
        }

        if (!jsonStr) return "null";

        var resObj = JSON.parse(jsonStr);
        var data = resObj.data || resObj;

        if (!data || (!data.id && !data.title)) {
            return "null";
        }

        var title = data.title || data.originalTitle || "";
        var thumb = data.poster || data.backdrop || "";
        var desc = data.description ? data.description.replace(/<[^>]+>/g, '').trim() : "";
        var directors = data.directors && Array.isArray(data.directors) ? data.directors.join(", ") : "";
        var actors = data.actors && Array.isArray(data.actors) ? data.actors.join(", ") : "";
        var genres = data.genres && Array.isArray(data.genres) ? data.genres.join(", ") : "";
        var countries = data.countries && Array.isArray(data.countries) ? data.countries.join(", ") : "";

        var rawEpisodes = data.episodes || [];
        var serverMap = {};

        for (var i = 0; i < rawEpisodes.length; i++) {
            var ep = rawEpisodes[i];
            if (!ep || ep.isTrailer) continue;

            var srvName = ep.server || "Server VIP";
            if (!serverMap[srvName]) {
                serverMap[srvName] = [];
            }

            var streamUrl = "";
            if (ep.videoSources && ep.videoSources.length > 0) {
                streamUrl = ep.videoSources[0].url || "";
            }

            var epTitle = ep.title || ("Tập " + (i + 1));
            serverMap[srvName].push({
                id: streamUrl || (BASE_URL + "/phim/" + (data.slug || "") + "#ep" + (i + 1)),
                name: epTitle,
                slug: "tap-" + (i + 1),
                rawIndex: parseInt(epTitle.replace(/\D/g, ''), 10) || (i + 1)
            });
        }

        var servers = [];
        for (var sName in serverMap) {
            if (serverMap.hasOwnProperty(sName)) {
                var epList = serverMap[sName];
                epList.sort(function(a, b) {
                    return a.rawIndex - b.rawIndex;
                });

                var formattedEps = [];
                for (var j = 0; j < epList.length; j++) {
                    formattedEps.push({
                        id: epList[j].id,
                        name: epList[j].name,
                        slug: epList[j].slug
                    });
                }

                servers.push({
                    name: sName,
                    episodes: formattedEps
                });
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Server VIP",
                episodes: [{
                    id: BASE_URL + "/phim/" + (data.slug || ""),
                    name: "Full HD",
                    slug: "full"
                }]
            });
        }

        var curEp = data.currentEpisode || 1;
        var totEp = data.totalEpisodes || 1;
        var statusStr = totEp > 1 ? ("Tập " + curEp + "/" + totEp) : "Full HD";

        return JSON.stringify({
            id: data.slug || data.id,
            title: title,
            posterUrl: thumb,
            backdropUrl: data.backdrop || thumb,
            description: desc,
            servers: servers,
            quality: "Full HD",
            year: data.releaseYear || 2026,
            rating: data.rating || 0,
            status: statusStr,
            duration: data.duration ? (data.duration + " phút") : "",
            casts: actors,
            director: directors,
            category: genres,
            country: countries
        });

    } catch (e) {
        return "null";
    }
}

function parseDetail(response, fetchedUrl) {
    return parseMovieDetail(response, fetchedUrl);
}

// =============================================================================
// STREAM RESOLUTION FOR PLAYER
// =============================================================================

function parseDetailResponse(response, fetchedUrl) {
    try {
        var directUrl = "";

        if (fetchedUrl && (fetchedUrl.indexOf(".m3u8") !== -1 || fetchedUrl.indexOf(".mp4") !== -1)) {
            directUrl = fetchedUrl;
        }

        if (!directUrl && response) {
            var jsonStr = "";
            if (typeof response === "string") {
                var idx = response.indexOf("{");
                if (idx !== -1) jsonStr = response.substring(idx);
            }

            if (jsonStr) {
                var resObj = JSON.parse(jsonStr);
                var data = resObj.data || resObj;
                if (data.episodes && data.episodes.length > 0) {
                    var ep0 = data.episodes[0];
                    if (ep0.videoSources && ep0.videoSources.length > 0) {
                        directUrl = ep0.videoSources[0].url || "";
                    }
                }
            }
        }

        if (!directUrl && fetchedUrl) {
            directUrl = fetchedUrl;
        }

        return JSON.stringify({
            url: directUrl,
            isEmbed: false,
            headers: {
                "Referer": BASE_URL + "/",
                "Origin": BASE_URL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({
            url: fetchedUrl || "",
            isEmbed: false,
            headers: {
                "Referer": BASE_URL + "/"
            }
        });
    }
}

function parseEpisodePlayer(response, fetchedUrl) {
    return parseDetailResponse(response, fetchedUrl);
}

function parsePlayerUrl(response) {
    return parseDetailResponse(response, "");
}

function parseEmbedPlayer(html, url) {
    return JSON.stringify({
        url: url,
        isEmbed: false,
        headers: {
            "Referer": BASE_URL + "/"
        }
    });
}
