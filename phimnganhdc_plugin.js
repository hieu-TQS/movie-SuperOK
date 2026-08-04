BASEURL = "https://phimnganhdc.com";
// https://www.xxxfiles.com/favicon-32x32.png
function getManifest() {
    return JSON.stringify({
        "id": "phimnganhdc",
        "name": "Phim Ngắn HDC",
        "description": "Phim ngắn trung quốc.",
        "version": "1.2",
        "BASEURL": "https://phimnganhdc.com",
        "iconUrl": "https://phimnganhdc.com/storage/files/logo-phimnganhdc.png",
        "isEnabled": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}


// https://phimnganhdc.com/danh-sach/phim-hoan-thanh
// https://phimnganhdc.com/danh-sach/top-phim-ngay
// https://phimnganhdc.com/the-loai/phim-ngan
function getHomeSections() {
    var listurl = `
/danh-sach/phim-hoan-thanh@@Phim Đã Full@@false
/danh-sach/top-phim-ngay@@Top Trong Ngày@@false
/the-loai/phim-ngan@@Phim Mới@@true
`;
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
    try {
        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if (slug && slug.indexOf("http") > -1 || slug.indexOf("search") > -1) {
            // thường là link search sẽ bị trả về ở đây
            return slug;
        }
        let page = 1;
        let path = slug || "";
        
        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            // Nếu có số trang hoặc  có menu categ
            // Sửa lỗi nếu JSON thiếu dấu ngoặc kép ở key hoặc sai cú pháp cơ bản
            let fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            // Sửa lỗi nếu truyền kiểu {"page",24} thành {"page":24}
            
            try {
                let filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                
                // Nếu có category trong JSON, ưu tiên lấy category làm đường dẫn (path)
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {
                //console.log("JSON parse lỗi, dùng giá trị mặc định");
            }
        }
        
        
        // 4. Chuẩn hóa path (Xóa dấu gạch chéo thừa ở đầu/cuối để tránh nhân đôi dấu //)        
        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        // https://www.tranny.one/recent/?mix=true&pageId=2&_=1783573720196
        if (page > 1) {
            resultUrl += "?page=" + page;
        }
        
        // Trả về kết quả, chỉ gộp dấu // ở phần path, giữ nguyên https://
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
        
    } catch (e) {
        // console.log("Lỗi hệ thống: " + e.message);
        // Trả về URL gốc an toàn nếu có lỗi
        let fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}
// https://phimnganhdc.com/the-loai/phim-ngan?page=5
// https://phimnganhdc.com/the-loai/phim-ngan?page=5
// https://phimnganhdc.com/?search=m%E1%BB%B9+nh%C3%A2n
//var BASEURL = "https://phimnganhdc.com";
// JSON lỗi cú pháp (thiếu nháy kép) của bạn
//var filtersJsonNoCat = '{page:11,category:[{"slug":"/the-loai/phim-ngan","name":"Thiếu niên"}]}'; 
//var filtersJsonNoCat = '{page:22}';
//console.log(getUrlList("", filtersJsonNoCat));


function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/?search=" + encodeURIComponent(keyword);
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

//BASEURL = "https://motherless.xxx";
//var html = document.getElementsByTagName("html")[0].outerHTML;
//JSON.parse(parseListResponse(html));

function parseListResponse(html, $url) {
    try {``
        var items = [];
        
        _$(html).find(".item").each(function() {
            var href = this.find("a").attr("href");
            var title = this.find(".img-film").attr("title");
            var src = this.find(".img-film").attr("src");
            if(src.indexOf("http") == -1){
                src = BASEURL + src;
            }
            
            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');
                
                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb
                });
            }
        });
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 999 }
        });
        
    } catch (e) {
        return JSON.stringify({
            "items": [{ "id": $url, "title": "Lỗi: " + e, "posterUrl": "", "backdropUrl": "" }],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}
///*
//html = outerHTML;
//JSON.parse(parseListResponse(html));
// Bỏ dấu / ở đầu chuỗi
//*/


function parseSearchResponse(html) {
    return parseListResponse(html);
}



function parseMovieDetail(html,url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "????";
    var cast = "????";
    var status = "????";
    var duration = "1:09:00 | 16 | 16";
    var rating = "????";
	var servers = [{}];
    var $info = "";
	var category = "";
	var country = "";
	var lang = "";
	var streamUrl = "";
    try{
        info = _$(html).find(".dinfo").html();
        limg = _$(html).find(".adspruce-streamlink").find("img").attr("src");
        if(limg.indexOf("http") == -1){
            limg = BASEURL + limg;
        }
        streamUrl = _$(html).find(".adspruce-streamlink").attr("href");
        lname = _$(html).find(".title").text();
        ldes = _$(html).find("#info-film").text().replace(/\s\s/g,"");
        //var poster = _$(html).find(".poster").html();
        //var lastserver = _$(html).find(".latest-episode").html();
        //ldes += "\r\n\r\n\r\n" + poster + "\r\n\r\n\r\n" + lastserver;
        status = _$(info).find("dt:content('Tình trạng')").next().text();
        year = _$(info).find("dt:content('Năm sản xuất')").next().text();
        cast = _$(info).find("dt:content('Diễn viên:')").next().text();
        duration = _$(info).find("dt:content('Thời lượng:')").next().text();
        category = _$(info).find("dt:content('Thể loại:')").next().text();
        country = _$(info).find("dt:content('Quốc gia:')").next().text();
        lang = _$(info).find("dt:content('Ngôn ngữ:')").next().text();	

        var servers = [];
        var $listserver = _$(html).find(".latest-episode").html();
        _$($listserver).find(".control-box").each(function(index, el) {
            var epi = [];
            var tap = 0;
            var nameserver = _$(el).find(".server-episode-block").text(); 
            this.find(".list-episode").find("a").each(function(index, Bl) {
                tap += 1;
                var ahref = this.attr("href"); 
                var name = this.text();
                epi.push({ id: ahref, name: name, slug: "tap-" + tap});
            });
            servers.push({
               name: nameserver || "Server",
               episodes: epi
            });
        });
        servers = sortEpisodesByName(servers);
        return JSON.stringify({
            id: url,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: year,
            status: status,
            duration: duration,
            casts: cast,
            director: direc,
            country: country,
            category: category,
            lang:lang
        });
  
  }
  catch (e) {
        return JSON.stringify({
        id: lurl,
        title: "Lỗi rồi bạn ơi. Tên miền đã bị đổi",
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: servers,
        quality: "HD",
        year: year,
        status: status,
        duration: duration,
        casts: cast,
        director: direc
      });
    }
}


//BASEURL = "https://phimnganhdc.com";
//var html = outerHTML;
//var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseMovieDetail(outerHTML,$url));

// https://phimnganhdc.com/dem-kinh-thanh-nho-em-xuyen-thanh-ban-gai-cu-doc-ac-cua-cau-chu-pha-san-35032
// https://phimnganhdc.com/dem-kinh-thanh-nho-em-xuyen-thanh-ban-gai-cu-doc-ac-cua-cau-chu-pha-san/tap-1-811897
function parseDetailResponse(html, url) {
    try {
        var stream = "";
        var server = [];
        _$(html).find(".tip-change-server").find(".streaming-server").each(function() {
            // Lúc này 'this' chính là thực thể của từng thẻ <a> riêng biệt
            var ahref = this.attr("data-link");
            var name = this.text();
            if (name === "HDC") {
                stream = ahref
            }
            var $item = { link: ahref, name: name };
            server.push($item);
        });
        if (stream == "") {
            stream = server[0].link;
        }
        var customjs = textJS(server);
        return JSON.stringify({
            "url": stream,
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

//BASEURL = "https://phimnganhdc.com";
//var html = outerHTML;
//var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseDetailResponse(html, url))

function sortEpisodesByName(data) {
    data.forEach(server => {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort((a, b) => {
                // Sử dụng Regex để tìm số đứng ngay sau chữ "Tập" (Không phân biệt hoa thường)
                const matchA = a.name.match(/Tập\s*(\d+)/i);
                const matchB = b.name.match(/Tập\s*(\d+)/i);
                
                // Nếu tìm thấy số thì chuyển thành kiểu Int, nếu không thấy thì mặc định là 0
                const numA = matchA ? parseInt(matchA[1], 10) : 0;
                const numB = matchB ? parseInt(matchB[1], 10) : 0;
                
                // Sắp xếp tăng dần: Số nhỏ xếp trước (lên trên), số lớn xếp sau (xuống dưới)
                return numA - numB;
            });
        }
    });
    return data;
}

function textJS($links) {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
LINKVIDEO = ${JSON.stringify($links)}

SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=phimnganhdc&type=js"; 
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black;display:none!important}';
style.innerHTML = customcss;
//document.head.appendChild(style);

/* Build Video Begin*/


(function() {
    // 1. Dữ liệu bộ các server phim
    const serverData = LINKVIDEO;
    
    let isRotated = false;
    
    // Tạo thẻ wrapper chính để bọc nội dung phục vụ việc xoay màn hình
    const wrapper = document.createElement('div');
    wrapper.className = 'page-main-wrapper';
    
    // Di chuyển toàn bộ cấu trúc cũ của trang web vào trong wrapper
    while (document.body.firstChild) {
        wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);
    
    // ================= DOM PROXY PATCHES (VÁ LỖI HỆ THỐNG) =================
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    const originalInsertBefore = document.body.insertBefore;
    
    document.body.appendChild = function(child) {
        // Chỉ để Loading và Style ở ngoài body gốc
        if (child === loadingEl || child.tagName === 'STYLE') {
            return originalAppendChild.call(this, child);
        }
        return wrapper.appendChild(child);
    };
    
    document.body.removeChild = function(child) {
        if (wrapper.contains(child)) {
            return wrapper.removeChild(child);
        }
        if (child.parentNode === this) {
            return originalRemoveChild.call(this, child);
        }
        if (child.parentNode) {
            return child.parentNode.removeChild(child);
        }
        return child;
    };
    
    document.body.insertBefore = function(newChild, refChild) {
        if (refChild && wrapper.contains(refChild)) {
            return wrapper.insertBefore(newChild, refChild);
        }
        if (!refChild || refChild.parentNode === this) {
            return originalInsertBefore.call(this, newChild, refChild);
        }
        if (refChild && refChild.parentNode) {
            return refChild.parentNode.insertBefore(newChild, refChild);
        }
        return originalInsertBefore.call(this, newChild, refChild);
    };
    // =============================================================================
    
    // 2. Tiêm cấu trúc CSS động vào thẻ Head
    const style = document.createElement('style');
    style.textContent = 'html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden;}.page-main-wrapper {width: 100%;height: 100%;position: relative;}/* Xoay wrapper -90deg để khớp hướng màn hình ngang */.page-main-wrapper.force-rotate {position: fixed !important;top: 50% !important;left: 50% !important;width: 100vh !important;  height: 100vw !important; transform: translate(-50%, -50%) rotate(-90deg) !important;transform-origin: center !important;z-index: 9996 !important;background: #000 !important;overflow: hidden !important;}/* Giao diện nút bấm (Bây giờ nằm TRONG wrapper nên sẽ tự động xoay theo video) */.server-container { position: fixed; top: 15px; right: 15px; z-index: 10000; font-family: Arial, sans-serif; display: flex; flex-direction: row!important; gap: 8px; align-items: center;font-size:12px}.server-btn-wrapper { position: relative;}.server-main-btn, .server-rotate-btn {background: rgba(0, 0, 0, 0.6); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); padding: 4px 4px!important; border-radius: 4px; cursor: pointer; backdrop-filter: blur(5px); font-weight: bold; min-width: 60px!important; text-align: center; box-sizing: border-box;}.server-main-btn:hover, .server-rotate-btn:hover { background: rgba(0, 0, 0, 0.8); border-color: rgba(255, 255, 255, 0.6);}.server-dropdown { display: none; position: absolute; top: 100%; right: 0; margin-top: 6px; background: rgba(20, 20, 20, 0.95); border: 1px solid #444; border-radius: 4px; min-width: 160px; overflow: hidden;}.server-dropdown.show { display: block;}.server-item { padding: 12px 15px; color: #ccc; cursor: pointer; transition: all 0.2s; text-align: left; font-size: 14px; border-left: 4px solid transparent;}.server-item:hover { background: #333; color: #fff;}.server-item.active { color: #fff; background: rgba(0, 255, 0, 0.15); border-left: 4px solid #00ff00; font-weight: bold;}.overlay-black { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background: #000 !important; z-index: 9990 !important; display: none;}.iframe-wrapper { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; z-index: 9991 !important; border: none !important; display: none; background: #000 !important;}/* Hiệu ứng Loading giữ nguyên thẳng màn hình */.server-loading-box { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; display: none; text-align: center; color: #fff; pointer-events: none; font-family: Arial, sans-serif;}.server-spinner { width: 45px; height: 45px; border: 4px solid rgba(255, 255, 255, 0.1); border-top: 4px solid #00ff00; border-radius: 50%; margin: 0 auto 12px auto; animation: server-spin 0.8s linear infinite;}@keyframes server-spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}';
    document.head.appendChild(style);
    
    // 3. Khởi tạo Loading ở body gốc
    const loadingEl = document.createElement('div');
    loadingEl.className = 'server-loading-box';
    loadingEl.innerHTML = '<div class="server-spinner"></div><div>Đang tải server...</div>';
    originalAppendChild.call(document.body, loadingEl);
    
    // Khởi tạo các thành phần giao diện điều khiển nằm TRONG wrapper để xoay đồng bộ
    const container = document.createElement('div');
    container.className = 'server-container';
    
    const overlay = document.createElement('div');
    overlay.className = 'overlay-black';
    wrapper.appendChild(overlay);
    
    const iframeCache = {};
    
    function pauseAllVideos() {
        wrapper.querySelectorAll('video').forEach(v => v.pause());
    }
    
    function toggleRotation() {
        isRotated = !isRotated;
        btnRotate.innerText = isRotated ? 'Xoay' : 'Xoay';
        wrapper.classList.toggle('force-rotate', isRotated);
    }
    
    function switchServer(targetLink) {
        const isCurrentPage = window.location.href.includes(targetLink) || targetLink.includes(window.location.href);
        
        if (isCurrentPage) {
            overlay.style.display = 'none';
            loadingEl.style.display = 'none';
            wrapper.querySelectorAll('.iframe-wrapper').forEach(el => el.style.display = 'none');
            updateButtons(targetLink);
            return;
        }
        
        pauseAllVideos();
        overlay.style.display = 'block';
        wrapper.querySelectorAll('.iframe-wrapper').forEach(el => el.style.display = 'none');
        
        if (!iframeCache[targetLink]) {
            loadingEl.style.display = 'block';
            
            const iframe = document.createElement('iframe');
            iframe.className = 'iframe-wrapper';
            iframe.src = targetLink;
            iframe.allowFullscreen = true;
            iframe.allow = "autoplay; encrypted-media";
            
            iframe.onload = function() {
                loadingEl.style.display = 'none';
            };
            
            wrapper.appendChild(iframe);
            iframeCache[targetLink] = iframe;
        } else {
            loadingEl.style.display = 'none';
        }
        
        iframeCache[targetLink].style.display = 'block';
        updateButtons(targetLink);
    }
    
    function updateButtons(activeLink) {
        document.querySelectorAll('.server-item').forEach(el => {
            const link = el.getAttribute('data-link');
            el.classList.toggle('active', link === activeLink);
        });
    }
    
    // 4. Dựng nút bấm điều khiển
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'server-btn-wrapper';
    
    const btnMain = document.createElement('button');
    btnMain.className = 'server-main-btn';
    btnMain.innerText = 'Server';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'server-dropdown';
    
    serverData.forEach(s => {
        const item = document.createElement('div');
        item.className = 'server-item';
        item.innerText = s.name;
        item.setAttribute('data-link', s.link);
        item.onclick = () => {
            switchServer(s.link);
            dropdown.classList.remove('show');
        };
        dropdown.appendChild(item);
    });
    
    btnMain.onclick = (e) => { e.stopPropagation();
        dropdown.classList.toggle('show'); };
    document.addEventListener('click', () => dropdown.classList.remove('show'));
    
    btnWrapper.appendChild(btnMain);
    btnWrapper.appendChild(dropdown);
    
    const btnRotate = document.createElement('button');
    btnRotate.className = 'server-rotate-btn';
    btnRotate.innerText = 'Xoay';
    btnRotate.onclick = (e) => {
        e.stopPropagation();
        toggleRotation();
    };
    
    container.appendChild(btnWrapper);
    container.appendChild(btnRotate);
    
    // ĐƯA VÀO ĐÂY: Thêm nút vào wrapper thay vì body để nút xoay theo video
    wrapper.appendChild(container);
    
    const currentUrl = window.location.href;
    const initialMatch = serverData.find(s => currentUrl.includes(s.link) || s.link.includes(currentUrl));
    if (initialMatch) {
        updateButtons(initialMatch.link);
    }
})();

    var DEVELOPE = false;
// ─── HÀM TOAST ĐƯỢC ĐƯA RA NGOÀI (Có thể gọi ở mọi nơi) ───
function showToast(message, duration, check) {
        if (typeof duration === 'undefined') duration = 7000;
        if (typeof check === 'undefined') check = true;
        if (check === false) return;
        var container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.style.cssText =
                'position:fixed;bottom:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        var toastEl = document.createElement('div');
        toastEl.innerHTML = message;
        toastEl.style.cssText =
            'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;font-size:14px;min-width:200px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
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
    }

/* Build Video End */

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
/the-loai/phim-bo@@Phim Bộ
/quoc-gia/han-quoc@@Hàn quốc
/quoc-gia/trung-quoc@@Trung Quốc
/quoc-gia/thai-lan@@Thái Lan
/the-loai/huyen-huyen@@Huyền Huyễn
/the-loai/tien-hiep@@Tiên Hiệp
/the-loai/xuyen-khong@@Xuyên Không
/the-loai/chuyen-the@@Chuyển Thể
/the-loai/boy-love@@Boylove
/the-loai/pha-an@@Phá Án
/the-loai/boy-love@@Boyloves
/the-loai/dan-quoc@@Dân Quốc
/the-loai/y-khoa@@Y Khoa
/the-loai/ngon-tinh@@Ngôn Tình
/the-loai/nguoc-luyen@@Ngược Luyến
/the-loai/nghe-nghiep@@Nghề Nghiệp
/the-loai/do-thi@@Đô Thị
/the-loai/hien-dai@@Hiện Đại
/the-loai/toi-pham@@Tội Phạm
/the-loai/lang-man@@Lãng Mạn
/the-loai/phim-hai@@Phim Hài
/the-loai/khoa-hoc-vien-tuong@@Khoa Học Viễn Tưởng
/the-loai/gia-tuong@@Giả Tưởng
/the-loai/gay-can@@Gây Cấn
/the-loai/lich-su@@Lịch Sử
/the-loai/xuyen-sach@@Xuyên Sách
/the-loai/he-thong@@Hệ Thống
/the-loai/bao-thu@@Báo Thù
/the-loai/ky-ao@@Kỳ Ảo
/the-loai/ngot-sung@@Ngọt Sủng
/the-loai/va-mat-tra-nam@@Vả Mặt Tra Nam
/the-loai/trong-sinh@@Trọng Sinh
/the-loai/co-con@@Có con
/the-loai/cuoi-truoc-yeu-sau@@Cưới Trước Yêu Sau
/the-loai/truy-the@@Truy Thê
/the-loai/hanh-dong@@Hành động
/the-loai/hai-huoc@@Hài hước
/the-loai/hoc-duong@@Học đường
/the-loai/co-trang@@Cổ trang
/the-loai/kinh-di@@Kinh dị
/the-loai/tinh-cam@@Tình cảm
/the-loai/vo-thuat@@Võ thuật
/the-loai/phieu-luu@@Phiêu lưu
/the-loai/vien-tuong@@Viễn tưởng
/the-loai/chinh-kich@@Chính kịch
/the-loai/the-thao@@Thể thao
/the-loai/am-nhac@@Âm nhạc
/the-loai/khoa-hoc@@Khoa học
/the-loai/tam-ly@@Tâm lý
/the-loai/hinh-su@@Hình sự
/the-loai/bi-an@@Bí ẩn
/the-loai/gia-dinh@@Gia đình
/the-loai/hoat-hinh@@Hoạt hình
/the-loai/tv-shows@@TV Shows
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
function _$(htmlOrBlock) {
    // 🔥 SỬA LỖI CHÍ MẠNG: Nếu vô tình bọc _$(this), trả về chính nó luôn chứ không bọc đè Object
    if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {
        return htmlOrBlock;
    }

    var instance = {
        sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',
        elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),

        find: function(selector) {
            var results = [];
            var contentFilter = "";
            if (selector.indexOf(":content(") !== -1) {
                var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);
                if (contentMatch) {
                    contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";
                    selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, "");
                }
            }

            var attrNameFilter = "";
            var attrValueFilter = "";
            var hasAttrFilter = false;
            var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);
            if (attrMatch) {
                hasAttrFilter = true;
                attrNameFilter = attrMatch[1];
                attrValueFilter = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
                selector = selector.replace(/\[.*?\]/, "");
            }

            var notSelector = "";
            if (selector.indexOf(":not(") !== -1) {
                var notMatch = selector.match(/:not\(([^)]+)\)/);
                if (notMatch) {
                    notSelector = notMatch[1];
                    selector = selector.replace(/:not\([^)]+\)/, "");
                }
            }

            var isFirstFilter = selector.indexOf(":first") !== -1;
            var isLastFilter = selector.indexOf(":last") !== -1;
            selector = selector.replace(/:first|:last/g, "");

            var isClass = selector.indexOf('.') === 0;
            var isId = selector.indexOf('#') === 0;
            var isAttrOnly = (selector === "" && hasAttrFilter);

            var targetClasses = [];
            var targetId = "";
            var targetTagName = "";

            if (isClass) {
                targetClasses = selector.split('.').filter(function(c) { return c.length > 0; });
            } else if (isId) {
                targetId = selector.substring(1);
            } else if (!isAttrOnly) {
                targetTagName = selector.toLowerCase();
            }

            for (var i = 0; i < this.elements.length; i++) {
                var currentHtml = this.elements[i];
                var pos = 0;
                var subResults = [];

                while ((pos = currentHtml.indexOf('<', pos)) !== -1) {
                    if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {
                        pos++;
                        continue;
                    }

                    var endOpenTag = currentHtml.indexOf('>', pos);
                    if (endOpenTag === -1) break;

                    var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
                    var spacePos = fullOpenTag.indexOf(' ');
                    var currentTagName = "";
                    if (spacePos === -1) {
                        currentTagName = fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase();
                    } else {
                        currentTagName = fullOpenTag.substring(1, spacePos).toLowerCase();
                    }

                    var isMatched = false;

                    if (isClass) {
                        var classMatchStr = "";
                        var classPos = fullOpenTag.indexOf('class="');
                        if (classPos !== -1) {
                            var startQuote = classPos + 7;
                            classMatchStr = fullOpenTag.substring(startQuote, fullOpenTag.indexOf('"', startQuote));
                        } else {
                            classPos = fullOpenTag.indexOf("class='");
                            if (classPos !== -1) {
                                var startQuote = classPos + 7;
                                classMatchStr = fullOpenTag.substring(startQuote, fullOpenTag.indexOf("'", startQuote));
                            }
                        }
                        if (classMatchStr) {
                            var currentClasses = classMatchStr.split(/\s+/);
                            var matchCount = 0;
                            for (var c = 0; c < targetClasses.length; c++) {
                                if (currentClasses.indexOf(targetClasses[c]) !== -1) matchCount++;
                            }
                            if (matchCount === targetClasses.length) isMatched = true;
                        }
                    } else if (isId) {
                        var idMatchStr = "";
                        var idPos = fullOpenTag.indexOf('id="');
                        if (idPos !== -1) {
                            var startQuote = idPos + 4;
                            idMatchStr = fullOpenTag.substring(startQuote, fullOpenTag.indexOf('"', startQuote));
                        } else {
                            idPos = fullOpenTag.indexOf("id='");
                            if (idPos !== -1) {
                                var startQuote = idPos + 4;
                                idMatchStr = fullOpenTag.substring(startQuote, fullOpenTag.indexOf("'", startQuote));
                            }
                        }
                        if (idMatchStr === targetId) isMatched = true;
                    } else if (isAttrOnly) {
                        isMatched = true;
                    } else {
                        if (currentTagName === targetTagName) isMatched = true;
                    }

                    if (isMatched && hasAttrFilter) {
                        var searchStr1 = attrNameFilter + '="' + attrValueFilter + '"';
                        var searchStr2 = attrNameFilter + "='" + attrValueFilter + "'";
                        if (fullOpenTag.indexOf(searchStr1) === -1 && fullOpenTag.indexOf(searchStr2) === -1) {
                            isMatched = false;
                        }
                    }

                    if (isMatched) {
                        var startTagPos = pos;
                        var endTagPos = endOpenTag + 1;
                        var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];

                        if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                            var depth = 1;
                            var scanPos = endOpenTag + 1;
                            var openStr = '<' + currentTagName;
                            var closeStr = '</' + currentTagName + '>';

                            while (depth > 0 && scanPos < currentHtml.length) {
                                var nextOpen = currentHtml.indexOf(openStr, scanPos);
                                var nextClose = currentHtml.indexOf(closeStr, scanPos);
                                if (nextClose === -1) { scanPos = currentHtml.length; break; }

                                if (nextOpen !== -1 && nextOpen < nextClose) {
                                    depth++;
                                    scanPos = nextOpen + openStr.length;
                                } else {
                                    depth--;
                                    scanPos = nextClose + closeStr.length;
                                    if (depth === 0) endTagPos = nextClose + closeStr.length;
                                }
                            }
                        }

                        var foundBlock = currentHtml.substring(startTagPos, endTagPos);

                        if (contentFilter) {
                            var pureText = foundBlock.replace(/<[^>]+>/g, "").trim();
                            if (pureText.indexOf(contentFilter) === -1) {
                                pos = endTagPos;
                                continue;
                            }
                        }

                        if (notSelector) {
                            var isNotClass = notSelector.indexOf('.') === 0;
                            var isNotId = notSelector.indexOf('#') === 0;
                            var notValue = notSelector.substring(1);

                            var hasNot = false;
                            if (isNotClass && fullOpenTag.indexOf('class="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;
                            if (isNotId && fullOpenTag.indexOf('id="') !== -1 && fullOpenTag.indexOf(notValue) !== -1) hasNot = true;

                            if (!hasNot) subResults.push(foundBlock);
                        } else {
                            subResults.push(foundBlock);
                        }

                        pos = endTagPos;
                    } else {
                        pos++;
                    }
                }

                if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];
                if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];

                results = results.concat(subResults);
            }

            var newInstance = _$(results);
            newInstance.sourceHtml = this.sourceHtml || currentHtml;
            return newInstance;
        },

        // 🎯 CHUẨN HÓA HÀM EACH: Hỗ trợ cả 2 cách viết (gọi thẳng `this` hoặc bọc `_$(el)`)
        each: function(callback) {
            for (var i = 0; i < this.elements.length; i++) {
                var childInstance = _$(this.elements[i]);
                childInstance.sourceHtml = this.sourceHtml;
                
                // Chuẩn jQuery: truyền vào (index, rawHtmlString)
                // Context 'this' vẫn giữ nguyên là childInstance để gọi trực tiếp phương thức
                callback.call(childInstance, i, this.elements[i]);
            }
            return this;
        },

        eq: function(index) {
            if (index < 0) index = this.elements.length + index;
            var matchedElement = this.elements[index];
            this.elements = matchedElement ? [matchedElement] : [];
            return this;
        },

        attr: function(attrName) {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var searchStr = attrName + '="';
            var pos = elem.indexOf(searchStr);
            if (pos === -1) {
                searchStr = attrName + "='";
                pos = elem.indexOf(searchStr);
            }
            if (pos === -1) return "";

            var start = pos + searchStr.length;
            var quoteType = elem.charAt(start - 1);
            var end = elem.indexOf(quoteType, start);
            return end === -1 ? "" : elem.substring(start, end);
        },

        html: function() {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) return elem.substring(start, end);
            return "";
        },

        text: function() {
            if (this.elements.length === 0) return "";
            var elem = this.elements[0];
            var start = elem.indexOf('>') + 1;
            var end = elem.lastIndexOf('</');
            if (start > 0 && end > start) {
                var content = elem.substring(start, end);
                return content.replace(/<\/?[^>]+(>|$)/g, "").trim();
            }
            return "";
        },

        next: function() {
            var results = [];
            if (!this.sourceHtml) return this;
            for (var i = 0; i < this.elements.length; i++) {
                var elem = this.elements[i];
                var idx = this.sourceHtml.indexOf(elem);
                if (idx === -1) continue;

                var scanPos = idx + elem.length;
                var nextOpen = this.sourceHtml.indexOf('<', scanPos);
                if (nextOpen !== -1) {
                    if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue;

                    var endOpenTag = this.sourceHtml.indexOf('>', nextOpen);
                    if (endOpenTag === -1) continue;

                    var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1);
                    var spacePos = fullOpenTag.indexOf(' ');
                    var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase();

                    var startTagPos = nextOpen;
                    var endTagPos = endOpenTag + 1;
                    var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];

                    if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                        var depth = 1;
                        var sPos = endOpenTag + 1;
                        var openStr = '<' + currentTagName;
                        var closeStr = '</' + currentTagName + '>';

                        while (depth > 0 && sPos < this.sourceHtml.length) {
                            var nOpen = this.sourceHtml.indexOf(openStr, sPos);
                            var nClose = this.sourceHtml.indexOf(closeStr, sPos);
                            if (nClose === -1) break;

                            if (nOpen !== -1 && nOpen < nClose) {
                                depth++;
                                sPos = nOpen + openStr.length;
                            } else {
                                depth--;
                                sPos = nClose + closeStr.length;
                                if (depth === 0) endTagPos = nClose + closeStr.length;
                            }
                        }
                    }
                    results.push(this.sourceHtml.substring(startTagPos, endTagPos));
                }
            }
            var nextInstance = _$(results);
            nextInstance.sourceHtml = this.sourceHtml;
            this.elements = results;
            return this;
        },

        parent: function() {
            var results = [];
            if (!this.sourceHtml) return this;
            for (var i = 0; i < this.elements.length; i++) {
                var elem = this.elements[i];
                var idx = this.sourceHtml.indexOf(elem);
                if (idx <= 0) continue;

                var scanPos = idx - 1;
                while (scanPos >= 0) {
                    var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos);
                    if (openTagPos === -1) break;

                    if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') {
                        var endOpenTag = this.sourceHtml.indexOf('>', openTagPos);
                        if (endOpenTag !== -1 && endOpenTag > openTagPos) {
                            var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1);
                            var spacePos = fullOpenTag.indexOf(' ');
                            var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase();

                            var endTagPos = endOpenTag + 1;
                            var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta'];

                            if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) {
                                var depth = 1;
                                var sPos = endOpenTag + 1;
                                var openStr = '<' + currentTagName;
                                var closeStr = '</' + currentTagName + '>';

                                while (depth > 0 && sPos < this.sourceHtml.length) {
                                    var nOpen = this.sourceHtml.indexOf(openStr, sPos);
                                    var nClose = this.sourceHtml.indexOf(closeStr, sPos);
                                    if (nClose === -1) break;

                                    if (nOpen !== -1 && nOpen < nClose) {
                                        depth++;
                                        sPos = nOpen + openStr.length;
                                    } else {
                                        depth--;
                                        sPos = nClose + closeStr.length;
                                        if (depth === 0) endTagPos = nClose + closeStr.length;
                                    }
                                }
                            }

                            if (endTagPos >= idx + elem.length) {
                                var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos);
                                if (results.indexOf(parentBlock) === -1) results.push(parentBlock);
                                break;
                            }
                        }
                    }
                    scanPos = openTagPos - 1;
                }
            }
            var parentInstance = _$(results);
            parentInstance.sourceHtml = this.sourceHtml;
            this.elements = results;
            return this;
        }
    };

    return instance;
};
