BASEURL = "https://xsexsub.site";
function getManifest() {
    return JSON.stringify({
        "id": "xsexsub",
        "name": "Phim XXX Vietsub",
        "description": "XXX hay.",
        "version": "1.3.2",
        "BASEURL": "https://xsexsub.site",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}  

// https://xsexsub.site/sex-vietsub-moi/page/4/
function getHomeSections() {
    var listurl = `
/sex-vietsub-moi/@@Phim Mới@@true
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
			resultUrl += "/page/" + page + "/";
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
// https://xsexsub.site/hiep-dam/page/4/
// https://xsexsub.site/sex-vietsub-moi/page/4/
//var BASEURL = "https://xsexsub.site";
// JSON lỗi cú pháp (thiếu nháy kép) của bạn
//var filtersJsonNoCat = '{page:11,category:[{"slug":"/hiep-dam/","name":"Thiếu niên"}]}'; 
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
function parseListResponse(html, $url) {
	try {
		var items = [];
		
		_$(html).find(".video-item").each(function() {
			var href = this.find("a").attr("href");
			var title = this.find(".title-post").text();
			var src = this.find(".thumb-container").attr("data-bg");
			if (src.indexOf("http") == -1) {
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



function parseMovieDetail(html, url) {
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
	try {
		limg = _$(html).find(".alignnone").attr("src");
		if (limg.indexOf("http") == -1) {
			limg = BASEURL + limg;
		}
		lname = _$(html).find(".title-videos").text();
		ldes = _$(html).find("#div2").find("p").text().replace(/\s\s/g, "");
		cast = _$(html).find(".dien-vien").text();
		var embed = _$(html).find("#okplayer-frame").attr("data-base");
		var servers = [];
		var epi = [];
		epi.push({ id: url, name: "Xem Ngay", slug: "full" });
		servers.push({
			name: "Server",
			episodes: epi
		});
		ldes += "\r\n\r\n\r\n" + JSON.stringify(servers);
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
			lang: lang
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
	var embed = _$(html).find("#okplayer-frame").attr("data-base");
		var customjs = textJS("");
		return JSON.stringify({
			"url": embed,
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

SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=xsexsub&type=js"; 
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black;display:none!important}';
style.innerHTML = customcss;
//document.head.appendChild(style);

/* Build Video Begin*/
/**
 * Dọn dẹp DOM, giữ lại các phần tử mong muốn và tự động gắn Control nếu có thẻ Video.
/**
 * Dọn dẹp DOM, giữ lại các phần tử mong muốn và tự động gắn Control nếu có thẻ Video.
 */
function keepElementsAndInjectControls(selectors) {
    const targets = [];
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => targets.push(el));
    });

    if (targets.length === 0) {
        console.error("Không tìm thấy element nào khớp với các selector!");
        return;
    }

    const targetsSet = new Set(targets);
    const ancestors = new Set();

    targets.forEach(target => {
        let current = target.parentElement;
        while (current && current !== document.body && current !== document.documentElement) {
            ancestors.add(current);
            current = current.parentElement;
        }
    });

    function cleanUp(container) {
        const children = Array.from(container.childNodes);
        children.forEach(child => {
            if (targetsSet.has(child)) {
                // Giữ nguyên
            } else if (ancestors.has(child)) {
                if (child.nodeType === Node.ELEMENT_NODE) cleanUp(child);
            } else {
                child.remove();
            }
        });
    }

    cleanUp(document.body);
    document.body.style.background = 'black';

    targets.forEach(target => {
        if (target.tagName.toLowerCase() === 'video') {
            Object.assign(target.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                zIndex: '998', 
                objectFit: 'contain',
                background: '#000',
                margin: '0',
                padding: '0'
            });
            
            target.controls = false; 
            injectCustomVideoControls(target);
        } else {
            target.style.position = 'relative';
            target.style.zIndex = '9999';
        }
    });
}

/**
 * Tạo UI và gắn logic điều khiển cho thẻ video có sẵn
 */
function injectCustomVideoControls(video) {
    const toastContainer = document.createElement('div');
    toastContainer.className = "custom-toast-container"; // THÊM CLASS ĐỂ QUẢN LÝ
    toastContainer.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(toastContainer);

    function showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.innerHTML = message;
        toast.style.cssText = 'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;font-family:sans-serif;font-size:14px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
        toastContainer.appendChild(toast);
        
        setTimeout(() => { toast.style.transform = 'translateX(0)'; toast.style.opacity = '1'; }, 10);
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)'; toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function generateVideoKey() {
        if (!video.duration || isNaN(video.duration)) return null;
        return 'VIDEO_SAVED_POS_' + Math.floor(video.duration);
    }

    function savePosition() {
        if (video.ended || !video.currentTime || video.currentTime < 5 || video.currentTime > video.duration - 5) return;
        const key = generateVideoKey();
        if (key) localStorage.setItem(key, video.currentTime);
    }

    function restorePosition() {
        const key = generateVideoKey();
        if (!key) return;
        const savedTime = localStorage.getItem(key);
        if (savedTime && parseFloat(savedTime) > 5) {
            video.currentTime = parseFloat(savedTime);
            showToast('⏩ Đã tiếp tục phát từ ' + formatTime(video.currentTime));
        }
    }

    const overlay = document.createElement('div');
    overlay.className = "custom-video-overlay"; // THÊM CLASS ĐỂ QUẢN LÝ
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;font-family:sans-serif;';
    
    const controls = document.createElement('div');
    controls.style.cssText = 'pointer-events:auto;position:absolute;bottom:0;left:0;width:100%;background:linear-gradient(transparent,rgba(0,0,0,0.85));padding:12px 16px 20px;box-sizing:border-box;transition:opacity 0.3s;opacity:0;';
    
    const progressWrap = document.createElement('div');
    progressWrap.style.cssText = 'width:100%;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;cursor:pointer;position:relative;margin-bottom:12px;';
    const progressBar = document.createElement('div');
    progressBar.style.cssText = 'height:100%;background:#e74c3c;width:0%;border-radius:3px;pointer-events:none;';
    progressWrap.appendChild(progressBar);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;align-items:center;gap:12px;color:#fff;';

    const btnPlay = document.createElement('button');
    btnPlay.textContent = video.paused ? '▶' : '⏸';
    const btnMute = document.createElement('button');
    btnMute.textContent = video.muted ? '🔇' : '🔊';
    const timeDisplay = document.createElement('span');
    timeDisplay.style.cssText = 'font-size:13px;min-width:100px;';
    timeDisplay.textContent = '0:00 / 0:00';
    
    const bigPlayBtn = document.createElement('div');
    bigPlayBtn.textContent = '▶';
    bigPlayBtn.style.cssText = 'pointer-events:auto;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:rgba(0,0,0,0.6);border-radius:50%;display:'+(video.paused?'flex':'none')+';align-items:center;justify-content:center;color:#fff;font-size:36px;cursor:pointer;z-index:15;';

    [btnPlay, btnMute].forEach(btn => {
        btn.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px;outline:none;';
    });

    btnRow.append(btnPlay, btnMute, timeDisplay);
    controls.append(progressWrap, btnRow);
    overlay.append(bigPlayBtn, controls);
    document.body.appendChild(overlay);

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' + s : s);
    }

    function togglePlay() {
        // Chỉ cho phép bấm khi overlay đang hiển thị (thẻ video đang hiện)
        if (overlay.style.display === 'none') return;
        video.paused ? video.play() : video.pause();
    }

    function updateUI() {
        btnPlay.textContent = video.paused ? '▶' : '⏸';
        bigPlayBtn.style.display = video.paused ? 'flex' : 'none';
        if (video.duration) {
            progressBar.style.width = (video.currentTime / video.duration * 100) + '%';
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        }
    }

    let controlsTimeout;
    function showControls() {
        if (overlay.style.display === 'none') return;
        controls.style.opacity = '1';
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => { controls.style.opacity = '0'; }, 3000);
    }

    video.addEventListener('timeupdate', () => { updateUI(); savePosition(); });
    video.addEventListener('play', updateUI);
    video.addEventListener('pause', updateUI);
    video.addEventListener('loadedmetadata', restorePosition);
    video.addEventListener('volumechange', () => { btnMute.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊'; });
    
    if (video.readyState >= 1) restorePosition();

    document.addEventListener('mousemove', showControls);
    overlay.addEventListener('click', showControls);
    
    const clickZone = document.createElement('div');
    clickZone.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:calc(100% - 60px);pointer-events:auto;cursor:pointer;';
    clickZone.addEventListener('click', togglePlay);
    overlay.appendChild(clickZone);

    btnPlay.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    btnMute.addEventListener('click', () => { video.muted = !video.muted; });
    
    progressWrap.addEventListener('click', (e) => {
        const rect = progressWrap.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (video.duration) video.currentTime = pct * video.duration;
    });

    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        if (overlay.style.display === 'none') return; // Không ăn phím tắt khi đang xem iframe
        showControls();
        switch(e.key) {
            case ' ': e.preventDefault(); togglePlay(); break;
            case 'ArrowRight': video.currentTime += 10; break;
            case 'ArrowLeft': video.currentTime -= 10; break;
            case 'f': 
            case 'F': 
                if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                else document.exitFullscreen();
                break;
        }
    });
}

// --- XỬ LÝ CHUYỂN SERVER (ĐÃ FIX LỖI ĐÈ) ---
window.changeServer = function(selectElement) {
    // Lấy chính xác video của bạn bằng Class
    const _VIDEO = document.getElementsByClassName("v-node")[0]; 
    const _IFRAME = document.getElementsByClassName("frame-server")[0];
    const _OVERLAY = document.getElementsByClassName("custom-video-overlay")[0];
    const _TOAST = document.getElementsByClassName("custom-toast-container")[0];
    
    const link = selectElement.value;
    if (!link) return;

    if (/mp4|m3u8/i.test(link)) {
        if (_IFRAME) {
            _IFRAME.style.display = "none";   
            _IFRAME.src = "about:blank"; 
        }
        
        if (_VIDEO) {
            _VIDEO.style.display = "block";
            _VIDEO.src = link;
            _VIDEO.load();
            _VIDEO.play().catch(e => console.log("Chờ click để play: ", e));
        }
        if (_OVERLAY) _OVERLAY.style.display = "block";
        if (_TOAST) _TOAST.style.display = "flex";
    } 
    else {
        // Tắt chính xác video của bạn
        if (_VIDEO) {
            _VIDEO.pause();             
            _VIDEO.style.display = "none";
        }
        
        if (_OVERLAY) _OVERLAY.style.display = "none";
        if (_TOAST) _TOAST.style.display = "none";
        
        if (_IFRAME) {
            _IFRAME.style.display = "block";
            _IFRAME.src = link;
        }
        
        if (window.showToast) {
            window.showToast("Đôi khi chuyển đổi server sẽ hơi chậm. Nếu video chưa chạy hãy nhấn nhiều lần vào video nhé bạn.", 5000);
        }
    }
}

    // TRƯỜNG HỢP 2: SERVER EMBED / IFRAME
    
    // TRƯỜNG HỢP 2: SERVER EMBED / IFRAME
    
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
			// --- KHỞI TẠO SELECT BOX ---
			var html = document.body.innerHTML;
			const regex = /data-link=["']([^"']+)["']/g;
			var number = 0;
			
			var selectHtml = '<select class="changeServer" onchange="changeServer(this)" style="background:black;color:white;opacity:0.8;border:none;padding:4px;font-size:14px;border-radius:4px;outline:none;">';
			for (const match of html.matchAll(regex)) {
				number++;
				const url = match[1];
				selectHtml += '<option value="' + url + '">Server ' + number + '</option>';
			}
			selectHtml += '</select>';
			
			const tempDiv = document.createElement('div');
			tempDiv.className = "wrap-server";
			tempDiv.innerHTML = selectHtml;
			tempDiv.style.cssText = "position:fixed;right:20px;top:10px;z-index:100000;background:black;color:white;padding:4px;border:1px solid #fff;border-radius:4px";
			
			const iframe = document.createElement('iframe');
			iframe.className = "frame-server";
			// Tăng z-index lên 9999 để đè hoàn toàn lên video, nhưng dưới nút chọn server (100000)
			iframe.style.cssText = "background:black;position:fixed;right:0px;top:0px;left:0px;bottom:0px;width:100%;height:100%;display:none;z-index:9999;border:none;";
			iframe.src = "about:blank";
			
			
			
			setTimeout(function() {
			keepElementsAndInjectControls(["video"]);
				document.body.appendChild(tempDiv);
				document.body.appendChild(iframe);
			}, 2000);
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
/loan-luan/@@Loạn Luân
/hiep-dam/@@Hiếp Dâm
/sex-vietsub-khong-che/@@Không Che
/sex-tap-the/@@Tập Thể
/sex-vung-trom/@@Vụng Trộm
/sex-co-trang/@@Cổ Trang
/sex-hoc-sinh/@@Học Sinh
/sex-cong-so/@@Công Sở
/phimsexsub/@@PhimSexSub
/phim-sex-thuyet-minh/@@Thuyết Minh
/quoc-gia/sex-trung/@@Sex Trung
/quoc-gia/sex-nhat/@@Sex Nhật
/quoc-gia/sex-my/@@Sex Mỹ

`
}

function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}function _$(htmlOrBlock){if (htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock;}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){var results=[];var contentFilter="";if (selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}}var attrNameFilter="";var attrValueFilter="";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrValueFilter=attrMatch[2]||attrMatch[3]||attrMatch[4]||"";selector=selector.replace(/\[.*?\]/,"");}var notSelector="";if (selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if (notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"");}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var isClass=selector.indexOf('.')===0;var isId=selector.indexOf('#')===0;var isAttrOnly=(selector===""&&hasAttrFilter);var targetClasses=[];var targetId="";var targetTagName="";if (isClass){targetClasses=selector.split('.').filter(function(c){return c.length > 0;});}else if (isId){targetId=selector.substring(1);}else if (!isAttrOnly){targetTagName=selector.toLowerCase();}for (var i=0;i < this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while ((pos=currentHtml.indexOf('<',pos))!==-1){if (currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue;}var endOpenTag=currentHtml.indexOf('>',pos);if (endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName="";if (spacePos===-1){currentTagName=fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase();}else{currentTagName=fullOpenTag.substring(1,spacePos).toLowerCase();}var isMatched=false;if (isClass){var classMatchStr="";var classPos=fullOpenTag.indexOf('class="');if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{classPos=fullOpenTag.indexOf("class='");if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (classMatchStr){var currentClasses=classMatchStr.split(/\s+/);var matchCount=0;for (var c=0;c < targetClasses.length;c++){if (currentClasses.indexOf(targetClasses[c])!==-1)matchCount++;}if (matchCount===targetClasses.length)isMatched=true;}}else if (isId){var idMatchStr="";var idPos=fullOpenTag.indexOf('id="');if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{idPos=fullOpenTag.indexOf("id='");if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (idMatchStr===targetId)isMatched=true;}else if (isAttrOnly){isMatched=true;}else{if (currentTagName===targetTagName)isMatched=true;}if (isMatched&&hasAttrFilter){var searchStr1=attrNameFilter+'="'+attrValueFilter+'"';var searchStr2=attrNameFilter+"='"+attrValueFilter+"'";if (fullOpenTag.indexOf(searchStr1)===-1&&fullOpenTag.indexOf(searchStr2)===-1){isMatched=false;}}if (isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&scanPos < currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if (nextClose===-1){scanPos=currentHtml.length;break;}if (nextOpen!==-1&&nextOpen < nextClose){depth++;scanPos=nextOpen+openStr.length;}else{depth--;scanPos=nextClose+closeStr.length;if (depth===0)endTagPos=nextClose+closeStr.length;}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if (contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue;}}if (notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if (isNotClass&&fullOpenTag.indexOf('class="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (isNotId&&fullOpenTag.indexOf('id="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (!hasNot)subResults.push(foundBlock);}else{subResults.push(foundBlock);}pos=endTagPos;}else{pos++;}}if (isFirstFilter&&subResults.length > 0)subResults=[subResults[0]];if (isLastFilter&&subResults.length > 0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults);}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance;},each:function(callback){for (var i=0;i < this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i]);}return this;},eq:function(index){if (index < 0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this;},attr:function(attrName){if (this.elements.length===0)return "";var elem=this.elements[0];var searchStr=attrName+'="';var pos=elem.indexOf(searchStr);if (pos===-1){searchStr=attrName+"='";pos=elem.indexOf(searchStr);}if (pos===-1)return "";var start=pos+searchStr.length;var quoteType=elem.charAt(start-1);var end=elem.indexOf(quoteType,start);return end===-1?"":elem.substring(start,end);},html:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start)return elem.substring(start,end);return "";},text:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start){var content=elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();}return "";},next:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx===-1)continue;var scanPos=idx+elem.length;var nextOpen=this.sourceHtml.indexOf('<',scanPos);if (nextOpen!==-1){if (this.sourceHtml.charAt(nextOpen+1)==='/') continue;var endOpenTag=this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag===-1)continue;var fullOpenTag=this.sourceHtml.substring(nextOpen,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos=nextOpen;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}results.push(this.sourceHtml.substring(startTagPos,endTagPos));}}var nextInstance=_$(results);nextInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;},parent:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx <=0)continue;var scanPos=idx-1;while (scanPos >=0){var openTagPos=this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos===-1)break;if (this.sourceHtml.charAt(openTagPos+1)!=='/'&&this.sourceHtml.charAt(openTagPos+1)!=='!'){var endOpenTag=this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag!==-1&&endOpenTag > openTagPos){var fullOpenTag=this.sourceHtml.substring(openTagPos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}if (endTagPos >=idx+elem.length){var parentBlock=this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock)===-1)results.push(parentBlock);break;}}}scanPos=openTagPos-1;}}var parentInstance=_$(results);parentInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;}};return instance;};