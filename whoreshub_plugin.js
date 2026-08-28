var BASEURL = "https://www.whoreshub.com"; 

function getManifest() {
    return JSON.stringify({
        "id": "whoreshub",
        "name": "XXX Whoreshub 4K",
        "description": "Phim chất lượng cao 4K / 1080p Whoreshub.",
        "version": "1.0.0",
        "info": "Phim chất lượng cao 4K / 1080p Whoreshub.",
        "baseUrl": "https://www.whoreshub.com",
        "iconUrl": "https://www.whoreshub.com/favicon.ico",
        "isEnabled": true,
        "type": "MOVIE",
        "isAdult": true,
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[whoreshub] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[whoreshub] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/categories/4k-porn/", "title": "Phim 4K", "type": "Grid" }
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
        if (slug && slug.indexOf("http") > -1) {
            if (slug.indexOf("search") > -1 && filtersJson) {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
                try {
                    var filters = JSON.parse(fixedJson);
                    var page = parseInt(filters.page) || 1;
                    if (page > 1) {
                        var kwMatch = slug.match(/\/search\/([^/]+)/i);
                        var kw = kwMatch ? kwMatch[1] : "video";
                        return slug + "?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&category_ids=&sort_by=&q=" + kw + "&from_videos=" + page + "&from_albums=" + page;
                    }
                } catch (jsonErr) {}
            }
            return slug;
        }
        
        var page = 1;
        var path = slug || "";
        
        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters2 = JSON.parse(fixedJson2);
                page = parseInt(filters2.page) || 1;
                if (filters2.category) {
                    if (Array.isArray(filters2.category) && filters2.category.length > 0) {
                        path = filters2.category[0].slug;
                    } else if (typeof filters2.category === 'string') {
                        path = filters2.category;
                    }
                }
            } catch (jsonErr) {}
        }
        
        var resultUrl = BASEURL;
        if (path) {
            resultUrl += (path.indexOf('/') === 0 ? path : '/' + path);
        }
        if (page > 1) {
            resultUrl += (resultUrl.endsWith('/') ? "" : "/") + page + "/";
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/" + encodeURIComponent(keyword || "") + "/";
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
        
        var linkRegex = /<a\s+[^>]*href="([^"]*\/videos\/(\d+)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(html)) !== null) {
            var href = m[1];
            if (seen[href]) continue;
            seen[href] = true;
            
            var fullTag = m[0];
            var inner = m[3];
            
            var title = "";
            var titleM = fullTag.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            if (titleM) title = titleM[1].trim();
            if (!title) continue;
            
            var src = "";
            var srcM = inner.match(/data-src="([^"]+)"/i) || inner.match(/src="([^"]+)"/i);
            if (srcM) src = srcM[1].trim().replace(/&amp;/g, '&');
            if (src.indexOf("//") === 0) src = "https:" + src;
            else if (src && src.indexOf("http") === -1) src = BASEURL + (src.indexOf('/') === 0 ? src : '/' + src);
            
            if (href.indexOf("http") === -1) {
                href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
            }
            
            var quality = "";
            var qM = inner.match(/class="[^"]*is-hd[^"]*"[^>]*>([^<]+)</i);
            if (qM) quality = qM[1].trim();
            
            var duration = "";
            var dM = inner.match(/class="[^"]*duration[^"]*"[^>]*>([^<]+)</i);
            if (dM) duration = dM[1].trim();
            
            items.push({
                id: href,
                title: title,
                posterUrl: src,
                backdropUrl: src,
                quality: quality || "4K",
                lang: "",
                episode_current: duration
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
        log("parseListResponse: " + e);
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseFlashvars(scriptContent) {
    var data = {};
    if (!scriptContent) return data;
    
    var match = scriptContent.match(/var\s+flashvars\s*=\s*\{([\s\S]*?)\};/i);
    if (!match) return data;
    
    var body = match[1];
    var pairRegex = /(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|([^,\s}]+))/g;
    var m;
    while ((m = pairRegex.exec(body)) !== null) {
        var key = m[1];
        var val = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : m[4]);
        if (typeof val === 'string') {
            val = val.replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
        data[key] = val;
    }
    return data;
}

function parseMovieDetail(html, url) {
    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");

        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var category = "";
        var episode_current = "";

        var rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
        if (limg.indexOf("//") === 0) {
            limg = "https:" + limg;
        } else if (limg && limg.indexOf("http") === -1) {
            limg = BASEURL + limg;
        }

        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        // Tìm flashvars trong các thẻ script
        var scriptContent = "";
        var scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].indexOf('flashvars') !== -1) {
                scriptContent = scripts[i];
                break;
            }
        }

        var flashvars = parseFlashvars(scriptContent);
        if (flashvars.video_title) {
            lname = flashvars.video_title;
        }
        if (flashvars.video_categories) {
            category = flashvars.video_categories;
        }

        var episodes = [];
        if (flashvars.video_alt_url3) {
            episodes.push({
                id: flashvars.video_alt_url3,
                name: flashvars.video_alt_url3_text || "2160p 4K",
                slug: "4k"
            });
        }
        if (flashvars.video_alt_url2) {
            episodes.push({
                id: flashvars.video_alt_url2,
                name: flashvars.video_alt_url2_text || "1080p FHD",
                slug: "1080p"
            });
        }
        if (flashvars.video_alt_url) {
            episodes.push({
                id: flashvars.video_alt_url,
                name: flashvars.video_alt_url_text || "720p HD",
                slug: "720p"
            });
        }
        if (flashvars.video_url) {
            episodes.push({
                id: flashvars.video_url,
                name: flashvars.video_url_text || "480p SD",
                slug: "480p"
            });
        }

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "Chất lượng Video",
                episodes: episodes
            });
        }

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "4K",
            year: 2026,
            rating: 9.0,
            status: "",
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: "",
            casts: "",
            director: ""
        });

    } catch (e) {
        log("parseMovieDetail: " + e);
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
        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": url || "",
            "headers": {}
        });
    }
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `[{\"link\":\"/categories/ai/\",\"name\":\"Ai\"},{\"link\":\"/categories/4k-porn/\",\"name\":\"4K Porn\"},{\"link\":\"/tags/solo/\",\"name\":\"solo\"},{\"link\":\"/tags/hardcore/\",\"name\":\"hardcore\"},{\"link\":\"/tags/lesbian/\",\"name\":\"lesbian\"},{\"link\":\"/tags/teen/\",\"name\":\"teen\"},{\"link\":\"/tags/webcam/\",\"name\":\"webcam\"},{\"link\":\"/tags/blowjob/\",\"name\":\"blowjob\"},{\"link\":\"/tags/bigass/\",\"name\":\"bigass\"},{\"link\":\"/tags/fetish/\",\"name\":\"fetish\"},{\"link\":\"/tags/sex2/\",\"name\":\"sex\"},{\"link\":\"/tags/fuck/\",\"name\":\"fuck\"},{\"link\":\"/tags/missionary/\",\"name\":\"missionary\"},{\"link\":\"/tags/deepthroat/\",\"name\":\"deepthroat\"},{\"link\":\"/tags/blonde/\",\"name\":\"blonde\"},{\"link\":\"/tags/threesome/\",\"name\":\"threesome\"},{\"link\":\"/tags/pov/\",\"name\":\"pov\"},{\"link\":\"/tags/small-tits/\",\"name\":\"small tits\"},{\"link\":\"/tags/big-tits/\",\"name\":\"big tits\"},{\"link\":\"/tags/pawg/\",\"name\":\"pawg\"},{\"link\":\"/tags/fingering/\",\"name\":\"fingering\"},{\"link\":\"/tags/babe/\",\"name\":\"babe\"},{\"link\":\"/tags/facial/\",\"name\":\"facial\"},{\"link\":\"/tags/big-ass/\",\"name\":\"big ass\"},{\"link\":\"/tags/vr/\",\"name\":\"vr\"},{\"link\":\"/tags/porn/\",\"name\":\"porn\"},{\"link\":\"/tags/pussy/\",\"name\":\"pussy\"},{\"link\":\"/tags/cumshot/\",\"name\":\"cumshot\"},{\"link\":\"/tags/shemale/\",\"name\":\"shemale\"},{\"link\":\"/tags/brunette/\",\"name\":\"brunette\"},{\"link\":\"/tags/latin/\",\"name\":\"latin\"},{\"link\":\"/tags/busty/\",\"name\":\"busty\"},{\"link\":\"/tags/creampie/\",\"name\":\"creampie\"},{\"link\":\"/tags/big-cock/\",\"name\":\"big cock\"},{\"link\":\"/tags/bbc2/\",\"name\":\"bbc\"},{\"link\":\"/tags/milf/\",\"name\":\"milf\"},{\"link\":\"/tags/latina/\",\"name\":\"latina\"},{\"link\":\"/tags/asian/\",\"name\":\"asian\"},{\"link\":\"/tags/ass/\",\"name\":\"ass\"}]`;
}

function buildMenu(menuStr, type) { 
    var menuArray = [];
    try {
        menuArray = JSON.parse(menuStr);
    } catch(e) {
        return [];
    }
    var menulist = []; 
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
