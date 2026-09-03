// =============================================================================
// 4K Movie Plugin (Tương thích 100% Mozilla Rhino JS & Android TV SuperOK)
// Hỗ trợ TMDB API, Streams trực tiếp 4K/FullHD & Phát mượt mà không độ trễ
// =============================================================================

var BASEURL = "https://moviedb.alokillgtv.workers.dev";
var BASEAPI = "https://vaxplayer.vercel.app";

// Polyfill BASE64 thuần ES5 (Tương thích tuyệt đối Rhino Engine trên Android)
var BASE64 = {
    _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
        if (!input) return "";
        var str = String(input);
        var utf8 = unescape(encodeURIComponent(str));
        var out = "";
        var i = 0;
        while (i < utf8.length) {
            var c1 = utf8.charCodeAt(i++) & 0xff;
            var c2 = i < utf8.length ? (utf8.charCodeAt(i++) & 0xff) : NaN;
            var c3 = i < utf8.length ? (utf8.charCodeAt(i++) & 0xff) : NaN;
            var b1 = c1 >> 2;
            var b2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : (c2 >> 4));
            var b3 = isNaN(c2) ? 64 : (((c2 & 15) << 2) | (isNaN(c3) ? 0 : (c3 >> 6)));
            var b4 = isNaN(c3) ? 64 : (c3 & 63);
            out += this._chars.charAt(b1) + this._chars.charAt(b2) + this._chars.charAt(b3) + this._chars.charAt(b4);
        }
        return out;
    },
    decode: function(input) {
        if (!input) return "";
        var str = String(input).replace(/[^A-Za-z0-9+/=]/g, "");
        var out = "";
        var i = 0;
        while (i < str.length) {
            var b1 = this._chars.indexOf(str.charAt(i++));
            var b2 = this._chars.indexOf(str.charAt(i++));
            var b3 = this._chars.indexOf(str.charAt(i++));
            var b4 = this._chars.indexOf(str.charAt(i++));
            var c1 = (b1 << 2) | (b2 >> 4);
            var c2 = ((b2 & 15) << 4) | (b3 >> 2);
            var c3 = ((b3 & 3) << 6) | b4;
            out += String.fromCharCode(c1);
            if (b3 !== 64 && !isNaN(b3) && b3 !== -1) out += String.fromCharCode(c2);
            if (b4 !== 64 && !isNaN(b4) && b4 !== -1) out += String.fromCharCode(c3);
        }
        try {
            return decodeURIComponent(escape(out));
        } catch(e) {
            return out;
        }
    }
};

function getManifest() {
    try {
        return JSON.stringify({
            "id": "4kmovie",
            "name": "Nguồn 4K Movie",
            "description": "Kho phim chiếu rạp và phim lẻ 4K/FHD chất lượng cao.",
            "info": "Kho phim chiếu rạp và phim lẻ 4K/FHD chất lượng cao.",
            "version": "1.0.2",
            "author": "Alokillgtv",
            "baseUrl": BASEURL,
            "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/film4k.png",
            "isEnabled": true,
            "isAdult": false,
            "type": "MOVIE",
            "playerType": "exoplayer"
        });
    } catch(e) {
        return JSON.stringify({
            "id": "4kmovie",
            "name": "Nguồn 4K Movie",
            "version": "1.0.1",
            "baseUrl": BASEURL,
            "isEnabled": true,
            "type": "MOVIE"
        });
    }
}

// ===== MENU LIST & SECTIONS =====

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/themoviedb?endpoint=movie/now_playing&language=vi-VN", "title": "Phim Chiếu Rạp", "type": "Horizontal" },
        { "slug": "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN", "title": "Phim Lẻ Thịnh Hành", "type": "Horizontal" },
        { "slug": "/api/themoviedb?endpoint=tv/top_rated&language=vi-VN", "title": "TV Show Đánh Giá Cao", "type": "Horizontal" },
        { "slug": "/api/themoviedb?endpoint=movie/top_rated&language=vi-VN", "title": "Phim Lẻ Điểm Cao", "type": "Horizontal" },
        { "slug": "/api/themoviedb?endpoint=trending/tv/day&language=vi-VN", "title": "TV Show Mới Thịnh Hành", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return [
        { "name": "Phim Thịnh Hành", "link": "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN" },
        { "name": "Phim Chiếu Rạp", "link": "/api/themoviedb?endpoint=movie/now_playing&language=vi-VN" },
        { "name": "Phim Lẻ Đánh Giá Cao", "link": "/api/themoviedb?endpoint=movie/top_rated&language=vi-VN" },
        { "name": "TV Show Thịnh Hành", "link": "/api/themoviedb?endpoint=trending/tv/day&language=vi-VN" },
        { "name": "TV Show Đang Phát Sóng", "link": "/api/themoviedb?endpoint=tv/on_the_air&language=vi-VN" },
        { "name": "TV Show Đánh Giá Cao", "link": "/api/themoviedb?endpoint=tv/top_rated&language=vi-VN" },
        { "name": "Phim Hành Động", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=28&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Phiêu Lưu", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=12&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Hoạt Hình", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=16&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Hài Hước", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=35&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Hình Sự", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=80&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Tài Liệu", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=99&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Chính Kịch", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=18&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Gia Đình", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10751&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Lịch Sử", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=36&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Kinh Dị", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=27&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Âm Nhạc", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10402&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Bí Ẩn", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=9648&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Lãng Mạn", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10749&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Viễn Tưởng", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=878&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Giật Gân", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=53&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Chiến Tranh", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=10752&sort_by=popularity.desc&language=vi-VN" },
        { "name": "Phim Miền Tây", "link": "/api/themoviedb?endpoint=discover/movie&with_genres=37&sort_by=popularity.desc&language=vi-VN" }
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
        var path = slug || "/api/themoviedb?endpoint=trending/movie/day&language=vi-VN";
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
        var url = path.indexOf("http") === 0 ? path : (BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path);
        if (page > 0 && url.indexOf("page=") === -1) {
            url += (url.indexOf("?") > -1 ? "&page=" : "?page=") + page;
        }
        return url;
    } catch(e) {
        return BASEURL;
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
    return BASEURL + "/api/themoviedb?endpoint=search/multi&language=vi-VN&query=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return BASEURL + (slug.indexOf("/") === 0 ? "" : "/") + slug;
}

// ===== PARSE LIST RESPONSE =====

function parseListResponse(html, $url) {
    try {
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
        var $data = typeof html === "object" ? html : JSON.parse(html);
        var results = $data.results || $data.data || [];
        var items = [];
        var isTVList = $url && ($url.indexOf("endpoint=tv/") > -1 || $url.indexOf("endpoint=trending/tv") > -1 || $url.indexOf("discover/tv") > -1);

        for (var i = 0; i < results.length; i++) {
            var item = results[i];
            if (!item || !item.id) continue;

            var isTV = isTVList || item.media_type === "tv" || item.first_air_date !== undefined || (item.name && !item.title);
            var mediaType = isTV ? "tv" : "movie";
            var title = item.name || item.title || item.original_name || item.original_title || "";
            if (!title) continue;

            var poster = item.poster_path ? ("https://image.tmdb.org/t/p/w500" + item.poster_path) : "";
            var backdrop = item.backdrop_path ? ("https://image.tmdb.org/t/p/w780" + item.backdrop_path) : poster;
            var releaseDate = item.first_air_date || item.release_date || "";
            var year = releaseDate ? parseInt(releaseDate.split("-")[0], 10) : 0;
            var id = "/api/themoviedb?endpoint=" + mediaType + "/" + item.id + "&language=vi-VN";

            items.push({
                "id": id,
                "title": title,
                "quality": "4K",
                "episode_current": isTV ? "Phim Bộ" : "Phim Lẻ",
                "posterUrl": poster,
                "backdropUrl": backdrop,
                "year": year ? String(year) : ""
            });
        }

        var currentPage = $data.page || 1;
        var totalPages = $data.total_pages || 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages
            }
        });
    } catch(e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

// ===== PARSE DETAIL RESPONSE =====

function parseMovieDetail(html, url) {
    try {
        if (!html) throw new Error("Dữ liệu chi tiết rỗng");
        var $data = typeof html === "object" ? html : JSON.parse(html);
        if (!$data || !$data.id) throw new Error("Dữ liệu TMDB không hợp lệ");

        var tmdbId = $data.id;
        var origTitle = $data.original_title || $data.original_name || $data.english_title || $data.title || $data.name || "";
        var title = $data.title || $data.name || origTitle || "Phim";
        var description = $data.overview || "Đang cập nhật nội dung phim...";
        var posterUrl = $data.poster_path ? ("https://image.tmdb.org/t/p/w500" + $data.poster_path) : "";
        var backdropUrl = $data.backdrop_path ? ("https://image.tmdb.org/t/p/w780" + $data.backdrop_path) : posterUrl;
        var releaseDate = $data.release_date || $data.first_air_date || "";
        var year = releaseDate ? parseInt(releaseDate.split("-")[0], 10) : 0;
        var duration = $data.runtime ? ($data.runtime + " phút") : ($data.episode_run_time && $data.episode_run_time.length > 0 ? ($data.episode_run_time[0] + " phút/tập") : "");
        var rating = $data.vote_average ? parseFloat($data.vote_average.toFixed(1)) : 0.0;
        var status = $data.status || "Hoàn thành";
        var isTV = (url && url.indexOf("endpoint=tv/") > -1) || $data.first_air_date !== undefined || ($data.seasons && Array.isArray($data.seasons));
        var episodeCurrent = isTV ? ($data.number_of_episodes ? ($data.number_of_episodes + " Tập") : "Phim Bộ") : "Full HD / 4K";

        var category = "";
        if ($data.genres && Array.isArray($data.genres)) {
            category = $data.genres.map(function(g) { return g.name; }).join(", ");
        }

        var country = "";
        if ($data.production_countries && Array.isArray($data.production_countries)) {
            country = $data.production_countries.map(function(c) { return c.name; }).join(", ");
        }

        var director = "";
        var casts = "";
        if ($data.credits) {
            if ($data.credits.crew) {
                var dirs = $data.credits.crew.filter(function(p) { return p.job === "Director"; });
                director = dirs.map(function(d) { return d.name; }).join(", ");
            }
            if ($data.credits.cast) {
                casts = $data.credits.cast.slice(0, 6).map(function(c) { return c.name; }).join(", ");
            }
        }

        var rawImdb = $data.raw_imdb_id || $data.imdb_id || ($data.external_ids ? $data.external_ids.imdb_id : "") || "";
        var cleanImdb = rawImdb ? String(rawImdb).trim() : "";
        var formattedTtId = cleanImdb ? (cleanImdb.indexOf("tt") === 0 ? cleanImdb : ("tt" + cleanImdb)) : "";

        // Ưu tiên truyền tên gốc / tên tiếng Anh để scraper quốc tế tìm chính xác
        var searchTitle = origTitle || title;

        var servers = [];

        if (isTV) {
            var seasons = ($data.seasons && Array.isArray($data.seasons)) ? $data.seasons : [];
            var validSeasons = seasons.filter(function(s) {
                return (s.season_number > 0 || seasons.length === 1) && (s.episode_count > 0 || (s.episodes && s.episodes.length > 0));
            });

            if (validSeasons.length === 0) {
                validSeasons = [{ season_number: 1, episode_count: 1 }];
            }

            var serverConfigs = [
                { id: "1", label: "Server 1 (VIP)" },
                { id: "2", label: "Server 2 (HD)" },
                { id: "3", label: "Server 3 (Dự phòng)" }
            ];

            validSeasons.forEach(function(s) {
                var sNum = s.season_number !== undefined ? s.season_number : 1;
                var epCount = s.episode_count || (s.episodes ? s.episodes.length : 1);

                serverConfigs.forEach(function(srv) {
                    var epList = [];
                    for (var ep = 1; ep <= epCount; ep++) {
                        var epUrl = "https://fetchvideo.alokillgtv.workers.dev/?type=tv&id=" + tmdbId +
                                    (formattedTtId ? ("&imdb_id=" + encodeURIComponent(formattedTtId) + "&ttid=" + encodeURIComponent(formattedTtId)) : "") +
                                    "&title=" + encodeURIComponent(searchTitle) +
                                    "&season=" + sNum + "&episode=" + ep + "&server=" + srv.id;
                        epList.push({
                            id: epUrl,
                            name: "Tập " + ep,
                            slug: epUrl
                        });
                    }

                    var serverTitle = (validSeasons.length > 1 ? ("Mùa " + sNum + " - ") : "") + srv.label;
                    servers.push({
                        name: serverTitle,
                        episodes: epList
                    });
                });
            });
        } else {
            var baseFetch = "https://fetchvideo.alokillgtv.workers.dev/?type=movie&id=" + tmdbId +
                            (formattedTtId ? ("&imdb_id=" + encodeURIComponent(formattedTtId) + "&ttid=" + encodeURIComponent(formattedTtId)) : "") +
                            "&title=" + encodeURIComponent(searchTitle);

            servers = [
                {
                    name: "Server 1 (VIP)",
                    episodes: [{ id: baseFetch + "&server=1", name: "Xem Phim (Server 1)", slug: baseFetch + "&server=1" }]
                },
                {
                    name: "Server 2 (HD)",
                    episodes: [{ id: baseFetch + "&server=2", name: "Xem Phim (Server 2)", slug: baseFetch + "&server=2" }]
                },
                {
                    name: "Server 3 (Dự phòng)",
                    episodes: [{ id: baseFetch + "&server=3", name: "Xem Phim (Server 3)", slug: baseFetch + "&server=3" }]
                },
                {
                    name: "Server 4 (Dự phòng)",
                    episodes: [{ id: baseFetch + "&server=4", name: "Xem Phim (Server 4)", slug: baseFetch + "&server=4" }]
                }
            ];
        }

        return JSON.stringify({
            id: url || String(tmdbId),
            title: title,
            name: title,
            originName: origTitle,
            posterUrl: posterUrl,
            backdropUrl: backdropUrl,
            description: description,
            year: year,
            rating: rating,
            quality: "4K",
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

// ===== PARSE PLAYER & EMBED STREAMS =====

function parseDetailResponse(html, url) {
    try {
        if (!html) {
            return JSON.stringify({ url: "", mimeType: "video/mp4", isEmbed: false, headers: {} });
        }
        var dataObj = typeof html === "object" ? html : JSON.parse(html);
        if (!dataObj) {
            return JSON.stringify({ url: "", mimeType: "video/mp4", isEmbed: false, headers: {} });
        }

        var rawStreams = (dataObj && Array.isArray(dataObj.data)) ? dataObj.data : ((dataObj && Array.isArray(dataObj.streams)) ? dataObj.streams : []);
        if (!rawStreams || rawStreams.length === 0) {
            return JSON.stringify({
                url: "",
                mimeType: "video/mp4",
                isEmbed: false,
                headers: {}
            });
        }

        var serverMatch = (url || "").match(/[?&]server=(\d+)/i);
        var requestedIdx = serverMatch ? (parseInt(serverMatch[1], 10) - 1) : 0;
        var srvIdx = (requestedIdx >= 0 && requestedIdx < rawStreams.length) ? requestedIdx : 0;
        var selectedStream = rawStreams[srvIdx];

        // Nếu stream được chọn không có URL, tìm stream hợp lệ đầu tiên
        var rawStreamUrl = selectedStream ? (selectedStream.streamUrl || selectedStream.url || "") : "";
        if (!rawStreamUrl) {
            for (var i = 0; i < rawStreams.length; i++) {
                if (rawStreams[i] && (rawStreams[i].streamUrl || rawStreams[i].url)) {
                    selectedStream = rawStreams[i];
                    rawStreamUrl = selectedStream.streamUrl || selectedStream.url;
                    break;
                }
            }
        }

        if (!rawStreamUrl) {
            return JSON.stringify({ url: "", mimeType: "video/mp4", isEmbed: false, headers: {} });
        }

        var rawMimeType = (selectedStream && selectedStream.mimeType) ? selectedStream.mimeType : "application/x-mpegURL";
        if (rawStreamUrl.split("?")[0].toLowerCase().endsWith(".mp4")) {
            rawMimeType = "video/mp4";
        }

        var customHeaders = {
            "User-Agent": (selectedStream && selectedStream.userAgent) ? selectedStream.userAgent : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
        };
        if (selectedStream && selectedStream.referer) customHeaders["Referer"] = selectedStream.referer;
        if (selectedStream && selectedStream.origin) customHeaders["Origin"] = selectedStream.origin;

        return JSON.stringify({
            url: rawStreamUrl,
            mimeType: rawMimeType,
            isEmbed: false,
            headers: customHeaders
        });
    } catch(e) {
        return JSON.stringify({
            url: "",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {}
        });
    }
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parsePlayerUrl(html) {
    return parseDetailResponse(html, "");
}
