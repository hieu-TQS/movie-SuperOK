
BASEURL = "https://cnporn.org";

function getManifest() {
    return JSON.stringify({
        "id": "cnporn",
        "name": "Porn Gái Trung",
        "description": "Nguồn Porn Gái Trung chất lượng HD.",
        "info": "Nguồn Porn Gái Trung chất lượng HD.",
        "version": "1.0.0",
        "BASEURL": "https://cnporn.org",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/cnporn.jpg",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[cnporn] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[cnporn] " + msg);
    }
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Hàng Mới", "type": "Grid" },
        { "slug": "/china-porn/", "title": "Gái Trung Quốc", "type": "Horizontal" },
        { "slug": "/historical/", "title": "Cổ Trang", "type": "Horizontal" },
        { "slug": "/younger-sister/", "title": "Gái Trẻ", "type": "Horizontal" }
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
            path = "/";
        }
        
        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            fullUrl = BASEURL + (fullUrl.charAt(0) === '/' ? fullUrl : '/' + fullUrl);
        }
        
        if (fullUrl.indexOf("/search/") !== -1 || fullUrl.indexOf("key=") !== -1) {
            var keyMatch = fullUrl.match(/key=([^&]+)/);
            var key = keyMatch ? keyMatch[1] : "";
            if (page > 1) {
                return BASEURL + "/search/page/" + page + "/?key=" + key;
            }
            return BASEURL + "/search/?key=" + key;
        }
        
        if (fullUrl.slice(-1) === '/') {
            fullUrl = fullUrl.slice(0, -1);
        }
        
        if (page > 1) {
            return fullUrl + "/page/" + page + "/";
        }
        return fullUrl + "/";
    } catch (e) {
        log(e);
        return BASEURL + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                : JSON.stringify(filtersJson);
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page) || 1;
        } catch (e) {}
    }
    var cleanKeyword = encodeURIComponent(keyword || "");
    if (page > 1) {
        return BASEURL + "/search/page/" + page + "/?key=" + cleanKeyword;
    }
    return BASEURL + "/search/?key=" + cleanKeyword;
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
        var regexItem = /<div[^>]*class=["'][^"']*tw-item[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
        var match;

        while ((match = regexItem.exec(html)) !== null) {
            var block = match[1];
            var hrefMatch = block.match(/<a[^>]+href=["']([^"']+)["']/i);
            var imgMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
            var altMatch = block.match(/alt=["']([^"']+)["']/i);
            var labelMatch = block.match(/<div class=["']label["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i);

            var href = hrefMatch ? hrefMatch[1] : "";
            var src = imgMatch ? imgMatch[1] : "";
            var title = altMatch ? altMatch[1].trim() : "";
            var quality = labelMatch ? labelMatch[1].replace(/<[^>]+>/g, '').trim() : "HD";

            if (href) {
                if (href.indexOf("http") === -1) {
                    href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
                }
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality,
                    "lang": "",
                    "episode_current": quality
                });
            }
        }

        if (items.length === 0) {
            var simpleRegex = /<a[^>]+href=["'](https:\/\/cnporn\.org\/[^"']+\.html)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["']/gi;
            var sMatch;
            while ((sMatch = simpleRegex.exec(html)) !== null) {
                items.push({
                    "id": sMatch[1],
                    "title": sMatch[3].trim(),
                    "posterUrl": sMatch[2].replace(/&amp;/g, '&'),
                    "backdropUrl": sMatch[2].replace(/&amp;/g, '&'),
                    "quality": "HD",
                    "lang": "",
                    "episode_current": "HD"
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
            "items": [{
                "id": $url || "",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, $url) {
    try {
        var lurl = $url || "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";

        var rmatch = html.match(/link\s+rel="canonical"\s+href=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) { lurl = rmatch[1]; }

        rmatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) { limg = rmatch[1]; }

        rmatch = html.match(/<title>([^<]+)/i);
        if (rmatch && rmatch[1]) { lname = rmatch[1].replace(/\s*-\s*CnPorn.*$/i, '').trim(); }

        var descMatch = html.match(/name=["']description["']\s+content=["']([^"']+)["']/i);
        if (descMatch && descMatch[1]) { ldes = descMatch[1].trim(); }

        var epi = [];
        var regex = /data-server\s*=\s*["']([^"']+)["']/g;
        var match;
        var serverIdx = 1;
        while ((match = regex.exec(html)) !== null) {
            var sUrl = match[1];
            if (sUrl.indexOf("http") === -1) {
                sUrl = BASEURL + (sUrl.charAt(0) === '/' ? sUrl : '/' + sUrl);
            }
            epi.push({
                id: sUrl,
                name: "Server " + serverIdx,
                slug: "sv" + serverIdx
            });
            serverIdx++;
        }

        if (epi.length === 0) {
            var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            if (iframeMatch && iframeMatch[1]) {
                var ifUrl = iframeMatch[1];
                if (ifUrl.indexOf("http") === -1) {
                    ifUrl = BASEURL + (ifUrl.charAt(0) === '/' ? ifUrl : '/' + ifUrl);
                }
                epi.push({
                    id: ifUrl,
                    name: "Server 1",
                    slug: "sv1"
                });
            }
        }

        var servers = [];
        if (epi.length > 0) {
            servers.push({
                name: "Phát trực tiếp",
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
            quality: "HD",
            year: 2026,
            rating: 8.5,
            status: "Full",
            duration: "N/A",
            casts: "N/A",
            director: "N/A",
            category: "18+"
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            id: $url || "error",
            title: "error",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamlink = "";
        
        if (url && (url.indexOf(".m3u8") !== -1 || url.indexOf(".mp4") !== -1)) {
            streamlink = url;
        }
        
        if (!streamlink && html) {
            var cleanHtml = html.replace(/\\\//g, '/');
            var m3u8Match = cleanHtml.match(/https?:\/\/[^\s"']+\.m3u8[^\s"']*/i) ||
                            cleanHtml.match(/https?:\/\/[^\s"']+\.mp4[^\s"']*/i);
            if (m3u8Match) {
                streamlink = m3u8Match[0].replace(/\\/g, '');
            }
        }
        
        if (!streamlink && html) {
            var fileMatch = html.match(/["']file["']\s*:\s*["']([^"']+)["']/i);
            if (fileMatch && fileMatch[1]) {
                streamlink = fileMatch[1].replace(/\\\//g, '/').replace(/\\/g, '');
            }
        }

        var isEmbed = false;
        if (!streamlink) {
            streamlink = url || "";
            if (streamlink.indexOf(".m3u8") === -1 && streamlink.indexOf(".mp4") === -1) {
                isEmbed = true;
            }
        }

        return JSON.stringify({
            "url": streamlink,
            "isEmbed": isEmbed,
            "mimeType": streamlink.indexOf(".mp4") !== -1 ? "video/mp4" : "application/x-mpegURL",
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
/historical/@@Cổ Trang
/incest/@@Loạn Luân
/big-tits/@@Vú Bự
/china-porn/@@Trung Quốc
/cuckold/@@Cuck Old
/teacher/@@Giáo Viên
/hidden-cam/@@Cam Ẩn
/rape/@@Hấp Diêm
/threesome/@@Chơi Ba
/younger-sister/@@Gái Trẻ
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


