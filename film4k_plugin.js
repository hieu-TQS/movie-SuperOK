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
        "description": "Nguồn phim Film4K độ nét cao, tốc độ phát nhanh.",
        "info": "Nguồn phim Film4K độ nét cao, tốc độ phát nhanh.",
        "version": "1.0.2",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/4kmovies.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/api/home?section=top", "title": "Top Phim Nổi Bật", "type": "Grid" },
        { "slug": "/api/home?section=hero", "title": "Phim Đề Xuất", "type": "Grid" },
        { "slug": "/api/home", "title": "Phim Mới Cập Nhật", "type": "Grid" },
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
            { name: "Top Nổi Bật", value: "top" },
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
                    if (sVal === "top") {
                        path = "/api/home?section=top";
                    } else if (sVal === "movie" || sVal === "tv") {
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
        var list = [];

        if (url && (url.indexOf("section=top") > -1 || url.indexOf("type=top") > -1 || url.indexOf("sort=top") > -1)) {
            list = json.top || json.list || [];
        } else if (url && url.indexOf("section=hero") > -1) {
            list = json.hero || json.list || [];
        } else {
            list = json.list || json.top || json.hero || [];
        }

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

        var customJs = textJS(streamUrl);
        
        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJs.trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": {} });
    }
}

function textJS(streamUrl) {
    return `
(function() {
    'use strict';
    var targetStreamUrl = ${JSON.stringify(streamUrl)} || window.location.href;

    var style = document.createElement('style');
    style.innerHTML = 'html, body { background: #000 !important; color: #fff; margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; }' +
        '#film4k-player-wrap { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 999999; display: flex; align-items: center; justify-content: center; }' +
        '#film4k-video { width: 100%; height: 100%; object-fit: contain; background: #000; outline: none; }' +
        '#film4k-loader { position: absolute; width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.2); border-top-color: #5b6cff; border-radius: 50%; animation: f4kspin 1s linear infinite; z-index: 10; pointer-events: none; }' +
        '@keyframes f4kspin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);

    function initPlayerDOM() {
        if (document.getElementById('film4k-player-wrap')) return;

        var wrap = document.createElement('div');
        wrap.id = 'film4k-player-wrap';

        var video = document.createElement('video');
        video.id = 'film4k-video';
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');

        var loader = document.createElement('div');
        loader.id = 'film4k-loader';

        wrap.appendChild(video);
        wrap.appendChild(loader);
        document.body.appendChild(wrap);

        video.addEventListener('loadeddata', function() { loader.style.display = 'none'; });
        video.addEventListener('playing', function() { loader.style.display = 'none'; });
        video.addEventListener('waiting', function() { loader.style.display = 'block'; });
        video.addEventListener('error', function() { loader.style.display = 'none'; });

        loadHlsScript(function() {
            setupHlsPlayback(video, targetStreamUrl, loader);
        });
    }

    function loadHlsScript(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js';
        s.onload = function() { callback(); };
        s.onerror = function() {
            var s2 = document.createElement('script');
            s2.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
            s2.onload = function() { callback(); };
            document.body.appendChild(s2);
        };
        document.body.appendChild(s);
    }

    function createCustomHlsLoader(HlsClass) {
        var BaseLoader = HlsClass.DefaultConfig.loader;
        function CustomLoader(config) {
            BaseLoader.call(this, config);
            var originalLoad = this.load.bind(this);
            this.load = function(context, config, callbacks) {
                var origOnSuccess = callbacks.onSuccess;
                callbacks.onSuccess = function(response, stats, context, networkDetails) {
                    if (response && response.data instanceof ArrayBuffer) {
                        var u8 = new Uint8Array(response.data);
                        // Check if starts with fake PNG header (\x89PNG)
                        if (u8.length > 8 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47) {
                            var offset = 67;
                            for (var i = 0; i < Math.min(200, u8.length - 8); i++) {
                                if (u8[i] === 0x49 && u8[i+1] === 0x45 && u8[i+2] === 0x4E && u8[i+3] === 0x44) {
                                    offset = i + 8;
                                    break;
                                }
                            }
                            response.data = response.data.slice(offset);
                        }
                    }
                    origOnSuccess(response, stats, context, networkDetails);
                };
                originalLoad(context, config, callbacks);
            };
        }
        CustomLoader.prototype = Object.create(BaseLoader.prototype);
        CustomLoader.prototype.constructor = CustomLoader;
        return CustomLoader;
    }

    function setupHlsPlayback(video, streamUrl, loader) {
        // TV Remote & Keyboard Controls
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (video.duration) video.currentTime = Math.min(video.duration, video.currentTime + 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    break;
                case ' ':
                case 'Enter':
                case 'k':
                case 'K':
                    e.preventDefault();
                    if (video.paused) video.play();
                    else video.pause();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    video.muted = !video.muted;
                    break;
            }
        });

        if (window.Hls && window.Hls.isSupported()) {
            var CustomLoader = createCustomHlsLoader(window.Hls);
            var hls = new window.Hls({
                pLoader: CustomLoader,
                fLoader: CustomLoader,
                loader: CustomLoader,
                enableWorker: true,
                lowLatencyMode: false
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                loader.style.display = 'none';
                video.play().catch(function() {
                    video.muted = true;
                    video.play();
                });
            });

            hls.on(window.Hls.Events.ERROR, function(event, data) {
                console.error('HLS Error:', data);
                if (data.fatal) {
                    switch (data.type) {
                        case window.Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case window.Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('canplay', function() {
                video.play();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayerDOM);
    } else {
        initPlayerDOM();
    }
})();
`;
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
