// =============================================================================
// VAAPP Plugin - XVideos (Bản chuẩn hóa SuperOK / STPhim)
// Hỗ trợ duyệt danh mục, tìm kiếm, lọc và phát luồng HLS Full HD / MP4
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASEURL = "https://www.xv-ru.com";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[XVideos] " + msg);
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

function getManifest() {
    return JSON.stringify({
        "id": "xvideos",
        "name": "XVideos",
        "description": "Kho video người lớn XVideos hỗ trợ HLS Full HD đa chất lượng.",
        "info": "Kho video người lớn XVideos hỗ trợ HLS Full HD đa chất lượng.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/Xvideos.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "?k=vietnam", "title": "Gái Việt (Vietnamese)", "type": "Horizontal" },
        { "slug": "new/1", "title": "Mới Nhất", "type": "Horizontal" },
        { "slug": "best", "title": "Hay Nhất", "type": "Horizontal" },
        { "slug": "tags/asian", "title": "Châu Á (Asian)", "type": "Horizontal" },
        { "slug": "tags/big_tits", "title": "Vú Bự (Big Tits)", "type": "Horizontal" },
        { "slug": "tags/anal", "title": "Lỗ Nhị (Anal)", "type": "Horizontal" },
        { "slug": "tags/creampie", "title": "Xuất Trong (Creampie)", "type": "Horizontal" },
        { "slug": "tags/milf", "title": "MILF / Gái Một Con", "type": "Horizontal" },
        { "slug": "tags/threesome", "title": "Chơi 3 (Threesome)", "type": "Horizontal" },
        { "slug": "tags/gangbang", "title": "Tập Thể (Gangbang)", "type": "Horizontal" },
        { "slug": "tags/hentai", "title": "Hentai / Hoạt Hình", "type": "Horizontal" },
        { "slug": "tags/1080p", "title": "Full HD 1080p", "type": "Horizontal" },
        { "slug": "verified/videos", "title": "Người Dùng Xác Minh", "type": "Horizontal" },
        { "slug": "new/1", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "?k=vietnam", "name": "Gái Việt (Vietnamese)" },
        { "slug": "tags/asian", "name": "Châu Á (Asian)" },
        { "slug": "tags/big_tits", "name": "Vú Bự (Big Tits)" },
        { "slug": "tags/anal", "name": "Lỗ Nhị (Anal)" },
        { "slug": "tags/creampie", "name": "Xuất Trong (Creampie)" },
        { "slug": "tags/milf", "name": "MILF (Gái Một Con)" },
        { "slug": "tags/lesbian", "name": "Đồng Tính Nữ (Lesbian)" },
        { "slug": "tags/threesome", "name": "Chơi 3 (Threesome)" },
        { "slug": "tags/gangbang", "name": "Tập Thể (Gangbang)" },
        { "slug": "tags/hentai", "name": "Hentai / Hoạt Hình" },
        { "slug": "tags/1080p", "name": "Full HD 1080p" }
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "new" },
            { "name": "Hay nhất", "value": "best" },
            { "name": "Được xác minh", "value": "verified" }
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

        if (!path) path = "new/1";

        var fullUrl = (path.indexOf('http') === 0) ? path : (BASEURL + "/" + path.replace(/^\/+/, ''));

        if (page > 1) {
            if (fullUrl.indexOf('?') > -1) {
                fullUrl += "&p=" + (page - 1);
            } else if (fullUrl.indexOf('/new/') > -1) {
                fullUrl = fullUrl.replace(/\/new\/\d+/, '/new/' + page);
            } else {
                fullUrl += "/" + (page - 1);
            }
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "new/1");
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
    var cleanKeyword = encodeURIComponent(keyword || "");
    var url = BASEURL + "/?k=" + cleanKeyword;
    if (page > 1) {
        url += "&p=" + (page - 1);
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

function getUrlCategories() { return BASEURL + "/tags"; }
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

        var videoBlocks = html.split(/<div[^>]+id=['"]video_/i);

        for (var i = 1; i < videoBlocks.length; i++) {
            var block = videoBlocks[i];

            var urlMatch = block.match(/href=['"](\/video[^\x27\"\s>]+)['"]/i)
                || block.match(/href=['"](\/video\.[a-zA-Z0-9]+[^\x27\"\s>]*)['"]/i);

            if (!urlMatch) continue;
            var videoUrl = urlMatch[1].replace(/^\/+/, '');
            var vKey = videoUrl.replace(/^video[\.\-_]?/i, '').split('/')[0];

            if (seenKeys[vKey]) continue;
            seenKeys[vKey] = true;

            var titleMatch = block.match(/<p[^>]+class=['"]title['"][^>]*>[\s\S]*?<a[^>]+title=['"]([^"']+)['"]/i)
                || block.match(/<p[^>]+class=['"]title['"][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)
                || block.match(/title=['"]([^"']{4,})['"]/i);

            var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s*\d+\s*(?:min|sec|мин|сек).*$/i, '')) : "XVideos Video";

            var thumbMatch = block.match(/data-src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-src=['"]([^"']+)['"]/i)
                || block.match(/src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-mzl=['"]([^"']+)['"]/i);

            var thumb = "";
            if (thumbMatch && thumbMatch[1] && thumbMatch[1].indexOf('lightbox-blank') === -1) {
                thumb = thumbMatch[1].replace(/&amp;/g, '&');
            }

            var durMatch = block.match(/<span[^>]+class=['"]duration['"][^>]*>([\s\S]*?)<\/span>/i);
            var duration = durMatch ? durMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            items.push({
                "id": videoUrl,
                "title": title,
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration
            });
        }

        var currentPage = 1;
        var totalPages = 1;

        var activeMatch = html.match(/<a[^>]+class=['"][^'"]*active[^'"]*['"][^>]*>(\d+)<\/a>/i);
        if (activeMatch) currentPage = parseInt(activeMatch[1]) || 1;

        var lastPageMatch = html.match(/class=['"][^'"]*last-page[^'"]*['"][^>]*>(\d+)<\/a>/i);
        if (lastPageMatch) {
            totalPages = parseInt(lastPageMatch[1]) || currentPage;
        } else {
            var allPages = html.match(/<li><a[^>]*>(\d+)<\/a><\/li>/gi);
            if (allPages && allPages.length > 0) {
                var maxP = 1;
                for (var j = 0; j < allPages.length; j++) {
                    var pNumMatch = allPages[j].match(/>(\d+)<\/a>/);
                    if (pNumMatch) {
                        var pNum = parseInt(pNumMatch[1]) || 1;
                        if (pNum > maxP) maxP = pNum;
                    }
                }
                totalPages = maxP;
            }
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
        var title = "XVideos Video";
        var poster = "";
        var duration = "N/A";
        var description = "";
        var hlsUrl = "";
        var highUrl = "";
        var lowUrl = "";
        var episodes = [];

        var hlsMatch = html.match(/html5player\.setVideoHLS\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (hlsMatch && hlsMatch[1]) hlsUrl = hlsMatch[1];

        var highMatch = html.match(/html5player\.setVideoUrlHigh\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (highMatch && highMatch[1]) highUrl = highMatch[1];

        var lowMatch = html.match(/html5player\.setVideoUrlLow\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (lowMatch && lowMatch[1]) lowUrl = lowMatch[1];

        var titleMatch = html.match(/html5player\.setVideoTitle\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (titleMatch && titleMatch[1]) title = decodeHtml(titleMatch[1]);

        var thumbMatch = html.match(/html5player\.setThumbUrl169\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i)
            || html.match(/html5player\.setThumbUrl\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (thumbMatch && thumbMatch[1]) poster = thumbMatch[1];

        if (!title || title === "XVideos Video") {
            var ogTitle = html.match(/<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^"']+)['"]/i)
                || html.match(/<title>([\s\S]*?)<\/title>/i);
            if (ogTitle) title = decodeHtml(ogTitle[1].replace(/ - XVIDEOS.*/i, ''));
        }

        if (!poster) {
            var ogImg = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^"']+)['"]/i);
            if (ogImg) poster = ogImg[1];
        }

        if (hlsUrl) {
            episodes.push({ id: hlsUrl, name: "HLS (Auto / Đa chất lượng)", slug: "hls_auto" });
        }
        if (highUrl) {
            episodes.push({ id: highUrl, name: "MP4 HD (Chất lượng cao)", slug: "mp4_hd" });
        }
        if (lowUrl && lowUrl !== highUrl) {
            episodes.push({ id: lowUrl, name: "MP4 SD (Tiết kiệm dữ liệu)", slug: "mp4_sd" });
        }

        if (episodes.length === 0) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) {
                hlsUrl = m3u8Match[0];
                episodes.push({ id: hlsUrl, name: "Xem Ngay (HLS)", slug: "full" });
            }
        }

        var mainStream = (episodes[0] && episodes[0].id) ? episodes[0].id : hlsUrl;

        return JSON.stringify({
            id: mainStream,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description || title,
            servers: [
                {
                    name: "XVideos Server",
                    episodes: episodes
                }
            ],
            quality: "HD",
            year: 2026,
            rating: 9.0,
            status: "Full",
            duration: duration,
            casts: "XVideos",
            director: "XVideos",
            category: "18+"
        });

    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({
            id: "",
            title: "XVideos Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "XVideos Server", episodes: [{ id: "", name: "Lỗi phát", slug: "full" }] }],
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
        var hlsMatch = html.match(/html5player\.setVideoHLS\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
        if (hlsMatch && hlsMatch[1]) streamUrl = hlsMatch[1];

        if (!streamUrl) {
            var highMatch = html.match(/html5player\.setVideoUrlHigh\s*\(\s*[\x27\"]([^\x27\"]+)[\x27\"]\s*\)/i);
            if (highMatch && highMatch[1]) streamUrl = highMatch[1];
        }

        if (!streamUrl) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) streamUrl = m3u8Match[0];
        }

        var customJs = textJS(html, url);

        return JSON.stringify({
            url: streamUrl || url,
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
?k=vietnam@@Gái Việt (Vietnamese)
tags/asian@@Châu Á (Asian)
tags/big_tits@@Vú Bự (Big Tits)
tags/anal@@Lỗ Nhị (Anal)
tags/creampie@@Xuất Trong (Creampie)
tags/milf@@MILF (Gái Một Con)
tags/lesbian@@Đồng Tính Nữ (Lesbian)
tags/threesome@@Chơi 3 (Threesome)
tags/gangbang@@Tập Thể (Gangbang)
tags/hentai@@Hentai / Hoạt Hình
tags/1080p@@Full HD 1080p
tags/amateur@@Không Chuyên (Amateur)
tags/blowjob@@Bú Cu (Blowjob)
tags/blonde@@Tóc Vàng (Blonde)
tags/brunette@@Tóc Nâu (Brunette)
tags/japanese@@Nhật Bản (Japanese)
tags/korean@@Hàn Quốc (Korean)
tags/chinese@@Trung Quốc (Chinese)
tags/cosplay@@Cosplay
tags/double_penetration@@Lỗ Đôi (Double Penetration)
tags/ebony@@Da Đen (Ebony)
tags/masturbation@@Thủ Dâm (Masturbation)
tags/pov@@Góc Nhìn Thứ Nhất (POV)
tags/public@@Ngoại Cảnh (Public)
tags/redhead@@Tóc Đỏ (Redhead)
tags/squirt@@Bắn Nước (Squirt)
tags/vintage@@Cổ Điển (Vintage)
verified/videos@@Người Dùng Xác Minh
best@@Hay Nhất
new/1@@Hàng Mới Cập Nhật
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
