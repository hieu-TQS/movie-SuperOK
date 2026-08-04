var BASEURL = "https://www.whoreshub.com"; 
// https://www.whoreshub.com/categories/4k-porn/
function getManifest() {
    return JSON.stringify({
        "id": "whoreshub",
        "name": "XXX Whoreshub 4K",
        "description": "XXX 4K",
        "version": "1.0.1",
        "info": "Phim chất lượng cao, nên đôi khi tải hởi chậm. Bạn chờ tí nhé.",
        "baseUrl": "https://www.whoreshub.com",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "isEnabled": true,
        "type": "MOVIE",
     	 	"isAdult": true,
        "playerTpye": "exoplayer"
    })
};

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[gamomephim] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[gamomephim] " + msg);
    }
}

function getHomeSections() {
    var listurl = '[{\"link\":\"/categories/4k-porn/\",\"name\":\"Phim 4K\"}]';
    var menulist = buildMenu(listurl, true);
    return JSON.stringify(menulist);
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
// HELPER: CURSOR BASE64 ENCODE / DECODE
// =============================================================================
function getUrlList(slug, filtersJson) {
    log("urlList: " + slug);
    try {
        if (slug && slug.indexOf("http") > -1) {
            if (slug.indexOf("search") > -1) {
                if (filtersJson) {
                    var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
                    try {
                        var filters = JSON.parse(fixedJson);
                        var page = parseInt(filters.page) || 1;
                        if (page > 1) {
                            return slug + "?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&category_ids=&sort_by=&_=1784724639811&q=blacked&from_videos="+page+"&from_albums=" + page
                        } else {
                            return slug;
                        }
                    } catch (jsonErr) {
                        return slug;
                    }
                }
            }
            return slug;
        }
        
        var page = 1;
        var path = slug || "";
        
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
        
        var resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        if (page > 1) {
            resultUrl += page + "/";
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        console.log(e);
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/" + encodeURIComponent(keyword) + "/";
}
// https://www.whoreshub.com/search/blacked/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&category_ids=&sort_by=&_=1784724639811&q=blacked&from_videos=3&from_albums=3
// https://www.whoreshub.com/search/blacked/
// https://www.whoreshub.com/tags/threesome/
//var BASEURL = "https://www.whoreshub.com";
// JSON lỗi cú pháp (thiếu nháy kép) của bạn
//var filtersJson = '{page:11,category:[{"slug":"/movies?sort=year_desc&limit=24&category=18-plus","name":"Thiếu niên"}]}'; 
//var filtersJson = '{page:22}';
//console.log(getUrlList("https://www.whoreshub.com/search/blacked/", filtersJson));


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
        _$(html).find(".thumb").each(function() {
            var href = this.find(".item").attr("href");
            if (href.indexOf("http") == -1) {
                href = BASEURL + href;
            }
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("data-src");

            if (src.indexOf("//") === 0) {
                src = "https:" + src;
            } else if (src.indexOf("http") === -1) {
                src = BASEURL + src;
            }

            var episode_current = ""
            var quality = this.find(".is-hd").text();
            if (href && href.indexOf("http") > -1 && href.indexOf("videos") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');
                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "lang": "",
                    "episode_current": episode_current
                });
            }
        });
        
        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });
    } catch (e) {
        log("parseListResponse: " + e);
        return JSON.stringify({
            "items": [{
                "id": $url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

/*
var BASEURL = "https://narto-drama.com";
//var BASEAPI = "https://k8s.onflixcdn.com/api";
var htmlsource = $("#labHtmlEditorWrap #labHtmlTreeContainer .lab-dom-pure-text").html();
JSON.parse(parseListResponse(sourceHTML, BASEURL));
//var html = outerHTML;

*/



function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function attachRndToUrl(baseUrl) {
    if (!baseUrl) return '';
    
    // Tạo timestamp 13 chữ số tại thời điểm hiện tại
    const rnd = Date.now();
    
    // Đảm bảo URL kết thúc bằng '/' nếu chưa có (trước khi thêm query)
    let formattedUrl = baseUrl;
    if (!formattedUrl.includes('?') && !formattedUrl.endsWith('/')) {
        formattedUrl += '/';
    }

    // Nối tham số rnd vào URL
    const separator = formattedUrl.includes('?') ? '&' : '?';
    return `${formattedUrl}${separator}rnd=${rnd}`;
}

function parseScript(rawScript) {
    const result = {
        success: false,
        data: {},
        embedHtml: ''
    };

    // Kiểm tra đầu vào cơ bản
    if (!rawScript || typeof rawScript !== 'string') {
        return result;
    }

    try {
        // 1. Trích xuất hàm getEmbed nếu bạn cần dùng code iframe của họ
        const embedMatch = rawScript.match(/return\s+('(?:[^'\\]|\\.)*')/);
        if (embedMatch) {
            // Loại bỏ dấu nháy ở đầu/cuối chuỗi iframe được tìm thấy
            result.embedHtml = embedMatch[1].slice(1, -1);
        }

        // 2. Tìm phần nội dung bên trong dấu ngoặc nhọn của biến object (var xxxx = { ... })
        const objectContentMatch = rawScript.match(/var\s+\w+\s*=\s*\{([\s\S]*?)\};/);

        if (objectContentMatch) {
            const objectBody = objectContentMatch[1];

            // 3. Regex quét các cặp key: 'value' hoặc key: value (phòng khi họ bỏ dấu nháy cho số)
            // Group 1: Key, Group 2: Value dạng chuỗi có nháy, Group 3: Value không nháy (số/boolean)
            const pairRegex = /(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|([^,\s}]+))/g;
            let match;

            while ((match = pairRegex.exec(objectBody)) !== null) {
                const key = match[1];
                let value = match[2] !== undefined ? match[2] : match[3];

                // Nếu là chuỗi, xử lý các ký tự bị escape (ví dụ \' đổi lại thành ')
                if (match[2] !== undefined) {
                    value = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
                } else {
                    // Nếu là số hoặc boolean thuần (không nằm trong nháy) thì ép kiểu tương ứng
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;
                    else if (!isNaN(value)) value = Number(value);
                }

                result.data[key] = value;
            }

            // Đánh dấu thành công nếu lấy được dữ liệu
            if (Object.keys(result.data).length > 0) {
                result.success = true;
            }
        }
    } catch (error) {
        // Ghi nhận lỗi nội bộ ra console để debug nhưng KHÔNG làm sập script của bạn
        console.error("SafeParser Error:", error);
    }

    return result;
}

function parseMovieDetail(html, url) {
    try {
        // === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
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
        var status = "";
        var category = "";
        var episode_current = "";

        var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
      
            if (limg.indexOf("//") === 0) {
                limg = "https:" + limg;
            } else if (limg.indexOf("http") === -1) {
                limg = BASEURL + limg;
            }
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];
        var year = 2026;
        var extra = "";
        category = _$(html).find("h4:content('Categories')").closest("ul").find("a").textAll(" - ");
        episode_current = _$(html).find(".movie-sub").text();;
        var $objepi = "";
        var script = _$(html).find("script:content('getEmbed\(')").html();
        if (!script) {
            script = _$(html).find("script:content('flashvars')").html();
        }
        var $dataVD = parseScript(script);
        var servers = [];
        var episodes = [];
        var $rnd = $dataVD.data.rnd;
        if ($dataVD.data.video_alt_url3) {
            var link = $dataVD.data.video_alt_url3.replace(/[\s\S]*?http/i, "http");
            episodes.push({
                id: attachRndToUrl(link) + "#.m3u8",
                name: "HQ: " + $dataVD.data.video_alt_url3_text,
                slug: "hd3"
            })
        }
        if ($dataVD.data.video_alt_url2) {
            var link = $dataVD.data.video_alt_url2.replace(/[\s\S]*?http/i, "http");
            episodes.push({
                id: attachRndToUrl(link) + "#.m3u8",
                name: "HQ: " + $dataVD.data.video_alt_url2_text,
                slug: "hd2"
            })
        }
        if ($dataVD.data.video_alt_url) {
            var link = $dataVD.data.video_alt_url.replace(/[\s\S]*?http/i, "http");
            episodes.push({
                id: attachRndToUrl(link) + "#.m3u8",
                name: "HQ: " + $dataVD.data.video_alt_url_text,
                slug: "hd3"
            })
        }
        if ($dataVD.data.video_url) {
            var link = $dataVD.data.video_url.replace(/[\s\S]*?http/i, "http");
            episodes.push({
                id: attachRndToUrl(link) + "#.m3u8",
                name: "HQ: " + $dataVD.data.video_url_text,
                slug: "hd4"
            })
        }
        servers.push({
            name: "Server",
            episodes: episodes
        })
        // Tạo chuỗi mô tả ẩn JSON servers giống hệt tác giả
        // === BƯỚC 5: TRẢ VỀ KẾT QUẢ ĐỒNG NHẤT ID ===
        return JSON.stringify({
            id: id, // BẮT BUỘC: ID phải là slug rút gọn của bộ phim để cả 2 lần fetch khớp nhau
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: 8.5,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers, // Lần 1 (trang chi tiết) sẽ là []. Lần 2 (khi chạy qua extra) sẽ có đầy đủ tập
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || "",
            extra: extra // Lần 2 (trang xem phim) extra sẽ rỗng để dừng chu kỳ tải ngầm
        });

    } catch (e) {
        log("parseMovieDetail:" + e)
        return JSON.stringify({
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}
/*
// https://edge.narto-drama.com/e/rs/detail/watch/tro-choi-cong-so/9/refresh-source?lang=vi-VN


BASEURL = "https://phimnganhdc.com";
var html = sourceHTML;
var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
JSON.parse(parseMovieDetail(outerHTML, $url));
// https://edge.narto-drama.com/e/rs/detail/watch/tro-choi-cong-so/check-new-episodes?_t=1784684483895&_=1784684480875
*/

function parseDetailResponse(html, url) {
    try {
        return JSON.stringify({
            "url": "",
            "isEmbed": false, // Chuyển về false để ưu tiên ExoPlayer native
            "mimeType": "application/x-mpegURL", // Dùng biến mimeType đã xử lý
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        log("stream error: " + e);
        return JSON.stringify({
            "url": "",
            "headers": {}
        });
    }
}


function sortEpisodesByName(data) {
    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var matchA = a.name.match(/Tập\s*(\d+)/i);
                var matchB = b.name.match(/Tập\s*(\d+)/i);
                var numA = matchA ? parseInt(matchA[1], 10) : 0;
                var numB = matchB ? parseInt(matchB[1], 10) : 0;
                return numA - numB;
            });
        }
    });
    return data;
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// https://www.whoreshub.com/tags/solo/

function getLISTmenu() {
    return `[{\"link\":\"/categories/ai/\",\"name\":\"Ai\"},{\"link\":\"/categories/4k-porn/\",\"name\":\"4K Porn\"},{\"link\":\"/tags/solo/\",\"name\":\"solo\"},{\"link\":\"/tags/hardcore/\",\"name\":\"hardcore\"},{\"link\":\"/tags/lesbian/\",\"name\":\"lesbian\"},{\"link\":\"/tags/teen/\",\"name\":\"teen\"},{\"link\":\"/tags/9bf0cd6bf76106c1d87b93939cf483d3/\",\"name\":\"-\"},{\"link\":\"/tags/webcam/\",\"name\":\"webcam\"},{\"link\":\"/tags/blowjob/\",\"name\":\"blowjob\"},{\"link\":\"/tags/bigass/\",\"name\":\"bigass\"},{\"link\":\"/tags/fetish/\",\"name\":\"fetish\"},{\"link\":\"/tags/sex2/\",\"name\":\"sex\"},{\"link\":\"/tags/fuck/\",\"name\":\"fuck\"},{\"link\":\"/tags/missionary/\",\"name\":\"missionary\"},{\"link\":\"/tags/deepthroat/\",\"name\":\"deepthroat\"},{\"link\":\"/tags/blonde/\",\"name\":\"blonde\"},{\"link\":\"/tags/threesome/\",\"name\":\"threesome\"},{\"link\":\"/tags/pov/\",\"name\":\"pov\"},{\"link\":\"/tags/small-tits/\",\"name\":\"small tits\"},{\"link\":\"/tags/big-tits/\",\"name\":\"big tits\"},{\"link\":\"/tags/pawg/\",\"name\":\"pawg\"},{\"link\":\"/tags/fingering/\",\"name\":\"fingering\"},{\"link\":\"/tags/babe/\",\"name\":\"babe\"},{\"link\":\"/tags/facial/\",\"name\":\"facial\"},{\"link\":\"/tags/big-ass/\",\"name\":\"big ass\"},{\"link\":\"/tags/vr/\",\"name\":\"vr\"},{\"link\":\"/tags/porn/\",\"name\":\"porn\"},{\"link\":\"/tags/pussy/\",\"name\":\"pussy\"},{\"link\":\"/tags/cumshot/\",\"name\":\"cumshot\"},{\"link\":\"/tags/shemale/\",\"name\":\"shemale\"},{\"link\":\"/tags/brunette/\",\"name\":\"brunette\"},{\"link\":\"/tags/latin/\",\"name\":\"latin\"},{\"link\":\"/tags/busty/\",\"name\":\"busty\"},{\"link\":\"/tags/creampie/\",\"name\":\"creampie\"},{\"link\":\"/tags/big-cock/\",\"name\":\"big cock\"},{\"link\":\"/tags/bbc2/\",\"name\":\"bbc\"},{\"link\":\"/tags/milf/\",\"name\":\"milf\"},{\"link\":\"/tags/latina/\",\"name\":\"latina\"},{\"link\":\"/tags/asian/\",\"name\":\"asian\"},{\"link\":\"/tags/ass/\",\"name\":\"ass\"},{\"link\":\"/tags/mature/\",\"name\":\"mature\"},{\"link\":\"/tags/anal/\",\"name\":\"anal\"},{\"link\":\"/tags/doggystyle/\",\"name\":\"doggystyle\"},{\"link\":\"/tags/petite/\",\"name\":\"petite\"},{\"link\":\"/tags/masturbation/\",\"name\":\"masturbation\"},{\"link\":\"/tags/xxx/\",\"name\":\"xxx\"},{\"link\":\"/tags/interracial/\",\"name\":\"interracial\"},{\"link\":\"/tags/amateur/\",\"name\":\"amateur\"},{\"link\":\"/tags/big-dick/\",\"name\":\"big dick\"},{\"link\":\"/tags/lingerie/\",\"name\":\"lingerie\"},{\"link\":\"/tags/oral/\",\"name\":\"oral\"},{\"link\":\"/tags/handjob/\",\"name\":\"handjob\"},{\"link\":\"/tags/\",\"name\":\"Show All Tags\"}]`  
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




function _$(htmlOrBlock){ if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) { return htmlOrBlock; } var instance = { sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '', elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []), length: 0, find: function (selector) { if (selector.indexOf(',') !== -1) { var results = []; var selectors = selector.split(',').map(function (s) { return s.trim(); }); for (var s = 0; s < selectors.length; s++) { if (selectors[s] === "") continue; var subInstance = this.find(selectors[s]); for (var r = 0; r < subInstance.elements.length; r++) { var element = subInstance.elements[r]; if (results.indexOf(element) === -1) { results.push(element); } } } var multiInstance = _$(results); multiInstance.sourceHtml = this.sourceHtml; return multiInstance; } var results = []; var contentFilter = ""; if (selector.indexOf(":content(") !== -1) { var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/); if (contentMatch) { contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || ""; selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, ""); } } var attrNameFilter = ""; var attrValueFilter = ""; var attrOperator = "="; var hasAttrFilter = false; var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/); if (attrMatch) { hasAttrFilter = true; attrNameFilter = attrMatch[1]; attrOperator = attrMatch[2]; attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || ""; selector = selector.replace(/\[.*?\]/, ""); } var notSelector = ""; if (selector.indexOf(":not(") !== -1) { var notMatch = selector.match(/:not\(([^)]+)\)/); if (notMatch) { notSelector = notMatch[1]; selector = selector.replace(/:not\([^)]+\)/, ""); } } var isFirstFilter = selector.indexOf(":first") !== -1; var isLastFilter = selector.indexOf(":last") !== -1; selector = selector.replace(/:first|:last/g, ""); var targetTagName = ""; var targetId = ""; var targetClasses = []; var selectorToParse = selector.trim(); if (selectorToParse !== "") { var idIndex = selectorToParse.indexOf('#'); if (idIndex !== -1) { var afterId = selectorToParse.substring(idIndex + 1); var nextDot = afterId.indexOf('.'); targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot); selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1)); } var classParts = selectorToParse.split('.'); var possibleTag = classParts.shift(); if (possibleTag) { targetTagName = possibleTag.toLowerCase(); } targetClasses = classParts.filter(function (c) { return c.length > 0; }); } for (var i = 0; i < this.elements.length; i++) { var currentHtml = this.elements[i]; var pos = 0; var subResults = []; while ((pos = currentHtml.indexOf('<', pos)) !== -1) { if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; } var endOpenTag = -1; var insideQuote = false; var quoteChar = ''; for (var j = pos + 1; j < currentHtml.length; j++) { var char = currentHtml.charAt(j); if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') { if (!insideQuote) { insideQuote = true; quoteChar = char; } else if (char === quoteChar) { insideQuote = false; } } if (char === '>' && !insideQuote) { endOpenTag = j; break; } } if (endOpenTag === -1) break; var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1); var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/); var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : ""; var isMatched = true; if (targetTagName && targetTagName !== currentTagName) { isMatched = false; } var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : ""; var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : ""; if (isMatched && targetId && idMatchStr !== targetId) { isMatched = false; } if (isMatched && targetClasses.length > 0) { if (classMatchStr) { var currentClasses = classMatchStr.trim().split(/\s+/); for (var c = 0; c < targetClasses.length; c++) { if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; } } } else { isMatched = false; } } if (isMatched && hasAttrFilter) { var actualValue = ""; if (attrNameFilter === "class") { actualValue = classMatchStr; } else if (attrNameFilter === "id") { actualValue = idMatchStr; } else { var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : ""; } var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1; if (!attrExists) { isMatched = false; } else { if (attrOperator === "=") { if (attrNameFilter === "class") { var classes = actualValue.trim().split(/\s+/); if (classes.indexOf(attrValueFilter) === -1) isMatched = false; } else if (actualValue !== attrValueFilter) { isMatched = false; } } else if (attrOperator === "*=") { if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false; } else if (attrOperator === "^=") { if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false; } else if (attrOperator === "$=") { if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false; } } } if (isMatched) { var startTagPos = pos; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = currentHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = currentHtml.length; } } var foundBlock = currentHtml.substring(startTagPos, endTagPos); if (contentFilter) { var pureText = ""; if (currentTagName === "script" || currentTagName === "style") { var innerStart = foundBlock.indexOf('>') + 1; var innerEnd = foundBlock.search(/<\/(?:script|style)/i); pureText = innerEnd !== -1 ? foundBlock.substring(innerStart, innerEnd) : foundBlock.substring(innerStart); } else { pureText = foundBlock.replace(/<[^>]+>/g, "").trim(); } var keywords = contentFilter.split('|'); var isContentMatched = false; for (var k = 0; k < keywords.length; k++) { if (pureText.indexOf(keywords[k].trim()) !== -1) { isContentMatched = true; break; } } if (!isContentMatched) { pos = endTagPos; continue; } } if (notSelector) { var isNotClass = notSelector.indexOf('.') === 0; var isNotId = notSelector.indexOf('#') === 0; var notValue = notSelector.substring(1); var hasNot = false; if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true; if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true; if (!hasNot) subResults.push(foundBlock); } else { subResults.push(foundBlock); } pos = endTagPos; } else { pos++; } } if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]]; if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]]; results = results.concat(subResults); } var newInstance = _$(results); newInstance.sourceHtml = this.sourceHtml || currentHtml; return newInstance; }, each: function (callback) { for (var i = 0; i < this.elements.length; i++) { var childInstance = _$(this.elements[i]); childInstance.sourceHtml = this.sourceHtml; callback.call(childInstance, i, this.elements[i]); } return this; }, eq: function (index) { if (index < 0) index = this.elements.length + index; var matchedElement = this.elements[index]; this.elements = matchedElement ? [matchedElement] : []; this.length = this.elements.length; return this; }, attr: function (attrName) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : ""; }, html: function () { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var matchClose = elem.match(/<\/([a-zA-Z0-9_-]+)\s*>\s*$/i); if (matchClose) { var end = elem.lastIndexOf(matchClose[0]); if (start > 0 && end >= start) return elem.substring(start, end); } return start > 0 ? elem.substring(start) : ""; }, text: function (separator) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); if (typeof separator === 'string') { return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(separator); } return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); } return ""; }, textAll: function (separator) { if (this.elements.length === 0) return ""; var sep = typeof separator === 'string' ? separator : " "; var allTexts = []; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); var cleanText = pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); if (cleanText !== '') { allTexts.push(cleanText); } } } return allTexts.join(sep); }, next: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx === -1) continue; var scanPos = idx + elem.length; var nextOpen = this.sourceHtml.indexOf('<', scanPos); if (nextOpen !== -1) { if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue; var endOpenTag = this.sourceHtml.indexOf('>', nextOpen); if (endOpenTag === -1) continue; var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var startTagPos = nextOpen; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = this.sourceHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = this.sourceHtml.length; } } results.push(this.sourceHtml.substring(startTagPos, endTagPos)); } } var nextInstance = _$(results); nextInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, parent: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx <= 0) continue; var scanPos = idx - 1; while (scanPos >= 0) { var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos); if (openTagPos === -1) break; if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') { var endOpenTag = this.sourceHtml.indexOf('>', openTagPos); if (endOpenTag !== -1 && endOpenTag > openTagPos) { var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var closeRegex = new RegExp('</' + currentTagName + '\\s*>', 'i'); var subHtml = this.sourceHtml.substring(endOpenTag + 1); var matchClose = subHtml.match(closeRegex); if (matchClose) { endTagPos = endOpenTag + 1 + matchClose.index + matchClose[0].length; } else { endTagPos = this.sourceHtml.length; } } if (endTagPos >= idx + elem.length) { var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos); if (results.indexOf(parentBlock) === -1) results.push(parentBlock); break; } } } scanPos = openTagPos - 1; } } var parentInstance = _$(results); parentInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, closest: function (selector) { var results = []; if (!this.sourceHtml || this.elements.length === 0) return _$([]); for (var i = 0; i < this.elements.length; i++) { var currentElem = this.elements[i]; var currentObj = _$(currentElem); currentObj.sourceHtml = this.sourceHtml; var selfCheck = _$(this.sourceHtml).find(selector); var isSelfMatched = false; for (var s = 0; s < selfCheck.elements.length; s++) { if (selfCheck.elements[s] === currentElem) { isSelfMatched = true; break; } } if (isSelfMatched) { if (results.indexOf(currentElem) === -1) results.push(currentElem); continue; } var parentObj = currentObj.parent(); while (parentObj.elements.length > 0) { var parentElem = parentObj.elements[0]; var checkMatch = _$(this.sourceHtml).find(selector); var isMatched = false; for (var j = 0; j < checkMatch.elements.length; j++) { if (checkMatch.elements[j] === parentElem) { isMatched = true; break; } } if (isMatched) { if (results.indexOf(parentElem) === -1) results.push(parentElem); break; } parentObj = parentObj.parent(); } } var closestInstance = _$(results); closestInstance.sourceHtml = this.sourceHtml; return closestInstance; } }; instance.length = instance.elements.length; return instance; };