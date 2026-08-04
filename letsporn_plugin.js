
BASEURL = "https://letsporn.com";
// https://www.xxxfiles.com/favicon-32x32.png
function getManifest() {
    return JSON.stringify({
        "id": "letsporn",
        "name": "Lets Porn",
        "description": "XXX Hay.",
        "version": "1.7.2",
        "BASEURL": "https://letsporn.com",
        "iconUrl": "https://static.letsporn.com/static/img/logo.png?v=1.2",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}


// https://letsporn.com/newest/4
function getHomeSections() {
    var listurl = "/newest/@@Hàng Mới@@true";
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
            
            // Xử lý nếu category là mảng
            if (filters.category) {
                if (Array.isArray(filters.category) && filters.category.length > 0) {
                    path = filters.category[0].slug;
                } else if (typeof filters.category === 'string') {
                    path = filters.category;
                }
            }
        }
    } catch (e) {
        
    }
    
    // 2. Nếu filters không có category, sử dụng slug truyền vào
    if (!path) {
        path = slug || "";
    }
    
    // 3. KIỂM TRA NẾU PATH ĐÃ LÀ URL TUYỆT ĐỐI
    // Nếu path bắt đầu bằng http:// hoặc https://, ta xử lý riêng không cộng BASEURL nữa
    if (/^https?:\/\//i.test(path)) {
        // Chuẩn hóa xóa dấu / ở cuối
        path = path.replace(/\/+$/, "");
        
        if (page > 1) {
            return path + "/" + page + "/";
        } else {
            return path + "/";
        }
    }
    
    // 4. Xử lý cho URL tương đối (slug thông thường)
    if (!path) return baseUrlClean + "/";
    
    path = path.replace(/^\/+|\/+$/g, "");
    var targetUrl = baseUrlClean + "/" + path;
    
    if (page > 1) {
        targetUrl += "/" + page + "/";
    } else {
        targetUrl += "/";
    }
    
    return targetUrl;
}
// https://letsporn.com/categories/bareback/4
// https://letsporn.com/search?q=blacked
// https://letsporn.com/newest/4
/*
var BASEURL = "https://www.xxxfiles.com";
// JSON lỗi cú pháp (thiếu nháy kép) của bạn
var filtersJson = '{page:1,category:[{"slug":"categories/teen/","name":"Thiếu niên"}]}'; 
// Trường hợp 1: Truyền URL tuyệt đối vào slug
console.log(getUrlList("https://www.xxxfiles.com/search/black/", filtersJson));
// Kết quả: "https://www.xxxfiles.com/categories/teen/" 
// (Vì trong filtersJson có category nên nó ưu tiên dùng category trước)
// Trường hợp 2: Nếu filtersJson không có category, nó sẽ dùng slug trực tiếp
var filtersJsonNoCat = '{page:2}';
console.log(getUrlList("https://www.xxxfiles.com/search/black/", filtersJsonNoCat));
// Kết quả: "https://www.xxxfiles.com/search/black/2/" (Nhận diện đúng URL và thêm trang)
*/

function getUrlSearch(keyword, filtersJson) {
    return "https://letsporn.com/search?q=" + encodeURIComponent(keyword);
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
    try {
        var items = [];
        
        _$(html).find(".th.th-p").each(function() {
            var href = this.find(".th-link-image").attr("href");
            var title = this.find(".th-link-image").attr("title");
            var src = this.find(".th-image").attr("src");
            
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
//html = $("html")[0].outerHTML;
//JSON.parse(parseListResponse(html));
// Bỏ dấu / ở đầu chuỗi
//*/


function parseSearchResponse(html) {
    return parseListResponse(html);
}


function parseMovieDetail(html,$url) {
    var outerHTML = html;
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var streamUrl = ""; // ĐÃ SỬA: Khai báo rõ ràng biến streamUrl tránh lỗi Global leak
    var $split = html.match(/thumbnailUrl["'][^"']+["']([^"']+)["']/i);
    if($split && $split[1]){limg = $split[1]}
    lname = _$(outerHTML).find('.fp-poster').find("img").attr("alt");
    ldes = _$(outerHTML).find('.video-description').text();
    
		var $link = [];
		var $stream = "";
		var link1 = "";
		var link2 = "";
		var name1 = "";
		var name2 = "";
		var $split = html.match(/video_url:\s+["']([^"']+)["'][^}]*video_url_text:\s+["']([^"']+)["']/i);
		
		var $split2 = html.match(/video_alt_url:\s+["']([^"']+)["'][^}]*video_alt_url_text:\s+["']([^"']+)["']/i);
		if ($split2 && $split2[1]) {
			var $item = { id: $split2[1] + "#video.m3u8", "name": "Độ Phân Giải " + $split2[2],slug:"full" }
			$stream = $split2[1];
			$link.push($item);
		}
		if ($split && $split[1]) {
			var $item = { id: $split[1] + "#video.m3u8", "name": "Độ Phân Giải " + $split[2], slug: "full" }
			$link.push($item);
		}
    
    return JSON.stringify({
        id: $url,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: [
            {
                name: "Servers: ",
                episodes: $link
            }
        ],
        quality: "HD",
        year: 2026,
        rating: 8.5,
        status: "Full",
        duration: "N/A",
        casts: "N/A",
        director: "N/A",
        category: "18+"
    });
}
/*
BASEURL = "https://www.justporn.com";
var html = $("html")[0].outerHTML;
var $url = "https://www.justporn.com/video/18058/hot-babe-remy-cheats-with-bbc/";
JSON.parse(parseMovieDetail(html,$url))
*/

function parseDetailResponse(html, url) {
	try {
		return JSON.stringify({
			"url": "",
			"isEmbed": false,
			"mimeType": "video/mp4",
			"headers": {
				"Referer": BASEURL,
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
			},
			"subtitles": []
		});
		
	} catch (e) {
		return JSON.stringify({ "url": "", "headers": {} });
	}
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
/categories/amateur@@Amateur
/categories/bareback@@Bareback
/categories/bisexual@@Bisexual
/categories/blowjob@@Blowjob
/categories/celebrity@@Celebrity
/categories/close-up@@Close Up
/categories/compilation@@Compilation
/categories/couple@@Couple
/categories/deepthroat@@Deepthroat
/categories/doggystyle@@Doggystyle
/categories/erotic@@Erotic
/categories/first-time@@First Time
/categories/gloryhole@@Gloryhole
/categories/handjob@@Handjob
/categories/hardcore@@Hardcore
/categories/homemade@@Homemade
/categories/lesbian@@Lesbian
/categories/masturbation@@Masturbation
/categories/orgasm@@Orgasm
/categories/outdoor@@Outdoor
/categories/pornstar@@Pornstar
/categories/pov@@PoV
/categories/public@@Public
/categories/softcore@@Softcore
/categories/solo@@Solo
/categories/titjob@@Titjob
/categories/vintage@@Vintage
/categories/webcam@@Webcam
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
    var instance = {
        elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),
        
        find: function(selector) {
            var results = [];
            
            // --- XỬ LÝ :not(...) ---
            var notSelector = "";
            if (selector.indexOf(":not(") !== -1) {
                var notMatch = selector.match(/:not\(([^)]+)\)/);
                if (notMatch) {
                    notSelector = notMatch[1];
                    selector = selector.replace(/:not\([^)]+\)/, ""); // Xóa đoạn :not để lọc selector chính trước
                }
            }
            
            // --- XỬ LÝ :first VÀ :last FLAGS ---
            var isFirstFilter = selector.indexOf(":first") !== -1;
            var isLastFilter = selector.indexOf(":last") !== -1;
            selector = selector.replace(/:first|:last/g, ""); // Làm sạch selector chính

            var isClass = selector.indexOf('.') === 0;
            var isId = selector.indexOf('#') === 0;
            
            var targetClasses = [];
            var targetId = "";
            var targetTagName = "";
            
            if (isClass) {
                targetClasses = selector.split('.').filter(function(c) { return c.length > 0; });
            } else if (isId) {
                targetId = selector.substring(1);
            } else {
                targetTagName = selector.toLowerCase();
            }
            
            for (var i = 0; i < this.elements.length; i++) {
                var currentHtml = this.elements[i];
                var pos = 0;
                var subResults = []; // Lưu tạm kết quả của element hiện tại để lọc :not, :first, :last
                
                while ((pos = currentHtml.indexOf('<', pos)) !== -1) {
                    if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') {
                        pos++;
                        continue;
                    }
                    
                    var endOpenTag = currentHtml.indexOf('>', pos);
                    if (endOpenTag === -1) break;
                    
                    var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1);
                    
                    // Trích xuất tên thẻ
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
                    } else {
                        if (currentTagName === targetTagName) isMatched = true;
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
                        
                        // --- ĐIỀU KIỆN LỌC :not(...) ---
                        if (notSelector) {
                            // Kiểm tra xem block tìm được có chứa class hoặc id bị loại trừ không
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
                
                // Áp dụng :first hoặc :last nếu có cấu hình
                if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]];
                if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]];
                
                results = results.concat(subResults);
            }
            
            this.elements = results;
            return this;
        },
        
        // --- THÊM HÀM .eq(index) ---
        eq: function(index) {
            if (index < 0) {
                index = this.elements.length + index; // Hỗ trợ eq(-1) để lấy phần tử cuối giống jQuery
            }
            var matchedElement = this.elements[index];
            this.elements = matchedElement ? [matchedElement] : [];
            return this;
        },
        
        each: function(callback) {
            for (var i = 0; i < this.elements.length; i++) {
                callback.call(_$(this.elements[i]), i);
            }
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
        }
    };
    
    return instance;
}
