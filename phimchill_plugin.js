BASEURL = "https://phimchillhdx.im/";

function getManifest() {
    return JSON.stringify({
        "id": "phimchill",          
        "name": "Phim Chill",
        "description": "Phim online",
        "version": "3.8.0",             
        "baseUrl": "https://phimchillhdx.im/",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/motherless_logo.jpgphimchill.ico", 
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}


function getHomeSections() {
    return JSON.stringify([{
        "slug": "danh-sach/phim-moi.html",
        "title": "Phim Mới",
        "type": "Grid"
    }]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

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
    // 1. Nếu slug đã là URL tuyệt đối thì trả về ngay
    if (slug && slug.indexOf("http") > -1) {
        return slug;
    }

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        var page = parseInt(filters.page) || 1;
        var path = slug || "";

        // 2. Xử lý category (hỗ trợ cả dạng Mảng lẫn Chuỗi)
        if (filters.category) {
            if (Array.isArray(filters.category) && filters.category.length > 0) {
                path = filters.category[0].slug || path;
            } else if (typeof filters.category === "string") {
                path = filters.category;
            }
        }

        // 3. Ghép URL và Query Parameter
        var url = BASEURL + (path ? "/" + path : "");
        if (page > 1) {
            url += "?page=" + page;
        }

        return url.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var encodedKeyword = encodeURIComponent(keyword || "");
    var page = 1;

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        page = parseInt(filters.page) || 1;
    } catch (e) {}

    // Ghép tham số tìm kiếm dạng Query String
    var url = BASEURL + "/?search=" + encodedKeyword;
    if (page > 1) {
        url += "&page=" + page;
    }

    return url;
}

function getUrlDetail(id) {
    if (!id) return "";

    // Nếu là click vào tập phim giả (ID dạng play-...)
    if (id.indexOf("play-") === 0) {
        var playUrl = id.replace("play-", "");
        if (playUrl.indexOf('http') !== 0) playUrl = BASEURL + playUrl;
        return playUrl; // Trả về trang chiếu phim kèm ?tap=X để nạp vào parseDetailResponse
    }

    if (id.indexOf('http') === 0) return id;
    return BASEURL + id;
}

function getUrlCategories() {
    return BASEURL;
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
        var pattern = /(?=<article[^>]*class="[^"]*max-w-xs[^"]*")/g;
        var splitItems = html.split(pattern).filter(Boolean);

        for (var j = 1; j < splitItems.length; j++) {
            var block = splitItems[j];
            var hrefMatch = block.match(/href="([^"]+)"/i);
            if (!hrefMatch) continue;
            var id = hrefMatch[1].trim();

            var title = "";
            var altMatch = block.match(/title="([^"]+)"/i);
            if (altMatch) {
                title = altMatch[1].trim();
            } else {
                var labelMatch = block.match(/title="([^"]+)"/i);
                title = labelMatch ? labelMatch[1].trim() : "";
            }
            if (!title || title === "Video không tiêu đề") {
                continue;
            }

            var srcMatch = block.match(/img[\s\S]*?src="([^"]+)"/i);
            var posterUrl = srcMatch ? srcMatch[1].trim() : "";
            if (posterUrl.indexOf('/') === 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + posterUrl;
            } else if (posterUrl.indexOf('http') !== 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + "/" + posterUrl;
            }
            items.push({
                "id": id,
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl
            });
        }

        var activeRegex = /active"[\s\S]*?<a[^>]*>\s*(\d+)\s*<\/a>/;
        var activeMatch = html.match(activeRegex);
        var activePage = activeMatch ? parseInt(activeMatch[1]) : 1;

        var lastPageRegex = /(\d+)\s*<\/a>\s*<\/li>\s*<li[^>]*next/;
        var lastPageMatch = html.match(lastPageRegex);
        var lastPage = lastPageMatch ? parseInt(lastPageMatch[1]) : 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": activePage,
                "totalPages": lastPage,
                "totalItems": 48 * lastPage,
                "itemsPerPage": 48
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(htmlContent, url) {
	try {
		// === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
		var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
			/<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
		var id = idMatch ? idMatch[1] : (url || "");
		
		var slug = "";
		if (id) {
			var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
			slug = slugMatch ? slugMatch[1] : id;
		}
		if (!slug) {
			var slugMatch2 = /\/phim\/([^/_.]+)/.exec(htmlContent);
			slug = slugMatch2 ? slugMatch2[1] : "";
		}
		
		// === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
		var lurl = "";
		var limg = "";
		var lname = "Đang cập nhật...";
		var ldes = "Không có mô tả.";
		var ldirec = "";
		var lactor = "";
		var lduran = "";
		
		var rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lurl = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) limg = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lname = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) ldes = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:director"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) ldirec = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:actor"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lactor = rmatch[1];
		
		rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
		if (rmatch && rmatch[1]) lduran = rmatch[1];
		
		// === BƯỚC 3: QUÉT TẬP PHIM (Nếu đang ở trang Xem phim thì sẽ tìm thấy) ===
		var servers = [];
		_$(htmlContent).find('span:content("Danh Sách")').each(function(index, el) {
			var $box = this.next();
			var $nameserver = _$(el).text();
			var $items = [];
			
			$box.find("a").each(function(idx, bl) {
				var $link = _$(bl).attr("href");
				var $number = _$(bl).text();
				
				if ($link) {
					if ($link.indexOf('http') !== 0) {
						$link = "https://phimchillhdz.im" + ($link.startsWith('/') ?
							'' : '/') + $link;
					}
					$items.push({
						id: $link,
						name: "Tập " + $number.trim(),
						slug: "tap-" + $number.trim()
					});
				}
			});
			
			if ($items.length > 0) {
				servers.push({
					name: $nameserver.trim() || "Danh Sách OP",
					episodes: $items
				});
			}
		});
		servers.sort(function(a, b) {
            function getPriority(name) {
                if (!name) return 3;
                if (name.indexOf("OP") !== -1) return 1; // KK Phim (PA cũ) lên đầu
                if (name.indexOf("Danh Sách Vietsub") !== -1) return 2; // Ổ Phim (OP cũ) xếp thứ hai
                if (name.indexOf("NC") !== -1) return 4; // Nguồn C (NC cũ) xuống cuối cùng
                return 3; // Các nguồn còn lại (SN, v.v.) nằm giữa
            }
            return getPriority(a.name) - getPriority(b.name);
        });
		// === BƯỚC 4: NHẬN DIỆN TRANG VÀ THIẾT LẬP EXTRA ===
		var extra = "";
		
		// Nhận diện trang xem phim: URL có đuôi ".html" kèm theo "tap-" HOẶC HTML chứa danh sách tập thực tế
		var isPlayPage = /\/tap-[^/]+?\.html$/.test(url || id)
		
		if (!isPlayPage) {
			// Đang ở trang chi tiết -> Lấy link nút "Xem phim" để gán vào extra
			var playBtnMatch = _$(htmlContent).find(".text-center").find(".mx-auto").attr("href");
			if (playBtnMatch) {
				extra = playBtnMatch;
			}
		}
		// Tạo chuỗi mô tả ẩn JSON servers giống hệt tác giả
		ldes += "\r\n\r\n\r\n" + extra + "\r\n\r\n\r\n" + JSON.stringify(servers);
		
		// === BƯỚC 5: TRẢ VỀ KẾT QUẢ ĐỒNG NHẤT ID ===
		return JSON.stringify({
			id: id, // BẮT BUỘC: ID phải là slug rút gọn của bộ phim để cả 2 lần fetch khớp nhau
			title: lname,
			posterUrl: limg,
			backdropUrl: limg,
			description: ldes,
			quality: "HD",
			year: 2026,
			rating: 8.5,
			servers: servers, // Lần 1 (trang chi tiết) sẽ là []. Lần 2 (khi chạy qua extra) sẽ có đầy đủ tập
			duration: lduran || "",
			casts: lactor || "",
			director: ldirec || "",
			extra: extra // Lần 2 (trang xem phim) extra sẽ rỗng để dừng chu kỳ tải ngầm
		});
		
	} catch (e) {
		return JSON.stringify({
			id: slug || url || "error",
			title: "error",
			servers: []
		});
	}
}


// Hàm bổ trợ chuẩn hóa tập phim an toàn, không lo lỗi "00"
function formatEpisode(numStr) {
    var num = parseInt(numStr, 10);
    if (isNaN(num)) return "01"; 
    return num < 10 ? "0" + num : "" + num;
}


function parseDetailResponse(html, url) {
	try {
		var streamUrl = "";
		var VDtype = "";
		_$(html).find('a[data-type="m3u8"]').each(function() {
			var link = this.attr("data-link");
			streamUrl = link;
			VDtype = "m3u8"
		});
		var embed = _$(html).find('a[data-type="embed"]').attr("data-link");
		var checkepi = "false";
		var typevideo = "true";
		
		if (!streamUrl) {
			typevideo = "false";
			if (embed) {
				streamUrl = embed;
				VDtype = "embed";
			}
			else {
				typevideo = "false";
				streamUrl = url;
			}
		}
		
		
		if (url.indexOf("true") > -1) {
			checkepi = "true";
		} else {
			var matchCurent = url.match(/tapplay=(\d+)/);
			var curentRaw = matchCurent ? matchCurent[1] : "1";
			var curent = formatEpisode(curentRaw); // Chuẩn hóa thành "01", "02", "22"...
			checkepi = _$(html).find("h2").find("a").text() + "- Tập " + curent;
		}
		var customJs = textJS(typevideo, checkepi);
		
		if (VDtype == "m3u8") {
			return JSON.stringify({
				"url": streamUrl,
				"isEmbed": false,
				"mimeType": "application/x-mpegURL",
				"headers": {
					"Referer": BASEURL,
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
				},
				"subtitles": []
			});
		}
		else {
			return JSON.stringify({
				"url": streamUrl,
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
					"Custom-Js": customJs.trim()
				},
				"subtitles": []
			});
		}
	} catch (e) {
		return JSON.stringify({
			url: url,
			headers: {}
		});
	}
}



function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}

function getLISTmenu() {
    return `
danh-sach/phim-le.html@@Phim Lẻ
danh-sach/phim-bo.html@@Phim Bộ
the-loai/short-drama.html@@Phim Ngắn
the-loai/tinh-cam.html@@Tình Cảm
the-loai/am-nhac.html@@Âm Nhạc
the-loai/tam-ly.html@@Tâm Lý
the-loai/kinh-di.html@@Kinh Dị
the-loai/tai-lieu.html@@Tài Liệu
the-loai/tv-shows.html@@TV Shows
the-loai/hanh-dong.html@@Hành Động
the-loai/vien-tuong.html@@Viễn Tưởng
the-loai/than-thoai.html@@Thần Thoại
the-loai/vo-thuat.html@@Võ Thuật
the-loai/chien-tranh.html@@Chiến Tranh
the-loai/chinh-kich.html@@Chính Kịch
the-loai/phieu-luu.html@@Phiêu Lưu
the-loai/hai-huoc.html@@Hài Hước
the-loai/co-trang.html@@Cổ Trang
the-loai/gia-dinh.html@@Gia Đình
the-loai/hoc-duong.html@@Học Đường
the-loai/hinh-su.html@@Hình Sự
the-loai/bi-an.html@@Bí Ẩn
the-loai/phim-18.html@@Phim 18+
`
}

function textJS($links,checkepi) {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
LINKVIDEO = ${JSON.stringify($links)};
CHECKEPI = ${JSON.stringify(checkepi)};
SCRIPTURL = "https://rawcdn.githack.com/alokillgtv-gif/VAXAPPSCRIPT/main/buildVideo.js"; 
if(LINKVIDEO == "false"){
	SCRIPTURL = "https://rawcdn.githack.com/alokillgtv-gif/VAXAPPSCRIPT/main/removeADSVIDEO.js";
}
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black}';
style.innerHTML = customcss;
document.head.appendChild(style);

/* Build Video Begin*/

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
								if (CHECKEPI == "true") {
									showToast('Tập phim bạn chọn chưa có hoặc đã lỗi. Đã tự động đưa bạn về tập 1!', 60000, true);
								}
								else{
									showToast(CHECKEPI, 30000, true,true);
								}
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


function buildMenu(listurl) {
    var menulist = [];
    if (!listurl) return menulist;
    var lines = listurl.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        var parts = line.split('@@');
        var link = parts[0] ? parts[0].trim() : "";
        var name = parts[1] ? parts[1].trim() : "";
        var check = parts[2] ? parts[2].trim() : undefined;
        if (!link || !name) continue;
        var item = {};
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
function _$(htmlOrBlock) {if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match( /:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[ 3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match( /\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/ );if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();var idMatch = selectorToParse.match(/#([a-zA-Z0-9_-]+)/);if (idMatch) {targetId = idMatch[1];selectorToParse = selectorToParse.replace(/#[a-zA-Z0-9_-]+/g,"");} var classMatches = selectorToParse.match(/\.([a-zA-Z0-9_-]+)/g);if (classMatches) {for (var c = 0;c < classMatches.length;c++) {targetClasses.push(classMatches[c].substring(1));} selectorToParse = selectorToParse.replace(/\.[a-zA-Z0-9_-]+/g,"");} var tagMatch = selectorToParse.match(/^([a-zA-Z0-9_-]+)/);if (tagMatch) {targetTagName = tagMatch[1].toLowerCase();} var searchSpace = this.elements.length > 0 ? this.elements : [this.sourceHtml];for (var e = 0;e < searchSpace.length;e++) {var currentContext = searchSpace[e];var blockRegex = /<([a-zA-Z0-9_-]+)([^>]*)>([\s\S]*?)<\/\1>/gi;var voidTags = /^(img|input|br|hr|meta|link)$/i;var match;while ((match = blockRegex.exec(currentContext)) !== null) {var fullTag = match[0];var tagName = match[1].toLowerCase();var attrs = match[2];var innerHtml = match[3];if (targetTagName && targetTagName !== tagName) continue;if (targetId) {var idAttr = attrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var foundId = idAttr ? (idAttr[1] || idAttr[2] || idAttr[3]) : "";if (foundId !== targetId) continue;} if (targetClasses.length > 0) {var classAttr = attrs.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var foundClasses = classAttr ? (classAttr[1] || classAttr[2] || classAttr[3] || "").split(/\s+/) : [];var hasAllClasses = true;for (var tc = 0;tc < targetClasses.length;tc++) {if (foundClasses.indexOf(targetClasses[tc]) === -1) {hasAllClasses = false;break;}} if (!hasAllClasses) continue;} if (hasAttrFilter) {var dynamicAttrRegex = new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var matchedAttr = attrs.match(dynamicAttrRegex);if (!matchedAttr) continue;var currentVal = matchedAttr[1] || matchedAttr[2] || matchedAttr[3] || "";if (attrOperator === "=" && currentVal !== attrValueFilter) continue;if (attrOperator === "*=" && currentVal.indexOf(attrValueFilter) === -1) continue;if (attrOperator === "^=" && currentVal.indexOf(attrValueFilter) !== 0) continue;if (attrOperator === "$=" && currentVal.slice(-attrValueFilter.length) !== attrValueFilter) continue;} if (contentFilter) {var plainText = innerHtml.replace(/<[^>]*>/g,"").trim();if (plainText.indexOf(contentFilter) === -1) continue;} if (notSelector) {var subElem = _$(fullTag);if (subElem.find(notSelector).length > 0) continue;} results.push(fullTag);} var singleTagRegex = /<([a-zA-Z0-9_-]+)([^>]*?)(\/?>)/gi;while ((match = singleTagRegex.exec(currentContext)) !== null) {var singleFullTag = match[0];var singleTagName = match[1].toLowerCase();var singleAttrs = match[2];if (!voidTags.test(singleTagName) && singleFullTag.indexOf("</") === -1) continue;if (targetTagName && targetTagName !== singleTagName) continue;if (targetId) {var sIdAttr = singleAttrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var sFoundId = sIdAttr ? (sIdAttr[1] || sIdAttr[2] || sIdAttr[3]) : "";if (sFoundId !== targetId) continue;} if (targetClasses.length > 0) {var sClassAttr = singleAttrs.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var sFoundClasses = sClassAttr ? (sClassAttr[1] || sClassAttr[2] || sClassAttr[3] || "").split(/\s+/) : [];var sHasAllClasses = true;for (var stc = 0;stc < targetClasses.length;stc++) {if (sFoundClasses.indexOf(targetClasses[stc]) === -1) {sHasAllClasses = false;break;}} if (!sHasAllClasses) continue;} if (hasAttrFilter) {var sDynamicAttrRegex = new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var sMatchedAttr = singleAttrs.match(sDynamicAttrRegex);if (!sMatchedAttr) continue;var sCurrentVal = sMatchedAttr[1] || sMatchedAttr[2] || sMatchedAttr[3] || "";if (attrOperator === "=" && sCurrentVal !== attrValueFilter) continue;if (attrOperator === "*=" && sCurrentVal.indexOf(attrValueFilter) === -1) continue;if (attrOperator === "^=" && sCurrentVal.indexOf(attrValueFilter) !== 0) continue;if (attrOperator === "$=" && sCurrentVal.slice(-attrValueFilter.length) !== attrValueFilter) continue;} if (results.indexOf(singleFullTag) === -1) {results.push(singleFullTag);}}} if (isFirstFilter && results.length > 0) results = [results[0]];if (isLastFilter && results.length > 0) results = [results[results.length - 1]];var matchedInstance = _$(results);matchedInstance.sourceHtml = this.sourceHtml;return matchedInstance;},attr: function (attrName) {if (this.elements.length === 0) return undefined;var firstElement = this.elements[0];var regex = new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var match = firstElement.match(regex);if (match) {return match[1] || match[2] || match[3] || "";} return undefined;},text: function () {if (this.elements.length === 0) return "";var combined = this.elements.join(" ");return combined.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();},html: function () {if (this.elements.length === 0) return "";return this.elements.join("\n");},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {callback.call(_$(this.elements[i]),i,this.elements[i]);} return this;},next: function () {if (this.elements.length === 0 || !this.sourceHtml) return _$("");var currentElem = this.elements[0];var pos = this.sourceHtml.indexOf(currentElem);if (pos === -1) return _$("");var remaining = this.sourceHtml.substring(pos + currentElem.length);var nextTagMatch = remaining.match(/<([a-zA-Z0-9_-]+)[^>]*>([\s\S]*?)<\/\1>/i);if (nextTagMatch) {return _$(nextTagMatch[0]);} return _$("");},length: 0};instance.length = instance.elements.length;return instance;}
