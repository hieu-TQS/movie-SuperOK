// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var BASEURL = "https://edge.narto-drama.com"; 

function getManifest() {
    return JSON.stringify({
        "id": "nartodrama",
        "name": "Phim Ngắn Narto",
        "description": "Phim Ngắn lồng tiếng vietsub hay",
        "version": "1.2.0",
        "info": "Nguồn phim ngắn siêu hay, chất lượng cao FHD.",
        "baseUrl": "https://edge.narto-drama.com",
        "iconUrl": "https://narto-drama.com/narto-drama-logo-compressed.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[nartodrama] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[nartodrama] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { slug: '/?lang=vi-VN', title: 'Phim Mới Cập Nhật', type: 'Grid' },
        { slug: '/search?lang=vi-VN&q=l%E1%BB%93ng+ti%E1%BA%BFng', title: 'Lồng Tiếng', type: 'Horizontal' },
        { slug: '/tag/hien-dai?lang=vi-VN', title: 'Hiện Đại', type: 'Horizontal' },
        { slug: '/tag/bao-thu?lang=vi-VN', title: 'Báo Thù', type: 'Horizontal' }
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
            return slug;
        }

        var page = 1;
        var path = slug || "/?lang=vi-VN";

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

        if (page > 1 && resultUrl.indexOf("page=") === -1) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        var fallback = BASEURL + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "/?lang=vi-VN");
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
        var resultUrl = BASEURL + "/search?lang=vi-VN&q=" + encodedKeyword;
        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        return BASEURL + "/search?lang=vi-VN&q=" + encodeURIComponent(keyword || "");
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

        var articleRegex = /<article\s+[^>]*class="[^"]*card[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
        var m;
        while ((m = articleRegex.exec(html)) !== null) {
            var card = m[0];
            var inner = m[1];

            var hrefMatch = card.match(/data-watch-url="([^"]+)"/i) || inner.match(/href="([^"]*\/detail\/[^"]*)"/i);
            if (!hrefMatch) continue;
            var href = hrefMatch[1];
            if (href.indexOf('http') !== 0) {
                href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
            }

            if (seen[href]) continue;
            seen[href] = true;

            var titleMatch = card.match(/data-movie-title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i) || inner.match(/title="([^"]+)"/i);
            var title = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : "";
            if (!title) continue;

            var srcMatch = inner.match(/src="([^"]+)"/i) || inner.match(/data-src="([^"]+)"/i);
            var src = srcMatch ? srcMatch[1].trim() : "";
            if (src && src.indexOf('http') !== 0) {
                src = BASEURL + (src.indexOf('/') === 0 ? src : '/' + src);
            }

            var epMatch = inner.match(/class="[^"]*episode-badge[^"]*"[^>]*>([^<]+)</i);
            var episode = epMatch ? epMatch[1].trim() : "";

            items.push({
                id: href,
                title: title,
                posterUrl: src,
                backdropUrl: src,
                quality: "HD",
                lang: "Vietsub",
                episode_current: episode
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

function parseMovieDetail(html, url) {
    try {
        var id = url || "";
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        if (idMatch) id = idMatch[1];

        var titleMatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var lname = titleMatch ? titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/ - Free Streaming.*$/i, '').trim() : "Đang cập nhật...";

        var imgMatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i) || html.match(/class="[^"]*poster[^"]*"[^>]*src="([^"]+)"/i);
        var limg = imgMatch ? imgMatch[1] : "";
        if (limg && limg.indexOf('http') !== 0) {
            limg = BASEURL + (limg.indexOf('/') === 0 ? limg : '/' + limg);
        }

        var descMatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        var ldes = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim() : "";

        // Trích xuất slug từ URL
        var slug = "";
        var slugMatch = id.match(/\/watch\/([^/?]+)/i) || id.match(/\/detail\/([^/?]+)/i);
        if (slugMatch) slug = slugMatch[1];

        // Quét các tập phim
        var episodes = [];
        var seen = {};
        var epRegex = /<a\s+[^>]*class="[^"]*episode-item[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = epRegex.exec(html)) !== null) {
            var href = m[1];
            var inner = m[2].replace(/<[^>]*>/g, '').trim();
            var numMatch = href.match(/\/(\d+)(?:\?|$)/) || inner.match(/\d+/);
            var epNum = numMatch ? parseInt(numMatch[1] || numMatch[0], 10) : (episodes.length + 1);

            if (seen[epNum]) continue;
            seen[epNum] = true;

            var refreshUrl = BASEURL + "/e/rs/detail/watch/" + slug + "/" + epNum + "/refresh-source?lang=vi-VN";
            episodes.push({
                id: refreshUrl,
                name: "Tập " + epNum,
                slug: "tap-" + epNum,
                num: epNum
            });
        }

        episodes.sort(function(a, b) { return a.num - b.num; });

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "Narto Drama",
                episodes: episodes.map(function(e) {
                    return {
                        id: e.id,
                        name: e.name,
                        slug: e.slug
                    };
                })
            });
        }

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: 2026,
            rating: 9.0,
            status: "",
            category: "Phim Ngắn",
            episode_current: episodes.length > 0 ? ("Tập " + episodes.length) : "",
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
        var streamUrl = "";
        var listsub = [];

        if (typeof html === 'string' && html.indexOf('{') === 0) {
            var data = JSON.parse(html);
            if (data.multi_resolutions && data.multi_resolutions.length > 0) {
                streamUrl = data.multi_resolutions[0].stream_url;
            } else if (data.direct_play_url) {
                streamUrl = data.direct_play_url;
            } else if (data.play_url) {
                streamUrl = data.play_url;
            }

            var subUrl = data.direct_subtitle_url || data.subtitle_url || "";
            if (subUrl) {
                if (subUrl.indexOf('http') !== 0) {
                    subUrl = BASEURL + (subUrl.indexOf('/') === 0 ? subUrl : '/' + subUrl);
                }
                listsub.push({
                    "lang": "Vietsub",
                    "url": subUrl,
                    "mimeType": "text/vtt"
                });
            }
        }

        if (!streamUrl) {
            streamUrl = url || "";
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": listsub
        });
    } catch (e) {
        log("stream error: " + e);
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
    return `[{\"link\":\"https://edge.narto-drama.com/search?lang=vi-VN&q=l%E1%BB%93ng+ti%E1%BA%BFng\",\"name\":\"Lồng Tiếng\"},{\"link\":\"https://edge.narto-drama.com/search?lang=vi-VN&q=kinh+d%E1%BB%8B\",\"name\":\"Kinh Dị\"},{\"link\":\"https://edge.narto-drama.com/tag/bi-an-than-phan?lang=vi-VN\",\"name\":\"Thân Phận Bí Ẩn\"},{\"link\":\"https://edge.narto-drama.com/tag/hien-dai?lang=vi-VN\",\"name\":\"Hiện Đại\"},{\"link\":\"https://edge.narto-drama.com/tag/bao-thu?lang=vi-VN\",\"name\":\"Báo Thù\"}]`;
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
