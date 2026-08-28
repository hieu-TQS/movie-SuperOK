// =============================================================================
// VAAPP Plugin - SEX MUP (Bản vá chuẩn hóa theo cấu trúc Core mới nhất)
// =============================================================================
BASEURL = "https://sexmupxinh.net";

function getManifest() {
    return JSON.stringify({
        "id": "sexmup",          
        "name": "Sex Múp",
        "description": "Nguồn XXX Hay",
        "version": "1.0.0",             
        "BASEURL": "https://sexmupxinh.net",
        "iconUrl": "https://sexmupxinh.net/favicon.ico", 
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "webview"
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

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Clip Mới", "type": "Grid" },
        { "slug": "/phim-sex-loan-luan/", "title": "Loạn Luân", "type": "Horizontal" },
        { "slug": "/phim-sex-khong-che/", "title": "Không Che", "type": "Horizontal" },
        { "slug": "/phim-sex-hiep-dam/", "title": "Hiếp Dâm", "type": "Horizontal" },
        { "slug": "/phim-sex-chau-au/", "title": "Châu Âu", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Hiếp Dâm", "slug": "/phim-sex-hiep-dam/" },
        { "name": "Loạn Luân", "slug": "/phim-sex-loan-luan/" },
        { "name": "Không Che", "slug": "/phim-sex-khong-che/" },
        { "name": "Vụng Trộm", "slug": "/phim-sex-vung-trom/" },
        { "name": "Châu Âu", "slug": "/phim-sex-chau-au/" },
        { "name": "Trung Quốc", "slug": "/phim-sex-trung-quoc/" },
        { "name": "Nhật Bản", "slug": "/phim-sex-nhat-ban/" },
        { "name": "Jav HD", "slug": "/jav-hd/" },
        { "name": "Phim Sex Hay", "slug": "/phim-sex-hay/" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        category: JSON.parse(getPrimaryCategories())
    });
}

function getFilters() {
    return getFilterConfig();
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/";

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

        if (!path || path === "") {
            path = "/";
        }

        var fullUrl = path;
        if (fullUrl.indexOf("http") !== 0) {
            if (fullUrl.charAt(0) !== '/') {
                fullUrl = '/' + fullUrl;
            }
            fullUrl = BASEURL + fullUrl;
        }

        if (fullUrl.indexOf("?") !== -1) {
            var qIdx = fullUrl.indexOf("?");
            var query = fullUrl.substring(qIdx);
            var basePart = fullUrl.substring(0, qIdx);
            if (basePart.slice(-1) === '/') basePart = basePart.slice(0, -1);
            if (page > 1) {
                return basePart + "/page/" + page + "/" + query;
            }
            return basePart + "/" + query;
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
        return BASEURL + "/page/" + page + "/?do=search&qh=" + cleanKeyword;
    }
    return BASEURL + "/search/?do=search&qh=" + cleanKeyword;
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
        if (!html) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
        }

        var liRegex = /<li[^>]*class=["'][^"']*video-list[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
        var match;

        while ((match = liRegex.exec(html)) !== null) {
            var block = match[1];

            var hrefMatch = block.match(/href=["']([^"']+)["']/i);
            var titleMatch = block.match(/title=["']([^"']+)["']/i) ||
                             block.match(/alt=["']([^"']+)["']/i) ||
                             block.match(/<div class=["']video-name["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);

            // Ưu tiên data-src / data-original trước để tránh dính data:image placeholder
            var dataSrcMatch = block.match(/data-src=["']([^"']+)["']/i) ||
                               block.match(/data-original=["']([^"']+)["']/i) ||
                               block.match(/data-lazy=["']([^"']+)["']/i);
            var src = "";
            if (dataSrcMatch && dataSrcMatch[1] && dataSrcMatch[1].indexOf('data:image') === -1) {
                src = dataSrcMatch[1].replace(/&amp;/g, '&');
            } else {
                var srcMatch = block.match(/src=["']([^"']+)["']/i);
                if (srcMatch && srcMatch[1] && srcMatch[1].indexOf('data:image') === -1) {
                    src = srcMatch[1].replace(/&amp;/g, '&');
                }
            }

            var href = hrefMatch ? hrefMatch[1] : "";
            var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            if (href) {
                if (href.indexOf("http") === -1) {
                    href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
                }
                if (src && src.indexOf("http") === -1) {
                    src = BASEURL + (src.charAt(0) === '/' ? src : '/' + src);
                }

                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": src,
                    "backdropUrl": src,
                    "quality": "HD",
                    "lang": "",
                    "episode_current": "HD"
                });
            }
        }

        if (items.length === 0) {
            var aRegex = /<a[^>]+href=["'](https:\/\/sexmupxinh\.net\/phim\/[^"']+)["'][^>]*title=["']([^"']*)["'][^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/gi;
            var aMatch;
            while ((aMatch = aRegex.exec(html)) !== null) {
                items.push({
                    "id": aMatch[1],
                    "title": aMatch[2].trim(),
                    "posterUrl": aMatch[3],
                    "backdropUrl": aMatch[3],
                    "quality": "HD",
                    "lang": "",
                    "episode_current": "HD"
                });
            }
        }

        var currentPage = 1;
        var totalPages = 999;

        var currentMatch = html.match(/class=["']pagenavi["'][\s\S]*?class=["']active["'][^>]*>(\d+)<\/a>/i);
        var maxMatch = html.match(/>(\d+)<\/a><a[^>]*>→<\/a>/i);

        if (currentMatch && currentMatch[1]) {
            currentPage = parseInt(currentMatch[1], 10);
        }
        if (maxMatch && maxMatch[1]) {
            totalPages = parseInt(maxMatch[1], 10);
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages
            }
        });
    } catch (e) {
        log(e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseList(html, $url) { return parseListResponse(html, $url); }
function parseHomeResponse(html, $url) { return parseListResponse(html, $url); }
function parseSearchResponse(html, $url) { return parseListResponse(html, $url); }
function parseSearchResult(html, $url) { return parseListResponse(html, $url); }

function parseMovieDetail(html, url) {
    var lurl = url || "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";

    try {
        var rmatch = html.match(/link\s+rel="canonical"[\s\S]*?href="([^"]+)"/i);
        if (rmatch && rmatch[1]) { lurl = rmatch[1]; }

        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) { limg = rmatch[1]; }

        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) { lname = rmatch[1].trim(); }

        rmatch = html.match(/<div\s+class="content">([\s\S]*?)<\/div>/i) ||
                 html.match(/meta\s+name="description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) { ldes = rmatch[1].replace(/<[^>]+>/g, '').trim(); }

        var pidMatch = html.match(/id="video"\s+data-id="(\d+)"/i) ||
                       html.match(/var\s+pid\s*=\s*(\d+)/i) ||
                       html.match(/player-proxy\.php\?id=(\d+)/i);
        
        var epUrl = lurl;
        if (pidMatch && pidMatch[1]) {
            epUrl = BASEURL + "/player-proxy.php?id=" + pidMatch[1];
        }

        var servers = [
            {
                name: "Phát trực tiếp",
                episodes: [
                    { id: epUrl, name: "Xem Phim (Web)", slug: "full" }
                ]
            }
        ];

        return JSON.stringify({
            id: lurl,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: 2026,
            rating: 8.0,
            status: "Full",
            duration: "N/A",
            casts: "N/A",
            director: "N/A",
            category: "18+"
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            id: lurl,
            title: "error: " + e,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: []
        });
    }
}

function parseDetail(html, url) { return parseMovieDetail(html, url); }

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        if (html && typeof html === 'string') {
            var trimmed = html.trim();
            if (trimmed.indexOf("http") === 0 && trimmed.indexOf("<") === -1) {
                streamUrl = trimmed;
            }
        }
        
        if (!streamUrl && url && typeof url === 'string' && url.indexOf("http") === 0) {
            streamUrl = url;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": true,
            "mimeType": "application/x-mpegURL",
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (error) {
        return JSON.stringify({ "url": url || "", "headers": {} });
    }
}

function parseEmbedResponse(response, url) {
    try {
        var streamUrl = "";
        if (response && typeof response === 'string') {
            var trimmed = response.trim();
            if (trimmed.indexOf("http") === 0 && trimmed.indexOf("<") === -1) {
                streamUrl = trimmed;
            } else {
                var ifMatch = response.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                if (ifMatch) streamUrl = ifMatch[1];
            }
        }
        if (!streamUrl) streamUrl = url || "";

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": true,
            "mimeType": "application/x-mpegURL",
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

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
