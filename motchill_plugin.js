BASEURL = "https://motchillm.fm";

function getManifest() {
    return JSON.stringify({
        "id": "motchill",
        "name": "Nguồn Phim Motchill",
        "description": "Motchill Trang Xem Phim.",
        "version": "1.0.0",
        "baseUrl": "https://motchillm.fm",
        "iconUrl": "https://motchillu.app/motchill.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[motchill] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[motchill] " + msg);
    }
}

function httpGet(url) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            return String(com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE.fetchContentString(url, null) || "");
        }
    } catch(e) {}
    return "";
}

// =============================================================================
// SECTIONS & MENUS
// =============================================================================

function getHomeSections() {
    var listurl = `
/danh-sach@@Phim Mới@@true
`;
    var menulist = buildMenu(listurl);
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
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            if (slug.indexOf("search") > -1 && filtersJson) {
                var fixedJson1 = filtersJson
                    .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    .replace(/:,/g, ':');
                try {
                    var filtersSearch = JSON.parse(fixedJson1);
                    var pageSearch = parseInt(filtersSearch.page) || 1;

                    if (pageSearch > 1) {
                        var keywordMatch = slug.match(/\?q=([^&]+)/i);
                        if (keywordMatch && keywordMatch[1]) {
                            var searchPageUrl = BASEURL + "/search/" + pageSearch + "?q=" + keywordMatch[1];
                            return searchPageUrl.replace(/([^:]\/)\/+/g, "$1");
                        }
                    }
                } catch (jsonErr) {}
            }
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

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
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }
        if (page > 1) {
            resultUrl += "/" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = BASEURL + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;

        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL;

        if (page > 1) {
            resultUrl += "/search/" + page + "?q=" + encodedKeyword;
        } else {
            resultUrl += "/search?q=" + encodedKeyword;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        var fallback = BASEURL + "/search?q=" + encodeURIComponent(keyword || "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + (slug.indexOf('/') === 0 ? slug : "/" + slug);
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
        var seen = {};
        
        var linkRegex = /<a\s+[^>]*href="([^"]*\/phim\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(html)) !== null) {
            var href = m[1];
            if (seen[href]) continue;
            seen[href] = true;
            
            var fullTag = m[0];
            var inner = m[2];
            
            var title = "";
            var titleMatch = fullTag.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            if (titleMatch) title = titleMatch[1].trim();
            if (!title) continue;
            
            var src = "";
            var srcMatch = inner.match(/src="([^"]+)"/i);
            if (srcMatch) src = srcMatch[1].trim().replace(/&amp;/g, '&');
            if (src && src.indexOf('http') !== 0) {
                src = BASEURL + (src.indexOf('/') === 0 ? src : '/' + src);
            }
            
            if (href.indexOf('http') !== 0) {
                href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
            }
            
            var quality = "";
            var qMatch = inner.match(/class="[^"]*top-0\s+right-1[^"]*"[^>]*>([^<]+)</i) || inner.match(/class="[^"]*bg-yellow-500[^"]*"[^>]*>([^<]+)</i);
            if (qMatch) quality = qMatch[1].trim();
            
            var lang = "";
            var lMatch = inner.match(/class="[^"]*top-0\s+left-1[^"]*"[^>]*>([^<]+)</i);
            if (lMatch) lang = lMatch[1].trim();
            
            var current = "";
            var cMatch = inner.match(/class="[^"]*bottom-1[^"]*"[^>]*>([^<]+)</i);
            if (cMatch) current = cMatch[1].trim();
            
            items.push({
                id: href,
                title: title,
                posterUrl: src,
                backdropUrl: src,
                quality: quality,
                lang: lang,
                episode_current: current
            });
        }
        
        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 999
            }
        });
        
    } catch (e) {
        log(e);
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseEpisodesFromHtml(html) {
    var servers = [];
    var serverMap = {};
    
    var unescaped = (html || "").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    
    var epRegex = /"server"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"slug"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"\s*,\s*"link"\s*:\s*"([^"]+)"/gi;
    var m;
    while ((m = epRegex.exec(unescaped)) !== null) {
        var sName = m[1].trim();
        var epName = m[2].trim();
        var epSlug = m[3].trim();
        var epType = m[4].trim();
        var epLink = m[5].trim().replace(/\\\//g, '/');
        
        if (!epLink || (epLink.indexOf('http://') !== 0 && epLink.indexOf('https://') !== 0)) continue;
        
        if (!serverMap[sName]) serverMap[sName] = {};
        
        if (!serverMap[sName][epSlug] || epType === 'm3u8') {
            serverMap[sName][epSlug] = {
                id: epLink,
                name: epName,
                slug: epSlug
            };
        }
    }
    
    for (var sName in serverMap) {
        var epObj = serverMap[sName];
        var eps = Object.keys(epObj).map(function(k) { return epObj[k]; });
        if (eps.length > 0) {
            servers.push({
                name: sName,
                episodes: eps
            });
        }
    }
    
    return servers;
}

function transformMovieData(data) {
    var servers = [];
    if (!data || !data.servers) return servers;
    
    data.servers.forEach(function(server) {
        var episodeMap = {};
        if (!server.items) return;
        
        server.items.forEach(function(item) {
            if (!item.link || (item.link.indexOf('http://') !== 0 && item.link.indexOf('https://') !== 0)) {
                return;
            }
            var numMatch = (item.name || "").match(/Tập\s*(\d+)/i) || (item.name || "").match(/(\d+)/);
            var epKey = numMatch ? ("tap-" + parseInt(numMatch[1], 10)) : (item.slug || item.name);
            var epDisplayName = numMatch ? ("Tập " + numMatch[1]) : item.name;
            
            // Ưu tiên m3u8 hơn embed
            if (!episodeMap[epKey] || (item.type === 'm3u8' && episodeMap[epKey].type === 'embed')) {
                episodeMap[epKey] = {
                    id: item.link,
                    name: epDisplayName,
                    slug: epKey,
                    type: item.type,
                    num: numMatch ? parseInt(numMatch[1], 10) : 0
                };
            }
        });
        
        var items = Object.keys(episodeMap).map(function(k) { return episodeMap[k]; });
        
        // Sắp xếp tăng dần từ tập 1 đến tập cuối
        items.sort(function(a, b) {
            return a.num - b.num;
        });
        
        if (items.length > 0) {
            servers.push({
                name: server.name || ("Server " + (servers.length + 1)),
                episodes: items.map(function(it) {
                    return {
                        id: it.id,
                        name: it.name,
                        slug: it.slug
                    };
                })
            });
        }
    });
    
    return servers;
}

function extractMovieId(html) {
    if (!html) return null;
    var m = html.match(/"movieId"\s*:\s*"(\d+)"/i) ||
            html.match(/\\?"movieId\\?"\s*:\s*\\?"(\d+)\\?"/i) ||
            html.match(/\\?"movie_id\\?"\s*:\s*\\?"(\d+)\\?"/i) ||
            html.match(/movie_id[^\d]+(\d+)/i) ||
            html.match(/data-id="(\d+)"/i);
    return m ? m[1] : null;
}

function parseMovieDetail(html, url) {
    try {
        var id = url || "";
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        if (idMatch) id = idMatch[1];
        
        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "Không có mô tả.";
        var category = "";
        var episode_current = "";
        var quality = "";
        var year = 2026;
        var rating = 0;
        var lactor = "";
        var ldirec = "";
        var lduran = "";
        var status = "";
        
        var rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
        
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1].replace(/ - Motchill$/i, '').replace(/^Phim /i, '');
        
        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];
        
        ldes = _$(html).find(".prose.prose-sm").text() || ldes;
        category = _$(html).find('span:content("Thể loại:")').next().text(" - ").trim();
        
        var yearText = _$(html).find('span:content("Năm sản xuất:")').text().trim().replace("Năm sản xuất:", "");
        year = Number(yearText) || 2026;
        
        episode_current = _$(html).find('span:content("Tập")').text().trim();
        
        var ratingText = _$(html).find('span:content("đánh giá")').text().trim();
        var ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
        rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
        
        quality = _$(html).find('span.bg-yellow-500').text().trim() || "HD";
        
        // 1. Lấy movie_id và gọi API baseapi/episodes để lấy đầy đủ tập chính xác nhất
        var servers = [];
        var movieId = extractMovieId(html);
        if (movieId) {
            var epApiUrl = BASEURL + "/baseapi/episodes?movie_id=" + movieId;
            var epJsonStr = httpGet(epApiUrl);
            if (epJsonStr) {
                try {
                    var epJson = JSON.parse(epJsonStr);
                    servers = transformMovieData(epJson);
                } catch(jsonErr) {}
            }
        }
        
        // 2. Fallback parse trực tiếp từ SSR nếu API không khả dụng
        if (servers.length === 0) {
            servers = parseEpisodesFromHtml(html);
        }
        
        // Sắp xếp tập phim
        servers = sortEpisodesByName(servers);
        
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
            servers: servers, 
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || ""
        });
        
    } catch (e) {
        log(e);
        return JSON.stringify({
            id: url || "error",
            title: "error",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";
        var isEmbed = false;
        
        // 1. Unwrap player.phimapi.com/player/?url=...
        if (streamUrl.indexOf("player.phimapi.com/player/?url=") !== -1) {
            var raw = streamUrl.split("player/?url=")[1];
            if (raw) {
                streamUrl = decodeURIComponent(raw);
            }
        }

        // 2. streamvsmov embed link
        if (streamUrl.indexOf("streamvsmov.com/video/") !== -1) {
            var vsmMatch = streamUrl.match(/https?:\/\/([^/]+)\/video\/([a-f0-9-]+)/i);
            if (vsmMatch) {
                streamUrl = "https://" + vsmMatch[1] + "/stream/" + vsmMatch[2] + "/master.m3u8";
            }
        }

        if (streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1) {
            isEmbed = true;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "headers": {} });
    }
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function sortEpisodesByName(data) {
    if (!data || !Array.isArray(data)) return [];
    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var matchA = (a.name || "").match(/Tập\s*(\d+)/i) || (a.name || "").match(/(\d+)/);
                var matchB = (b.name || "").match(/Tập\s*(\d+)/i) || (b.name || "").match(/(\d+)/);

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

function getLISTmenu() {
    return `
/danh-sach/phim-le@@Phim Lẻ
/danh-sach/phim-bo@@Phim Bộ
/the-loai/hanh-dong@@Hành Động
/the-loai/tinh-cam@@Tình Cảm
/the-loai/hai-huoc@@Hài Hước
/the-loai/co-trang@@Cổ Trang
/the-loai/tam-ly@@Tâm Lý
/the-loai/hinh-su@@Hình Sự
/the-loai/chien-tranh@@Chiến Tranh
/the-loai/the-thao@@Thể Thao
/the-loai/vo-thuat@@Võ Thuật
/the-loai/vien-tuong@@Viễn Tưởng
/the-loai/phieu-luu@@Phiêu Lưu
/the-loai/khoa-hoc@@Khoa Học
/the-loai/kinh-di@@Kinh Dị
/the-loai/am-nhac@@Âm Nhạc
/the-loai/than-thoai@@Thần Thoại
/the-loai/tai-lieu@@Tài Liệu
/the-loai/gia-dinh@@Gia Đình
/the-loai/chinh-kich@@Chính kịch
/the-loai/bi-an@@Bí ẩn
/the-loai/hoc-duong@@Học Đường
/the-loai/kinh-dien@@Kinh Điển
/the-loai/phim-18@@Phim 18+
/the-loai/hoat-hinh@@Anime & Hoạt Hình
/the-loai/tv-shows@@TV Shows
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

function _$(htmlOrBlock){if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) {return htmlOrBlock;} var instance = {sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '',elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []),find: function (selector) {if (selector.indexOf(',') !== -1) {var results = [];var selectors = selector.split(',').map(function (s) {return s.trim();});for (var s = 0;s < selectors.length;s++) {if (selectors[s] === "") continue;var subInstance = this.find(selectors[s]);for (var r = 0;r < subInstance.elements.length;r++) {var element = subInstance.elements[r];if (results.indexOf(element) === -1) {results.push(element);}}} var multiInstance = _$(results);multiInstance.sourceHtml = this.sourceHtml;return multiInstance;} var results = [];var contentFilter = "";if (selector.indexOf(":content(") !== -1) {var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch) {contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || "";selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}} var attrNameFilter = "";var attrValueFilter = "";var attrOperator = "=";var hasAttrFilter = false;var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch) {hasAttrFilter = true;attrNameFilter = attrMatch[1];attrOperator = attrMatch[2];attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || "";selector = selector.replace(/\[.*?\]/,"");} var notSelector = "";if (selector.indexOf(":not(") !== -1) {var notMatch = selector.match(/:not\(([^)]+)\)/);if (notMatch) {notSelector = notMatch[1];selector = selector.replace(/:not\([^)]+\)/,"");}} var isFirstFilter = selector.indexOf(":first") !== -1;var isLastFilter = selector.indexOf(":last") !== -1;selector = selector.replace(/:first|:last/g,"");var targetTagName = "";var targetId = "";var targetClasses = [];var selectorToParse = selector.trim();var idMatch = selectorToParse.match(/#([a-zA-Z0-9_-]+)/);if (idMatch) {targetId = idMatch[1];selectorToParse = selectorToParse.replace(/#[a-zA-Z0-9_-]+/g,"");} var classMatches = selectorToParse.match(/\.([a-zA-Z0-9_-]+)/g);if (classMatches) {for (var c = 0;c < classMatches.length;c++) {targetClasses.push(classMatches[c].substring(1));} selectorToParse = selectorToParse.replace(/\.[a-zA-Z0-9_-]+/g,"");} var tagMatch = selectorToParse.match(/^([a-zA-Z0-9_-]+)/);if (tagMatch) {targetTagName = tagMatch[1].toLowerCase();} var searchSpace = this.elements.length > 0 ? this.elements : [this.sourceHtml];for (var e = 0;e < searchSpace.length;e++) {var currentContext = searchSpace[e];var blockRegex = /<([a-zA-Z0-9_-]+)([^>]*)>([\s\S]*?)<\/\1>/gi;var voidTags = /^(img|input|br|hr|meta|link)$/i;var match;while ((match = blockRegex.exec(currentContext)) !== null) {var fullTag = match[0];var tagName = match[1].toLowerCase();var attrs = match[2];var innerHtml = match[3];if (targetTagName && targetTagName !== tagName) continue;if (targetId) {var idAttr = attrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var foundId = idAttr ? (idAttr[1] || idAttr[2] || idAttr[3]) : "";if (foundId !== targetId) continue;} if (targetClasses.length > 0) {var classAttr = attrs.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var foundClasses = classAttr ? (classAttr[1] || classAttr[2] || classAttr[3] || "").split(/\s+/) : [];var hasAllClasses = true;for (var tc = 0;tc < targetClasses.length;tc++) {if (foundClasses.indexOf(targetClasses[tc]) === -1) {hasAllClasses = false;break;}} if (!hasAllClasses) continue;} if (hasAttrFilter) {var dynamicAttrRegex = new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var matchedAttr = attrs.match(dynamicAttrRegex);if (!matchedAttr) continue;var currentVal = matchedAttr[1] || matchedAttr[2] || matchedAttr[3] || "";if (attrOperator === "=" && currentVal !== attrValueFilter) continue;if (attrOperator === "*=" && currentVal.indexOf(attrValueFilter) === -1) continue;if (attrOperator === "^=" && currentVal.indexOf(attrValueFilter) !== 0) continue;if (attrOperator === "$=" && currentVal.slice(-attrValueFilter.length) !== attrValueFilter) continue;} if (contentFilter) {var plainText = innerHtml.replace(/<[^>]*>/g,"").trim();if (plainText.indexOf(contentFilter) === -1) continue;} if (notSelector) {var subElem = _$(fullTag);if (subElem.find(notSelector).length > 0) continue;} results.push(fullTag);} var singleTagRegex = /<([a-zA-Z0-9_-]+)([^>]*?)(\/?>)/gi;while ((match = singleTagRegex.exec(currentContext)) !== null) {var singleFullTag = match[0];var singleTagName = match[1].toLowerCase();var singleAttrs = match[2];if (!voidTags.test(singleTagName) && singleFullTag.indexOf("</") === -1) continue;if (targetTagName && targetTagName !== singleTagName) continue;if (targetId) {var sIdAttr = singleAttrs.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var sFoundId = sIdAttr ? (sIdAttr[1] || sIdAttr[2] || sIdAttr[3]) : "";if (sFoundId !== targetId) continue;} if (targetClasses.length > 0) {var sClassAttr = singleAttrs.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);var sFoundClasses = sClassAttr ? (sClassAttr[1] || sClassAttr[2] || sClassAttr[3] || "").split(/\s+/) : [];var sHasAllClasses = true;for (var stc = 0;stc < targetClasses.length;stc++) {if (sFoundClasses.indexOf(targetClasses[stc]) === -1) {sHasAllClasses = false;break;}} if (!sHasAllClasses) continue;} if (hasAttrFilter) {var sDynamicAttrRegex = new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var sMatchedAttr = singleAttrs.match(sDynamicAttrRegex);if (!sMatchedAttr) continue;var sCurrentVal = sMatchedAttr[1] || sMatchedAttr[2] || sMatchedAttr[3] || "";if (attrOperator === "=" && sCurrentVal !== attrValueFilter) continue;if (attrOperator === "*=" && sCurrentVal.indexOf(attrValueFilter) === -1) continue;if (attrOperator === "^=" && sCurrentVal.indexOf(attrValueFilter) !== 0) continue;if (attrOperator === "$=" && sCurrentVal.slice(-attrValueFilter.length) !== attrValueFilter) continue;} if (results.indexOf(singleFullTag) === -1) {results.push(singleFullTag);}}} if (isFirstFilter && results.length > 0) results = [results[0]];if (isLastFilter && results.length > 0) results = [results[results.length - 1]];var matchedInstance = _$(results);matchedInstance.sourceHtml = this.sourceHtml;return matchedInstance;},attr: function (attrName) {if (this.elements.length === 0) return undefined;var firstElement = this.elements[0];var regex = new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))',"i");var match = firstElement.match(regex);if (match) {return match[1] || match[2] || match[3] || "";} return undefined;},text: function (separator) {if (this.elements.length === 0) return "";var sep = typeof separator === 'string' ? separator : " ";var combined = this.elements.join(sep);return combined.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim();},html: function () {if (this.elements.length === 0) return "";return this.elements.join("\n");},each: function (callback) {for (var i = 0;i < this.elements.length;i++) {callback.call(_$(this.elements[i]),i,this.elements[i]);} return this;},parent: function () {if (this.elements.length === 0 || !this.sourceHtml) return _$("");var currentElem = this.elements[0];var pos = this.sourceHtml.indexOf(currentElem);if (pos === -1) return _$("");var before = this.sourceHtml.substring(0, pos);var lastOpenTagMatch = before.match(/<([a-zA-Z0-9_-]+)([^>]*)>(?![\s\S]*<\/\1>)/gi);if (lastOpenTagMatch && lastOpenTagMatch.length > 0) {var parentTagWithAttrs = lastOpenTagMatch[lastOpenTagMatch.length - 1];var parentTagName = parentTagWithAttrs.match(/<([a-zA-Z0-9_-]+)/i)[1];var parentOpenPos = before.lastIndexOf(parentTagWithAttrs);if (parentOpenPos !== -1) {var fromParentOpen = this.sourceHtml.substring(parentOpenPos);var count = 0;var parentCloseRegex = new RegExp("<(\\/)?" + parentTagName + "[^>]*>","gi");var pMatch;var endPos = -1;while ((pMatch = parentCloseRegex.exec(fromParentOpen)) !== null) {if (pMatch[1] === "/") {count--;} else {count++;} if (count === 0) {endPos = parentOpenPos + pMatch.index + pMatch[0].length;break;}} if (endPos !== -1) {return _$(this.sourceHtml.substring(parentOpenPos, endPos));}}} return _$("");},closest: function (selector) {var current = this;while (current.elements.length > 0) {if (current.is(selector)) return current;current = current.parent();} return _$("");},is: function (selector) {if (this.elements.length === 0) return false;var matched = _$(this.sourceHtml).find(selector);for (var i = 0;i < matched.elements.length;i++) {if (matched.elements[i] === this.elements[0]) return true;} return false;},next: function () {if (this.elements.length === 0 || !this.sourceHtml) return _$("");var currentElem = this.elements[0];var pos = this.sourceHtml.indexOf(currentElem);if (pos === -1) return _$("");var remaining = this.sourceHtml.substring(pos + currentElem.length);var nextTagMatch = remaining.match(/<([a-zA-Z0-9_-]+)[^>]*>([\s\S]*?)<\/\1>/i);if (nextTagMatch) {return _$(nextTagMatch[0]);} return _$("");},length: 0};instance.length = instance.elements.length;return instance;}
