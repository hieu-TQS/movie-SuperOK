// =============================================================================
// https://tvhay.buzz/
// =============================================================================

var BASEURL = "https://tvhay.buzz";
var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "tvhay",
        "name": "TVHAY",
        "description": "Xem phim thuyết minh lồng tiếng TVHAY",
        "version": "1.0.3",
        "baseUrl": BASEURL,
        "iconUrl": "https://tvhay.buzz/favicon.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Phim Mới Cập Nhật", "type": "Grid" },
        { "slug": "/phim-bo", "title": "Phim Bộ", "type": "Grid" },
        { "slug": "/phim-le", "title": "Phim Lẻ", "type": "Grid" },
        { "slug": "/short-drama", "title": "Short Drama", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({ category: getCachedCategories() });
}

function getCachedCategories() {
    if (!_cachedCategories) _cachedCategories = buildMenu(getLISTmenu());
    return _cachedCategories;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/";
        
        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {
                    var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                    filters = JSON.parse(fixedJson);
                }
            } else {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) path = filters.category[0].slug || path;
                    else if (typeof filters.category === "string") path = filters.category;
                }
            }
        }
        
        if (path.indexOf("http") === 0) {
            if (page > 1) return path + "?page=" + page;
            return path;
        }
        
        if (path.charAt(0) !== "/") path = "/" + path;
        
        if (page > 1) {
            return BASEURL + path + "?page=" + page;
        }
        return BASEURL + path;
    } catch (e) {
        return BASEURL + (slug ? slug : "/");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson) : filtersJson;
        if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
    }
    return BASEURL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "") + "&page=" + page;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== "/") slug = "/" + slug;
    return BASEURL + slug;
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
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
        
        var itemRegex = /<div[^>]+class=["'][^"']*movie-item[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*movie-item[^"']*["']|$)/gi;
        var itemMatch;
        while ((itemMatch = itemRegex.exec(html)) !== null) {
            var block = itemMatch[1];
            var linkMatch = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/i) || block.match(/title=["']([^"']+)["'][^>]*<a[^>]+href=["']([^"']+)["']/i);
            if (!linkMatch) continue;
            
            var itemUrl = linkMatch[1];
            var itemTitle = linkMatch[2];
            
            if (itemUrl.indexOf("/") !== 0 && itemUrl.indexOf("http") !== 0) {
                itemUrl = linkMatch[2];
                itemTitle = linkMatch[1];
            }

            if (itemUrl.indexOf("http") !== 0) {
                if (itemUrl.charAt(0) !== "/") itemUrl = "/" + itemUrl;
                itemUrl = BASEURL + itemUrl;
            }
            
            var thumbMatch = block.match(/<img[^>]*?\bsrc=["']([^"']+)["']/i) || block.match(/data-src=["']([^"']+)["']/i);
            var thumb = thumbMatch ? thumbMatch[1] : "";
            
            var quality = "";
            var qualityMatch = block.match(/class=["'][^"']*movie-label[^"']*["'][^>]*>([^<]+)/i);
            if (qualityMatch) quality = qualityMatch[1].trim();
            
            var duration = "";
            var durationMatch = block.match(/class=["'][^"']*movie-ep-status[^"']*["'][^>]*>([^<]+)/i);
            if (durationMatch) duration = durationMatch[1].trim();
            
            items.push({
                "id": itemUrl,
                "title": itemTitle.trim(),
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration,
                "quality": quality
            });
        }
        
        var currentPage = 1;
        var hasNext = items.length > 0;
        var pageMatch = html.match(/class=["'][^"']*current[^"']*["'][^>]*>(\d+)/i);
        if (pageMatch) currentPage = parseInt(pageMatch[1], 10);
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": 999, "hasNext": hasNext }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(html, $url) { return parseListResponse(html, $url); }

function parseMovieDetail(html, argUrl) {
    try {
        var pageUrl = argUrl || "";
        var title = "";
        var tMatch = html.match(/class=["'][^"']*movie-name-vi[^"']*["'][^>]*>([^<]+)/i);
        if (tMatch) title = tMatch[1].trim();

        var originName = "";
        var oMatch = html.match(/class=["'][^"']*movie-name-en[^"']*["'][^>]*>([^<]+)/i);
        if (oMatch) originName = oMatch[1].trim();

        var posterUrl = "";
        var pMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (pMatch) posterUrl = pMatch[1];

        var description = "";
        var dMatch = html.match(/class=["'][^"']*movie-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        if (dMatch) description = dMatch[1].replace(/<[^>]+>/g, "").trim();

        function extractMeta(html, label) {
            var regex = new RegExp("<li>\\s*" + label + "\\s*:.*?<span[^>]*>([^<]+)<\\/span>", "i");
            var m = html.match(regex);
            if (!m) {
                var regex2 = new RegExp(label + ".*?<span[^>]*>([^<]+)<\\/span>", "i");
                m = html.match(regex2);
            }
            return m ? m[1].trim() : "";
        }

        var year = parseInt(extractMeta(html, "Năm Sản Xuất"), 10) || 0;
        var status = extractMeta(html, "Tình Trạng");
        var duration = extractMeta(html, "Thời lượng");
        var director = extractMeta(html, "Đạo diễn");
        var casts = extractMeta(html, "Diễn viên");
        
        var episodes = [];
        var watchHref = "";
        var watchMatch = html.match(/class=["'][^"']*btn-watch[^"']*["'][^>]*href=["']([^"']+)["']/i) || html.match(/href=["']([^"']+)["'][^>]*class=["'][^"']*btn-watch[^"']*["']/i);
        if (watchMatch && watchMatch[1]) {
            watchHref = watchMatch[1];
        }

        var isSeries = false;
        var maxEp = 1;
        var baseUrlPart = "";

        if (watchHref && watchHref.indexOf("tap-full") === -1 && watchHref.indexOf("tap-Full") === -1 && watchHref.match(/\/tap-\d+/i)) {
            isSeries = true;
            var epRegex = /\/xem\/([^\/]+)\/tap-(\d+)/gi;
            var epMatch;
            while ((epMatch = epRegex.exec(html)) !== null) {
                baseUrlPart = epMatch[1];
                var epNum = parseInt(epMatch[2], 10);
                if (epNum > maxEp) {
                    maxEp = epNum;
                }
            }
            
            var statusMatch = status.match(/\((?:[^\/]+\/)?(\d+)\)/i) || status.match(/Tập\s+(\d+)/i);
            if (statusMatch && parseInt(statusMatch[1], 10) > maxEp) {
                maxEp = parseInt(statusMatch[1], 10);
            }
            
            if (!baseUrlPart) {
                var watchUrlMatch = watchHref.match(/\/xem\/([^\/]+)\/tap-/i);
                if (watchUrlMatch) baseUrlPart = watchUrlMatch[1];
            }
        }

        if (isSeries && baseUrlPart) {
            for (var i = 1; i <= maxEp; i++) {
                var epUrl = "/xem/" + baseUrlPart + "/tap-" + i;
                if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + epUrl;
                episodes.push({ "id": epUrl, "name": "Tập " + i, "slug": "tap-" + i });
            }
        } else if (watchHref) {
            if (watchHref.indexOf("http") !== 0) watchHref = BASEURL + watchHref;
            episodes.push({ "id": watchHref, "name": "Full", "slug": "full" });
        }
        
        return JSON.stringify({
            "id": pageUrl,
            "title": title,
            "originName": originName,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "year": year,
            "status": status,
            "duration": duration,
            "director": director,
            "casts": casts,
            "servers": [{ "name": "TVHAY", "episodes": episodes }]
        });
    } catch(e) {
        return JSON.stringify({ "id": argUrl || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        var iframeMatch = html.match(/id=["']movie-iframe["'][^>]*src=["']([^"']+)["']/i) || html.match(/var\s+linkHPro\s*=\s*["']([^"']+)["']/i) || html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        
        if (iframeMatch && iframeMatch[1]) {
            var iframeSrc = iframeMatch[1];
            var urlParamMatch = iframeSrc.match(/[?&]url=([^&]+)/i);
            if (urlParamMatch) {
                streamUrl = decodeURIComponent(urlParamMatch[1]);
            } else if (iframeSrc.indexOf("streamvsmov.com/video/") > -1) {
                return JSON.stringify({ "url": iframeSrc, "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
            } else if (iframeSrc.indexOf(".m3u8") > -1 || iframeSrc.indexOf(".mp4") > -1) {
                streamUrl = iframeSrc;
            } else {
                if (iframeSrc.indexOf("http") !== 0 && iframeSrc.indexOf("//") !== 0) {
                    if (iframeSrc.charAt(0) !== "/") iframeSrc = "/" + iframeSrc;
                    iframeSrc = BASEURL + iframeSrc;
                }
                return JSON.stringify({ "url": iframeSrc, "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
            }
        }
        
        if (streamUrl) {
            return JSON.stringify({
                "url": streamUrl,
                "isEmbed": false,
                "mimeType": streamUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4",
                "headers": {
                    "Referer": BASEURL + "/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": {} });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "isEmbed": true, "headers": {} });
    }
}

function parseCategoriesResponse(apiResponseJson) { return JSON.stringify(getCachedCategories()); }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// CATEGORIES DATA & PARSER
// =============================================================================

function buildMenu(listurl) {
    var menulist = [];
    if (!listurl) return menulist;
    var lines = listurl.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf("@@") === -1) continue;
        var parts = line.split("@@");
        var link = parts[0] ? parts[0].trim() : "";
        var name = parts[1] ? parts[1].trim() : "";
        if (!link || !name) continue;
        menulist.push({ "slug": link, "name": name });
    }
    return menulist;
}

function getLISTmenu() {
    return [
        "/the-loai/hanh-dong/@@Hành Động",
        "/the-loai/vo-thuat/@@Võ Thuật",
        "/the-loai/tinh-cam/@@Tình Cảm",
        "/the-loai/tam-ly/@@Tâm Lý",
        "/the-loai/hai-huoc/@@Hài Hước",
        "/the-loai/kinh-di/@@Kinh Dị",
        "/the-loai/vien-tuong/@@Viễn Tưởng",
        "/the-loai/hinh-su/@@Hình Sự",
        "/the-loai/co-trang/@@Cổ Trang",
        "/the-loai/the-thao/@@Thể Thao",
        "/the-loai/am-nhac/@@Âm Nhạc",
        "/the-loai/tai-lieu/@@Tài Liệu",
        "/the-loai/gia-dinh/@@Gia Đình",
        "/the-loai/chinh-kich/@@Chính Kịch",
        "/the-loai/bi-an/@@Bí Ẩn",
        "/the-loai/chien-tranh/@@Chiến Tranh",
        "/the-loai/than-thoai/@@Thần Thoại",
        "/quoc-gia/trung-quoc/@@Trung Quốc",
        "/quoc-gia/han-quoc/@@Hàn Quốc",
        "/quoc-gia/thai-lan/@@Thái Lan",
        "/quoc-gia/nhat-ban/@@Nhật Bản",
        "/quoc-gia/my/@@Mỹ",
        "/quoc-gia/viet-nam/@@Việt Nam"
    ].join("\n");
}
