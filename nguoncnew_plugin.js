// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguoncnew",
        "name": "Phim NguonC Xoá Quảng Cáo",
        "version": "1.29",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
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
        var sort = filters.sort || "updated"; // updated, view, year

        // Handle "Phim Mới Cập Nhật" specially if no filter
        if (slug === 'phim-moi-cap-nhat' && !filters.category && !filters.country && !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        // Priority 1: Category Support //v1/api/the-loai/{slug}
        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" + filters.category + "?page=" + page + "&sort=" + sort;
        }

        // Priority 2: Country Support //v1/api/quoc-gia/{slug}
        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + filters.country + "?page=" + page + "&sort=" + sort;
        }

        // Priority 3: Year Support //v1/api/nam-phat-hanh/{year}
        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + filters.year + "?page=" + page + "&sort=" + sort;
        }

        // --- Slug-based Logic (if no active filter) ---

        // Handle Years (4 digits)
        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Handle specific Lists (Danh sách)
        var listSlugs = ['phim-le', 'phim-bo', 'phim-dang-chieu', 'tv-shows', 'subteam'];
        // Note: 'hoat-hinh' is sometimes a list, sometimes a category. 
        // On NguonC, 'hoat-hinh' is usually in 'the-loai' but let's check standard lists.
        // NguonC commonly puts 'phim-hoat-hinh' in lists or 'hoat-hinh' in genres.

        if (listSlugs.indexOf(slug) >= 0) {
            // If slug is 'hoat-hinh', prefer 'the-loai' logic unless we know it's a list
            if (slug !== 'hoat-hinh') {
                return "https://phim.nguonc.com/api/films/danh-sach/" + slug + "?page=" + page + "&sort=" + sort;
            }
        }

        // Handle Countries (Fallback if slug matches country list)
        var countrySlugs = [
            'au-my', 'anh', 'trung-quoc', 'indonesia', 'viet-nam', 'phap', 'hong-kong',
            'han-quoc', 'nhat-ban', 'thai-lan', 'dai-loan', 'nga', 'ha-lan',
            'philippines', 'an-do', 'quoc-gia-khac'
        ];
        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" + slug + "?page=" + page + "&sort=" + sort;
        }

        // Default to Genres (Thể loại)
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

// Just returning the home page to trigger the parser, which will return hardcoded data
function getUrlCategories() { return "https://phim.nguonc.com"; }
function getUrlCountries() { return "https://phim.nguonc.com"; }
function getUrlYears() { return "https://phim.nguonc.com"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        // Handle NguonC structure: sometimes data is array directly (search), sometimes an object (list)
        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (data.items && Array.isArray(data.items)) {
            items = data.items;
        }

        // Handle NguonC 'paginate' structure
        // User provided: "paginate": { "current_page": 1, ... }
        var paginate = response.paginate || response.pagination || (data.params && data.params.pagination) || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                // Handle different field names for current episode
                episode_current: item.current_episode || item.episode_current || "",
                // Handle different field names for language
                lang: item.language || item.lang || ""
            };
        });

        // Determine pagination values
        var currentPage = paginate.current_page || paginate.currentPage || 1;
        var totalItems = paginate.total_items || paginate.totalItems || 0;
        var itemsPerPage = paginate.items_per_page || paginate.itemsPerPage || paginate.totalItemsPerPage || 24;

        // Calculate total pages if not provided directly
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
        // Normalize movie object (supports standard and potential variants)
        var movie = response.movie || response.data?.item || response.data || {};

        // Normalize episodes
        var rawEpisodes = movie.episodes || response.episodes || response.data?.item?.episodes || [];

        var servers = [];
        if (Array.isArray(rawEpisodes)) {
            rawEpisodes.forEach(function (server) {
                var episodes = [];
                var serverItems = server.items || server.server_data || [];

                if (Array.isArray(serverItems)) {
                    serverItems.forEach(function (ep) {
                        var embed = ep.embed || ep.link_embed || "";
                        var m3u8 = ep.m3u8 || ep.link_m3u8 || "";

                        // Use Embed URL as ID to allow scraping Referer/M3u8 details
                        // If no embed, use m3u8 directly.
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

        // Helper to extract category/country/year
        // Handles both { "1": { group: ..., list: [...] } } AND typical arrays
        var extractGroup = function (categoryObj, groupName) {
            if (!categoryObj) return "";

            // If it's an object with keys "1", "2"...
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
            casts: movie.casts || movie.actor || "", // Fallback to 'actor' if casts is missing
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


function parseDetailResponse(html, url) {
    try {
        var customjs = textJS();
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": "https://embed.streamc.xyz/",
                "Origin": "https://embed.streamc.xyz/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                // Đánh lừa thuật toán Client Hints của tường lửa
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": '"Android"',
                
                // Khai báo kiểu dữ liệu được chấp nhận giống như trình duyệt thật
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function textJS() {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=nguoncnew&type=js"; 
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black;display:none!important}';
style.innerHTML = customcss;
//document.head.appendChild(style);
/* BUILD VIDEO BEGIN*/
// "version": "1.8"

function runVideo(){
    'use strict';
    var DEVELOPE = false;
    
    function GetlinkVideo() {
        // 1. Tìm thẻ video gốc ĐANG PHÁT trên trang
        var originalVideo = document.querySelector('video');
        if (!originalVideo) {
            console.log("❌ Không tìm thấy thẻ video gốc trên trang!");
            return;
        }

        // 2. Chặn đứng các script quảng cáo chạy ngầm (popup, chuyển trang giữa chừng)
        var highestId = window.setTimeout(function() {
            for (var i = highestId; i >= 0; i--) {
                window.clearInterval(i);
                window.clearTimeout(i);
            }
        }, 0);

        // 3. Quét playlist và cấu trúc server trước khi thay đổi DOM
        var playlist = scanSources();
        var stream1 = originalVideo.src || '';
        var stream2 = window.location.href;
        
        // 4. Gọi hàm build đè giao diện lên video gốc
        showToast("Đang khởi chạy trình phát tốt hơn.", 5000, true, true);
        buildVideoWithOriginal(originalVideo, stream1, stream2, playlist);
    }

    // ─── QUÉT NGUỒN PHÁT VÀ PLAYLIST ───
    function scanSources() {
        var activeSrc = '';
        var servers = [];
        var episodes = [];
        var seen = new Set();
        var els = document.querySelectorAll('[class*="video"], [class*="player"], video, iframe');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var src = el.src || el.getAttribute('data-src') || '';
            if (!src) {
                var s = el.querySelector('source');
                if (s) src = s.src || s.getAttribute('src') || '';
            }
            if (src && (src.indexOf('.mp4') > -1 || src.indexOf('.m3u8') > -1 || src.indexOf('embed') > -1)) {
                if (!activeSrc) activeSrc = src;
                if (!seen.has(src)) {
                    seen.add(src);
                    var lbl = 'Server ' + (servers.length + 1);
                    if (src.indexOf('embed') > -1) lbl = 'Nhúng ' + (servers.length + 1);
                    servers.push({ label: lbl, src: src, type: 'server' });
                }
            }
        }
        var allLinks = document.querySelectorAll('a, button, [role="button"], [data-link]');
        for (var k = 0; k < allLinks.length; k++) {
            var el2 = allLinks[k];
            var href = el2.href || el2.getAttribute('href') || el2.getAttribute('data-src') || el2.getAttribute('data-link') || '';
            var txt = (el2.textContent || el2.innerText || '').trim();
            if (!href || href === '#' || href === window.location.href || seen.has(href)) continue;
            if (/(server|sv|nguồn|source|embed|link)/i.test(txt + ' ' + el2.className)) {
                if (href.indexOf('.mp4') > -1 || href.indexOf('.m3u8') > -1 || href.indexOf('embed') > -1) {
                    seen.add(href);
                    servers.push({ label: txt || 'Server ' + (servers.length + 1), src: href, type: 'server' });
                }
            }
        }
        var aTags = document.querySelectorAll('a');
        for (var j = 0; j < aTags.length; j++) {
            var a = aTags[j];
            var aHref = a.href || a.getAttribute('href');
            var aTxt = (a.textContent || a.innerText || '').trim();
            if (!aHref || aHref === '#' || aHref === window.location.href) continue;
            var isEpisode = false;
            if (/(tập|tap|ep|episode|chap|part)\s*(\d+|[ivx]+)/i.test(aTxt)) isEpisode = true;
            if (/(tập|tap|ep|episode|chap|part)[-\s]?(\d+|[ivx]+)/i.test(aHref)) isEpisode = true;
            if (a.className && /(^|\s)(ep|episode|tap|chapter|part|tapphim)(\d+|$)/i.test(a.className)) isEpisode = true;
            if (isEpisode) {
                episodes.push({ label: aTxt || 'Tập ' + (episodes.length + 1), src: aHref, type: 'episode' });
            }
        }
        return { activeSrc: activeSrc, servers: servers, episodes: episodes };
    }

    // ─── HÀM TOAST CHỮ CHẠY GÕ PHÍM ───
    globalThis.toastScrollQueue = globalThis.toastScrollQueue || [];
    globalThis.isToastScrollRunning = globalThis.isToastScrollRunning || false;
    globalThis.showToast = function(message, duration, check, scroll) {
        if (typeof duration === 'undefined') duration = 7000;
        if (typeof check === 'undefined') check = true;
        if (typeof scroll === 'undefined') scroll = false;
        if (check === false) return;
        
        if (scroll) {
            globalThis.toastScrollQueue.push({ message, duration });
            function processScrollQueue() {
                if (globalThis.isToastScrollRunning || globalThis.toastScrollQueue.length === 0) return;
                globalThis.isToastScrollRunning = true;
                var current = globalThis.toastScrollQueue.shift();
                var topContainer = document.getElementById('global-toast-top-container');
                if (!topContainer) {
                    topContainer = document.createElement('div');
                    topContainer.id = 'global-toast-top-container';
                    topContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9999999;background:rgba(0,0,0,0.75);color:#fff;font-family:sans-serif;font-size:13px;padding:6px 15px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:28px;box-shadow:0 2px 10px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s ease;';
                    document.body.appendChild(topContainer);
                }
                topContainer.innerHTML = '';
                topContainer.style.opacity = '1';
                var textEl = document.createElement('span');
                textEl.style.cssText = 'white-space:nowrap;border-right:2px solid transparent;letter-spacing:0.5px;';
                topContainer.appendChild(textEl);
                var fullText = current.message;
                var charIndex = 0;
                var typingTimer;
                function typeWriter() {
                    if (charIndex < fullText.length) {
                        textEl.innerHTML += fullText.charAt(charIndex);
                        charIndex++;
                        typingTimer = setTimeout(typeWriter, 40);
                    } else {
                        setTimeout(function() {
                            topContainer.style.opacity = '0';
                            setTimeout(function() {
                                topContainer.remove();
                                globalThis.isToastScrollRunning = false;
                                processScrollQueue();
                            }, 300);
                        }, 10000);
                    }
                }
                typeWriter();
            }
            processScrollQueue();
            return;
        }
        
        var container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        var toastEl = document.createElement('div');
        toastEl.innerHTML = message;
        toastEl.style.cssText = 'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;font-size:14px;min-width:200px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
        container.appendChild(toastEl);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(0)';
            toastEl.style.opacity = '1';
        }, 10);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(120%)';
            toastEl.style.opacity = '0';
            setTimeout(function() {
                toastEl.remove();
                if (container.childElementCount === 0) container.remove();
            }, 300);
        }, duration);
    };

    // ─── HÀM KHỞI DỰNG PLAYER CUSTOM ĐÈ LÊN GIAO DIỆN GỐC ───
    function buildVideoWithOriginal(video, stream1, stream2, playlistData) {
        video.id = 'main-video';
        video.style.cssText = 'width:100%;height:100%;object-fit:contain;cursor:pointer;background:#000;outline:none;border:none;box-shadow:none;transition: all 0.2s ease;';
        video.controls = false;
        
        var container = document.createElement('div');
        container.id = 'custom-video-player';
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;font-family:Segoe UI,Roboto,sans-serif;user-select:none;-webkit-user-select:none;outline:none;border:none;box-shadow:none;overflow:hidden;';

        var spinner = document.createElement('div');
        spinner.id = 'video-spinner';
        spinner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite;z-index:10;pointer-events:none;display:none;';
        var spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin{0%{transform:translate(-50%,-50%) rotate(0deg);}100%{transform:translate(-50%,-50%) rotate(360deg);}}';
        document.head.appendChild(spinStyle);

        var controls = document.createElement('div');
        controls.id = 'video-controls';
        controls.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;background:linear-gradient(transparent,rgba(0,0,0,0.85));padding:12px 16px 20px;box-sizing:border-box;transition:opacity 0.3s;opacity:0;z-index:20;';
        var progressWrap = document.createElement('div');
        progressWrap.style.cssText = 'width:100%;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;cursor:pointer;position:relative;margin-bottom:12px;';
        var progressBar = document.createElement('div');
        progressBar.style.cssText = 'height:100%;background:#e74c3c;width:0%;border-radius:3px;position:relative;pointer-events:none;';
        var progressHandle = document.createElement('div');
        progressHandle.style.cssText = 'position:absolute;right:-6px;top:-4px;width:14px;height:14px;background:#e74c3c;border-radius:50%;opacity:0;transition:opacity 0.2s;pointer-events:none;';
        progressBar.appendChild(progressHandle);
        progressWrap.appendChild(progressBar);
        
        progressWrap.onmouseenter = function() { progressHandle.style.opacity = '1'; };
        progressWrap.onmouseleave = function() { progressHandle.style.opacity = '0'; };
        
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;align-items:center;gap:12px;';

        var btnPlay = createBtn('⏸', 'Phát / Tạm dừng');
        var btnMute = createBtn('🔊', 'Tắt / Bật âm lượng');
        var timeDisplay = document.createElement('span');
        timeDisplay.style.cssText = 'color:#fff;font-size:13px;min-width:100px;';
        timeDisplay.textContent = '0:00 / 0:00';
        var btnReload = createBtn('🔄', 'Tải lại nguồn video');
        var spacer = document.createElement('div');
        spacer.style.cssText = 'flex:1;';
        var speedIndicator = document.createElement('span');
        speedIndicator.style.cssText = 'color:#fff;font-size:12px;opacity:0.8;';
        speedIndicator.textContent = '1.0x';
        
        var btnFullscreen = createBtn('⛶', 'Kích thước trình phát: Co giãn (Mặc định)');
        var btnPlaylist = createBtn('☰', 'Danh sách phát / Server');

        btnRow.appendChild(btnPlay);
        btnRow.appendChild(btnMute);
        btnRow.appendChild(timeDisplay);
        btnRow.appendChild(spacer);
        btnRow.appendChild(speedIndicator);
        btnRow.appendChild(btnReload);
        btnRow.appendChild(btnFullscreen);

        controls.appendChild(progressWrap);
        controls.appendChild(btnRow);
        
        var bigPlayBtn = document.createElement('div');
        bigPlayBtn.id = 'big-play-btn';
        bigPlayBtn.textContent = '▶';
        bigPlayBtn.style.cssText = 'text-indent:10px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:rgba(0,0,0,0.6);border-radius:50%;display:none;align-items:center;justify-content:center;color:#fff;font-size:36px;cursor:pointer;z-index:15;';

        var seekOverlay = document.createElement('div');
        seekOverlay.id = 'seek-overlay';
        seekOverlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:12px 24px;border-radius:8px;font-size:18px;font-weight:bold;pointer-events:none;opacity:0;transition:opacity 0.3s;z-index:30;';
        
        var playlistPanel = document.createElement('div');
        playlistPanel.id = 'playlist-panel';
        playlistPanel.style.cssText = 'position:fixed;top:0;right:0;width:300px;max-width:80%;height:100%;background:rgba(15,15,15,0.97);z-index:40;transform:translateX(100%);transition:transform 0.25s ease;overflow-y:auto;padding:20px;box-sizing:border-box;color:#fff;font-family:Segoe UI,Roboto,sans-serif;';
        var plHeader = document.createElement('div');
        plHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.2);';
        plHeader.innerHTML = '<span style="font-size:16px;font-weight:bold;">📋 Playlist</span>';
        var plClose = document.createElement('button');
        plClose.textContent = '✕';
        plClose.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;';
        plClose.onclick = function(e) { if (e) e.stopPropagation(); playlistPanel.style.transform = 'translateX(100%)'; };
        plHeader.appendChild(plClose);
        playlistPanel.appendChild(plHeader);

        var plContent = document.createElement('div');
        plContent.id = 'playlist-content';
        playlistPanel.appendChild(plContent);
        
        var playlistState = {
            servers: (playlistData && playlistData.servers) ? playlistData.servers.slice() : [],
            episodes: (playlistData && playlistData.episodes) ? playlistData.episodes.slice() : []
        };
        
        function buildSection(title, items, onClick, parent) {
            if (!items || items.length === 0) return;
            var sec = document.createElement('div');
            sec.style.cssText = 'margin-bottom:20px;';
            var secTitle = document.createElement('div');
            secTitle.textContent = title;
            secTitle.style.cssText = 'font-size:13px;text-transform:uppercase;opacity:0.6;margin-bottom:10px;';
            sec.appendChild(secTitle);
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    var btn = document.createElement('button');
                    btn.textContent = item.label;
                    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:10px 12px;margin-bottom:6px;background:rgba(255,255,255,0.08);border:none;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;transition:background 0.2s;';
                    btn.onmouseenter = function() { btn.style.background = 'rgba(231,76,60,0.3)'; };
                    btn.onmouseleave = function() { btn.style.background = 'rgba(255,255,255,0.08)'; };
                    btn.onclick = function(e) { if (e) e.stopPropagation(); onClick(item); };
                    sec.appendChild(btn);
                })(items[i]);
            }
            parent.appendChild(sec);
        }

        function renderPlaylist() {
            plContent.innerHTML = '';
            var hasAny = false;
            if (playlistState.servers.length > 1) {
                buildSection('🎥 Chuyển Server', playlistState.servers, function(item) { switchSource(item.src); }, plContent);
                hasAny = true;
            }
            if (playlistState.episodes.length > 0) {
                buildSection('📁 Tập phim', playlistState.episodes, function(item) { savePosition(); window.location.href = item.src; }, plContent);
                hasAny = true;
            }
            if (hasAny) {
                if (!btnPlaylist.parentNode) btnRow.appendChild(btnPlaylist);
                if (!playlistPanel.parentNode) container.appendChild(playlistPanel);
            } else {
                if (btnPlaylist.parentNode) btnPlaylist.parentNode.removeChild(btnPlaylist);
            }
        }

        // Đóng gói các thành phần giao diện Player mới
        container.appendChild(video);
        container.appendChild(spinner);
        container.appendChild(bigPlayBtn);
        container.appendChild(seekOverlay);
        container.appendChild(controls);
        container.appendChild(playlistPanel);

        // ─── CHỈNH SỬA: CƠ CHẾ KHÓA VÀ BẢO VỆ BỘ TOOL KHI CLEAR ADS ───
        var idsToKeep = [
            'custom-video-player', // Luôn giữ lại trình phát custom
            'lab-quick-hide-menu', 'labCssExtractMenu', 'labCssExtractList', 
            '__labTopLayerContainer', 'labMainDashboard', 'lab-fab-wrapper', 
            'interactive-dashboard-styles-v15-0', 'lab-sandbox-internal-css', 
            'lab-token-pointer-style', 'lab-v16-pro-max-styles', 
            'lab-v163-isolation-style', 'lab-html-source-viewer-styles'
        ];

        // Quét dọn sạch sẽ thẻ HEAD, chỉ giữ lại các tag cấu trúc của Tool
        var headChildren = Array.from(document.head.children);
        headChildren.forEach(function(child) {
            if (!child.id || idsToKeep.indexOf(child.id) === -1) {
                child.remove();
            }
        });
        
        // Tái tạo cấu hình metadata thiết yếu cho Head
        var metaCharset = document.createElement('meta'); metaCharset.setAttribute('charset', 'UTF-8'); document.head.appendChild(metaCharset);
        var metaView = document.createElement('meta'); metaView.name = 'viewport'; metaView.content = 'width=device-width, initial-scale=1.0'; document.head.appendChild(metaView);
        document.head.appendChild(spinStyle);

        // Quét dọn sạch sẽ thẻ BODY, giữ lại bộ Dashboard, Menu và đẩy Player vào
        var bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(function(child) {
            if (!child.id || idsToKeep.indexOf(child.id) === -1) {
                child.remove();
            }
        });
        
        // Đẩy trình phát custom vào body sạch quảng cáo
        document.body.appendChild(container);
        document.title = 'Dẹp hết quảng cáo rồi nha bạn.';
        // ─────────────────────────────────────────────────────────────

        var isPlaying = false;
        var isMuted = false;
        var currentSpeed = 1.0;
        var controlsTimeout = null;
        var isDraggingProgress = false;
        var isDraggingVideo = false;
        var isHoveringControls = false;
        var lastSaveTime = 0;
        
        var currentResizeMode = 0; // 0: Co giãn, 1: Fill, 2: Ngang, 3: Dọc

        function generateVideoKey() {
            if (!video || !video.duration || isNaN(video.duration)) return null;
            var totalSeconds = Math.floor(video.duration);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;
            var pad = function(num) { return num < 10 ? '0' + num : num; };
            return 'VIDEO_' + pad(hours) + '_' + pad(minutes) + '_' + pad(seconds);
        }
        
        function savePosition() {
            if (!video || video.ended || !video.currentTime || isNaN(video.currentTime)) return;
            var saveKey = generateVideoKey();
            if (!saveKey) return;
            var now = Date.now();
            if (now - lastSaveTime < 4000) return;
            lastSaveTime = now;
            try {
                if (video.currentTime > 5 && (video.currentTime < video.duration - 5)) {
                    localStorage.setItem(saveKey, JSON.stringify({ time: video.currentTime, duration: video.duration, savedAt: now }));
                }
            } catch (e) {}
        }
        
        function clearSavedPosition() {
            try {
                var saveKey = generateVideoKey();
                if (saveKey) localStorage.removeItem(saveKey);
            } catch (e) {}
        }
        
        function restorePosition() {
            try {
                var saveKey = generateVideoKey();
                if (!saveKey) return false;
                var saved = localStorage.getItem(saveKey);
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data && data.time && data.time > 5) {
                        if (data.time >= video.duration - 5) return false;
                        video.currentTime = data.time;
                        showToast('⏩ Đã tiếp tục phát từ ' + formatTime(data.time), 4000, true);
                        return true;
                    }
                }
            } catch (e) {}
            return false;
        }

        function switchSource(newSrc) {
            var wasPlaying = !video.paused;
            var prevTime = video.currentTime;
            stream1 = newSrc;
            video.src = newSrc;
            video.load();
            spinner.style.display = 'block';
            video.onloadeddata = function() {
                spinner.style.display = 'none';
                if (!restorePosition() && prevTime > 0) video.currentTime = prevTime;
                if (wasPlaying) video.play();
                showToast('Đã chuyển nguồn phát');
            };
            video.onerror = function() {
                spinner.style.display = 'none';
                showToast('Không thể phát nguồn này!');
            };
            playlistPanel.style.transform = 'translateX(100%)';
        }

        function createBtn(icon, title) {
            var btn = document.createElement('button');
            btn.textContent = icon;
            btn.title = title;
            btn.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px;transition:background 0.2s;outline:none;';
            btn.onmouseenter = function() { btn.style.background = 'rgba(255,255,255,0.2)'; };
            btn.onmouseleave = function() { btn.style.background = 'none'; };
            return btn;
        }

        function showSeekOverlay(text) {
            seekOverlay.textContent = text;
            seekOverlay.style.opacity = '1';
            clearTimeout(seekOverlay._timer);
            seekOverlay._timer = setTimeout(function() { seekOverlay.style.opacity = '0'; }, 800);
        }

        function formatTime(sec) {
            if (!sec || isNaN(sec)) return '0:00';
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' + s : s);
        }

        function updateProgress() {
            if (video.duration && !isNaN(video.duration) && !isDraggingProgress) {
                var pct = (video.currentTime / video.duration) * 100;
                progressBar.style.width = pct + '%';
            }
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        }

        function seekVideo(seconds) {
            var newTime = video.currentTime + seconds;
            if (newTime < 0) newTime = 0;
            if (video.duration && !isNaN(video.duration) && newTime > video.duration) newTime = video.duration;
            video.currentTime = newTime;
            showSeekOverlay((seconds > 0 ? '+' : '') + seconds + 's');
        }

        function togglePlay() {
            if (video.paused) {
                video.play().then(function() {
                    isPlaying = true; btnPlay.textContent = '⏸'; bigPlayBtn.style.display = 'none'; spinner.style.display = 'none';
                }).catch(function(e) {
                    video.muted = true;
                    video.play().then(function() { isMuted = true; btnMute.textContent = '🔇'; isPlaying = true; btnPlay.textContent = '⏸'; bigPlayBtn.style.display = 'none'; spinner.style.display = 'none'; });
                });
            } else {
                video.pause(); isPlaying = false; btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex';
            }
        }

        function toggleMute() {
            video.muted = !video.muted;
            isMuted = video.muted;
            btnMute.textContent = isMuted ? '🔇' : '🔊';
            showToast(isMuted ? 'Đã tắt tiếng' : 'Đã bật tiếng');
        }

        function reloadVideo() {
            spinner.style.display = 'block';
            var currentTime = video.currentTime;
            var wasPlaying = !video.paused;
            video.src = stream1 + (stream1.indexOf('?') > -1 ? '&' : '?') + '_reload=' + Date.now();
            video.load();
            video.onloadeddata = function() {
                spinner.style.display = 'none';
                video.currentTime = currentTime;
                restorePosition();
                if (wasPlaying) video.play();
                showToast('Đã tải lại nguồn video');
            };
            video.onerror = function() {
                spinner.style.display = 'none';
                if (stream2 && stream2 !== stream1) {
                    showToast('Nguồn 1 lỗi, thử nguồn dự phòng...');
                    stream1 = stream2;
                    video.src = stream1;
                    video.load();
                } else {
                    showToast('Lỗi tải video! Kiểm tra nguồn.');
                }
            };
        }

        function changeVideoSize() {
            video.style.removeProperty('width');
            video.style.removeProperty('height');
            video.style.removeProperty('object-fit');
            
            if (currentResizeMode === 0) {
                video.style.cssText += 'width:100%;height:100%;object-fit:contain;';
                btnFullscreen.textContent = '⛶';
                btnFullscreen.title = 'Kích thước: Co giãn phù hợp thiết bị (Mặc định)';
                showToast('📺 Chế độ: Co giãn vừa vặn thiết bị (Mặc định)');
            } else if (currentResizeMode === 1) {
                video.style.cssText += 'width:100%;height:100%;object-fit:fill;';
                btnFullscreen.textContent = '🔲';
                btnFullscreen.title = 'Kích thước: Tràn viền toàn màn hình';
                showToast('📺 Chế độ: Điền đầy toàn màn hình');
            } else if (currentResizeMode === 2) {
                video.style.cssText += 'width:100vw;height:auto;object-fit:contain;';
                btnFullscreen.textContent = '↔';
                btnFullscreen.title = 'Kích thước: Khớp chuẩn chiều ngang';
                showToast('📺 Chế độ: Cắt gọt theo chiều ngang');
            } else if (currentResizeMode === 3) {
                video.style.cssText += 'width:auto;height:100vh;object-fit:contain;';
                btnFullscreen.textContent = '↕';
                btnFullscreen.title = 'Kích thước: Khớp chuẩn chiều dọc';
                showToast('📺 Chế độ: Cắt gọt theo chiều dọc');
            }
        }

        function showControls() {
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(function() { 
                if (!isDraggingProgress && !isHoveringControls) {
                    controls.style.opacity = '0'; 
                }
            }, 3000);
        }

        controls.onmouseenter = function() {
            isHoveringControls = true;
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
        };
        controls.onmouseleave = function() {
            isHoveringControls = false;
            showControls();
        };

        video.addEventListener('loadeddata', function() {
            spinner.style.display = 'none';
            updateProgress();
            if (isMuted && video.muted) { video.muted = false; isMuted = false; btnMute.textContent = '🔊'; }
            restorePosition();
            changeVideoSize();
        });
        video.addEventListener('loadedmetadata', function() { restorePosition(); });
        video.addEventListener('waiting', function() { spinner.style.display = 'block'; });
        video.addEventListener('playing', function() { spinner.style.display = 'none'; bigPlayBtn.style.display = 'none'; });
        video.addEventListener('error', function() { spinner.style.display = 'none'; showToast('Lỗi phát hoặc quảng cáo đang chặn luồng. Nhấn 🔄 để tải lại.'); btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; });
        video.addEventListener('timeupdate', function() { updateProgress(); savePosition(); });
        video.addEventListener('ended', function() { btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; isPlaying = false; clearSavedPosition(); });
        
        var lastClickTime = 0;
        var clickTimer = null;
        
        video.addEventListener('click', function(e) {
			    e.stopPropagation();
                showControls();
			    if (isDraggingVideo) { isDraggingVideo = false; return; }
			    
                var currentTime = Date.now();
                var clickDelay = currentTime - lastClickTime;
			    var width = window.innerWidth;
			    var x = e.clientX;
			    
                if (clickDelay < 300) {
                    clearTimeout(clickTimer);
                    if (x < width * 0.3) {
                        seekVideo(-10);
                    } else if (x > width * 0.7) {
                        seekVideo(10);
                    } else {
                        togglePlay();
                    }
                } else {
                    clickTimer = setTimeout(function() {
                        togglePlay();
                    }, 250);
                }
                lastClickTime = currentTime;
			});

        video.addEventListener('mousemove', showControls);
        container.addEventListener('mousemove', showControls);
        container.addEventListener('click', showControls);

        video.addEventListener('volumechange', function() { btnMute.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊'; });
        btnPlay.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
        btnMute.addEventListener('click', function(e) { e.stopPropagation(); toggleMute(); });
        btnReload.addEventListener('click', function(e) { e.stopPropagation(); reloadVideo(); });
        
        btnFullscreen.addEventListener('click', function(e) { 
            e.stopPropagation(); 
            currentResizeMode = (currentResizeMode + 1) % 4;
            changeVideoSize();
        });
        
        btnPlaylist.addEventListener('click', function(e) { e.stopPropagation(); playlistPanel.style.transform = 'translateX(0)'; });
        
        progressWrap.addEventListener('click', function(e) {
            e.stopPropagation();
            var rect = progressWrap.getBoundingClientRect();
            var pct = (e.clientX - rect.left) / rect.width;
            if (video.duration && !isNaN(video.duration)) video.currentTime = pct * video.duration;
            updateProgress();
        });
        progressWrap.addEventListener('mousedown', function(e) { isDraggingProgress = true; showControls(); });
        document.addEventListener('mousemove', function(e) {
            if (isDraggingProgress && video.duration && !isNaN(video.duration)) {
                var rect = progressWrap.getBoundingClientRect();
                var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                progressBar.style.width = (pct * 100) + '%';
                video.currentTime = pct * video.duration;
                updateProgress();
            }
        });
        document.addEventListener('mouseup', function() { isDraggingProgress = false; });
        bigPlayBtn.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });

        // BỘ PHÍM TẮT ĐIỀU KHIỂN
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            showControls();
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); e.shiftKey ? seekVideo(-30) : (e.ctrlKey || e.altKey) ? seekVideo(-5) : seekVideo(-10); break;
                case 'ArrowRight': e.preventDefault(); e.shiftKey ? seekVideo(30) : (e.ctrlKey || e.altKey) ? seekVideo(5) : seekVideo(10); break;
                case ' ': case 'k': case 'K': e.preventDefault(); togglePlay(); break;
                case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); showToast('Âm lượng: ' + Math.round(video.volume * 100) + '%'); break;
                case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); showToast('Âm lượng: ' + Math.round(video.volume * 100) + '%'); break;
                case 'm': case 'M': e.preventDefault(); toggleMute(); break;
                case 'f': case 'F': 
                    e.preventDefault(); 
                    currentResizeMode = (currentResizeMode + 1) % 4;
                    changeVideoSize();
                    break;
                case 'r': case 'R': e.preventDefault(); reloadVideo(); break;
                case 'Home': e.preventDefault(); video.currentTime = 0; showToast('Về đầu video'); break;
                case 'End': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration - 1; break;
                case '>': case '.': e.preventDefault(); currentSpeed = Math.min(4, currentSpeed + 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '<': case ',': e.preventDefault(); currentSpeed = Math.max(0.25, currentSpeed - 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '0': e.preventDefault(); video.currentTime = 0; break;
                case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration * (parseInt(e.key) / 10); break;
            }
        });

        // BỘ CẢM ỨNG ĐIỀU HƯỚNG VUỐT VUỐT
        var touchStartX = 0, touchStartY = 0, isSwiping = false;
        container.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; isSwiping = false; }, { passive: true });
        container.addEventListener('touchmove', function(e) {
            if (e.touches.length !== 1) return;
            var dx = e.touches[0].clientX - touchStartX;
            var dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
                isSwiping = true;
                var seekSec = Math.round(dx / 15);
                if (Math.abs(seekSec) >= 1) { seekVideo(seekSec); touchStartX = e.touches[0].clientX; }
            }
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
                isSwiping = true;
                if (touchStartX > window.innerWidth / 2) {
                    var volChange = -dy / 200;
                    video.volume = Math.max(0, Math.min(1, video.volume + volChange));
                    showToast('🔊 ' + Math.round(video.volume * 100) + '%');
                    touchStartY = e.touches[0].clientY;
                }
            }
        }, { passive: true });

        // TUA VÙNG CHUỘT KÉO (REGION MOUSE SELECT) KHÔNG LO QUẢNG CÁO
        var regionStartX = 0, regionOverlay = null;
        video.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            isDraggingVideo = false;
            regionStartX = e.clientX;
            regionOverlay = document.createElement('div');
            regionOverlay.style.cssText = 'position:fixed;top:0;height:100vh;background:rgba(231,76,60,0.3);pointer-events:none;z-index:25;';
            document.body.appendChild(regionOverlay);
        });
        document.addEventListener('mousemove', function(e) {
            if (!regionOverlay) return;
            isDraggingVideo = true;
            var left = Math.min(regionStartX, e.clientX);
            var width = Math.abs(e.clientX - regionStartX);
            regionOverlay.style.left = left + 'px';
            regionOverlay.style.width = width + 'px';
        });
        document.addEventListener('mouseup', function(e) {
            if (!regionOverlay) return;
            var deltaX = e.clientX - regionStartX;
            if (Math.abs(deltaX) > 50 && video.duration && !isNaN(video.duration)) {
                var startPct = Math.min(regionStartX, e.clientX) / window.innerWidth;
                video.currentTime = startPct * video.duration;
                showToast('⏩ Đã tua đến vùng chọn: ' + formatTime(video.currentTime));
                if (video.paused) togglePlay();
            }
            regionOverlay.remove();
            regionOverlay = null;
        });

        if (video.paused) {
            video.play().then(function() {
                isPlaying = true; btnPlay.textContent = '⏸';
                showToast('🎉 Đã bọc Player thành công lên video gốc! Xem phim mượt mà, sạch quảng cáo.', 5000, true, true);
            }).catch(function() {
                video.muted = true; isMuted = true; btnMute.textContent = '🔇';
                video.play();
                showToast('Đã phát tự động (Muted) - Bấm 🔊 hoặc phím M để bật tiếng');
            });
        } else {
            isPlaying = true;
            btnPlay.textContent = '⏸';
            showToast('🎉 Xem vui nhé các bạn.  ', 5000, true, true);
        }

        renderPlaylist();
        showControls();

        window.VideoPlayerAPI = {
            addServer: function(item) { if (!item || !item.src) return; playlistState.servers.push(item); renderPlaylist(); },
            addServerAt: function(index, item) { if (!item || !item.src) return; playlistState.servers.splice(index, 0, item); renderPlaylist(); },
            addEpisode: function(item) { if (!item || !item.src) return; playlistState.episodes.push(item); renderPlaylist(); },
            addEpisodeAt: function(index, item) { if (!item || !item.src) return; playlistState.episodes.splice(index, 0, item); renderPlaylist(); },
            removeServer: function(label) { playlistState.servers = playlistState.servers.filter(function(s) { return s.label !== label; }); renderPlaylist(); },
            removeEpisode: function(label) { playlistState.episodes = playlistState.episodes.filter(function(s) { return s.label !== label; }); renderPlaylist(); },
            clearServers: function() { playlistState.servers = []; renderPlaylist(); },
            clearEpisodes: function() { playlistState.episodes = []; renderPlaylist(); },
            getServers: function() { return playlistState.servers.slice(); },
            getEpisodes: function() { return playlistState.episodes.slice(); },
            switchSource: function(src) { switchSource(src); },
            refresh: function() { renderPlaylist(); }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', GetlinkVideo);
    } else {
        GetlinkVideo();
    }
}
function checkResume() {
	(function initVideoFlow() {
		if (document.querySelector('video')) {
			console.log("🎯 Tìm thấy thẻ video ngay lập tức. Khởi chạy luôn!");
			runVideo();
			return;
		}
		
		console.log("⏳ Chưa thấy video. Bắt đầu quét tìm video hoặc nút resumeBtn mỗi 1 giây...");
		let secondsPassed = 0;
		const maxSeconds = 20;
		const checkInterval = setInterval(function() {
			secondsPassed++;
			
			const videoElement = document.querySelector('video');
			const skipButton = document.getElementById("resumeBtn");
			
			if (videoElement) {
				clearInterval(checkInterval);
				console.log("✓ Tìm thấy thẻ video xuất hiện trong vòng lặp! Khởi chạy ngay.");
				runVideo();
				return;
			}
			
			if (skipButton) {
				const style = window.getComputedStyle(skipButton);
				if (style.display !== 'none' && style.visibility !== 'hidden') {
					clearInterval(checkInterval);
					console.log("🎯 Đã tìm thấy nút resumeBtn hiển thị! Click và đợi 2s...");
					skipButton.click();
					setTimeout(function() {
						runVideo();
					}, 2000);
					return;
				}
			}
			
			if (secondsPassed >= maxSeconds) {
				clearInterval(checkInterval);
				console.log("⏱ Đã hết 20 giây quét mà không tìm thấy gì.");
				showToast("⚠️ Vui lòng nhấn vào màn hình hoặc nút Xem Tiếp để tiếp tục phát phim!", 20000, true, false);
				runVideo();
			}
		}, 1000);
	})();
}

if (document.readyState === 'loading') {
    //document.addEventListener('DOMContentLoaded', initCustomVideoFix);
    setTimeout(checkResume, 1000);
} else {
    setTimeout(checkResume, 1000);
}

`;
}

// Hardcoded Categories (Genres)
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

// Hardcoded Countries
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

// Hardcoded Years
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
    // Base image URL for NguonC
    return "https://img.phimapi.com/" + path;
}
