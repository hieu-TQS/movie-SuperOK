// =============================================================================
// CẤU HÌNH DOMAIN (CHỈ CẦN SỬA TÊN MIỀN Ở ĐÂY NẾU WEB CÓ THAY ĐỔI)
// =============================================================================
var MAIN_DOMAIN = "www.shortflix.net"; 
var BASEURL = "https://" + MAIN_DOMAIN; 
var BASEAPI = "https://" + MAIN_DOMAIN + "/api/search?limit=100&language=vi_VN&lang=vi_VN";

// =============================================================================
// GLOBAL CURSOR CACHE (BỘ NHỚ LƯU CURSOR ĐỘNG TRONG BỘ NHỚ RAM)
// =============================================================================
var CURSOR_CACHE = {};
var URL_TO_PAGE_MAP = {};
var URL_TO_PATH_MAP = {};

function getManifest() {
    return JSON.stringify({
        "id": "shortflix",
        "name": "Phim Ngắn Shortflix",
        "description": "Phim ngắn Shortflix bản v1.0.0 phát mượt mà hỗ trợ phụ đề tiếng Việt.",
        "info": "Phim ngắn Shortflix bản v1.0.0 phát mượt mà hỗ trợ phụ đề tiếng Việt.",
        "version": "1.0.0", 
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/shortflix.png",
        "isEnabled": true,
        "hasLogin": true,                     
        "loginUrl": BASEURL + "/vi/login",    
        "type": "shortfilm",                  
        "layoutType": "VERTICAL",             
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[shortflix] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[shortflix] " + msg);
    }
}

// CHỈ ĐỂ 5 MỤC NỔI BẬT Ở TRANG CHỦ THEO YÊU CẦU
function getHomeSections() {
    return JSON.stringify([
        { "slug": "&sortBy=last_episode_at", "title": "Phim Mới Cập Nhật", "type": "Grid" },
        { "slug": "&genre=tong-tai", "title": "Phim Tổng Tài", "type": "Horizontal" },
        { "slug": "&genre=co-dai", "title": "Phim Cổ Đại", "type": "Horizontal" },
        { "slug": "&genre=ngon-tinh", "title": "Phim Ngôn Tình", "type": "Horizontal" },
        { "slug": "&q=l%E1%BB%93ng+ti%E1%BA%BFng", "title": "Phim Lồng Tiếng", "type": "Horizontal" }
    ]);
}

// ĐẨY TOÀN BỘ DANH MỤC VÀO MENU PRIMARY CATEGORIES
function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getFilterConfig() {
    return JSON.stringify({});
}

// =============================================================================
// HELPER: CURSOR BASE64 ENCODE / DECODE (GIỮ NGUYÊN)
// =============================================================================

function encodeBase64(str) {
    if (typeof btoa !== 'undefined') {
        try { return btoa(str); } catch (e) {}
    }
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '';
    for (var block, charCode, idx = 0, map = chars;
        str.charAt(idx | 0) || (map = '=', idx % 1);
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)) {
        charCode = str.charCodeAt(idx += 3/4);
        block = block << 8 | charCode;
    }
    return output;
}

function decodeBase64(str) {
    if (typeof atob !== 'undefined') {
        try { return atob(str); } catch (e) {}
    }
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = '';
    str = String(str).replace(/=+$/, '');
    for (var bc = 0, bs, buffer, idx = 0;
        buffer = str.charAt(idx++);
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}

function parseCursor(cursorBase64) {
    if (!cursorBase64) return null;
    try {
        var jsonStr = decodeBase64(cursorBase64);
        return JSON.parse(jsonStr);
    } catch (e) {
        return null;
    }
}

function createCursor(lastItem) {
    if (!lastItem) return "";
    try {
        var rawOrder = lastItem.orderValue || lastItem.updatedAt || lastItem.publishedAt || lastItem.last_episode_at || 0;
        var orderVal = Number(rawOrder);
        
        if (isNaN(orderVal) && typeof rawOrder === 'string') {
            var dateParsed = Date.parse(rawOrder);
            orderVal = !isNaN(dateParsed) ? dateParsed : 0;
        }

        var cursorObj = {
            id: String(lastItem.id || ""),
            timestamp: 0,
            orderValue: orderVal || 0
        };
        
        return encodeBase64(JSON.stringify(cursorObj));
    } catch (e) {
        return "";
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        var cursor = "";

        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                cursor = filters.cursor || ""; 
                
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var resultUrl = "";
        if (path && path.indexOf("http") === 0) {
            resultUrl = path;
        } else {
            resultUrl = BASEAPI + (path ? path : "");
        }

        if (page > 1 && !cursor) {
            var cacheKey = path + "_page_" + page;
            cursor = CURSOR_CACHE[cacheKey] || "";
        }

        if (cursor) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "cursor=" + encodeURIComponent(cursor);
        }

        resultUrl = resultUrl.replace(/([^:]\/)\/+/g, "$1");

        URL_TO_PAGE_MAP[resultUrl] = page;
        URL_TO_PATH_MAP[resultUrl] = path;

        return resultUrl;
    } catch (e) {
        return slug || BASEAPI;
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEAPI + "&q=" + encodeURIComponent(keyword);
}

function extractSlug(urlOrSlug) {
    if (!urlOrSlug) return "";
    var str = String(urlOrSlug);
    if (str.indexOf("/videos/") > -1) {
        str = str.split("/videos/")[1];
    }
    str = str.split("?")[0].split("#")[0];
    return str.replace(/^\/+|\/+$/g, "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var cleanSlug = extractSlug(slug);
    if (!cleanSlug) return BASEURL;
    return BASEURL + "/api/videos/" + cleanSlug + "?language=vi_VN&lang=vi_VN";
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        var items = [];
        var $data = JSON.parse(html);
        var nextCursor = "";
        
        if ($data && $data.items && $data.items.length > 0) {
            for (var $j = 0; $j < $data.items.length; $j++) {
                var $item = $data.items[$j];
                var year = "";
                var lang = "";
                var current = $item.status ? $item.status.replace("PUBLISHED", "Hoàn Thành") : "";
                
                var itemSlug = $item.slug || $item.id || "";
                var href = BASEURL + "/vi/videos/" + itemSlug;
                
                var quality = "HD";
                var title = $item.title || "";
                var src = $item.thumbnailUrl || "";

                if (href) {
                    var cleanThumb = src.replace(/&amp;/g, '&');
                    items.push({
                        "id": href,
                        "title": title.trim(),
                        "posterUrl": cleanThumb,
                        "backdropUrl": cleanThumb,
                        "quality": quality,
                        "lang": lang,
                        "episode_current": current
                    });
                }
            }

            if ($data.nextCursor) {
                nextCursor = $data.nextCursor;
            } else {
                var lastRawItem = $data.items[$data.items.length - 1];
                nextCursor = createCursor(lastRawItem);
            }

            var currentPage = URL_TO_PAGE_MAP[$url] || 1;
            var currentPath = URL_TO_PATH_MAP[$url] || "";
            var nextPage = currentPage + 1;

            if (nextCursor) {
                var cacheKey = currentPath + "_page_" + nextPage;
                CURSOR_CACHE[cacheKey] = nextCursor;
            }
        }

        return JSON.stringify({
            "items": items,
            "nextCursor": nextCursor,
            "pagination": {
                "currentPage": 1,
                "totalPages": items.length > 0 ? 999 : 1,
                "nextCursor": nextCursor
            }
        });

    } catch (e) {
        return JSON.stringify({
            "items": [],
            "nextCursor": "",
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var id = url;
        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "Không có mô tả.";
        var category = "";
        var episode_current = "";
        var episode_total = "";
        var quality = "1080p";
        var year = 2026;
        var rating = 0;
        var lactor = "";
        var ldirec = "";
        var lduran = "";
        var status = "PUBLISHED";
        
        var cleanSlug = extractSlug(url);

        // Trường hợp 1: Data trả về dạng JSON từ /api/videos/{slug}
        if (html && (html.trim().charAt(0) === '{' || html.trim().charAt(0) === '[')) {
            var data = JSON.parse(html);
            if (data) {
                lname = data.title || (data.translate && data.translate.title) || lname;
                ldes = data.description || (data.translate && data.translate.description) || ldes;
                limg = data.thumbnailUrl || limg;
                if (data.createdAt) {
                    var parsedYear = parseInt(data.createdAt.substring(0, 4));
                    if (!isNaN(parsedYear)) year = parsedYear;
                }
                if (data.status) {
                    status = data.status === "PUBLISHED" ? "Hoàn Thành" : data.status;
                }
                
                // Categories & Tags
                var cats = [];
                if (data.tags && Array.isArray(data.tags)) {
                    for (var t = 0; t < data.tags.length; t++) {
                        if (data.tags[t] && data.tags[t].title) cats.push(data.tags[t].title);
                    }
                }
                if (data.genres && Array.isArray(data.genres)) {
                    for (var g = 0; g < data.genres.length; g++) {
                        if (data.genres[g] && data.genres[g].name && data.genres[g].lang === 'vi_VN') {
                            if (cats.indexOf(data.genres[g].name) === -1) cats.push(data.genres[g].name);
                        }
                    }
                }
                if (cats.length > 0) category = cats.join(", ");

                var servers = [];
                var directEpisodes = [];
                var webviewEpisodes = [];

                if (data.episodes && Array.isArray(data.episodes) && data.episodes.length > 0) {
                    var total = data.episodes.length;
                    episode_current = "Full " + total + " Tập";
                    episode_total = String(total);

                    for (var i = 0; i < data.episodes.length; i++) {
                        var ep = data.episodes[i];
                        var epNum = ep.episodeNumber || (i + 1);
                        var epTitle = "Tập " + epNum;
                        var epSlug = ep.episodeNumberStr || ("episode-" + epNum);

                        // Tìm videoUrl HLS và phụ đề VTT từ versions (vi_VN hoặc version đầu tiên)
                        var videoM3u8 = "";
                        var subVtt = "";
                        if (ep.versions && Array.isArray(ep.versions) && ep.versions.length > 0) {
                            var targetVersion = null;
                            for (var v = 0; v < ep.versions.length; v++) {
                                if (ep.versions[v] && ep.versions[v].lang === 'vi_VN' && ep.versions[v].videoUrl) {
                                    targetVersion = ep.versions[v];
                                    break;
                                }
                            }
                            if (!targetVersion) {
                                targetVersion = ep.versions[0];
                            }
                            if (targetVersion) {
                                videoM3u8 = targetVersion.videoUrl || "";
                                var subs = targetVersion.subtitles || targetVersion.subtitlesList;
                                if (subs && Array.isArray(subs) && subs.length > 0) {
                                    for (var s = 0; s < subs.length; s++) {
                                        if (subs[s] && subs[s].fileUrl) {
                                            subVtt = subs[s].fileUrl;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if (videoM3u8) {
                            var streamWithSub = subVtt ? (videoM3u8 + "#sub=" + encodeURIComponent(subVtt)) : videoM3u8;
                            directEpisodes.push({
                                name: epTitle,
                                id: streamWithSub,
                                slug: epSlug,
                                thumbnailUrl: ep.thumbnailUrl || limg,
                                duration: ep.duration ? String(ep.duration) + "s" : ""
                            });
                        }

                        // Webview fallback episode URL
                        var webUrl = BASEURL + "/vi/videos/" + cleanSlug + "?ep=" + epNum;
                        webviewEpisodes.push({
                            name: epTitle + " (Web)",
                            id: webUrl,
                            slug: epSlug,
                            thumbnailUrl: ep.thumbnailUrl || limg
                        });
                    }
                }

                if (directEpisodes.length > 0) {
                    servers.push({
                        name: "HLS Direct (Phát ExoPlayer)",
                        episodes: directEpisodes
                    });
                }

                if (webviewEpisodes.length > 0) {
                    servers.push({
                        name: "Web Player (Dự Phòng VIP Webview)",
                        episodes: webviewEpisodes
                    });
                }

                return JSON.stringify({
                    id: id,
                    title: lname,
                    posterUrl: limg,
                    backdropUrl: limg,
                    description: ldes,
                    quality: quality,
                    year: year,
                    rating: rating,
                    status: status,
                    category: category,
                    episode_current: episode_current,
                    episode_total: episode_total,
                    servers: servers,
                    duration: lduran || "",
                    casts: lactor || "",
                    director: ldirec || "",
                    extra: ""
                });
            }
        }

        // Fallback: nếu html là trang HTML web
        lname = _$(html).find("h1").text() || _$(html).find('meta[property="og:title"]').attr("content") || "Shortflix Film";
        limg = _$(html).find('meta[property="og:image"]').attr("content") || "";
        ldes = _$(html).find(".order-6:content('Giới thiệu')").text() || "Không có mô tả.";

        var watchLink = BASEURL + "/vi/videos/" + cleanSlug;
        var fallbackServers = [{
            name: "Lướt Chuyển Tập Tự Động (Webview)",
            episodes: [{
                id: watchLink,
                name: "Bấm vào để Xem & Vuốt",
                slug: "webview-player"
            }]
        }];

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: quality,
            year: year,
            rating: rating,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: fallbackServers,
            duration: "",
            casts: "",
            director: "",
            extra: ""
        });
    } catch (e) {
        return JSON.stringify({ id: url || "error", title: "Lỗi chi tiết", servers: [] });
    }
}

// -----------------------------------------------------------------------------
// WEBVIEW LOADER & HLS RESOLVER
// -----------------------------------------------------------------------------
function parseDetailResponse(html, url) {
    try {
        if (!url) return JSON.stringify({ url: "", isEmbed: false });

        var streamUrl = url;
        if (url.indexOf("#sub=") > -1) {
            // Keep the #sub= param attached so ExoPlayer/WebPlayer can extract and render the VTT subtitle
            streamUrl = url;
        }

        // Nếu url là link HLS trực tiếp (.m3u8 hoặc cdn nsstorage) -> Phát bằng ExoPlayer
        if (url.indexOf(".m3u8") > -1 || url.indexOf("nsstorage.space") > -1 || url.indexOf("/hls/") > -1) {
            return JSON.stringify({
                "url": url,
                "isEmbed": false,
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": BASEURL + "/"
                }
            });
        }

        var pureWebviewJs = `
            (function() {
                try {
                    document.cookie = "NEXT_LOCALE=vi_VN; path=/; max-age=31536000";
                    localStorage.setItem("language", "vi_VN");
                    localStorage.setItem("lang", "vi_VN");
                    localStorage.setItem("NEXT_LOCALE", "vi_VN");
                } catch(e) {}
                // Vô hiệu hóa tính năng Fullscreen của Web Player để Android không bốc ra ngoài
                try {
                    var noop = function() { return Promise.resolve(); };
                    Object.defineProperty(document, 'fullscreenEnabled', {get: function() { return false; }});
                    Object.defineProperty(document, 'webkitFullscreenEnabled', {get: function() { return false; }});
                    if(Element.prototype.requestFullscreen) Element.prototype.requestFullscreen = noop;
                    if(Element.prototype.webkitRequestFullscreen) Element.prototype.webkitRequestFullscreen = noop;
                    if(Element.prototype.mozRequestFullScreen) Element.prototype.mozRequestFullScreen = noop;
                    if(Element.prototype.msRequestFullscreen) Element.prototype.msRequestFullscreen = noop;
                    if(window.HTMLVideoElement) {
                        HTMLVideoElement.prototype.webkitEnterFullscreen = noop;
                        HTMLVideoElement.prototype.enterFullscreen = noop;
                    }
                } catch(e) {}

                var EMAIL = "iamwilliamm6@gmail.com";
                var PASS = "trung@123";

                // CSS Giấu rác, quảng cáo và ẩn nút phóng to của trình phát web
                var style = document.createElement('style');
                style.innerHTML = 'header, .header, nav, footer, .footer, .download-app, .app-download, [class*="ad-"], [id*="ad-"], .popup, .modal, .google-auto-placed, iframe[src*="ads"], .bottom-nav, .navigation, .sidebar, .comments, .vjs-fullscreen-control, .plyr__controls [data-plyr="fullscreen"], .jw-fullscreen, .fullscreen-btn, video::-webkit-media-controls-fullscreen-button { display: none !important; opacity: 0 !important; pointer-events: none !important; z-index: -9999 !important; } body, html { margin: 0 !important; padding: 0 !important; overflow-x: hidden !important; background: #000 !important; overscroll-behavior-y: none; }';
                document.head.appendChild(style);

                setInterval(function() {
                    // Ép thẻ video chạy inline để player của web hoạt động trọn vẹn bên trong khung dọc
                    var vids = document.querySelectorAll('video');
                    for (var k = 0; k < vids.length; k++) {
                        if (!vids[k].hasAttribute('playsinline')) {
                            vids[k].setAttribute('playsinline', 'true');
                            vids[k].setAttribute('webkit-playsinline', 'true');
                        }
                    }

                    var appBanners = document.querySelectorAll('div[class*="download"], div[class*="banner"]');
                    for (var i = 0; i < appBanners.length; i++) {
                        if (appBanners[i]) appBanners[i].style.display = 'none';
                    }
                    var closeBtns = document.querySelectorAll('.close, .btn-close, [aria-label="Close"]');
                    for (var j = 0; j < closeBtns.length; j++) {
                        try { closeBtns[j].click(); } catch(e){}
                    }
                }, 500);

                // Auto Login Logic gốc của bác
                if (sessionStorage.getItem('vax_autologin_done')) return;
                function doLogin() {
                    var loginBtn = document.querySelector('a[href*="/login"]');
                    if (loginBtn) {
                        sessionStorage.setItem('vax_redirect_back', window.location.href);
                        window.location.href = loginBtn.href; 
                    } else {
                        sessionStorage.setItem('vax_autologin_done', 'true');
                    }
                }

                if (window.location.href.indexOf('/login') > -1) {
                    var checkForm = setInterval(function() {
                        var emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="mail"]');
                        var passInput = document.querySelector('input[type="password"], input[name="password"]');
                        var submitBtn = document.querySelector('button[type="submit"]');

                        if (emailInput && passInput && submitBtn) {
                            clearInterval(checkForm);
                            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                            nativeInputValueSetter.call(emailInput, EMAIL);
                            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                            nativeInputValueSetter.call(passInput, PASS);
                            passInput.dispatchEvent(new Event('input', { bubbles: true }));
                            
                            setTimeout(function() {
                                submitBtn.click();
                                sessionStorage.setItem('vax_autologin_done', 'true');
                                setTimeout(function() {
                                    var backUrl = sessionStorage.getItem('vax_redirect_back');
                                    if (backUrl) window.location.href = backUrl;
                                    else window.location.href = '/';
                                }, 2000);
                            }, 500);
                        }
                    }, 500);
                } else {
                    setTimeout(doLogin, 1500);
                }
            })();
        `;

        return JSON.stringify({
            "url": url,
            "isEmbed": true, 
            "headers": {
                "Referer": BASEURL,
                "Block-Ads": "true",
                "Block-Redirects": "false", 
                "Custom-Js": pureWebviewJs.replace(/\r\n|\r|\n/g, " ").trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": url, "isEmbed": true, "headers": {} });
    }
}

function parseEmbedResponse(htmlContent, url) {
    return JSON.stringify({ url: "", isEmbed: false });
}

function parseCategoriesResponse(apiResponseJson) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// DANH BẠ THỂ LOẠI & HELPER _$ (GIỮ NGUYÊN)
// =============================================================================
function getLISTmenu() {
    return `[{\"link\":\"&q=l%E1%BB%93ng+ti%E1%BA%BFng\",\"name\":\"Lồng Tiếng\"},{\"link\":\"&genre=tong-tai\",\"name\":\"Tổng tài\"},{\"link\":\"&genre=co-dai\",\"name\":\"Cổ đại\"},{\"link\":\"&genre=tam-ly\",\"name\":\"Tâm lý\"},{\"link\":\"&genre=ngon-tinh\",\"name\":\"Ngôn tình\"},{\"link\":\"&genre=hai-huoc\",\"name\":\"Hài hước\"},{\"link\":\"&genre=nu-cuong\",\"name\":\"Nữ cường\"},{\"link\":\"&genre=huyen-huyen\",\"name\":\"Huyền huyễn\"},{\"link\":\"&genre=toi-pham\",\"name\":\"Tội phạm\"},{\"link\":\"&genre=xuyen-khong\",\"name\":\"Xuyên không\"},{\"link\":\"&genre=thanh-xuan\",\"name\":\"Thanh xuân\"},{\"link\":\"&genre=hanh-dong\",\"name\":\"Hành động\"},{\"link\":\"&genre=kinh-di\",\"name\":\"Kinh dị\"},{\"link\":\"&genre=gia-dinh\",\"name\":\"Gia Đình\"},{\"link\":\"&genre=bi-an\",\"name\":\"Bí ẩn\"},{\"link\":\"&genre=dan-quoc\",\"name\":\"Dân quốc\"},{\"link\":\"&genre=trong-sinh\",\"name\":\"Trọng sinh\"},{\"link\":\"&genre=cuoi-truoc-yeu-sau\",\"name\":\"Cưới trước yêu sau\"},{\"link\":\"&genre=khoa-hoc-vien-tuong\",\"name\":\"Khoa học viễn tưởng\"},{\"link\":\"&genre=hanh-dong-ly-ky\",\"name\":\"Hành động ly kỳ\"},{\"link\":\"&genre=hien-dai\",\"name\":\"Hiện đại\"},{\"link\":\"&genre=bao-thu\",\"name\":\"Báo thù\"},{\"link\":\"&genre=the-thao\",\"name\":\"Thể thao\"},{\"link\":\"&genre=em-be\",\"name\":\"Em bé\"},{\"link\":\"&genre=nguoc-luyen\",\"name\":\"Ngược luyến\"},{\"link\":\"&genre=sung-ngot\",\"name\":\"Sủng ngọt\"},{\"link\":\"&genre=hieu-lam\",\"name\":\"Hiểu lầm\"},{\"link\":\"&genre=khac\",\"name\":\"Khác\"},{\"link\":\"&genre=hao-mon\",\"name\":\"Hào môn\"},{\"link\":\"&genre=tim-nguoi-than\",\"name\":\"Tìm người thân\"},{\"link\":\"&genre=quan-phiet\",\"name\":\"Quân phiệt\"},{\"link\":\"&genre=vuon-len-tu-so-khong\",\"name\":\"Vươn lên từ số không\"},{\"link\":\"&genre=tai-hop\",\"name\":\"Tái hợp\"},{\"link\":\"&genre=su-tro-lai\",\"name\":\"Sự trở lại\"},{\"link\":\"&genre=tam-ly-tinh-cam\",\"name\":\"Tâm lý tình cảm\"},{\"link\":\"&genre=truong-thanh\",\"name\":\"Trưởng thành\"}]`;
}

function buildMenu(menuStr, type) { 
    var menuArray = JSON.parse(menuStr); 
    let menulist = []; 
    if (!menuArray || !Array.isArray(menuArray)) return menulist; 
    var typeStr = type !== undefined ? String(type).trim() : undefined; 
    for (var i = 0; i < menuArray.length; i++) { 
        var item = menuArray[i]; 
        if (!item) continue; 
        var link = item.link ? String(item.link).trim() : ""; 
        var name = item.name ? String(item.name).trim() : ""; 
        if (!link || !name) continue; 
        var menuItem = {}; 
        if (typeStr === "false") { 
            menuItem = { "slug": link, "title": name, "type": "Horizontal" }; 
        } else if (typeStr === "true") { 
            menuItem = { "slug": link, "title": name, "type": "Grid" }; 
        } else { 
            menuItem = { "slug": link, "name": name }; 
        } 
        menulist.push(menuItem); 
    } 
    return menulist; 
}

function _$(htmlOrBlock){ if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) { return htmlOrBlock; } var instance = { sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '', elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []), length: 0, find: function (selector) { if (selector.indexOf(',') !== -1) { var results = []; var selectors = selector.split(',').map(function (s) { return s.trim(); }); for (var s = 0; s < selectors.length; s++) { if (selectors[s] === "") continue; var subInstance = this.find(selectors[s]); for (var r = 0; r < subInstance.elements.length; r++) { var element = subInstance.elements[r]; if (results.indexOf(element) === -1) { results.push(element); } } } var multiInstance = _$(results); multiInstance.sourceHtml = this.sourceHtml; return multiInstance; } var results = []; var contentFilter = ""; if (selector.indexOf(":content(") !== -1) { var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/); if (contentMatch) { contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || ""; selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, ""); } } var attrNameFilter = ""; var attrValueFilter = ""; var attrOperator = "="; var hasAttrFilter = false; var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/); if (attrMatch) { hasAttrFilter = true; attrNameFilter = attrMatch[1]; attrOperator = attrMatch[2]; attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || ""; selector = selector.replace(/\[.*?\]/, ""); } var notSelector = ""; if (selector.indexOf(":not(") !== -1) { var notMatch = selector.match(/:not\(([^)]+)\)/); if (notMatch) { notSelector = notMatch[1]; selector = selector.replace(/:not\([^)]+\)/, ""); } } var isFirstFilter = selector.indexOf(":first") !== -1; var isLastFilter = selector.indexOf(":last") !== -1; selector = selector.replace(/:first|:last/g, ""); var targetTagName = ""; var targetId = ""; var targetClasses = []; var selectorToParse = selector.trim(); if (selectorToParse !== "") { var idIndex = selectorToParse.indexOf('#'); if (idIndex !== -1) { var afterId = selectorToParse.substring(idIndex + 1); var nextDot = afterId.indexOf('.'); targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot); selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1)); } var classParts = selectorToParse.split('.'); var possibleTag = classParts.shift(); if (possibleTag) { targetTagName = possibleTag.toLowerCase(); } targetClasses = classParts.filter(function (c) { return c.length > 0; }); } for (var i = 0; i < this.elements.length; i++) { var currentHtml = this.elements[i]; var pos = 0; var subResults = []; while ((pos = currentHtml.indexOf('<', pos)) !== -1) { if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; } var endOpenTag = -1; var insideQuote = false; var quoteChar = ''; for (var j = pos + 1; j < currentHtml.length; j++) { var char = currentHtml.charAt(j); if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') { if (!insideQuote) { insideQuote = true; quoteChar = char; } else if (char === quoteChar) { insideQuote = false; } } if (char === '>' && !insideQuote) { endOpenTag = j; break; } } if (endOpenTag === -1) break; var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1); var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/); var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : ""; var isMatched = true; if (targetTagName && targetTagName !== currentTagName) { isMatched = false; } var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : ""; var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : ""; if (isMatched && targetId && idMatchStr !== targetId) { isMatched = false; } if (isMatched && targetClasses.length > 0) { if (classMatchStr) { var currentClasses = classMatchStr.trim().split(/\s+/); for (var c = 0; c < targetClasses.length; c++) { if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; } } } else { isMatched = false; } } if (isMatched && hasAttrFilter) { var actualValue = ""; if (attrNameFilter === "class") { actualValue = classMatchStr; } else if (attrNameFilter === "id") { actualValue = idMatchStr; } else { var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : ""; } var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1; if (!attrExists) { isMatched = false; } else { if (attrOperator === "=") { if (attrNameFilter === "class") { var classes = actualValue.trim().split(/\s+/); if (classes.indexOf(attrValueFilter) === -1) isMatched = false; } else if (actualValue !== attrValueFilter) { isMatched = false; } } else if (attrOperator === "*=") { if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false; } else if (attrOperator === "^=") { if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false; } else if (attrOperator === "$=") { if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false; } } } if (isMatched) { var startTagPos = pos; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(this.sourceHtml)) !== null) { var isClose = match[1] === '/'; var fullMatched = match[0]; if (isClose) { depth--; } else if (fullMatched.indexOf('/>') === -1) { depth++; } if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } if (depth > 0) { endTagPos = currentHtml.length; } } var foundBlock = currentHtml.substring(startTagPos, endTagPos); if (contentFilter) { var pureText = ""; if (currentTagName === "script" || currentTagName === "style") { var innerStart = foundBlock.indexOf('>') + 1; var innerEnd = foundBlock.search(/<\/(?:script|style)/i); pureText = innerEnd !== -1 ? foundBlock.substring(innerStart, innerEnd) : foundBlock.substring(innerStart); } else { pureText = foundBlock.replace(/<[^>]+>/g, "").trim(); } var keywords = contentFilter.split('|'); var isContentMatched = false; for (var k = 0; k < keywords.length; k++) { if (pureText.indexOf(keywords[k].trim()) !== -1) { isContentMatched = true; break; } } if (!isContentMatched) { pos = endTagPos; continue; } } if (notSelector) { var isNotClass = notSelector.indexOf('.') === 0; var isNotId = notSelector.indexOf('#') === 0; var notValue = notSelector.substring(1); var hasNot = false; if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true; if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true; if (!hasNot) subResults.push(foundBlock); } else { subResults.push(foundBlock); } pos = endTagPos; } else { pos++; } } if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]]; if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]]; results = results.concat(subResults); } var newInstance = _$(results); newInstance.sourceHtml = this.sourceHtml || currentHtml; return newInstance; }, each: function (callback) { for (var i = 0; i < this.elements.length; i++) { var childInstance = _$(this.elements[i]); childInstance.sourceHtml = this.sourceHtml; callback.call(childInstance, i, this.elements[i]); } return this; }, eq: function (index) { if (index < 0) index = this.elements.length + index; var matchedElement = this.elements[index]; this.elements = matchedElement ? [matchedElement] : []; this.length = this.elements.length; return this; }, attr: function (attrName) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : ""; }, html: function () { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var matchClose = elem.match(/<\/([a-zA-Z0-9_-]+)\s*>\s*$/i); if (matchClose) { var end = elem.lastIndexOf(matchClose[0]); if (start > 0 && end >= start) return elem.substring(start, end); } return start > 0 ? elem.substring(start) : ""; }, text: function (separator) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); if (typeof separator === 'string') { return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(separator); } return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); } return ""; }, textAll: function (separator) { if (this.elements.length === 0) return ""; var sep = typeof separator === 'string' ? separator : " "; var allTexts = []; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); var cleanText = pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); if (cleanText !== '') { allTexts.push(cleanText); } } } return allTexts.join(sep); }, next: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx === -1) continue; var scanPos = idx + elem.length; var nextOpen = this.sourceHtml.indexOf('<', scanPos); if (nextOpen !== -1) { if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue; var endOpenTag = this.sourceHtml.indexOf('>', nextOpen); if (endOpenTag === -1) continue; var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var startTagPos = nextOpen; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(this.sourceHtml)) !== null) { if (match[1] === '/') depth--; else if (match[0].indexOf('/>') === -1) depth++; if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } } results.push(this.sourceHtml.substring(startTagPos, endTagPos)); } } var nextInstance = _$(results); nextInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, parent: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx <= 0) continue; var scanPos = idx - 1; while (scanPos >= 0) { var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos); if (openTagPos === -1) break; if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') { var endOpenTag = this.sourceHtml.indexOf('>', openTagPos); if (endOpenTag !== -1 && endOpenTag > openTagPos) { var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(this.sourceHtml)) !== null) { if (match[1] === '/') depth--; else if (match[0].indexOf('/>') === -1) depth++; if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } } if (endTagPos >= idx + elem.length) { var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos); if (results.indexOf(parentBlock) === -1) results.push(parentBlock); break; } } } scanPos = openTagPos - 1; } } var parentInstance = _$(results); parentInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, closest: function (selector) { var results = []; if (!this.sourceHtml || this.elements.length === 0) return _$([]); for (var i = 0; i < this.elements.length; i++) { var currentElem = this.elements[i]; var currentObj = _$(currentElem); currentObj.sourceHtml = this.sourceHtml; var selfCheck = _$(this.sourceHtml).find(selector); var isSelfMatched = false; for (var s = 0; s < selfCheck.elements.length; s++) { if (selfCheck.elements[s] === currentElem) { isSelfMatched = true; break; } } if (isSelfMatched) { if (results.indexOf(currentElem) === -1) results.push(currentElem); continue; } var parentObj = currentObj.parent(); while (parentObj.elements.length > 0) { var parentElem = parentObj.elements[0]; var checkMatch = _$(this.sourceHtml).find(selector); var isMatched = false; for (var j = 0; j < checkMatch.elements.length; j++) { if (checkMatch.elements[j] === parentElem) { isMatched = true; break; } } if (isMatched) { if (results.indexOf(parentElem) === -1) results.push(parentElem); break; } parentObj = parentObj.parent(); } } var closestInstance = _$(results); closestInstance.sourceHtml = this.sourceHtml; return closestInstance; } }; instance.length = instance.elements.length; return instance; }
