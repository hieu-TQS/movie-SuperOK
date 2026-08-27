// =============================================================================
// 4K Movie Plugin (Tương thích 100% Mozilla Rhino JS & Android TV SuperOK)
// Hỗ trợ TMDB API, Streams trực tiếp 4K/FullHD & Phụ đề Vietsub tự động
// =============================================================================

var BASEURL = "https://moviedb.alokillgtv.workers.dev";
var BASEAPI = "https://fetchvideo.alokillgtv.workers.dev";

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
            if (b3 !== 64 && !isNaN(b3)) out += String.fromCharCode(c2);
            if (b4 !== 64 && !isNaN(b4)) out += String.fromCharCode(c3);
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
            "description": "Nguồn phim 4K Movie & TV Shows chất lượng cao kèm Vietsub",
            "version": "1.3.5",
            "author": "Alokillgtv",
            "baseUrl": BASEURL,
            "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/4kmovie.png",
            "isEnabled": true,
            "isAdult": false,
            "type": "MOVIE",
            "playerType": "exoplayer"
        });
    } catch(e) {
        return JSON.stringify({
            "id": "4kmovie",
            "name": "Nguồn 4K Movie",
            "version": "1.0",
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
        var title = $data.title || $data.name || $data.original_title || $data.original_name || "Phim";
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

        var rawImdb = $data.imdb_id || ($data.external_ids ? $data.external_ids.imdb_id : "") || "";
        var cleanImdb = rawImdb ? String(rawImdb).trim() : "";
        var formattedTtId = cleanImdb ? (cleanImdb.indexOf("tt") === 0 ? cleanImdb : ("tt" + cleanImdb)) : "";

        var servers = [];

        if (isTV) {
            var seasons = ($data.seasons && Array.isArray($data.seasons)) ? $data.seasons : [];
            var validSeasons = seasons.filter(function(s) {
                return (s.season_number > 0 || seasons.length === 1) && (s.episode_count > 0 || (s.episodes && s.episodes.length > 0));
            });

            if (validSeasons.length === 0) {
                validSeasons = [{ season_number: 1, episode_count: 1 }];
            }

            validSeasons.forEach(function(s) {
                var sNum = s.season_number !== undefined ? s.season_number : 1;
                var epCount = s.episode_count || (s.episodes ? s.episodes.length : 1);
                var epList = [];

                for (var ep = 1; ep <= epCount; ep++) {
                    var epUrl = "https://fetchvideo.alokillgtv.workers.dev/?type=tv&id=" + tmdbId +
                                (formattedTtId ? ("&imdb_id=" + encodeURIComponent(formattedTtId) + "&ttid=" + encodeURIComponent(formattedTtId)) : "") +
                                "&title=" + encodeURIComponent(title) +
                                "&season=" + sNum + "&episode=" + ep + "&server=1";
                    epList.push({
                        id: epUrl,
                        name: "Tập " + ep,
                        slug: epUrl
                    });
                }

                servers.push({
                    name: "Mùa " + sNum,
                    episodes: epList
                });
            });
        } else {
            var baseFetch = "https://fetchvideo.alokillgtv.workers.dev/?type=movie&id=" + tmdbId +
                            (formattedTtId ? ("&imdb_id=" + encodeURIComponent(formattedTtId) + "&ttid=" + encodeURIComponent(formattedTtId)) : "") +
                            "&title=" + encodeURIComponent(title);

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
            originName: $data.original_title || $data.original_name || "",
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
        if (!html) return JSON.stringify({ url: url || "", isEmbed: true });
        var dataObj = typeof html === "object" ? html : JSON.parse(html);
        var streams = (dataObj && Array.isArray(dataObj.data)) ? dataObj.data : ((dataObj && Array.isArray(dataObj.streams)) ? dataObj.streams : null);
        
        if (streams && streams.length > 0) {
            return parseEmbedResponse(html, url);
        }
        
        return JSON.stringify({
            url: url,
            mimeType: "application/json",
            isEmbed: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch(e) {
        return JSON.stringify({ url: url || "", isEmbed: true });
    }
}

function parseEmbedResponse(html, url) {
    try {
        if (!html) throw new Error("Dữ liệu rỗng");
        
        // Bước 2: Nhận Subtitle và trả về stream video hoàn chỉnh
        var streamMatch = url.match(/[?&]stream=([^&]+)/i);
        if (streamMatch) {
            var encodedStream = decodeURIComponent(streamMatch[1]);
            var decodedData = BASE64.decode(encodedStream);
            var streamUrl = "";
            var mimeType = "application/x-mpegURL";
            var customHeaders = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            };
            
            try {
                var parsedPayload = JSON.parse(decodedData);
                if (parsedPayload && parsedPayload.url) {
                    streamUrl = parsedPayload.url;
                    if (parsedPayload.mime) mimeType = parsedPayload.mime;
                    if (parsedPayload.headers) {
                        for (var k in parsedPayload.headers) {
                            customHeaders[k] = parsedPayload.headers[k];
                        }
                    }
                }
            } catch(eJson) {
                streamUrl = decodedData;
            }
            
            if (streamUrl && streamUrl.split("?")[0].toLowerCase().endsWith(".mp4")) {
                mimeType = "video/mp4";
            }
            
            var rawSubs = null;
            try {
                rawSubs = typeof html === "object" ? html : JSON.parse(html);
            } catch(eSub) {}
            
            var subsData = Array.isArray(rawSubs) ? rawSubs : ((rawSubs && Array.isArray(rawSubs.subtitles)) ? rawSubs.subtitles : []);
            var subtitleList = [];
            subsData.forEach(function(item) {
                var itemUrl = item.url || item.file || item.src || "";
                if (!itemUrl) return;
                subtitleList.push({
                    lang: item.name || item.display || item.label || "Phụ đề",
                    url: itemUrl,
                    mimeType: item.mimetype || item.mimeType || "text/vtt"
                });
            });
            
            function getSubPriority(name) {
                var s = String(name || "").toUpperCase();
                if (s.indexOf("VIET") > -1 || s.indexOf("VI") > -1) return 1;
                if (s.indexOf("ENG") > -1) return 2;
                return 3;
            }
            subtitleList.sort(function(a, b) {
                return getSubPriority(a.lang) - getSubPriority(b.lang);
            });
            
            return JSON.stringify({
                url: streamUrl,
                mimeType: mimeType,
                isEmbed: false,
                headers: customHeaders,
                subtitles: subtitleList
            });
        }
        
        // Bước 1: Nhận danh sách Streams từ fetchvideo và chuyển tiếp lấy Subtitle
        var dataObj = typeof html === "object" ? html : JSON.parse(html);
        var rawStreams = (dataObj && Array.isArray(dataObj.data)) ? dataObj.data : ((dataObj && Array.isArray(dataObj.streams)) ? dataObj.streams : []);
        if (!rawStreams || rawStreams.length === 0) {
            throw new Error("Không tìm thấy stream trong phản hồi");
        }
        
        var serverMatch = url.match(/[?&]server=(\d+)/i);
        var requestedIdx = serverMatch ? (parseInt(serverMatch[1], 10) - 1) : 0;
        var srvIdx = (requestedIdx >= 0 && requestedIdx < rawStreams.length) ? requestedIdx : 0;
        var selectedStream = rawStreams[srvIdx];
        
        var rawStreamUrl = selectedStream.streamUrl || selectedStream.url || "";
        var rawMimeType = selectedStream.mimeType || "application/x-mpegURL";
        var rawFormat = selectedStream.provider || selectedStream.quality || "HLS";
        
        var customHeaders = {
            "User-Agent": selectedStream.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };
        if (selectedStream.referer) customHeaders["Referer"] = selectedStream.referer;
        if (selectedStream.origin) customHeaders["Origin"] = selectedStream.origin;
        
        var payload = {
            url: rawStreamUrl,
            mime: rawMimeType,
            format: rawFormat,
            headers: customHeaders
        };
        var encodedStream = BASE64.encode(JSON.stringify(payload));
        
        var tmdbMatch = url.match(/[?&](?:id|tmdb|tmdb_id)=(\d+)/i);
        var tmdbId = tmdbMatch ? tmdbMatch[1] : "";
        var imdbMatch = url.match(/[?&]imdb_id=([^&]+)/i);
        var imdbId = imdbMatch ? imdbMatch[1] : "";
        var isTV = url.indexOf("type=tv") > -1 || url.indexOf("season=") > -1;
        
        var seasonMatch = url.match(/[?&]season=(\d+)/i);
        var episodeMatch = url.match(/[?&]episode=(\d+)/i);
        var season = seasonMatch ? seasonMatch[1] : "1";
        var episode = episodeMatch ? episodeMatch[1] : "1";
        
        var subApiUrl = "";
        if (isTV) {
            subApiUrl = "https://getsubtitle.alokillgtv.workers.dev/?id=" + tmdbId + "&imdb_id=" + encodeURIComponent(imdbId) + "&type=tv&tmdb=" + tmdbId + "&season=" + season + "&episode=" + episode + "&stream=" + encodeURIComponent(encodedStream);
        } else {
            subApiUrl = "https://getsubtitle.alokillgtv.workers.dev/?id=" + tmdbId + "&imdb_id=" + encodeURIComponent(imdbId) + "&type=movie&tmdb=" + tmdbId + "&stream=" + encodeURIComponent(encodedStream);
        }
        
        return JSON.stringify({
            url: subApiUrl,
            mimeType: "application/json",
            isEmbed: true,
            headers: { "User-Agent": customHeaders["User-Agent"] },
            subtitles: []
        });
    } catch(e) {
        return JSON.stringify({
            url: "",
            mimeType: "video/mp4",
            isEmbed: false,
            headers: {},
            subtitles: []
        });
    }
}
