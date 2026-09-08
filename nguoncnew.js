// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguoncnew",
        "name": "NguonC",
        "version": "1.0.3",
        "description": "Nguồn C phim bộ, phim lẻ chất lượng cao.",
        "info": "Nguồn C phim bộ, phim lẻ chất lượng cao.",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/nguoncnew.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        if (listSlugs.indexOf(slug) >= 0) {
            if (slug !== 'hoat-hinh') {
                return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
            }
        }

        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        return "https://phim.nguonc.com/api/films/the-loai/" + slug + "?page=" + page + "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    return "https://phim.nguonc.com/api/films/search?keyword=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.current_episode || item.episode_current || "",
                lang: item.language || item.lang || ""
            };
        });

        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;

        var totalPages = paginate.total_page || paginate.totalPages || 0;
        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }
        if (totalPages === 0) totalPages = 1;

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.movie || (response.data && response.data.item) || response.data || {};
        var rawEpisodes = movie.episodes || response.episodes || (response.data && response.data.item && response.data.item.episodes) || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";

                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name: ep.name || ep.episode_name || "",
                                slug: ep.slug || ep.episode_slug || ""
                            });
                        }
                    });
                }

                if (episodes.length > 0) {
                    servers.push({
                        name: server.server_name || server.name || "Server",
                        episodes: episodes
                    });
                }
            });
        }

        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";
            for (var key in categoryObj) {
                var group = categoryObj[key];
                if (group && group.group && group.group.name === groupName && group.list && group.list.length > 0) {
                    return group.list.map(function (item) { return item.name; }).join(", ");
                }
            }
            return "";
        };

        var extractedYear = extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.description || movie.content || "").replace(/<[^>]*>/g, ""),
            year: parseInt(movie.year || extractedYear) || 0,
            rating: parseFloat(movie.view) || 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.current_episode || movie.episode_current || "",
            lang: movie.language || movie.lang || "",
            casts: movie.casts || movie.actor || "",
            director: movie.director || "",
            category: extractGroup(movie.category, "Thể loại"),
            country: extractGroup(movie.category, "Quốc gia"),
            view: parseInt(movie.view) || 0,
            status: movie.status || ""
        });
    } catch (error) {
        return "{}";
    }
}

function decodeBase64(input) {
    if (!input) return "";
    if (typeof atob === 'function') {
        try { return atob(input); } catch (e) {}
    }
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var str = String(input).replace(/=+$/, '');
    var output = '';
    for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function parseDetailResponse(html, url) {
    try {
        var hostOrigin = "https://embed.streamc.xyz";
        if (url && url.indexOf("http") === 0) {
            var parts = url.split("/");
            if (parts.length >= 3) {
                hostOrigin = parts[0] + "//" + parts[2];
            }
        }
        var customjs = textJS();
        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "Referer": "https://phim.nguonc.com/",
                "Origin": hostOrigin,
                "Bypass-AdBlock": "true",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function textJS() {
    return `
(function() {
    'use strict';

    // 1. Defeat Anti-Adblock checks & fake window.open
    var fakeWin = {
        closed: false,
        focus: function(){},
        blur: function(){},
        close: function(){ this.closed = true; },
        location: { href: 'about:blank', replace: function(){}, assign: function(){}, reload: function(){} },
        document: {
            write: function(){},
            writeln: function(){},
            open: function(){},
            close: function(){},
            createElement: function(){ return document.createElement('div'); },
            body: { appendChild: function(){} }
        },
        opener: window, parent: window, top: window, self: window, window: window
    };

    try {
        Object.defineProperty(window, 'open', {
            get: function() { return function() { return fakeWin; }; },
            set: function() {},
            configurable: true
        });
    } catch(e) {
        window.open = function() { return fakeWin; };
    }

    // Mock ad libraries & global variables
    window._wau = window._wau || [];
    window._wau.push = function() {};
    window.waust = window.waust || {};
    window.popCash = window.popCash || {};
    window.ExoLoader = window.ExoLoader || {};

    // Lock anti-adblock flags
    var falseProps = ['playerBlocked', 'popupFailed', 'isAdBlockActive', 'adBlockDetected', 'adblock', 'adBlocker', 'adsBlocked'];
    for (var i = 0; i < falseProps.length; i++) {
        (function(p) {
            try {
                window[p] = false;
                Object.defineProperty(window, p, {
                    get: function() { return false; },
                    set: function() {},
                    configurable: true
                });
            } catch(e) {}
        })(falseProps[i]);
    }

    var trueProps = ['popupReady', 'hasShownAds', 'canRunAds', 'hasLoadedAds'];
    for (var j = 0; j < trueProps.length; j++) {
        (function(p) {
            try {
                window[p] = true;
                Object.defineProperty(window, p, {
                    get: function() { return true; },
                    set: function() {},
                    configurable: true
                });
            } catch(e) {}
        })(trueProps[j]);
    }

    // Lock blockPlayer
    try {
        window.blockPlayer = function() {};
        Object.defineProperty(window, 'blockPlayer', {
            get: function() { return function() {}; },
            set: function() {},
            configurable: true
        });
    } catch(e) {}

    // Suppress adblock failure events
    var blockEvents = ['popup-failed', 'adblock-detected', 'adblock', 'block-player'];
    for (var k = 0; k < blockEvents.length; k++) {
        window.addEventListener(blockEvents[k], function(e) {
            if (e) {
                if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
                if (typeof e.stopPropagation === 'function') e.stopPropagation();
                if (typeof e.preventDefault === 'function') e.preventDefault();
            }
        }, true);
    }

    // Deceive bait elements check (offsetWidth, offsetHeight, getComputedStyle)
    try {
        var origGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function(el, pseudo) {
            var res = origGetComputedStyle.apply(this, arguments);
            var cls = ((el && el.className) || '') + ' ' + ((el && el.id) || '');
            if (/(ad|banner|sponsor|adsbox|popup|detector)/i.test(cls)) {
                return new Proxy(res, {
                    get: function(target, prop) {
                        if (prop === 'display') {
                            var d = target.display;
                            return (d === 'none') ? 'block' : d;
                        }
                        if (prop === 'visibility') {
                            var v = target.visibility;
                            return (v === 'hidden') ? 'visible' : v;
                        }
                        if (prop === 'opacity') {
                            var o = target.opacity;
                            return (o === '0') ? '1' : o;
                        }
                        return target[prop];
                    }
                });
            }
            return res;
        };
    } catch(e) {}

    try {
        var origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get: function() {
                var cls = (this.className || '') + ' ' + (this.id || '');
                if (/(ad|banner|sponsor|adsbox|popup|detector)/i.test(cls)) {
                    return 250;
                }
                if (origOffsetHeight && origOffsetHeight.get) {
                    return origOffsetHeight.get.call(this);
                }
                return 250;
            },
            configurable: true
        });
        var origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            get: function() {
                var cls = (this.className || '') + ' ' + (this.id || '');
                if (/(ad|banner|sponsor|adsbox|popup|detector)/i.test(cls)) {
                    return 300;
                }
                if (origOffsetWidth && origOffsetWidth.get) {
                    return origOffsetWidth.get.call(this);
                }
                return 300;
            },
            configurable: true
        });
    } catch(e) {}

    // Inject styles: ensure player & video take 100vw/100vh, preserve controlbar/timeline
    var style = document.createElement('style');
    style.innerHTML = 'body, html { background: black !important; overflow: hidden !important; margin: 0; padding: 0; width: 100vw; height: 100vh; }' +
        '#player, #video-container, video, iframe[src*="stream"] { display: flex !important; visibility: visible !important; opacity: 1 !important; width: 100vw !important; height: 100vh !important; }' +
        '.jw-controls, .jw-controlbar, .vjs-control-bar, .plyr__controls, [class*="controlbar"], [class*="controls"] { z-index: 10000 !important; }';
    if (document.head) { document.head.appendChild(style); } else { document.addEventListener('DOMContentLoaded', function() { document.head.appendChild(style); }); }

    // Helper: Safe base64 decode
    function safeAtob(str) {
        if (!str) return "";
        if (typeof atob === 'function') {
            try { return atob(str); } catch(e) {}
        }
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var strNorm = String(str).replace(/=+$/, '');
        var output = '';
        for (var bc = 0, bs, buffer, idx = 0; buffer = strNorm.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    }

    // Extract stream URL from data-obf attribute
    function extractStreamFromDom() {
        var playerEl = document.getElementById('player') || document.querySelector('[data-obf]');
        if (playerEl) {
            var obf = playerEl.getAttribute('data-obf') || (playerEl.dataset ? playerEl.dataset.obf : '');
            if (obf && !window.streamURL) {
                try {
                    var jsonStr = safeAtob(obf);
                    if (jsonStr) {
                        var streamData = JSON.parse(jsonStr);
                        if (streamData && streamData.sUb) {
                            var subPath = streamData.sUb;
                            if (subPath.indexOf('/') !== 0 && subPath.indexOf('http') !== 0) {
                                subPath = '/' + subPath;
                            }
                            var fullUrl = (subPath.indexOf('http') === 0) ? subPath : (location.origin + subPath);
                            if (fullUrl.indexOf('?d=1') === -1 && fullUrl.indexOf('&d=1') === -1) {
                                fullUrl += (fullUrl.indexOf('?') > -1 ? '&' : '?') + 'd=1';
                            }
                            window.streamURL = fullUrl;
                            window.videoHash = streamData.hD || '';
                        }
                    }
                } catch(e) {}
            }
        }
    }

    // Connect video events to Native AndroidBridge
    function hookVideoBridge(video) {
        if (!video || video._bridgeHooked) return;
        video._bridgeHooked = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.controls = true;

        function reportPlay() {
            if (window.AndroidBridge && typeof window.AndroidBridge.onVideoPlaying === 'function') {
                window.AndroidBridge.onVideoPlaying();
            }
        }
        function reportPause() {
            if (window.AndroidBridge && typeof window.AndroidBridge.onVideoPaused === 'function') {
                window.AndroidBridge.onVideoPaused();
            }
        }
        function reportEnded() {
            if (window.AndroidBridge && typeof window.AndroidBridge.onVideoEnded === 'function') {
                window.AndroidBridge.onVideoEnded();
            }
        }
        function reportError() {
            if (window.AndroidBridge && typeof window.AndroidBridge.onVideoError === 'function') {
                window.AndroidBridge.onVideoError();
            }
        }
        function reportTime() {
            if (window.AndroidBridge && typeof window.AndroidBridge.onTimeUpdate === 'function' && video.duration) {
                window.AndroidBridge.onTimeUpdate(video.currentTime, video.duration);
            }
        }

        video.addEventListener('play', reportPlay);
        video.addEventListener('playing', reportPlay);
        video.addEventListener('pause', reportPause);
        video.addEventListener('ended', reportEnded);
        video.addEventListener('error', reportError);
        video.addEventListener('timeupdate', reportTime);
        video.addEventListener('loadeddata', function() {
            video.controls = true;
            if (video.paused) {
                video.play().catch(function() { video.muted = true; video.play(); });
            }
        });

        if (!video.paused) reportPlay();
    }

    // Load Hls.js script dynamically
    function ensureHlsJs(callback) {
        if (typeof window.Hls !== 'undefined') {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = false;
        script.onload = function() { callback(); };
        script.onerror = function() { callback(); };
        (document.head || document.documentElement).appendChild(script);
    }

    // Fallback direct playback using HLS.js
    function triggerDirectPlayback(srcUrl) {
        if (window._directVideoAttached) return;
        var targetSrc = srcUrl || window.streamURL;
        if (!targetSrc) return;

        var video = document.querySelector('video');
        if (!video) {
            video = document.createElement('video');
            video.id = 'direct-streamc-video';
            video.autoplay = true;
            video.controls = true;
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
            var container = document.getElementById('player') || document.body;
            container.appendChild(video);
        }
        window._directVideoAttached = true;
        hookVideoBridge(video);

        ensureHlsJs(function() {
            if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                try {
                    if (window._hlsInstance) {
                        window._hlsInstance.destroy();
                    }
                    var hls = new window.Hls({
                        enableWorker: false,
                        lowLatencyMode: false,
                        xhrSetup: function(xhr, url) {
                            xhr.withCredentials = false;
                        }
                    });
                    window._hlsInstance = hls;
                    hls.loadSource(targetSrc);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        video.play().catch(function(){ video.muted = true; video.play(); });
                    });
                } catch(e) {
                    video.src = targetSrc;
                    video.play().catch(function(){ video.muted = true; video.play(); });
                }
            } else {
                video.src = targetSrc;
                video.play().catch(function(){ video.muted = true; video.play(); });
            }
        });
    }

    // Main execution cycle
    function checkAndRun() {
        extractStreamFromDom();

        // Check if a video element already exists on page
        var v = document.querySelector('video');
        if (v) {
            hookVideoBridge(v);
            if (v.paused) {
                v.play().catch(function() { v.muted = true; v.play(); });
            }
            return;
        }

        // Auto click resume button if present
        var resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            try { resumeBtn.click(); } catch(e) {}
        }

        // Try JWPlayer play if available
        if (typeof window.jwplayer === 'function') {
            try {
                var jw = window.jwplayer('player') || window.jwplayer();
                if (jw && typeof jw.play === 'function') {
                    jw.play();
                }
            } catch(e) {}
        }

        // Purge any adblock warning screen (except Turnstile container)
        var adScreens = document.querySelectorAll('.adblock-screen, div[class*="adblock"], div[id*="adblock"], div[class*="ad-block"], div[id*="ad-block"]');
        for (var m = 0; m < adScreens.length; m++) {
            try {
                if (adScreens[m] && adScreens[m].id !== 'block-player' && adScreens[m].parentNode) {
                    adScreens[m].parentNode.removeChild(adScreens[m]);
                }
            } catch(e) {}
        }
    }

    // Run periodic checks
    var checkCount = 0;
    var checkInterval = setInterval(function() {
        checkCount++;
        checkAndRun();

        // If after 3 seconds (6 checks) no video is playing and we have streamURL, force HLS.js
        if (checkCount >= 6 && !document.querySelector('video') && window.streamURL && !window._directVideoAttached) {
            triggerDirectPlayback(window.streamURL);
        }

        if (checkCount >= 20) {
            clearInterval(checkInterval);
        }
    }, 500);

    // Immediate check
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndRun);
    } else {
        checkAndRun();
    }
})();
`;
}

function parseCategoriesResponse(apiResponseJson) {
    var genres = [
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }
    ];
    return JSON.stringify(genres);
}

function parseCountriesResponse(apiResponseJson) {
    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];
    return JSON.stringify(countries);
}

function parseYearsResponse(apiResponseJson) {
    var years = [];
    for (var i = 2026; i >= 2004; i--) {
        years.push({ name: i.toString(), value: i.toString() });
    }
    return JSON.stringify(years);
}

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://img.phimapi.com/" + path;
}
