BASEURL = "https://www.freepornvideos.xxx";
// https://www.xxxfiles.com/favicon-32x32.png
function getManifest() {
    return JSON.stringify({
        "id": "4kporn",
        "name": "Phim XXX 4K",
        "description": "XXX siêu nét.",
        "version": "1.5.4",
        "BASEURL": "https://www.freepornvideos.xxx",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "info":"Nguồn phim chất lượng 4K nên load hơi lâu, bạn chịu khó đợi tí nha.",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

// https://www.freepornvideos.xxx/latest-updates/3/
function getHomeSections() {
    var listurl = `
/latest-updates/@@Phim Mới@@true
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

function log(msg) {
    var baseUrl = typeof BASEURL !== 'undefined' ? BASEURL : "";
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[" + baseUrl + "] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[" + baseUrl + "] " + msg);
    }
}

function getUrlList(slug, filtersJson) {
    log("list url: " + slug);
    try {
        var page = 1;

        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http/https)
        if (slug && slug.indexOf("http") > -1) {
            // Trường hợp link search tuyệt đối truyền vào cần phân trang
            if (slug.indexOf("search") > -1 && filtersJson) {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
                try {
                    var filters = JSON.parse(fixedJson);
                    page = parseInt(filters.page) || 1;
                    if (page > 1) {
                        var cleanSlug = slug.replace(/\/+$/, "");
                        return (cleanSlug + "/" + page + "/").replace(/([^:]\/)\/+/g, "$1");
                    }
                } catch (jsonErr) {}
            }
            return slug;
        }

        var path = slug || "";

        // 2. Parse filtersJson an toàn để lấy trang (page) và category (nếu chưa có slug)
        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson2);
                page = parseInt(filters.page) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // 3. Chuẩn hóa đường dẫn từ BASEURL
        var baseUrlClean = (typeof BASEURL !== 'undefined' ? BASEURL : "").replace(/\/+$/, "");
        var pathClean = path ? path.replace(/^\/+|\/+$/g, "") : "";

        var resultUrl = baseUrlClean + (pathClean ? "/" + pathClean : "");

        // 4. Ghép phân trang theo cấu trúc /path/page/
        if (page > 1) {
            resultUrl += "/" + page + "/";
        } else {
            if (pathClean && pathClean.indexOf("?") !== 0) {
                resultUrl += "/";
            }
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log(e);
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallbackBase = typeof BASEURL !== 'undefined' ? BASEURL : "";
        var fallback = fallbackBase + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;

        // 1. Parse filtersJson an toàn để lấy số trang nếu có
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var baseUrlClean = (typeof BASEURL !== 'undefined' ? BASEURL : "").replace(/\/+$/, "");
        var encodedKeyword = encodeURIComponent(keyword || "");

        // 2. Tạo URL tìm kiếm: /search/keyword/ (trang 1) hoặc /search/keyword/page/ (trang > 1)
        var resultUrl = baseUrlClean + "/search/" + encodedKeyword + "/";

        if (page > 1) {
            resultUrl += page + "/";
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log(e);
        var fallbackBase = typeof BASEURL !== 'undefined' ? BASEURL : "";
        var fallback = fallbackBase + "/search/" + encodeURIComponent(keyword || "") + "/";
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
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
		
		_$(html).find(".item").each(function() {
			var href = this.find("a").attr("href");
			var title = this.find("a").attr("title");
			// https://img.freepornvideos.xxx/93816000/93816189/medium@2x/1.jpg
			var src = this.find(".thumb_img").attr("src");
			var srcload = this.find(".thumb_img").attr("data-src");
			if (!src.match(/http/) | src.match(/data:image/)) {
				src = srcload;
			}
			if (src.indexOf("http") == -1) {
				src = BASEURL + src;
			}
			
			if (href && href.indexOf("http") > -1 && href.indexOf(BASEURL) > -1) {
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
	var servers = [];
	var $info = "";
	var category = "";
	var country = "";
	var lang = "";
	var streamUrl = "";
	try {
		limg = _$(html).find('meta[property="og:image"]').attr("content");
		if (limg.indexOf("http") == -1) {
			limg = BASEURL + limg;
		}
		lname = _$(html).find('meta[property="og:title"]').attr("content");
		ldes = _$(html).find('meta[property="og:description"]').attr("content");
		var sourcevd = _$(html).find(".video-js").html();
		var regvid = /src=["']([^"']+)["'][^>]+label=["']([^"']+)["']/g;
		var epi = [];
		var stream = "";
		var number = 0;
		for (const match of sourcevd.matchAll(regvid)) {
			number++
			var link = match[1];
			var type = match[2];
			if (number == 1) {
				stream = link;
			}
			if (type.indexOf("2160") > -1) {
				stream = link;
			}
			epi.push({ id: link + "#video.m3u8", name: "Độ Phân Giải " + type,slug: lname.replace(/\s/g,"_") });
		}
  	servers.push({
            name: "4K PORN",
            episodes: epi
    });
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
/search/indian/@@Ấn Độ
/search/Stepmom/@@Mẹ kế
/search/Stepsister/@@Chị kế
/search/Anal/@@Lỗ Nhị
/search/Japanese/@@Nhật Bản
/search/Milf/@@Nữ trung niên
/search/Teen/@@Teen
/search/best-friend/@@Bạn thân
/search/squirting-curvy-girls/@@Gái Mập
/search/Housewives/@@Bà nội trợ
/search/asian/@@Châu Á
/search/family/@@Gia đình
/search/Swap/@@Trao đổi
/search/brazzers/@@Brazzers
/search/teen-love/@@Tuổi teen
/search/Mature/@@Chín chắn
/search/Oil-massage/@@Mát-xa dầu
/search/Group-Sex/@@Tập thể
/search/trans/@@Chuyển giới
/search/Hijab/@@Khăn trùm đầu Hồi giáo
/search/Vintage/@@Cổ điển
/search/China/@@Trung Quốc
/search/lesbian/@@Đồng tính nữ
/search/japan/@@Nhật Bản
/search/vixen/@@Vixen
/search/Party/@@Tiệc tùng
/search/Lena-Paul/@@Lena Paul
/search/Teens/@@Teen
/search/oldje/@@oldje
/search/Japanese-massage/@@Mát-xa kiểu Nhật
/search/sneaky/@@Lén lút
/search/abella-danger/@@Abella Danger
/search/blacked/@@Blacked
/search/Japanese-oil-massage/@@Mát-xa dầu
/search/Black/@@Da đen
/search/Hairy-Milf/@@Phụ nữ trung niên rậm lông
/search/Bangbros/@@Bangbros
/search/Hairy-babes@@Gái trẻ rậm lông
/search/nubiles@@Nubiles
/search/ass-fingering@@Móc Đít
/search/Hairy@@Rậm lông
/search/nina@@Nina
/search/Hairy-blonde@@Tóc vàng
`
}

function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}function _$(htmlOrBlock){if (htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock;}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){var results=[];var contentFilter="";if (selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}}var attrNameFilter="";var attrValueFilter="";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrValueFilter=attrMatch[2]||attrMatch[3]||attrMatch[4]||"";selector=selector.replace(/\[.*?\]/,"");}var notSelector="";if (selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if (notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"");}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var isClass=selector.indexOf('.')===0;var isId=selector.indexOf('#')===0;var isAttrOnly=(selector===""&&hasAttrFilter);var targetClasses=[];var targetId="";var targetTagName="";if (isClass){targetClasses=selector.split('.').filter(function(c){return c.length > 0;});}else if (isId){targetId=selector.substring(1);}else if (!isAttrOnly){targetTagName=selector.toLowerCase();}for (var i=0;i < this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while ((pos=currentHtml.indexOf('<',pos))!==-1){if (currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue;}var endOpenTag=currentHtml.indexOf('>',pos);if (endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName="";if (spacePos===-1){currentTagName=fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase();}else{currentTagName=fullOpenTag.substring(1,spacePos).toLowerCase();}var isMatched=false;if (isClass){var classMatchStr="";var classPos=fullOpenTag.indexOf('class="');if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{classPos=fullOpenTag.indexOf("class='");if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (classMatchStr){var currentClasses=classMatchStr.split(/\s+/);var matchCount=0;for (var c=0;c < targetClasses.length;c++){if (currentClasses.indexOf(targetClasses[c])!==-1)matchCount++;}if (matchCount===targetClasses.length)isMatched=true;}}else if (isId){var idMatchStr="";var idPos=fullOpenTag.indexOf('id="');if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{idPos=fullOpenTag.indexOf("id='");if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (idMatchStr===targetId)isMatched=true;}else if (isAttrOnly){isMatched=true;}else{if (currentTagName===targetTagName)isMatched=true;}if (isMatched&&hasAttrFilter){var searchStr1=attrNameFilter+'="'+attrValueFilter+'"';var searchStr2=attrNameFilter+"='"+attrValueFilter+"'";if (fullOpenTag.indexOf(searchStr1)===-1&&fullOpenTag.indexOf(searchStr2)===-1){isMatched=false;}}if (isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&scanPos < currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if (nextClose===-1){scanPos=currentHtml.length;break;}if (nextOpen!==-1&&nextOpen < nextClose){depth++;scanPos=nextOpen+openStr.length;}else{depth--;scanPos=nextClose+closeStr.length;if (depth===0)endTagPos=nextClose+closeStr.length;}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if (contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue;}}if (notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if (isNotClass&&fullOpenTag.indexOf('class="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (isNotId&&fullOpenTag.indexOf('id="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (!hasNot)subResults.push(foundBlock);}else{subResults.push(foundBlock);}pos=endTagPos;}else{pos++;}}if (isFirstFilter&&subResults.length > 0)subResults=[subResults[0]];if (isLastFilter&&subResults.length > 0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults);}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance;},each:function(callback){for (var i=0;i < this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i]);}return this;},eq:function(index){if (index < 0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this;},attr:function(attrName){if (this.elements.length===0)return "";var elem=this.elements[0];var searchStr=attrName+'="';var pos=elem.indexOf(searchStr);if (pos===-1){searchStr=attrName+"='";pos=elem.indexOf(searchStr);}if (pos===-1)return "";var start=pos+searchStr.length;var quoteType=elem.charAt(start-1);var end=elem.indexOf(quoteType,start);return end===-1?"":elem.substring(start,end);},html:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start)return elem.substring(start,end);return "";},text:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start){var content=elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();}return "";},next:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx===-1)continue;var scanPos=idx+elem.length;var nextOpen=this.sourceHtml.indexOf('<',scanPos);if (nextOpen!==-1){if (this.sourceHtml.charAt(nextOpen+1)==='/') continue;var endOpenTag=this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag===-1)continue;var fullOpenTag=this.sourceHtml.substring(nextOpen,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos=nextOpen;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}results.push(this.sourceHtml.substring(startTagPos,endTagPos));}}var nextInstance=_$(results);nextInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;},parent:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx <=0)continue;var scanPos=idx-1;while (scanPos >=0){var openTagPos=this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos===-1)break;if (this.sourceHtml.charAt(openTagPos+1)!=='/'&&this.sourceHtml.charAt(openTagPos+1)!=='!'){var endOpenTag=this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag!==-1&&endOpenTag > openTagPos){var fullOpenTag=this.sourceHtml.substring(openTagPos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}if (endTagPos >=idx+elem.length){var parentBlock=this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock)===-1)results.push(parentBlock);break;}}}scanPos=openTagPos-1;}}var parentInstance=_$(results);parentInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;}};return instance;};