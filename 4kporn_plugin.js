BASEURL = "https://www.freepornvideos.xxx";

function getManifest() {
    return JSON.stringify({
        "id": "4kporn",
        "name": "Phim XXX 4K",
        "description": "XXX siêu nét chất lượng 4K.",
        "version": "1.5.6",
        "BASEURL": "https://www.freepornvideos.xxx",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "info": "Nguồn phim chất lượng 4K nên load hơi lâu, bạn chịu khó đợi tí nha.",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    var baseUrl = typeof BASEURL !== 'undefined' ? BASEURL : "";
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[" + baseUrl + "] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[" + baseUrl + "] " + msg);
    }
}

// https://www.freepornvideos.xxx/latest-updates/3/
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/latest-updates/", "title": "Phim Mới", "type": "Grid" },
        { "slug": "/top-rated/", "title": "Đánh Giá Cao", "type": "Grid" },
        { "slug": "/most-popular/", "title": "Phổ Biến Nhất", "type": "Grid" }
    ]);
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
    try {
        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].id || "";
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        if (!path) {
            path = "/latest-updates/";
        }

        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            fullUrl = BASEURL + (fullUrl.charAt(0) === '/' ? fullUrl : '/' + fullUrl);
        }

        if (fullUrl.indexOf("?") !== -1) {
            var qIdx = fullUrl.indexOf("?");
            fullUrl = fullUrl.substring(0, qIdx);
        }

        if (fullUrl.slice(-1) === '/') {
            fullUrl = fullUrl.slice(0, -1);
        }

        if (page > 1) {
            return fullUrl + "/" + page + "/";
        }
        return fullUrl + "/";
    } catch (e) {
        log(e);
        return BASEURL + "/latest-updates/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var encodedKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
        var resultUrl = BASEURL + "/search/" + encodedKeyword + "/";
        if (page > 1) {
            resultUrl += page + "/";
        }
        return resultUrl;
    } catch (e) {
        log(e);
        return BASEURL + "/search/" + encodeURIComponent(keyword || "") + "/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + (slug.charAt(0) === '/' ? slug : '/' + slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        var items = [];
        var itemRegex = /<div class="item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var block = match[1];
            var aMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*title="([^"]*)"/i) ||
                         block.match(/<a[^>]+title="([^"]*)"[^>]*href="([^"]+)"/i);
            var imgMatch = block.match(/<img[^>]+src="([^"]+)"/i) ||
                           block.match(/<img[^>]+data-src="([^"]+)"/i);
            var altMatch = block.match(/<img[^>]+alt="([^"]*)"/i);
            var durMatch = block.match(/<span class="duration">([\s\S]*?)<\/span>/i);
            var is4k = block.indexOf('class="k4"') !== -1;

            var href = "";
            var title = "";
            if (aMatch) {
                if (aMatch[1].indexOf("http") !== -1 || aMatch[1].indexOf("/") === 0) {
                    href = aMatch[1];
                    title = aMatch[2] || "";
                } else {
                    title = aMatch[1] || "";
                    href = aMatch[2] || "";
                }
            }

            if (!title && altMatch) {
                title = altMatch[1];
            }

            var src = imgMatch ? imgMatch[1] : "";
            var duration = durMatch ? durMatch[1].replace(/Full\s*Video/i, '').replace(/<[^>]+>/g, '').trim() : "";
            var quality = is4k ? "4K UHD" : "1080p";

            if (href) {
                if (href.indexOf("http") === -1) {
                    href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
                }
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "lang": "",
                    "episode_current": duration || quality
                });
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": 1, "totalPages": 999 }
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            "items": [{ "id": $url || "", "title": "Lỗi: " + e, "posterUrl": "", "backdropUrl": "" }],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, url) {
    var lurl = url || "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var duration = "";
    var servers = [];
    var category = "";
    var cast = "";
    var direc = "";

    function cleanUrl(u) {
        if (!u) return "";
        var str = u.replace(/&amp;/gi, '&').replace(/\\\//g, '/').replace(/\\/g, '').trim();
        str = str.replace(/^["']|["']$/g, '');
        if (str.indexOf("//") === 0) {
            str = "https:" + str;
        } else if (str.indexOf("http") !== 0 && str.length > 0) {
            str = BASEURL + (str.charAt(0) === '/' ? str : '/' + str);
        }
        return str;
    }

    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
                      /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        if (idMatch && idMatch[1]) {
            lurl = idMatch[1];
        }

        var imgMatch = /<meta\s+property="og:image"\s+content="([^"]+)"/i.exec(html);
        if (imgMatch && imgMatch[1]) {
            limg = cleanUrl(imgMatch[1]);
        }

        var titleMatch = /<meta\s+property="og:title"\s+content="([^"]+)"/i.exec(html) ||
                         /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) ||
                         /<title>([^<]+)/i.exec(html);
        if (titleMatch && titleMatch[1]) {
            lname = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        }

        var descMatch = /<meta\s+property="og:description"\s+content="([^"]+)"/i.exec(html) ||
                        /<meta\s+name="description"\s+content="([^"]+)"/i.exec(html);
        if (descMatch && descMatch[1]) {
            ldes = descMatch[1].trim();
        }

        // Models / Cast
        var models = [];
        var modelRegex = /href="https:\/\/www\.freepornvideos\.xxx\/models\/[^"]+\/"[^>]*>([\s\S]*?)<\/a>/gi;
        var mMatch;
        while ((mMatch = modelRegex.exec(html)) !== null) {
            var mName = mMatch[1].replace(/<[^>]+>/g, '').trim();
            if (mName && models.indexOf(mName) === -1) {
                models.push(mName);
            }
        }
        if (models.length > 0) {
            cast = models.join(", ");
        }

        var studioMatch = html.match(/href="https:\/\/www\.freepornvideos\.xxx\/(?:[a-z]{2}\/)?sites\/[^"]+\/"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
        if (studioMatch && studioMatch[1]) {
            direc = studioMatch[1].trim();
        }

        // Categories / Tags
        var catMatches = html.match(/href="https:\/\/www\.freepornvideos\.xxx\/categories\/[^"]+\/"[^>]*>([^<]+)<\/a>/gi) || [];
        var cats = [];
        for (var c = 0; c < catMatches.length; c++) {
            var cm = catMatches[c].match(/>([^<]+)<\/a>/i);
            if (cm && cm[1]) cats.push(cm[1].trim());
        }
        if (cats.length > 0) {
            category = cats.join(", ");
        }

        // Video sources parsing
        var epi = [];
        var seenUrls = {};

        // 1. Parse all <source ...> tags
        var sourceRegex = /<source\b([^>]+)>/gi;
        var sMatch;
        while ((sMatch = sourceRegex.exec(html)) !== null) {
            var attrs = sMatch[1];
            var srcM = attrs.match(/src=['"]([^'"]+)['"]/i) || attrs.match(/src=([^\s>]+)/i);
            if (srcM && srcM[1]) {
                var vUrl = cleanUrl(srcM[1]);
                if (vUrl && !seenUrls[vUrl]) {
                    seenUrls[vUrl] = true;
                    var labelM = attrs.match(/label=['"]([^'"]+)['"]/i) ||
                                 attrs.match(/title=['"]([^'"]+)['"]/i) ||
                                 attrs.match(/res=['"]([^'"]+)['"]/i);
                    var label = labelM ? labelM[1] : "";
                    if (!label) {
                        var qM = vUrl.match(/(\d{3,4}p)/i);
                        label = qM ? qM[1] : "HD";
                    }
                    epi.push({
                        id: vUrl,
                        name: "Độ Phân Giải " + label,
                        slug: label.toLowerCase()
                    });
                }
            }
        }

        // 2. Parse <video ... src="..."> tags
        if (epi.length === 0) {
            var videoRegex = /<video\b[^>]+src=['"]([^'"]+)['"]/gi;
            var vMatch;
            while ((vMatch = videoRegex.exec(html)) !== null) {
                var vUrl2 = cleanUrl(vMatch[1]);
                if (vUrl2 && !seenUrls[vUrl2]) {
                    seenUrls[vUrl2] = true;
                    epi.push({
                        id: vUrl2,
                        name: "Server Standard",
                        slug: "standard"
                    });
                }
            }
        }

        // 3. Parse JS object properties (video_url, file, url, get_file)
        if (epi.length === 0) {
            var jsMp4Regex = /(?:video_url|video_alt_url|file|url)["']?\s*:\s*["']([^"']+\.mp4[^"']*)["']/gi;
            var jsMatch;
            var idx = 1;
            while ((jsMatch = jsMp4Regex.exec(html)) !== null) {
                var vUrl3 = cleanUrl(jsMatch[1]);
                if (vUrl3 && !seenUrls[vUrl3]) {
                    seenUrls[vUrl3] = true;
                    var qM3 = vUrl3.match(/(\d{3,4}p)/i);
                    var label3 = qM3 ? qM3[1] : ("Server " + idx);
                    epi.push({
                        id: vUrl3,
                        name: "Độ Phân Giải " + label3,
                        slug: label3.toLowerCase()
                    });
                    idx++;
                }
            }
        }

        // 4. Direct mp4 URL regex fallback
        if (epi.length === 0) {
            var directMp4Regex = /https?:\/\/[^\s"'<>]+?\.(?:mp4|m3u8)(?:\?[^\s"'<>]*)?/gi;
            var dMatch;
            var idx2 = 1;
            while ((dMatch = directMp4Regex.exec(html)) !== null) {
                var vUrl4 = cleanUrl(dMatch[0]);
                if (vUrl4 && !seenUrls[vUrl4] && vUrl4.indexOf("/preview/") === -1 && vUrl4.indexOf("thumbs") === -1) {
                    seenUrls[vUrl4] = true;
                    var qM4 = vUrl4.match(/(\d{3,4}p)/i);
                    var label4 = qM4 ? qM4[1] : ("Link " + idx2);
                    epi.push({
                        id: vUrl4,
                        name: "Độ Phân Giải " + label4,
                        slug: label4.toLowerCase()
                    });
                    idx2++;
                }
            }
        }

        // 5. Fallback to detail page URL if no direct video found
        if (epi.length === 0 && lurl) {
            epi.push({
                id: lurl,
                name: "Server Default",
                slug: "default"
            });
        }

        if (epi.length > 0) {
            servers.push({
                name: "4K PORN",
                episodes: epi
            });
        }

        return JSON.stringify({
            id: lurl,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "4K/HD",
            year: year,
            status: "Full",
            duration: duration || "N/A",
            casts: cast || "N/A",
            director: direc || "N/A",
            country: "",
            category: category,
            lang: ""
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            id: lurl,
            title: "error: " + e,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var cleanHtml = (html && typeof html === 'string') ? html.replace(/\\\//g, '/').replace(/&amp;/gi, '&') : '';
        var streamlink = "";

        function isDirectMediaUrl(u) {
            if (!u || typeof u !== 'string') return false;
            var lower = u.toLowerCase();
            return lower.indexOf('.mp4') !== -1 ||
                   lower.indexOf('.m3u8') !== -1 ||
                   lower.indexOf('get_file') !== -1 ||
                   lower.indexOf('video_url') !== -1 ||
                   lower.indexOf('/get_video/') !== -1;
        }

        function sanitizeUrl(u) {
            if (!u) return "";
            var str = u.replace(/&amp;/gi, '&').replace(/\\\//g, '/').replace(/\\/g, '').trim();
            str = str.replace(/^["']|["']$/g, '');
            if (str.indexOf("//") === 0) {
                str = "https:" + str;
            } else if (str.indexOf("http") !== 0 && str.length > 0) {
                str = BASEURL + (str.charAt(0) === '/' ? str : '/' + str);
            }
            return str;
        }

        // If url is passed and is a direct media URL
        if (url && typeof url === 'string' && isDirectMediaUrl(url)) {
            streamlink = sanitizeUrl(url);
        }

        // If streamlink is not direct media URL, try parsing html
        if (!streamlink && cleanHtml) {
            var srcMatch = cleanHtml.match(/<source\b[^>]*src=['"]([^'"]+)['"]/i);
            if (srcMatch && srcMatch[1]) {
                streamlink = sanitizeUrl(srcMatch[1]);
            }
        }

        if (!streamlink && cleanHtml) {
            var fileMatch = cleanHtml.match(/["'](?:file|video_url|url)["']\s*:\s*["']([^"']+)["']/i);
            if (fileMatch && fileMatch[1]) {
                streamlink = sanitizeUrl(fileMatch[1]);
            }
        }

        if (!streamlink && cleanHtml) {
            var mp4Match = cleanHtml.match(/https?:\/\/[^\s"'<>]+?\.(?:mp4|m3u8)(?:\?[^\s"'<>]*)?/i);
            if (mp4Match) {
                streamlink = sanitizeUrl(mp4Match[0]);
            }
        }

        if (!streamlink && cleanHtml) {
            var getFileMatch = cleanHtml.match(/https?:\/\/[^\s"'<>]+\/get_file\/[^\s"'<>]+/i);
            if (getFileMatch) {
                streamlink = sanitizeUrl(getFileMatch[0]);
            }
        }

        if (!streamlink && url) {
            streamlink = sanitizeUrl(url);
        }

        var isEmbed = false;
        var lowerStream = streamlink.toLowerCase();
        if (!isDirectMediaUrl(streamlink)) {
            isEmbed = true;
        }

        var mimeType = "video/mp4";
        if (lowerStream.indexOf(".m3u8") !== -1) {
            mimeType = "application/x-mpegURL";
        }

        return JSON.stringify({
            "url": streamlink,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "headers": {} });
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
}function _$(htmlOrBlock){if (htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock;}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){var results=[];var contentFilter="";if (selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}}var attrNameFilter="";var attrValueFilter="";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrValueFilter=attrMatch[2]||attrMatch[3]||attrMatch[4]||"";selector=selector.replace(/\[.*?\]/,"");}var notSelector="";if (selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if (notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"");}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var isClass=selector.indexOf('.')===0;var isId=selector.indexOf('#')===0;var isAttrOnly=(selector===""&&hasAttrFilter);var targetClasses=[];var targetId="";var targetTagName="";if (isClass){targetClasses=selector.split('.').filter(function(c){return c.length > 0;});}else if (isId){targetId=selector.substring(1);}else if (!isAttrOnly){targetTagName=selector.toLowerCase();}for (var i=0;i < this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while ((pos=currentHtml.indexOf('<',pos))!==-1){if (currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue;}var endOpenTag=currentHtml.indexOf('>',pos);if (endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName="";if (spacePos===-1){currentTagName=fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase();}else{currentTagName=fullOpenTag.substring(1,spacePos).toLowerCase();}var isMatched=false;if (isClass){var classMatchStr="";var classPos=fullOpenTag.indexOf('class="');if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{classPos=fullOpenTag.indexOf("class='");if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (classMatchStr){var currentClasses=classMatchStr.split(/\s+/);var matchCount=0;for (var c=0;c < targetClasses.length;c++){if (currentClasses.indexOf(targetClasses[c])!==-1)matchCount++;}if (matchCount===targetClasses.length)isMatched=true;}}else if (isId){var idMatchStr="";var idPos=fullOpenTag.indexOf('id="');if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{idPos=fullOpenTag.indexOf("id='");if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (idMatchStr===targetId)isMatched=true;}else if (isAttrOnly){isMatched=true;}else{if (currentTagName===targetTagName)isMatched=true;}if (isMatched&&hasAttrFilter){var searchStr1=attrNameFilter+'="'+attrValueFilter+'"';var searchStr2=attrNameFilter+"='"+attrValueFilter+"'";if (fullOpenTag.indexOf(searchStr1)===-1&&fullOpenTag.indexOf(searchStr2)===-1){isMatched=false;}}if (isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&scanPos < currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if (nextClose===-1){scanPos=currentHtml.length;break;}if (nextOpen!==-1&&nextOpen < nextClose){depth++;scanPos=nextOpen+openStr.length;}else{depth--;scanPos=nextClose+closeStr.length;if (depth===0)endTagPos=nextClose+closeStr.length;}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if (contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue;}}if (notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if (isNotClass&&fullOpenTag.indexOf('class="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (isNotId&&fullOpenTag.indexOf('id="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (!hasNot)subResults.push(foundBlock);}else{subResults.push(foundBlock);}pos=endTagPos;}else{pos++;}}if (isFirstFilter&&subResults.length > 0)subResults=[subResults[0]];if (isLastFilter&&subResults.length > 0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults);}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance;},each:function(callback){for (var i=0;i < this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i]);}return this;},eq:function(index){if (index < 0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this;},attr:function(attrName){if (this.elements.length===0)return "";var elem=this.elements[0];var searchStr=attrName+'="';var pos=elem.indexOf(searchStr);if (pos===-1){searchStr=attrName+"='";pos=elem.indexOf(searchStr);}if (pos===-1)return "";var start=pos+searchStr.length;var quoteType=elem.charAt(start-1);var end=elem.indexOf(quoteType,start);return end===-1?"":elem.substring(start,end);},html:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start)return elem.substring(start,end);return "";},text:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start){var content=elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();}return "";},next:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx===-1)continue;var scanPos=idx+elem.length;var nextOpen=this.sourceHtml.indexOf('<',scanPos);if (nextOpen!==-1){if (this.sourceHtml.charAt(nextOpen+1)==='/') continue;var endOpenTag=this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag===-1)continue;var fullOpenTag=this.sourceHtml.substring(nextOpen,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos=nextOpen;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}results.push(this.sourceHtml.substring(startTagPos,endTagPos));}}var nextInstance=_$(results);nextInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;},parent:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx <=0)continue;var scanPos=idx-1;while (scanPos >=0){var openTagPos=this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos===-1)break;if (this.sourceHtml.charAt(openTagPos+1)!=='/'&&this.sourceHtml.charAt(openTagPos+1)!=='!'){var endOpenTag=this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag!==-1&&endOpenTag > openTagPos){var fullOpenTag=this.sourceHtml.substring(openTagPos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}if (endTagPos >=idx+elem.length){var parentBlock=this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock)===-1)results.push(parentBlock);break;}}}scanPos=openTagPos-1;}}var parentInstance=_$(results);parentInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;}};return instance;};
