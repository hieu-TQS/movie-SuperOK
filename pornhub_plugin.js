// =============================================================================
// VAAPP Plugin - Pornhub (Bản chuẩn hóa SuperOK / STPhim)
// Hỗ trợ duyệt danh mục, tìm kiếm, lọc và phát luồng HLS Full HD đa chất lượng
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASEURL = "https://rt.pornhub.com";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[Pornhub] " + msg);
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
        .trim();
}

function getManifest() {
    return JSON.stringify({
        "id": "pornhub",
        "name": "Pornhub",
        "description": "Kho video người lớn lớn nhất thế giới, hỗ trợ HLS Full HD đa chất lượng.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://ci.phncdn.com/www-static/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "video/search?search=vietnamese", "title": "Gái Việt (Vietnamese)", "type": "Horizontal" },
        { "slug": "video?o=mr", "title": "Mới Nhất", "type": "Horizontal" },
        { "slug": "video?o=mv", "title": "Xem Nhiều Nhất", "type": "Horizontal" },
        { "slug": "video?o=ht", "title": "Đánh Giá Cao", "type": "Horizontal" },
        { "slug": "video?c=111", "title": "Châu Á (Asian)", "type": "Horizontal" },
        { "slug": "video?c=8", "title": "Vú Bự (Big Tits)", "type": "Horizontal" },
        { "slug": "video?c=35", "title": "Lỗ Nhị (Anal)", "type": "Horizontal" },
        { "slug": "video?c=15", "title": "Xuất Trong (Creampie)", "type": "Horizontal" },
        { "slug": "video?c=29", "title": "MILF / Gái Một Con", "type": "Horizontal" },
        { "slug": "video?c=65", "title": "Chơi 3 (Threesome)", "type": "Horizontal" },
        { "slug": "video?c=80", "title": "Tập Thể (Gangbang)", "type": "Horizontal" },
        { "slug": "video?c=86", "title": "Hentai / Hoạt Hình", "type": "Horizontal" },
        { "slug": "video?c=103", "title": "4K Siêu Nét", "type": "Horizontal" },
        { "slug": "video", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "video/search?search=vietnamese", "name": "Gái Việt (Vietnamese)" },
        { "slug": "video?c=111", "name": "Châu Á (Asian)" },
        { "slug": "video?c=8", "name": "Vú Bự (Big Tits)" },
        { "slug": "video?c=35", "name": "Lỗ Nhị (Anal)" },
        { "slug": "video?c=15", "name": "Xuất Trong (Creampie)" },
        { "slug": "video?c=29", "name": "MILF (Gái Một Con)" },
        { "slug": "video?c=27", "name": "Đồng Tính Nữ (Lesbian)" },
        { "slug": "video?c=65", "name": "Chơi 3 (Threesome)" },
        { "slug": "video?c=80", "name": "Tập Thể (Gangbang)" },
        { "slug": "video?c=86", "name": "Hentai / Hoạt Hình" },
        { "slug": "video?c=103", "name": "4K Ultra HD" }
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "mr" },
            { "name": "Xem nhiều nhất", "value": "mv" },
            { "name": "Đánh giá cao", "value": "ht" },
            { "name": "Phổ biến nhất", "value": "tr" }
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
        var sortValue = "";

        if (filtersJson) {
            try {
                var fixedJson = typeof filtersJson === 'string'
                    ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    : JSON.stringify(filtersJson);
                var filters = (typeof filtersJson === 'object') ? filtersJson : JSON.parse(fixedJson);

                if (filters.page) page = parseInt(filters.page) || 1;
                if (filters.sort) {
                    if (typeof filters.sort === 'string') sortValue = filters.sort;
                    else if (Array.isArray(filters.sort) && filters.sort.length > 0) sortValue = filters.sort[0].value || filters.sort[0];
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (err) {}
        }

        if (!path) path = "video";

        var fullUrl = (path.indexOf('http') === 0) ? path : (BASEURL + "/" + path.replace(/^\/+/, ''));

        if (sortValue && fullUrl.indexOf('o=') === -1) {
            fullUrl += (fullUrl.indexOf('?') > -1 ? '&' : '?') + 'o=' + sortValue;
        }

        if (page > 1) {
            fullUrl += (fullUrl.indexOf('?') > -1 ? '&' : '?') + 'page=' + page;
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "video");
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
    var url = BASEURL + "/video/search?search=" + cleanKeyword;
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getSearchUrl(keyword, page) {
    return getUrlSearch(keyword, page);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    if (slug.indexOf('view_video.php') !== -1) {
        return BASEURL + "/" + slug.replace(/^\/+/, '');
    }
    return BASEURL + "/view_video.php?viewkey=" + encodeURIComponent(slug);
}

function getUrlCategories() { return BASEURL + "/categories"; }
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

        var itemRegex = /<li[^>]+class=['"][^'"]*videoblock[^'"]*['"][^>]*>([\s\S]*?)<\/li>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var block = match[0];

            var vkeyMatch = block.match(/data-video-vkey=['"]([^'"]+)['"]/i)
                || block.match(/href=['"]\/view_video\.php\?viewkey=([a-zA-Z0-9]+)['"]/i)
                || block.match(/data-vkey=['"]([^'"]+)['"]/i);

            if (!vkeyMatch) continue;
            var vkey = vkeyMatch[1];
            if (seenKeys[vkey]) continue;
            seenKeys[vkey] = true;

            var titleMatch = block.match(/<span[^>]+class=['"][^'"]*title[^'"]*['"][^>]*>[\s\S]*?<a[^>]+title=['"]([^"']+)['"]/i)
                || block.match(/<span[^>]+class=['"][^'"]*title[^'"]*['"][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i)
                || block.match(/<a[^>]+class=['"][^'"]*linkVideoThumb[^'"]*['"][^>]+title=['"]([^"']+)['"]/i)
                || block.match(/title=['"]([^"']{4,})['"]/i);

            var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '')) : "Pornhub Video";

            var thumbMatch = block.match(/data-image=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-thumb_url=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/src=['"]([^"']+\.(?:jpg|jpeg|webp|png)[^"']*)['"]/i)
                || block.match(/data-image=['"]([^"']+)['"]/i)
                || block.match(/data-thumb_url=['"]([^"']+)['"]/i)
                || block.match(/data-src=['"]([^"']+)['"]/i)
                || block.match(/src=['"]([^"']+)['"]/i);

            var thumb = "";
            if (thumbMatch && thumbMatch[1] && thumbMatch[1].indexOf('data:image') === -1) {
                thumb = thumbMatch[1].replace(/&amp;/g, '&');
            }

            var durationMatch = block.match(/<var[^>]+class=['"]duration['"][^>]*>([\s\S]*?)<\/var>/i);
            var duration = durationMatch ? durationMatch[1].trim() : "";

            items.push({
                "id": "view_video.php?viewkey=" + vkey,
                "title": title,
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration
            });
        }

        if (items.length === 0) {
            var fbRegex = /<a[^>]+href=['"]\/view_video\.php\?viewkey=([a-zA-Z0-9]+)['"][^>]+title=['"]([^"']+)['"][^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = fbRegex.exec(html)) !== null) {
                var fbKey = match[1];
                var fbTitle = decodeHtml(match[2]);
                var innerHtml = match[3];

                if (seenKeys[fbKey]) continue;
                seenKeys[fbKey] = true;

                var imgM = innerHtml.match(/src=['"]([^"']+)['"]/i) || innerHtml.match(/data-image=['"]([^"']+)['"]/i);
                var fbThumb = (imgM && imgM[1].indexOf('data:image') === -1) ? imgM[1].replace(/&amp;/g, '&') : "";

                items.push({
                    "id": "view_video.php?viewkey=" + fbKey,
                    "title": fbTitle,
                    "posterUrl": fbThumb,
                    "backdropUrl": fbThumb
                });
            }
        }

        var currentPage = 1;
        var totalPages = 1;

        var pageCurrMatch = html.match(/class=['"][^'"]*page_current[^'"]*['"][^>]*>[\s\S]*?(\d+)[\s\S]*?<\/li>/i)
            || html.match(/class=['"][^'"]*page_current[^'"]*['"][^>]*>(\d+)/i)
            || html.match(/active['"][^>]*>\s*(\d+)\s*<\/span>/i);

        if (pageCurrMatch) {
            currentPage = parseInt(pageCurrMatch[1]) || 1;
        }

        var pageTotalMatch = html.match(/<li[^>]+class=['"][^'"]*page_number[^'"]*['"][^>]*>[\s\S]*?<a[^>]*>(\d+)<\/a>/gi);
        if (pageTotalMatch && pageTotalMatch.length > 0) {
            var lastNumMatch = pageTotalMatch[pageTotalMatch.length - 1].match(/>(\d+)<\/a>/i);
            if (lastNumMatch) {
                totalPages = parseInt(lastNumMatch[1]) || currentPage;
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
        var title = "Pornhub Video";
        var poster = "";
        var duration = "N/A";
        var description = "";
        var hlsUrl = "";
        var episodes = [];
        var maxQuality = "1080p";

        var fvMatch = html.match(/flashvars_\d+\s*=\s*(\{[\s\S]*?\});/);
        if (fvMatch) {
            try {
                var fv = JSON.parse(fvMatch[1]);
                if (fv.video_title) title = decodeHtml(fv.video_title);
                if (fv.image_url) poster = fv.image_url;
                if (fv.video_duration) {
                    var durSec = parseInt(fv.video_duration) || 0;
                    if (durSec > 0) {
                        var m = Math.floor(durSec / 60);
                        var s = durSec % 60;
                        duration = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                    }
                }

                if (fv.mediaDefinitions && Array.isArray(fv.mediaDefinitions)) {
                    var hlsItems = [];
                    var mp4Items = [];
                    for (var i = 0; i < fv.mediaDefinitions.length; i++) {
                        var md = fv.mediaDefinitions[i];
                        if (!md || !md.videoUrl) continue;
                        var qual = (md.quality ? md.quality + "p" : (md.height ? md.height + "p" : "HD"));
                        if (md.format === "hls") {
                            hlsItems.push({
                                id: md.videoUrl,
                                name: "HLS " + qual,
                                slug: "hls_" + qual,
                                qualityNum: parseInt(md.quality || md.height) || 0
                            });
                            if (!hlsUrl) hlsUrl = md.videoUrl;
                        } else if (md.format === "mp4") {
                            mp4Items.push({
                                id: md.videoUrl,
                                name: "MP4 " + qual,
                                slug: "mp4_" + qual,
                                qualityNum: parseInt(md.quality || md.height) || 0
                            });
                        }
                    }

                    hlsItems.sort(function(a, b) { return b.qualityNum - a.qualityNum; });
                    mp4Items.sort(function(a, b) { return b.qualityNum - a.qualityNum; });

                    if (hlsItems.length > 0 && hlsItems[0].qualityNum > 0) {
                        maxQuality = hlsItems[0].qualityNum + "p";
                    }

                    episodes = hlsItems.concat(mp4Items);
                }
            } catch (e) {
                log("Lỗi parse flashvars: " + e);
            }
        }

        if (!title || title === "Pornhub Video") {
            var ogTitle = html.match(/<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^"']+)['"]/i)
                || html.match(/<title>([\s\S]*?)<\/title>/i);
            if (ogTitle) title = decodeHtml(ogTitle[1].replace(/ - Pornhub.*/i, ''));
        }
        if (!poster) {
            var ogImg = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^"']+)['"]/i)
                || html.match(/<link[^>]+rel=['"]image_src['"][^>]+href=['"]([^"']+)['"]/i);
            if (ogImg) poster = ogImg[1];
        }
        if (!hlsUrl && episodes.length === 0) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) {
                hlsUrl = m3u8Match[0];
                episodes.push({ id: hlsUrl, name: "Xem Ngay (HLS)", slug: "full" });
            }
        }
        if (episodes.length === 0 && hlsUrl) {
            episodes.push({ id: hlsUrl, name: "Xem Ngay", slug: "full" });
        }
        if (episodes.length === 0) {
            episodes.push({ id: "", name: "Không tìm thấy luồng", slug: "full" });
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
                    name: "Pornhub Server",
                    episodes: episodes
                }
            ],
            quality: maxQuality,
            year: 2026,
            rating: 9.0,
            status: "Full",
            duration: duration,
            casts: "Pornhub",
            director: "Pornhub",
            category: "18+"
        });

    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({
            id: "",
            title: "Pornhub Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "Pornhub Server", episodes: [{ id: "", name: "Lỗi phát", slug: "full" }] }],
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
        var fvMatch = html.match(/flashvars_\d+\s*=\s*(\{[\s\S]*?\});/);
        if (fvMatch) {
            try {
                var fv = JSON.parse(fvMatch[1]);
                if (fv.mediaDefinitions && Array.isArray(fv.mediaDefinitions)) {
                    var bestQual = -1;
                    for (var i = 0; i < fv.mediaDefinitions.length; i++) {
                        var md = fv.mediaDefinitions[i];
                        if (md && md.videoUrl && md.format === "hls") {
                            var q = parseInt(md.quality || md.height) || 0;
                            if (q > bestQual) {
                                bestQual = q;
                                streamUrl = md.videoUrl;
                            }
                        }
                    }
                    if (!streamUrl) {
                        for (var j = 0; j < fv.mediaDefinitions.length; j++) {
                            if (fv.mediaDefinitions[j] && fv.mediaDefinitions[j].videoUrl) {
                                streamUrl = fv.mediaDefinitions[j].videoUrl;
                                break;
                            }
                        }
                    }
                }
            } catch (e) {}
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
                "Cookie": "hasVisited=1; age_verified=1; accessAgeDisclaimerPH=1; platform=pc;",
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
video/search?search=vietnamese@@Gái Việt (Vietnamese)
video?c=111@@Châu Á (Asian)
video?c=8@@Vú Bự (Big Tits)
video?c=35@@Lỗ Nhị (Anal)
video?c=15@@Xuất Trong (Creampie)
video?c=29@@MILF (Gái Một Con)
video?c=27@@Đồng Tính Nữ (Lesbian)
video?c=65@@Chơi 3 (Threesome)
video?c=80@@Tập Thể (Gangbang)
video?c=86@@Hentai / Hoạt Hình
video?c=103@@4K Ultra HD
video?c=1@@Không Chuyên (Amateur)
video?c=12@@Gái Xinh (Babe)
video?c=10@@BDSM
video?c=7@@Cặc Khủng (Big Cock)
video?c=13@@Bú Cu (Blowjob)
video?c=9@@Tóc Vàng (Blonde)
video?c=14@@Tóc Nâu (Brunette)
video?c=19@@Cosplay
video?c=38@@Lỗ Đôi (Double Penetration)
video?c=16@@Da Đen (Ebony)
video?c=26@@Fetish
video?c=3@@Hardcore
video?c=28@@Trung Niên (Mature)
video?c=22@@Thủ Dâm (Masturbation)
video?c=41@@Góc Nhìn Thứ Nhất (POV)
video?c=24@@Ngoại Cảnh (Public)
video?c=30@@Tóc Đỏ (Redhead)
video?c=69@@Bắn Nước (Squirt)
video?c=73@@Cổ Điển (Vintage)
video?c=90@@HD Videos
video?c=105@@VR Porn
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
