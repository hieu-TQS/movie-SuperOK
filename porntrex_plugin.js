// =============================================================================
// VAAPP Plugin - PornTrex (Bản chuẩn hóa SuperOK / STPhim)
// Hỗ trợ duyệt danh mục, tìm kiếm, lọc và phát luồng 4K / 1080p / 720p / HLS
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASEURL = "https://www.porntrex.tv";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[PornTrex] " + msg);
    }
}

function decodeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&mdash;/g, "-")
        .replace(/&ndash;/g, "-")
        .trim();
}

function cleanStreamUrl(url) {
    if (!url) return "";
    var res = url;
    if (res.indexOf('//') === 0) res = "https:" + res;
    return res;
}

function getManifest() {
    return JSON.stringify({
        "id": "porntrex",
        "name": "PornTrex",
        "description": "Kho video người lớn 4K / Full HD chất lượng cao không quảng cáo.",
        "version": "1.0.1",
        "baseUrl": BASEURL,
        "iconUrl": "https://ptx.cdntrex.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "search/vietnamese", "title": "Gái Việt (Vietnamese)", "type": "Horizontal" },
        { "slug": "latest-updates", "title": "Mới Nhất (Latest Updates)", "type": "Horizontal" },
        { "slug": "most-popular", "title": "Xem Nhiều Nhất (Most Popular)", "type": "Horizontal" },
        { "slug": "top-rated", "title": "Đánh Giá Cao (Top Rated)", "type": "Horizontal" },
        { "slug": "categories/4k-porn", "title": "4K Ultra HD", "type": "Horizontal" },
        { "slug": "categories/asian", "title": "Châu Á (Asian)", "type": "Horizontal" },
        { "slug": "categories/big-tits", "title": "Vú Bự (Big Tits)", "type": "Horizontal" },
        { "slug": "categories/anal", "title": "Lỗ Nhị (Anal)", "type": "Horizontal" },
        { "slug": "categories/creampie", "title": "Xuất Trong (Creampie)", "type": "Horizontal" },
        { "slug": "categories/milf", "title": "MILF (Gái Một Con)", "type": "Horizontal" },
        { "slug": "categories/hentai", "title": "Hentai / Hoạt Hình", "type": "Horizontal" },
        { "slug": "categories/japanese", "title": "Nhật Bản (Japanese)", "type": "Horizontal" },
        { "slug": "categories/homemade", "title": "Tự Quay (Homemade)", "type": "Horizontal" },
        { "slug": "latest-updates", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "search/vietnamese", "name": "Gái Việt (Vietnamese)" },
        { "slug": "latest-updates", "name": "Mới Nhất (Latest Updates)" },
        { "slug": "most-popular", "name": "Xem Nhiều Nhất" },
        { "slug": "top-rated", "name": "Đánh Giá Cao" },
        { "slug": "categories/4k-porn", "name": "4K Ultra HD" },
        { "slug": "categories/asian", "name": "Châu Á (Asian)" },
        { "slug": "categories/big-tits", "name": "Vú Bự (Big Tits)" },
        { "slug": "categories/anal", "name": "Lỗ Nhị (Anal)" },
        { "slug": "categories/creampie", "name": "Xuất Trong (Creampie)" },
        { "slug": "categories/milf", "name": "MILF (Gái Một Con)" },
        { "slug": "categories/hentai", "name": "Hentai / Hoạt Hình" }
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "latest-updates" },
            { "name": "Xem nhiều nhất", "value": "most-popular" },
            { "name": "Đánh giá cao", "value": "top-rated" }
        ],
        "category": menulist
    });
}

function getFilterConfig() {
    return getFilters();
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            try {
                var fixedJson = typeof filtersJson === 'string'
                    ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    : JSON.stringify(filtersJson);
                var filters = (typeof filtersJson === 'object') ? filtersJson : JSON.parse(fixedJson);

                if (filters.page) page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (err) {}
        }

        if (!path) path = "latest-updates";

        var cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
        var fullUrl = (cleanPath.indexOf('http') === 0) ? cleanPath : (BASEURL + "/" + cleanPath);

        if (page > 1) {
            if (fullUrl.indexOf('?') > -1) {
                fullUrl += "&from=" + (page < 10 ? "0" + page : page);
            } else {
                fullUrl += "/" + page + "/";
            }
        } else {
            if (fullUrl.indexOf('?') === -1) {
                fullUrl += "/";
            }
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "latest-updates") + "/";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        if (typeof filtersJson === 'number') {
            page = filtersJson;
        } else if (typeof filtersJson === 'string') {
            try {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                var parsed = JSON.parse(fixedJson);
                if (parsed.page) page = parseInt(parsed.page) || 1;
            } catch (e) {}
        } else if (typeof filtersJson === 'object' && filtersJson.page) {
            page = parseInt(filtersJson.page) || 1;
        }
    }
    var cleanKeyword = encodeURIComponent(keyword || "").replace(/%20/g, '-');
    var url = BASEURL + "/search/" + cleanKeyword + "/";
    if (page > 1) {
        url += page + "/";
    }
    return url;
}

function getSearchUrl(keyword, page) {
    return getUrlSearch(keyword, page);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug.replace(/^\/+/, '');
}

function getUrlCategories() { return BASEURL + "/categories/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });

        var items = [];
        var seenKeys = {};

        var itemBlocks = html.split(/<div[^>]+class=['"][^'"]*video-item[^\x27\"]*['"]/i);

        for (var i = 1; i < itemBlocks.length; i++) {
            var block = itemBlocks[i];

            // 1. URL
            var urlMatch = block.match(/href=['"](?:https?:\/\/[^\/]+)?\/video\/(\d+)\/([^\x27\"\s>]+)['"]/i)
                || block.match(/href=['"](?:https?:\/\/[^\/]+)?\/(video\/\d+\/[^\x27\"\s>]+)['"]/i);

            if (!urlMatch) continue;
            var videoId = urlMatch[1];
            var videoUrl = (urlMatch[2] ? 'video/' + videoId + '/' + urlMatch[2] : urlMatch[1]).replace(/^\/+/, '');

            if (seenKeys[videoId]) continue;
            seenKeys[videoId] = true;

            // 2. Title
            var titleMatch = block.match(/alt=['"]([^"']+)['"]/i)
                || block.match(/title=['"]([^"']{4,})['"]/i)
                || block.match(/<a[^>]+class=['"][^'"]*title[^\x27\"]*['"][^>]*>([\s\S]*?)<\/a>/i);

            var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '')) : "PornTrex Video";

            // 3. Thumbnail
            var thumbMatch = block.match(/data-src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-src=['"]([^"']+)['"]/i)
                || block.match(/src=['"]([^"']+)['"]/i);

            var thumb = "";
            if (thumbMatch && thumbMatch[1] && thumbMatch[1].indexOf('data:image') === -1) {
                thumb = thumbMatch[1].replace(/&amp;/g, '&');
                if (thumb.indexOf('//') === 0) thumb = "https:" + thumb;
            }

            // 4. Duration
            var durMatch = block.match(/<div[^>]+class=['"][^'"]*durations[^\x27\"]*['"][^>]*>([\s\S]*?)<\/div>/i)
                || block.match(/<span[^>]+class=['"][^'"]*duration[^\x27\"]*['"][^>]*>([\s\S]*?)<\/span>/i);
            var duration = durMatch ? durMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            items.push({
                "id": videoUrl,
                "title": title,
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration
            });
        }

        // Extract pagination
        var currentPage = 1;
        var totalPages = 1;

        var currMatch = html.match(/class=['"][^'"]*active[^\x27\"]*['"][^>]*>[\s\S]*?(\d+)[\s\S]*?<\/[ali]+/i)
            || html.match(/class=['"][^'"]*current[^\x27\"]*['"][^>]*>[\s\S]*?(\d+)[\s\S]*?<\/[ali]+/i);
        if (currMatch) currentPage = parseInt(currMatch[1]) || 1;

        var pageLinks = html.match(/<a[^>]+aria-label=['"]pagination['"][^>]*>(\d+)<\/a>/gi)
            || html.match(/<a[^>]+href=['"][^'"]*\/(\d+)\/['"][^>]*>\d+<\/a>/gi);

        if (pageLinks && pageLinks.length > 0) {
            var maxP = 1;
            for (var j = 0; j < pageLinks.length; j++) {
                var pM = pageLinks[j].match(/>(\d+)<\/a>/) || pageLinks[j].match(/\/(\d+)\//);
                if (pM) {
                    var n = parseInt(pM[1]) || 1;
                    if (n > maxP) maxP = n;
                }
            }
            totalPages = maxP;
        }
        if (totalPages < currentPage) totalPages = currentPage + 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "totalItems": items.length,
                "itemsPerPage": items.length
            }
        });

    } catch (e) {
        log("Lỗi parseListResponse: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var title = "PornTrex Video";
        var poster = "";
        var duration = "N/A";
        var description = "";
        var episodes = [];
        var maxQuality = "1080p";
        var category = "18+";

        var fvMatch = html.match(/flashvars\s*=\s*(\{[\s\S]*?\});/i)
            || html.match(/var\s+flashvars\s*=\s*(\{[\s\S]*?\});/i);

        if (fvMatch) {
            var fvStr = fvMatch[1];
            var tM = fvStr.match(/video_title:\s*['"]([^'"]+)['"]/i);
            if (tM) title = decodeHtml(tM[1]);

            var cM = fvStr.match(/video_categories:\s*['"]([^'"]+)['"]/i);
            if (cM) category = decodeHtml(cM[1]);

            var pM = fvStr.match(/preview_url:\s*['"]([^'"]+)['"]/i);
            if (pM) {
                poster = pM[1];
                if (poster.indexOf('//') === 0) poster = "https:" + poster;
            }

            var hlsM = fvStr.match(/video_hls_url:\s*['"]([^'"]+)['"]/i);
            if (hlsM && hlsM[1]) {
                episodes.push({ id: cleanStreamUrl(hlsM[1]), name: "HLS (Auto)", slug: "hls_auto" });
            }

            var url4k = fvStr.match(/video_alt_url3:\s*['"]([^'"]+)['"]/i);
            var text4k = fvStr.match(/video_alt_url3_text:\s*['"]([^'"]+)['"]/i);
            if (url4k && url4k[1]) {
                var label4k = text4k ? text4k[1] : "4K Ultra HD";
                episodes.push({ id: cleanStreamUrl(url4k[1]), name: "MP4 " + label4k, slug: "mp4_4k" });
                maxQuality = "4K";
            }

            var url1080 = fvStr.match(/video_alt_url2:\s*['"]([^'"]+)['"]/i);
            var text1080 = fvStr.match(/video_alt_url2_text:\s*['"]([^'"]+)['"]/i);
            if (url1080 && url1080[1]) {
                var label1080 = text1080 ? text1080[1] : "1080p HD";
                episodes.push({ id: cleanStreamUrl(url1080[1]), name: "MP4 " + label1080, slug: "mp4_1080p" });
            }

            var url720 = fvStr.match(/video_alt_url:\s*['"]([^'"]+)['"]/i);
            var text720 = fvStr.match(/video_alt_url_text:\s*['"]([^'"]+)['"]/i);
            if (url720 && url720[1]) {
                var label720 = text720 ? text720[1] : "720p HD";
                episodes.push({ id: cleanStreamUrl(url720[1]), name: "MP4 " + label720, slug: "mp4_720p" });
            }

            var urlDef = fvStr.match(/video_url:\s*['"]([^'"]+)['"]/i);
            var textDef = fvStr.match(/video_url_text:\s*['"]([^'"]+)['"]/i);
            if (urlDef && urlDef[1]) {
                var labelDef = textDef ? textDef[1] : "480p";
                episodes.push({ id: cleanStreamUrl(urlDef[1]), name: "MP4 " + labelDef, slug: "mp4_def" });
            }
        }

        if (!title || title === "PornTrex Video") {
            var ogTitle = html.match(/<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^"']+)['"]/i)
                || html.match(/<title>([\s\S]*?)<\/title>/i);
            if (ogTitle) title = decodeHtml(ogTitle[1].replace(/ - PornTrex.*/i, ''));
        }
        if (!poster) {
            var ogImg = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^"']+)['"]/i);
            if (ogImg) {
                poster = ogImg[1];
                if (poster.indexOf('//') === 0) poster = "https:" + poster;
            }
        }

        if (episodes.length === 0) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) {
                episodes.push({ id: cleanStreamUrl(m3u8Match[0]), name: "HLS Stream", slug: "hls" });
            }
        }

        var mainStream = (episodes[0] && episodes[0].id) ? episodes[0].id : "";

        return JSON.stringify({
            id: mainStream,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description || title,
            servers: [
                {
                    name: "PornTrex Server",
                    episodes: episodes
                }
            ],
            quality: maxQuality,
            year: 2026,
            rating: 9.0,
            status: "Full",
            duration: duration,
            casts: "PornTrex",
            director: "PornTrex",
            category: category
        });

    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({
            id: "",
            title: "PornTrex Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "PornTrex Server", episodes: [{ id: "", name: "Lỗi phát", slug: "full" }] }],
            quality: "HD",
            year: 2026,
            rating: 8.0,
            status: "Full",
            duration: "N/A",
            casts: "N/A",
            director: "N/A",
            category: "18+"
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        var fvMatch = html.match(/flashvars\s*=\s*(\{[\s\S]*?\});/i)
            || html.match(/var\s+flashvars\s*=\s*(\{[\s\S]*?\});/i);

        if (fvMatch) {
            var fvStr = fvMatch[1];
            var url4k = fvStr.match(/video_alt_url3:\s*['"]([^'"]+)['"]/i);
            var url1080 = fvStr.match(/video_alt_url2:\s*['"]([^'"]+)['"]/i);
            var url720 = fvStr.match(/video_alt_url:\s*['"]([^'"]+)['"]/i);
            var urlDef = fvStr.match(/video_url:\s*['"]([^'"]+)['"]/i);
            var hlsM = fvStr.match(/video_hls_url:\s*['"]([^'"]+)['"]/i);

            if (url1080 && url1080[1]) streamUrl = url1080[1];
            else if (url4k && url4k[1]) streamUrl = url4k[1];
            else if (url720 && url720[1]) streamUrl = url720[1];
            else if (urlDef && urlDef[1]) streamUrl = urlDef[1];
            else if (hlsM && hlsM[1]) streamUrl = hlsM[1];
        }

        if (!streamUrl) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) streamUrl = m3u8Match[0];
        }

        var finalStream = cleanStreamUrl(streamUrl || url);
        var customJs = textJS(html, url);

        return JSON.stringify({
            url: finalStream,
            headers: {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJs.trim()
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
    }
}

function textJS(html, $url) {
    return `
function initCustomVideoFix() {
    const style = document.createElement('style');
    var customcss = 'body { background: black; overflow: hidden; }';
    style.innerHTML = customcss;
    document.head.appendChild(style);
    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('click', () => { autoFullscreenLoop(video); });
        autoFullscreenLoop(video);
    }
} 

function autoFullscreenLoop(videoElement) {
    if (!videoElement) return;
    const checkInterval = setInterval(() => {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (isFullscreen) { clearInterval(checkInterval); return; }
        videoElement.muted = false;
        if (videoElement.paused) { videoElement.play().catch(err => {}); }
        if (videoElement.requestFullscreen) { videoElement.requestFullscreen().catch(err => {}); }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
    initCustomVideoFix();
}
`;
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
search/vietnamese@@Gái Việt (Vietnamese)
latest-updates@@Mới Nhất (Latest Updates)
most-popular@@Xem Nhiều Nhất
top-rated@@Đánh Giá Cao
categories/4k-porn@@4K Ultra HD
categories/asian@@Châu Á (Asian)
categories/big-tits@@Vú Bự (Big Tits)
categories/anal@@Lỗ Nhị (Anal)
categories/creampie@@Xuất Trong (Creampie)
categories/milf@@MILF (Gái Một Con)
categories/lesbian@@Đồng Tính Nữ (Lesbian)
categories/threesome@@Chơi 3 (Threesome)
categories/gangbang@@Tập Thể (Gangbang)
categories/hentai@@Hentai / Hoạt Hình
categories/japanese@@Nhật Bản (Japanese)
categories/homemade@@Tự Quay (Homemade)
categories/amateur@@Không Chuyên (Amateur)
categories/blowjob@@Bú Cu (Blowjob)
categories/blonde@@Tóc Vàng (Blonde)
categories/brunette@@Tóc Nâu (Brunette)
categories/cosplay@@Cosplay
categories/double-penetration@@Lỗ Đôi (Double Penetration)
categories/ebony@@Da Đen (Ebony)
categories/masturbation@@Thủ Dâm (Masturbation)
categories/pov@@Góc Nhìn Thứ Nhất (POV)
categories/public@@Ngoái Cảnh (Public)
categories/red-head@@Tóc Đỏ (Redhead)
categories/squirt@@Bắn Nước (Squirt)
categories/vintage@@Cổ Điển (Vintage)
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
