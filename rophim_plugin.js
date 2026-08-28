// =============================================================================
// RoPhim Plugin (Tương thích 100% Mozilla Rhino JS & Android TV SuperOK)
// Hỗ trợ RoPhim API v1, Phim Lẻ, Phim Bộ (Đa Server: Vietsub, Lồng Tiếng, Thuyết Minh)
// =============================================================================

var BASEURL = "https://www.rophim.ad";
var BASEAPI = "https://api.rophim.stream";

// Hàm giải mã Base64 chuẩn RFC 4648 (Tự động bù padding & loại bỏ null byte cho Rhino)
function decodeBase64(input) {
    if (!input) return "";
    var str = String(input).replace(/[^A-Za-z0-9+/=_-]/g, "");
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4 !== 0) {
        str += "=";
    }
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var out = "";
    for (var i = 0; i < str.length; i += 4) {
        var b1 = chars.indexOf(str.charAt(i));
        var b2 = chars.indexOf(str.charAt(i + 1));
        var b3 = chars.indexOf(str.charAt(i + 2));
        var b4 = chars.indexOf(str.charAt(i + 3));

        if (b1 < 0 || b2 < 0) break;

        var c1 = (b1 << 2) | (b2 >> 4);
        out += String.fromCharCode(c1);

        if (b3 >= 0 && b3 !== 64 && str.charAt(i + 2) !== "=") {
            var c2 = ((b2 & 15) << 4) | (b3 >> 2);
            out += String.fromCharCode(c2);
        }
        if (b4 >= 0 && b4 !== 64 && str.charAt(i + 3) !== "=") {
            var c3 = ((b3 & 3) << 6) | b4;
            out += String.fromCharCode(c3);
        }
    }
    out = out.replace(/\0/g, "");
    try {
        return decodeURIComponent(escape(out));
    } catch(e) {
        return out;
    }
}

// Chuyển đổi mã hóa v-c3Rv... thành link ảnh trực tiếp storage/images/...
function getImageUrl(rawPath) {
    if (!rawPath) return "";
    if (rawPath.indexOf("http") === 0) return rawPath;
    if (rawPath.indexOf("v-") === 0) {
        var clean = rawPath.substring(2);
        var dotIdx = clean.lastIndexOf(".");
        if (dotIdx > -1) clean = clean.substring(0, dotIdx);
        var decoded = decodeBase64(clean);
        if (decoded && decoded.indexOf("storage/") === 0) {
            return BASEAPI + "/" + decoded;
        }
    }
    return BASEAPI + "/" + rawPath;
}

function getManifest() {
    try {
        return JSON.stringify({
            "id": "rophim",
            "name": "Nguồn RoPhim",
            "description": "Kho phim RoPhim HD/FHD/4K (Vietsub, Lồng Tiếng, Thuyết Minh)",
            "version": "1.0.0",
            "author": "Alokillgtv",
            "baseUrl": BASEURL,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/rophim.png",
            "isEnabled": true,
            "isAdult": false,
            "type": "MOVIE",
            "playerType": "embed"
        });
    } catch(e) {
        return JSON.stringify({
            "id": "rophim",
            "name": "Nguồn RoPhim",
            "version": "1.0.0",
            "baseUrl": BASEURL,
            "isEnabled": true,
            "type": "MOVIE",
            "playerType": "embed"
        });
    }
}

// ===== MENU LIST & SECTIONS =====

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/v1/movie/filterV2?is_shown_in_theater=1&exclude_status=Upcoming&sort=release_date", "title": "Chiếu Rạp", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?status=completed&exclude_status=Upcoming&sort=release_date", "title": "Trọn Bộ", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?type=1&exclude_status=Upcoming&sort=release_date", "title": "Phim Lẻ Mới", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?type=2&exclude_status=Upcoming&sort=release_date", "title": "Phim Bộ Mới", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?versions=4&exclude_status=Upcoming&sort=release_date", "title": "Thuyết Minh", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?versions=2&exclude_status=Upcoming&sort=release_date", "title": "Lồng Tiếng", "type": "Horizontal" },
        { "slug": "/api/v1/movie/filterV2?exclude_status=Upcoming&sort=release_date", "title": "Tất Cả Phim Mới", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return [
        { "link": "/api/v1/movie/filterV2?genres=w0ezvedE&sort=release_date", "name": "Hành Động" },
        { "link": "/api/v1/movie/filterV2?genres=DOX75eKx&sort=release_date", "name": "Phiêu Lưu" },
        { "link": "/api/v1/movie/filterV2?genres=QyXNlerW&sort=release_date", "name": "Hoạt Hình" },
        { "link": "/api/v1/movie/filterV2?genres=8EVM6e0Y&sort=release_date", "name": "Anime" },
        { "link": "/api/v1/movie/filterV2?genres=Wy9D2Vn4&sort=release_date", "name": "Hài Hước" },
        { "link": "/api/v1/movie/filterV2?genres=P6XKv9d8&sort=release_date", "name": "Hình Sự" },
        { "link": "/api/v1/movie/filterV2?genres=q6eEDVQa&sort=release_date", "name": "Tài Liệu" },
        { "link": "/api/v1/movie/filterV2?genres=bPVJl9p5&sort=release_date", "name": "Chính Kịch" },
        { "link": "/api/v1/movie/filterV2?genres=RweWEXrM&sort=release_date", "name": "Gia Đình" },
        { "link": "/api/v1/movie/filterV2?genres=GxVo3VAn&sort=release_date", "name": "Cổ Trang" },
        { "link": "/api/v1/movie/filterV2?genres=o2elOVGK&sort=release_date", "name": "Kinh Dị" },
        { "link": "/api/v1/movie/filterV2?genres=jwVGrXo2&sort=release_date", "name": "Âm Nhạc" },
        { "link": "/api/v1/movie/filterV2?genres=aQe4Q9jJ&sort=release_date", "name": "Bí Ẩn" },
        { "link": "/api/v1/movie/filterV2?genres=K8V1M4VJ&sort=release_date", "name": "Lãng Mạn" },
        { "link": "/api/v1/movie/filterV2?genres=mZVvnV8R&sort=release_date", "name": "Khoa Học" },
        { "link": "/api/v1/movie/filterV2?genres=jaen4XoK&sort=release_date", "name": "Viễn Tưởng" },
        { "link": "/api/v1/movie/filterV2?genres=mjeRaDVq&sort=release_date", "name": "Giật Gân" },
        { "link": "/api/v1/movie/filterV2?genres=xD96gXZK&sort=release_date", "name": "Chiến Tranh" },
        { "link": "/api/v1/movie/filterV2?genres=Wy9Dz2Vn&sort=release_date", "name": "Kiếm Hiệp" },
        { "link": "/api/v1/movie/filterV2?genres=nw9qm692&sort=release_date", "name": "Võ Hiệp" },
        { "link": "/api/v1/movie/filterV2?genres=28e30p9Z&sort=release_date", "name": "Tiên Hiệp" },
        { "link": "/api/v1/movie/filterV2?genres=OAednWXD&sort=release_date", "name": "Xuyên Không" },
        { "link": "/api/v1/movie/filterV2?genres=w0ezDrXd&sort=release_date", "name": "Ngôn Tình" },
        { "link": "/api/v1/movie/filterV2?genres=NrXgAeva&sort=release_date", "name": "Học Đường" },
        { "link": "/api/v1/movie/filterV2?genres=K8V1YMVJ&sort=release_date", "name": "Siêu Anh Hùng" },
        { "link": "/api/v1/movie/filterV2?genres=RrXYnV8l&sort=release_date", "name": "LGBTQ+" }
    ];
}

function getPrimaryCategories() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({
                "name": menu[i].name,
                "slug": menu[i].link
            });
        }
        return JSON.stringify(result);
    } catch(e) {
        return JSON.stringify([]);
    }
}

function getFilterConfig() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({
                "name": menu[i].name,
                "slug": menu[i].link
            });
        }
        return JSON.stringify({
            category: result
        });
    } catch(e) {
        return JSON.stringify({ category: [] });
    }
}

function parseCategoriesResponse(apiResponseJson) {
    return getPrimaryCategories();
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// ===== URL GENERATION =====

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/api/v1/movie/filterV2?sort=release_date";
        if (filtersJson) {
            try {
                var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
                if (f.page) page = parseInt(f.page, 10) || 1;
                if (f.category) {
                    if (Array.isArray(f.category) && f.category.length > 0) {
                        path = f.category[0].slug || f.category[0].link || path;
                    } else if (typeof f.category === "string") {
                        path = f.category;
                    }
                }
            } catch(e) {}
        }
        var url = path.indexOf("http") === 0 ? path : (BASEAPI + (path.indexOf("/") === 0 ? "" : "/") + path);
        if (page > 0 && url.indexOf("page=") === -1) {
            url += (url.indexOf("?") > -1 ? "&page=" : "?page=") + page;
        }
        return url;
    } catch(e) {
        return BASEAPI + "/api/v1/movie/filterV2?sort=release_date&page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
            if (f.page) page = parseInt(f.page, 10) || 1;
        } catch(e) {}
    }
    return BASEAPI + "/api/v1/movie/filterV2?q=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return BASEAPI + (slug.indexOf("/") === 0 ? "" : "/") + slug;
}

// ===== PARSE LIST RESPONSE =====

function parseListResponse(html, $url) {
    try {
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
        var dataObj = typeof html === "object" ? html : JSON.parse(html);
        var result = dataObj.result || dataObj.data || {};
        var rawItems = result.items || [];
        var items = [];

        for (var i = 0; i < rawItems.length; i++) {
            var item = rawItems[i];
            if (!item || !item._id) continue;

            var title = item.title || item.name || item.original_title || "";
            if (!title) continue;

            var poster = "";
            if (item.images && item.images.posters && item.images.posters.length > 0) {
                poster = getImageUrl(item.images.posters[0].path);
            }
            var backdrop = poster;
            if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
                backdrop = getImageUrl(item.images.backdrops[0].path);
            }

            var isTV = (item.type === 2);
            var quality = item.quality ? String(item.quality).toUpperCase() : "HD";
            var year = item.year ? String(item.year) : "";

            var statusStr = item.status || "";
            if (statusStr) {
                statusStr = statusStr.replace(/on going/i, "Đang Ra")
                                     .replace(/released/i, "Hoàn Thành")
                                     .replace(/upcoming/i, "Sắp Ra");
            }
            var episodeCurrent = statusStr || (isTV ? "Phim Bộ" : "Phim Lẻ");

            var id = "/api/v1/movie/detail/" + item._id;

            items.push({
                "id": id,
                "title": title,
                "quality": quality,
                "episode_current": episodeCurrent,
                "posterUrl": poster,
                "backdropUrl": backdrop,
                "year": year
            });
        }

        var currentPage = 1;
        if ($url) {
            var pMatch = $url.match(/[?&]page=(\d+)/i);
            if (pMatch) currentPage = parseInt(pMatch[1], 10);
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": 999,
                "hasNext": items.length >= 20
            }
        });
    } catch(e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// ===== PARSE MOVIE DETAIL =====

function parseMovieDetail(html, url) {
    try {
        if (!html) throw new Error("Dữ liệu rỗng");
        var dataObj = typeof html === "object" ? html : JSON.parse(html);
        var item = dataObj.result || dataObj.data || dataObj;
        if (!item || !item._id) throw new Error("Không tìm thấy thông tin phim");

        var title = item.title || item.original_title || "Phim";
        var description = item.overview || "Đang cập nhật nội dung phim...";
        
        var posterUrl = "";
        if (item.images && item.images.posters && item.images.posters.length > 0) {
            posterUrl = getImageUrl(item.images.posters[0].path);
        }
        var backdropUrl = posterUrl;
        if (item.images && item.images.backdrops && item.images.backdrops.length > 0) {
            backdropUrl = getImageUrl(item.images.backdrops[0].path);
        }

        var year = item.year ? parseInt(item.year, 10) : 0;
        var quality = item.quality ? String(item.quality).toUpperCase() : "HD";
        var rating = item.imdb_rating ? parseFloat(item.imdb_rating) : (item.rating ? 0.0 : 0.0);
        var duration = item.runtime ? (item.runtime + " phút") : "";
        var status = item.status || "Hoàn thành";
        var isTV = (item.type === 2);
        var episodeCurrent = isTV ? (item.total_episodes ? (item.total_episodes + " Tập") : "Phim Bộ") : "Full HD";

        var category = "";
        if (item.genres && Array.isArray(item.genres)) {
            category = item.genres.map(function(g) { return g.name; }).join(", ");
        }

        var country = "";
        if (item.countries && Array.isArray(item.countries)) {
            country = item.countries.map(function(c) { return c.name; }).join(", ");
        }

        var director = "";
        if (item.directors && Array.isArray(item.directors)) {
            director = item.directors.map(function(d) { return d.name; }).join(", ");
        }

        var casts = "";
        if (item.actors && Array.isArray(item.actors)) {
            casts = item.actors.slice(0, 6).map(function(a) { return a.name; }).join(", ");
        }

        var servers = [];
        var latestEpisode = item.latest_episode || { "1": 1 };

        function getVersionName(verKey) {
            var k = String(verKey);
            if (k === "1") return "Server Vietsub";
            if (k === "2") return "Server Lồng Tiếng";
            if (k === "3") return "Server Thuyết Minh [MB]";
            if (k === "4") return "Server Thuyết Minh [MN]";
            return "Server " + k;
        }

        if (isTV) {
            // TV Show (Phim bộ)
            for (var verKey in latestEpisode) {
                var verName = getVersionName(verKey);
                var epCount = parseInt(latestEpisode[verKey], 10) || 1;
                var episodes = [];

                for (var ep = 1; ep <= epCount; ep++) {
                    var epUrl = "https://api.rophim.stream/player/embed?id=" + item._id + "&ep=" + ep + "&ss=1&ver=" + verKey + "&version=1";
                    episodes.push({
                        id: epUrl,
                        name: "Tập " + ep,
                        slug: "tap-" + ep
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: verName,
                        episodes: episodes
                    });
                }
            }
        } else {
            // Movie (Phim lẻ)
            for (var verKey in latestEpisode) {
                var verName = getVersionName(verKey);
                var epUrl = "https://api.rophim.stream/player/embed?id=" + item._id + "&ver=" + verKey;
                servers.push({
                    name: verName,
                    episodes: [
                        {
                            id: epUrl,
                            name: "Xem Phim (" + verName.replace("Server ", "") + ")",
                            slug: "full"
                        }
                    ]
                });
            }
        }

        if (servers.length === 0) {
            servers.push({
                name: "Server Vietsub",
                episodes: [
                    {
                        id: "https://api.rophim.stream/player/embed?id=" + item._id + "&ver=1",
                        name: "Xem Phim",
                        slug: "full"
                    }
                ]
            });
        }

        return JSON.stringify({
            id: url || String(item._id),
            title: title,
            name: title,
            originName: item.original_title || "",
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            year: year,
            rating: rating,
            quality: quality,
            category: category,
            country: country,
            casts: casts,
            director: director,
            status: status,
            time: duration,
            episode_current: episodeCurrent,
            servers: servers
        });
    } catch(e) {
        return JSON.stringify({
            id: url || "error",
            title: "Lỗi tải chi tiết",
            name: "Lỗi tải chi tiết",
            description: "Chi tiết lỗi: " + e,
            servers: []
        });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

// ===== PARSE PLAYER & EMBED =====

function parseDetailResponse(html, url) {
    try {
        return JSON.stringify({
            url: url,
            isEmbed: true,
            mimeType: "text/html",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.rophim.ad/",
                "Origin": "https://www.rophim.ad"
            },
            subtitles: []
        });
    } catch(e) {
        return JSON.stringify({
            url: url || "",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}
