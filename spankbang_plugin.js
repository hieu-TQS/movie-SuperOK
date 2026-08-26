// =============================================================================
// VAAPP Plugin - SpankBang (Bản chuẩn hóa SuperOK / STPhim)
// Hỗ trợ duyệt danh mục, tìm kiếm, lọc và phát luồng 4K / 1080p / 720p / HLS
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASEURL = "https://jp.spankbang.com/";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[SpankBang] " + msg);
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
        "id": "spankbang",
        "name": "SpankBang",
        "description": "Kho video người lớn chất lượng cao 4K / 1080p / HLS hàng đầu thế giới.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://spankbang.com/static/desktop/images/favicon/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "s/vietnamese", "title": "Gái Việt (Vietnamese)", "type": "Horizontal" },
        { "slug": "trending_videos", "title": "Thịnh Hành (Trending)", "type": "Horizontal" },
        { "slug": "most_popular", "title": "Xem Nhiều Nhất (Most Popular)", "type": "Horizontal" },
        { "slug": "new_videos", "title": "Mới Nhất (New Videos)", "type": "Horizontal" },
        { "slug": "4k", "title": "4K Ultra HD", "type": "Horizontal" },
        { "slug": "1080p", "title": "Full HD 1080p", "type": "Horizontal" },
        { "slug": "s/asian", "title": "Châu Á (Asian)", "type": "Horizontal" },
        { "slug": "s/japanese", "title": "Nhật Bản (Japanese)", "type": "Horizontal" },
        { "slug": "s/korean", "title": "Hàn Quốc (Korean)", "type": "Horizontal" },
        { "slug": "s/big+tits", "title": "Vú Bự (Big Tits)", "type": "Horizontal" },
        { "slug": "s/anal", "title": "Lỗ Nhị (Anal)", "type": "Horizontal" },
        { "slug": "s/creampie", "title": "Xuất Trong (Creampie)", "type": "Horizontal" },
        { "slug": "s/milf", "title": "MILF (Gái Một Con)", "type": "Horizontal" },
        { "slug": "s/hentai", "title": "Hentai / Hoạt Hình", "type": "Horizontal" },
        { "slug": "trending_videos", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "s/vietnamese", "name": "Gái Việt (Vietnamese)" },
        { "slug": "trending_videos", "name": "Thịnh Hành (Trending)" },
        { "slug": "most_popular", "name": "Xem Nhiều Nhất" },
        { "slug": "new_videos", "name": "Mới Nhất" },
        { "slug": "4k", "name": "4K Ultra HD" },
        { "slug": "1080p", "name": "Full HD 1080p" },
        { "slug": "s/asian", "name": "Châu Á (Asian)" },
        { "slug": "s/big+tits", "name": "Vú Bự (Big Tits)" },
        { "slug": "s/anal", "name": "Lỗ Nhị (Anal)" },
        { "slug": "s/creampie", "name": "Xuất Trong (Creampie)" },
        { "slug": "s/milf", "name": "MILF (Gái Một Con)" },
        { "slug": "s/hentai", "name": "Hentai / Hoạt Hình" }
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Thịnh hành", "value": "trending_videos" },
            { "name": "Xem nhiều nhất", "value": "most_popular" },
            { "name": "Mới nhất", "value": "new_videos" }
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

        if (!path) path = "trending_videos";

        var cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
        var fullUrl = (cleanPath.indexOf('http') === 0) ? cleanPath : (BASEURL + "/" + cleanPath);

        if (page > 1) {
            if (fullUrl.indexOf('?') > -1) {
                fullUrl += "&p=" + page;
            } else {
                fullUrl += "/" + page + "/";
            }
        } else {
            if (fullUrl.indexOf('?') === -1 && fullUrl.indexOf('http') === 0 && cleanPath.length > 0) {
                fullUrl += "/";
            }
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "trending_videos");
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
    var cleanKeyword = encodeURIComponent(keyword || "").replace(/%20/g, '+');
    var url = BASEURL + "/s/" + cleanKeyword + "/";
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

        // Pattern: <div ... class="...video-item..." ...>
        var itemRegex = /<div[^>]+class=['"][^'"]*video-item[^'"]*['"][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var block = match[0];

            // 1. URL
            var urlMatch = block.match(/href=['"](\/[a-zA-Z0-9]+\/video\/[^\x27\"\s>]+)['"]/i)
                || block.match(/href=['"](\/[a-zA-Z0-9]+\/video\/?)['"]/i)
                || block.match(/href=['"](\/[a-zA-Z0-9]+\/watch\/[^\x27\"\s>]+)['"]/i);

            if (!urlMatch) continue;
            var videoUrl = urlMatch[1].replace(/^\/+/, '');
            var vKey = videoUrl.split('/')[0];

            if (seenKeys[vKey]) continue;
            seenKeys[vKey] = true;

            // 2. Title
            var titleMatch = block.match(/<a[^>]+class=['"][^'"]*n[^'"]*['"][^>]+title=['"]([^"']+)['"]/i)
                || block.match(/<a[^>]+class=['"][^'"]*n[^'"]*['"][^>]*>([\s\S]*?)<\/a>/i)
                || block.match(/<img[^>]+alt=['"]([^"']+)['"]/i)
                || block.match(/title=['"]([^"']{4,})['"]/i);

            var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '')) : "SpankBang Video";

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
            var durMatch = block.match(/<span[^>]+class=['"]l['"][^>]*>([\s\S]*?)<\/span>/i);
            var duration = durMatch ? durMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            items.push({
                "id": videoUrl,
                "title": title,
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration
            });
        }

        // Fallback pattern
        if (items.length === 0) {
            var fbRegex = /<a[^>]+href=['"](\/[a-zA-Z0-9]+\/video\/[^\x27\"\s>]+)['"][^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = fbRegex.exec(html)) !== null) {
                var rawLink = match[1].replace(/^\/+/, '');
                var inner = match[2];
                var key = rawLink.split('/')[0];

                if (seenKeys[key]) continue;
                seenKeys[key] = true;

                var tM = inner.match(/alt=['"]([^"']+)['"]/i) || inner.match(/title=['"]([^"']+)['"]/i);
                var tStr = tM ? decodeHtml(tM[1]) : "SpankBang Video";

                var iM = inner.match(/data-src=['"]([^"']+)['"]/i) || inner.match(/src=['"]([^"']+)['"]/i);
                var pStr = (iM && iM[1].indexOf('data:image') === -1) ? iM[1].replace(/&amp;/g, '&') : "";
                if (pStr.indexOf('//') === 0) pStr = "https:" + pStr;

                items.push({
                    "id": rawLink,
                    "title": tStr,
                    "posterUrl": pStr,
                    "backdropUrl": pStr,
                    "duration": ""
                });
            }
        }

        // Pagination
        var currentPage = 1;
        var totalPages = 1;

        var currMatch = html.match(/class=['"][^'"]*current[^'"]*['"][^>]*>(\d+)<\/span>/i)
            || html.match(/class=['"][^'"]*active[^'"]*['"][^>]*>(\d+)<\/a>/i);
        if (currMatch) currentPage = parseInt(currMatch[1]) || 1;

        var totalMatch = html.match(/<li[^>]+class=['"][^'"]*last[^'"]*['"][^>]*>[\s\S]*?<a[^>]*>(\d+)<\/a>/i)
            || html.match(/class=['"][^'"]*pagination[^'"]*['"][^>]*>[\s\S]*?(\d+)<\/a><\/li>\s*<li[^>]+class=['"][^'"]*next/i);
        if (totalMatch) {
            totalPages = parseInt(totalMatch[1]) || currentPage;
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
        var title = "SpankBang Video";
        var poster = "";
        var duration = "N/A";
        var description = "";
        var episodes = [];
        var maxQuality = "1080p";

        // 1. stream_data JSON
        var streamDataMatch = html.match(/var\s+stream_data\s*=\s*(\{[\s\S]*?\});/i)
            || html.match(/stream_data\s*=\s*(\{[\s\S]*?\});/i);

        if (streamDataMatch) {
            try {
                var sd = JSON.parse(streamDataMatch[1]);
                var keys = ['4k', '4K', '2160p', '1080p', '720p', '480p', '320p', '240p', 'm3u8', 'auto'];
                for (var i = 0; i < keys.length; i++) {
                    var k = keys[i];
                    if (sd[k]) {
                        var streamUrl = Array.isArray(sd[k]) ? sd[k][0] : sd[k];
                        if (streamUrl && typeof streamUrl === 'string' && streamUrl.length > 5) {
                            var qName = k.toUpperCase();
                            if (k === 'm3u8' || k === 'auto') qName = "HLS (Auto)";
                            episodes.push({
                                id: streamUrl,
                                name: qName,
                                slug: "stream_" + k
                            });
                        }
                    }
                }
            } catch (e) {
                log("Lỗi parse stream_data: " + e);
            }
        }

        // Title
        var tMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^"']+)['"]/i)
            || html.match(/<title>([\s\S]*?)<\/title>/i);
        if (tMatch) title = decodeHtml(tMatch[1].replace(/<[^>]+>/g, '').replace(/ - SpankBang.*/i, ''));

        // Poster
        var imgMatch = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^"']+)['"]/i)
            || html.match(/<video[^>]+poster=['"]([^"']+)['"]/i);
        if (imgMatch) poster = imgMatch[1];

        // Direct HLS fallback
        if (episodes.length === 0) {
            var m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>:]*/i);
            if (m3u8Match) {
                episodes.push({ id: m3u8Match[0], name: "HLS Stream", slug: "hls" });
            }
        }

        if (episodes.length > 0 && episodes[0].name.indexOf('4K') !== -1) maxQuality = "4K";
        else if (episodes.length > 0 && episodes[0].name.indexOf('1080') !== -1) maxQuality = "1080p";

        var mainStream = (episodes[0] && episodes[0].id) ? episodes[0].id : "";

        return JSON.stringify({
            id: mainStream,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description || title,
            servers: [
                {
                    name: "SpankBang Server",
                    episodes: episodes
                }
            ],
            quality: maxQuality,
            year: 2026,
            rating: 9.0,
            status: "Full",
            duration: duration,
            casts: "SpankBang",
            director: "SpankBang",
            category: "18+"
        });

    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({
            id: "",
            title: "SpankBang Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "SpankBang Server", episodes: [{ id: "", name: "Lỗi phát", slug: "full" }] }],
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
        var streamDataMatch = html.match(/var\s+stream_data\s*=\s*(\{[\s\S]*?\});/i)
            || html.match(/stream_data\s*=\s*(\{[\s\S]*?\});/i);

        if (streamDataMatch) {
            try {
                var sd = JSON.parse(streamDataMatch[1]);
                var keys = ['4k', '4K', '2160p', '1080p', '720p', '480p', 'm3u8', 'auto', '320p', '240p'];
                for (var i = 0; i < keys.length; i++) {
                    if (sd[keys[i]]) {
                        var val = Array.isArray(sd[keys[i]]) ? sd[keys[i]][0] : sd[keys[i]];
                        if (val && typeof val === 'string' && val.length > 5) {
                            streamUrl = val;
                            break;
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
                "Cookie": "age_verified=1; country=US;",
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
s/vietnamese@@Gái Việt (Vietnamese)
trending_videos@@Thịnh Hành (Trending)
most_popular@@Xem Nhiều Nhất
new_videos@@Mới Nhất
4k@@4K Ultra HD
1080p@@Full HD 1080p
s/asian@@Châu Á (Asian)
s/japanese@@Nhật Bản (Japanese)
s/korean@@Hàn Quốc (Korean)
s/chinese@@Trung Quốc (Chinese)
s/big+tits@@Vú Bự (Big Tits)
s/anal@@Lỗ Nhị (Anal)
s/creampie@@Xuất Trong (Creampie)
s/milf@@MILF (Gái Một Con)
s/lesbian@@Đồng Tính Nữ (Lesbian)
s/threesome@@Chơi 3 (Threesome)
s/gangbang@@Tập Thể (Gangbang)
s/hentai@@Hentai / Hoạt Hình
s/amateur@@Không Chuyên (Amateur)
s/blowjob@@Bú Cu (Blowjob)
s/blonde@@Tóc Vàng (Blonde)
s/brunette@@Tóc Nâu (Brunette)
s/cosplay@@Cosplay
s/double+penetration@@Lỗ Đôi (Double Penetration)
s/ebony@@Da Đen (Ebony)
s/masturbation@@Thủ Dâm (Masturbation)
s/pov@@Góc Nhìn Thứ Nhất (POV)
s/public@@Ngoại Cảnh (Public)
s/redhead@@Tóc Đỏ (Redhead)
s/squirt@@Bắn Nước (Squirt)
s/vintage@@Cổ Điển (Vintage)
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
