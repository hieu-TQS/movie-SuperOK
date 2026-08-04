
BASEURL = "https://sexdeplon.blog";
BASEIMG = "https://sexdeplon.com/resize/50/2025/02/04/16c0e67dcf0acbc0be5e7ef611c410b76820a26b490a9d790f758fbe851607bc.png";

// https://sexdep.vip/?page=2
// https://www.xxxfiles.com/favicon-32x32.png
function getManifest() {
    return JSON.stringify({
        "id": "sexdep",
        "name": "sexdep",
        "description": "XXX Hay",
        "version": "1.4.4",
        "BASEURL": "https://sexdeplon.blog",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}



// https://sexdeplon.com/?view=hay-nhat&page=2
function getHomeSections() {
    var listurl = "the-loai/viet-nam@@Hàng Mới@@true";
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        category: menulist
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var baseUrlClean = (typeof BASEURL !== 'undefined' ? BASEURL : "").replace(/\/$/, "");
    
    var page = 1;
    var path = "";
    
    // 1. Cố gắng parse JSON một cách an toàn
    try {
        if (filtersJson) {
            // Thay thế các key không có dấu nháy bằng key có dấu nháy để sửa lỗi JSON lỏng lẻo
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            var filters = JSON.parse(fixedJson);
            
            page = parseInt(filters.page) || 1;
            
            // Chỉ lấy category từ JSON nếu không truyền slug vào hàm
            if (!slug && filters.category) {
                if (Array.isArray(filters.category) && filters.category.length > 0) {
                    path = filters.category[0].slug;
                } else if (typeof filters.category === 'string') {
                    path = filters.category;
                }
            }
        }
    } catch (e) {
        // Ghi log lỗi nếu cần thiết để debug: console.error(e);
    }
    
    // 2. Nếu có slug truyền vào, ưu tiên sử dụng slug đó
    if (slug) {
        path = slug;
    }
    
    // 3. KIỂM TRA NẾU PATH ĐÃ LÀ URL TUYỆT ĐỐI
    if (/^https?:\/\//i.test(path)) {
        path = path.replace(/\/+$/, "");
        
        if (page > 1) {
            if (path.indexOf("?") > -1) {
                return path + "&page=" + page;
            } else {
                return path + "/?page=" + page;
            }
        } else {
            return path + "/";
        }
    }
    
    // 4. Xử lý cho URL tương đối (slug thông thường)
    if (!path) return baseUrlClean + "/";
    
    path = path.replace(/^\/+|\/+$/g, "");
    var targetUrl = baseUrlClean + "/" + path;
    
    if (page > 1) {
        if (targetUrl.indexOf("?") > -1) {
            targetUrl += "&page=" + page;
        } else {
            targetUrl += "?page=" + page;
        }
    } else {
        // Tránh nhân đôi dấu / nếu path thực chất là query string (ví dụ: ?view=hay-nhat)
        if (path.indexOf("?") !== 0) {
            targetUrl += "/";
        }
    }
    
    return targetUrl;
}
/*
// === KHU VỰC TEST CHẠY THỬ ===
var BASEURL = "https://sexdep.vip";
var filtersJson = '{page:5,category:[{"slug":"?view=hay-nhat","name":"Hay Nhất"},{"slug":"the-loai/vietsub","name":"Vietsub"},{"slug":"the-loai/khong-che","name":"Không Che"},{"slug":"the-loai/viet-nam","name":"Việt Nam"},{"slug":"the-loai/trung-quoc","name":"Trung Quốc"},{"slug":"the-loai/au-my","name":"Âu - Mỹ"},{"slug":"the-loai/gai-xinh","name":"Gái Xinh"},{"slug":"the-loai/hiep-dam","name":"Hiếp Dâm"},{"slug":"the-loai/jav-hd","name":"JAV HD"},{"slug":"the-loai/hoc-sinh","name":"Học Sinh"},{"slug":"the-loai/vu-to","name":"Vú To"}]}';

//Trường hợp 1: Truyền slug cụ thể -> Sẽ lấy slug này + số page trong JSON
//console.log(getUrlList("the-loai/au-my", filtersJson)); 
// Kết quả: https://sexdep.vip/the-loai/au-my?page=7
// Trường hợp 2: Không truyền slug -> Sẽ tự động lấy phần tử đầu tiên trong JSON (?view=hay-nhat)
console.log(getUrlList("https://sexdep.vip/search/vang-anh", filtersJson));
*/
// https://sexdep.vip/search/gai-nga?page=2

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================



function parseListResponse(html, currentUrl) {
    try {
        var items = [];
        
        // 1. Kiểm tra nếu HTML trống hoặc lỗi
        if (!html || html.indexOf('body') === -1) {
            return JSON.stringify({
                items: [{ id: currentUrl, title: "Lỗi: 1 - " + currentUrl, posterUrl: BASEIMG }],
                pagination: { currentPage: 1, totalPages: 1 }
            });
        }
        
        // 2. Regex linh hoạt hơn cho class (chấp nhận thumb item hoặc item thumb, và các class đi kèm)
        const divRegex = /<div[^>]*class=["'][^"']*item-box[^"']*["'][^>]*>([\s\S]*?)<\/div>/g;
        let match;
        
        while ((match = divRegex.exec(html)) !== null) {
            const content = match[1];
            
            // Nếu trong khối không chứa các từ khóa quan trọng thì bỏ qua
            if (!content.match(/img|href|video|src/i)) {
                continue;
            }
            
            // 3. Lấy href từ thẻ <a> đầu tiên trong khối
            var urlMatch = content.match(/<a[^>]+href=["'](http[^"']+)["']/i);
            var itemUrl = "";
            if (urlMatch && urlMatch[1]) {
                itemUrl = urlMatch[1];
            } else {
                continue; // Không có link thì bỏ qua item này
            }
            
            if (!itemUrl.startsWith("http")) {
                itemUrl = BASEURL + (itemUrl.startsWith("/") ? "" : "/") + itemUrl;
            }
            
            // 4. Lấy Title từ thuộc tính alt của ảnh
            var title = "";
            var rmatch = content.match(/alt=["']([^>]+)["']/i);
            if (rmatch && rmatch[1]) {
                title = rmatch[1];
            }
            
            // 5. Lấy Poster (Ưu tiên data-src rồi mới đến src)
            // <a[^>]+href=["'](http[^"']+)["']
            var posterMatch = content.match(/src=['"](http[^"']+)["']/i);
            var poster = posterMatch ? posterMatch[1] : BASEIMG;
            
            if (poster && !poster.startsWith("http")) {
                poster = BASEURL + (poster.startsWith("/") ? "" : "/") + poster;
            }
            
            items.push({
                id: itemUrl,
                title: title,
                posterUrl: poster
            });
        }
        
        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
        
    } catch (e) {
        return JSON.stringify({
            items: [{ id: currentUrl, title: "Lỗi: 2 - " + e.message, posterUrl: BASEIMG }],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

// --- Cách chạy thực tế trên Console trình duyệt ---

/*
BASEURL = "https://sexdeplon.com";
BASEIMG = "https://sexdeplon.com";
var html = document.getElementsByTagName("html")[0].outerHTML;
JSON.parse(parseListResponse(html));
*/


function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "????";
    var cast = "????";
    var status = "????";
    var duration = "";
    var servers = [];
    var categories = "";
    
    try {
        var rmatch;
        // Lấy title name /property=["']og:title["']\s+content=["']([^"']+)["']/i
        rmatch = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) { lname = rmatch[1].trim(); }
        
        // Lấy ảnh /property=["']og:image["']\s+content=["']([^"']+)["']/i
        rmatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) { limg = rmatch[1].trim(); }
        
        // Lấy description /property=["']og:description["']\s+content=["']([^"']+)["']/i
        rmatch = html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) {var ldes = rmatch[1];}
        
        // Lấy thể loại /(<div[^>]+class=["']categories[\s\S]*?<\/div>)/i
        rmatch = html.match(/(<div[^>]+class=["']categories[\s\S]*?<\/div>)/i);
        if (rmatch && rmatch[1]) {categories = trimHTML(rmatch[1])}          
        // Bốc tách server
        var regex = /data-source=["']([^"']+)/g;
        var matches = [...html.matchAll(regex)];
        var episodes = [];

        matches.forEach((match, index) => {
          var link = match[1];
          var stt = index + 1; // Số thứ tự bắt đầu từ 1, 2, 3...
          episodes.push({
             id: link,
             name: "Server " + stt,
             slug: "tap-" + stt
          });
          //console.log("Đang duyệt link số: " + stt + " -> " + link);
        });
        
        servers = [{
            name: "Server",
            episodes: episodes
        }];
        
    } catch (e) {
        console.error("Lỗi parse dữ liệu: ", e);
    }
    
    return JSON.stringify({
        id: lurl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: lurl ? ldes + "\r\n\r\n" + lurl : ldes,
        servers: servers,
        quality: "HD",
        year: year,
        status: status,
        duration: duration,
        casts: cast,
        director: direc,
        category: categories
    });
}


//BASEURL = "https://motherless.xxx";
//var html = document.getElementsByTagName("html")[0].outerHTML;
//JSON.parse(parseMovieDetail(html));



function parseDetailResponse(html, url) {
    try {
        var customjs = textJS();
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
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
SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=sexdep&type=js"; 
const style = document.createElement('style');
var customcss = '';
style.innerHTML = customcss;
//document.head.appendChild(style);

// Build Video Begin

// "version": "1.6"

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

    // ─── QUÉT NGUỒN PHÁT VÀ PLAYLIST (GIỮ NGUYÊN CODE) ───
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

    // ─── HÀM GIỮ LẠI THẺ VIDEO GỐC ĐỂ CHỐNG ĐEN MÀN HÌNH ───
    // ─── ĐOẠN CODE ĐÃ ĐƯỢC CHỈNH SỬA ───
    function buildVideoWithOriginal(video, stream1, stream2, playlistData) {
        video.id = 'main-video';
        
        // Đã thay object-fit: contain thành cover (hoặc fill tùy bạn) và thêm outline:none
        video.style.cssText = 'width:100%;height:100%;object-fit:contain;cursor:pointer;background:#000;outline:none;border:none;box-shadow:none;';

        video.controls = false;
        
        var container = document.createElement('div');
        container.id = 'custom-video-player';
        
        // Thêm outline:none và box-shadow:none cho container để triệt tiêu hoàn toàn viền vàng
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;font-family:Segoe UI,Roboto,sans-serif;user-select:none;-webkit-user-select:none;outline:none;border:none;box-shadow:none;';

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
        var btnFullscreen = createBtn('⛶', 'Toàn màn hình');
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

        // CHÌA KHÓA: "Bốc" thẻ video cũ bỏ vào Container mới mà KHÔNG LÀM MẤT STREAM
        container.appendChild(video);
        container.appendChild(spinner);
        container.appendChild(bigPlayBtn);
        container.appendChild(seekOverlay);
        container.appendChild(controls);
        container.appendChild(playlistPanel);

        // Clear toàn bộ HTML cũ của trang web phim để xóa sạch khung quảng cáo rác
        var htmlTAG = document.getElementsByTagName("html")[0];
        htmlTAG.innerHTML = '';
        document.body = document.createElement('body');
        document.body.appendChild(container);
        document.head.innerHTML = '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
        document.head.appendChild(spinStyle);
        document.title = 'Dẹp hết quảng cáo rồi nha bạn.';

        var isPlaying = false;
        var isMuted = false;
        var currentSpeed = 1.0;
        var controlsTimeout = null;
        var isDraggingProgress = false;
        var isDraggingVideo = false;
        var lastSaveTime = 0;

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

        // Sửa lỗi hiển thị giây/phút bị NaN thời gian đầu load video
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

        function toggleFullscreen() {
            if (!document.fullscreenElement) container.requestFullscreen().catch(function() {});
            else document.exitFullscreen().catch(function() {});
        }

        function showControls() {
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(function() { if (!isDraggingProgress) controls.style.opacity = '0'; }, 3000);
        }

        video.addEventListener('loadeddata', function() {
            spinner.style.display = 'none';
            updateProgress();
            if (isMuted && video.muted) { video.muted = false; isMuted = false; btnMute.textContent = '🔊'; }
            restorePosition();
        });
        video.addEventListener('loadedmetadata', function() { restorePosition(); });
        video.addEventListener('waiting', function() { spinner.style.display = 'block'; });
        video.addEventListener('playing', function() { spinner.style.display = 'none'; bigPlayBtn.style.display = 'none'; });
        video.addEventListener('error', function() { spinner.style.display = 'none'; showToast('Lỗi phát hoặc quảng cáo đang chặn luồng. Nhấn 🔄 để tải lại.'); btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; });
        video.addEventListener('timeupdate', function() { updateProgress(); savePosition(); });
        video.addEventListener('ended', function() { btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; isPlaying = false; clearSavedPosition(); });
        
        video.addEventListener('click', function(e) {
			    e.stopPropagation();
			    if (isDraggingVideo) { isDraggingVideo = false; return; }
			    
			    // Tính toán trực tiếp dựa trên độ rộng hiển thị của viewport để click chính xác hơn
			    var width = window.innerWidth;
			    var x = e.clientX;
			    
			    if (x < width * 0.3) seekVideo(-10);
			    else if (x > width * 0.7) seekVideo(10);
			    else togglePlay();
			});


        video.addEventListener('volumechange', function() { btnMute.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊'; });
        btnPlay.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
        btnMute.addEventListener('click', function(e) { e.stopPropagation(); toggleMute(); });
        btnReload.addEventListener('click', function(e) { e.stopPropagation(); reloadVideo(); });
        btnFullscreen.addEventListener('click', function(e) { e.stopPropagation(); toggleFullscreen(); });
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
        container.addEventListener('mousemove', showControls);
        container.addEventListener('click', showControls);
        bigPlayBtn.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });

        // LẮP BỘ PHÍM TẮT ĐIỀU KHIỂN XỊN
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
                case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
                case 'r': case 'R': e.preventDefault(); reloadVideo(); break;
                case 'Home': e.preventDefault(); video.currentTime = 0; showToast('Về đầu video'); break;
                case 'End': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration - 1; break;
                case '>': case '.': e.preventDefault(); currentSpeed = Math.min(4, currentSpeed + 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '<': case ',': e.preventDefault(); currentSpeed = Math.max(0.25, currentSpeed - 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '0': e.preventDefault(); video.currentTime = 0; break;
                case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration * (parseInt(e.key) / 10); break;
            }
        });

        // BỘ CẢM ỨNG ĐIỀU HƯỚNG SẠCH QUẢNG CÁO VUỐT CHẠY
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

        // BẮT ĐẦU PHÁT TRÊN THẺ GỐC (GIỮ NGUYÊN TRẠNG THÁI LUỒNG BLOB)
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

        // PHƠI BÀY API LÀM VIỆC (GIỮ NGUYÊN)
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
	// SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
	// Thay thế đoạn checkAndClick cũ ở cuối script bằng logic này:
	// Thay thế đoạn initVideoFlow cũ ở cuối script bằng logic tối ưu này:
	(function initVideoFlow() {
		// Bước 1: Kiểm tra nhanh lần đầu tiên xem có video luôn không
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
			
			// Truy vấn cả 2 phần tử ở mỗi chu kỳ quét
			const videoElement = document.querySelector('video');
			const skipButton = document.getElementById("resumeBtn");
			
			// ĐIỀU KIỆN 1: Nếu tự nhiên tìm thấy thẻ video xuất hiện
			if (videoElement) {
				clearInterval(
					checkInterval); // Xóa lặp ngay lập tức để tránh lỗi click ngầm về sau
				console.log(
					"✓ Tìm thấy thẻ video xuất hiện trong vòng lặp! Khởi chạy ngay."
				);
				runVideo();
				return;
			}
			
			// ĐIỀU KIỆN 2: Nếu tìm thấy nút resumeBtn trước
			if (skipButton) {
				// Kiểm tra ẩn/hiển thị bằng CSS thực tế
				const style = window.getComputedStyle(skipButton);
				if (style.display !== 'none' && style.visibility !== 'hidden') {
					
					clearInterval(
						checkInterval); // Xóa lặp ngay lập tức để an toàn cho DOM mới
					console.log(
						"🎯 Đã tìm thấy nút resumeBtn hiển thị! Click và đợi 2s...");
					
					skipButton.click(); // Click vào nút
					
					setTimeout(function() {
						runVideo(); // Chạy runVideo sau khi click 2 giây
					}, 2000);
					return;
				}
			}
			
			// ĐIỀU KIỆN 3: Đã quét hết 20 giây mà cả video lẫn nút đều "bặt vô âm tín"
			if (secondsPassed >= maxSeconds) {
				clearInterval(checkInterval); // Dừng vòng lặp hẳn
				console.log("⏱ Đã hết 20 giây quét mà không tìm thấy gì.");
				
				// Hiển thị Toast thông báo yêu cầu người dùng tương tác trong 20s
				showToast(
					"⚠️ Vui lòng nhấn vào màn hình hoặc nút Xem Tiếp để tiếp tục phát phim!",
					20000,
					true,
					false
				);
				
				// Ép chạy hàm runVideo() luôn sau đó để dựng giao diện player custom lên
				runVideo();
			}
		}, 1000); // Quét lại sau mỗi 1 giây (1000ms)
	})();
}
setTimeout(checkResume, 5000);

// Build Video End

function injectScriptAfterLoad(scriptUrl) {
    function doFetchAndInject() {
        console.log('⏳ Đang tiến hành fetch code từ:', scriptUrl);
        
        fetch(SCRIPTURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Mã phản hồi từ Server không tốt: ' + response.status);
                }
                return response.text(); // Lấy toàn bộ mã nguồn dưới dạng chuỗi chữ
            })
            .then(codeText => {
                // 1. Tạo một thẻ script trống mới hoàn toàn bằng JS
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                
                // 2. Đổ thẳng nội dung code dạng chữ vào trong thẻ script vừa tạo
                scriptElement.textContent = codeText;
                
                // 3. Nhúng (Inject) thẻ script này vào vị trí cuối cùng của thẻ body
                document.body.appendChild(scriptElement);
               // showToast('🎯 Đã fetch và nhúng thành công script vào sau body,!',5000);
            })
            .catch(error => {
                console.error('❌ Lỗi không thể fetch hoặc nhúng script:', error);
            });
    }
    
    // Kiểm tra trạng thái tải của trang web
    if (document.readyState !== 'loading') {
        // Nếu trang web đã tải xong cấu trúc DOM cơ bản, thực hiện ngay lập tức
        doFetchAndInject();
    } else {
        // Nếu trang web vẫn đang load thô, đợi sự kiện DOMContentLoaded kích hoạt rồi chạy
        document.addEventListener('DOMContentLoaded', doFetchAndInject);
    }
}

function initCustomVideoFix() {
    // SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
    if (SCRIPTURL && SCRIPTURL !== "undefined") {
        injectScriptAfterLoad(SCRIPTURL);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
    initCustomVideoFix();
}

`;
}
function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `
the-loai/vietsub@@Vietsub
the-loai/khong-che@@Không Che
the-loai/viet-nam@@Việt Nam
the-loai/trung-quoc@@Trung Quốc
the-loai/au-my@@Âu - Mỹ
the-loai/gai-xinh@@Gái Xinh
the-loai/hiep-dam@@Hiếp Dâm
the-loai/jav-hd@@JAV HD
the-loai/hoc-sinh@@Học Sinh
the-loai/vu-to@@Vú To
`
}


// Hàm tách menu bằng list - ĐÃ TỐI ƯU: Không dùng Regex lặp để tránh treo app
function buildMenu(listurl) {
    let menulist = [];
    if (!listurl) return menulist;
    
    let lines = listurl.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        
        let parts = line.split('@@');
        let link = parts[0] ? parts[0].trim() : "";
        let name = parts[1] ? parts[1].trim() : "";
        let check = parts[2] ? parts[2].trim() : undefined;

        if (!link || !name) continue;

        let item = {};
        if (check === "false") {
            item = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (check === "true") {
            item = { "slug": link, "title": name, "type": "Grid" };
        } else {
            item = { "slug": link, "name": name };
        }
        menulist.push(item);
    }
    return menulist;
}
function trimHTML(inhtml) {
    var result = inhtml.replace(/<[^>]*>/g, '');
    result = result.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n|\r/gi, ' - ')
        .replace(/\s+/gi, ' ')
        .replace(/^,+|,+$/g, "");
    return result;
}


