// =============================================================================
// VAAPP Plugin - xNhau
// Ho tro nguon xNhau (xnhau.art / xnhau.city)
// Tuong thich SmartTube / Rhino Engine
// =============================================================================

var BASEURL = "https://xnhau.art";

function getManifest() {
    return JSON.stringify({
        "id": "xnhau",
        "name": "xNhau (ALL)",
        "description": "Kho clip và phim xNhau hot nhất, cập nhật liên tục.",
        "info": "Nguồn phim xNhau chất lượng cao HD/FHD.",
        "version": "1.0.0",
        "baseUrl": "https://xnhau.art",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xnhau.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/movies", "title": "Hàng Mới", "type": "Grid" },
        { "slug": "/movies?sort=popular", "title": "Phổ Biến", "type": "Horizontal" },
        { "slug": "/movies?sort=trending", "title": "Xu Hướng", "type": "Horizontal" },
        { "slug": "/category/tu-quay", "title": "Tự Quay", "type": "Horizontal" },
        { "slug": "/category/viet-nam", "title": "Việt Nam", "type": "Horizontal" },
        { "slug": "/category/phim-sex-sinh-vien", "title": "Sinh Viên", "type": "Horizontal" },
        { "slug": "/category/cap3", "title": "Cấp 3", "type": "Horizontal" },
        { "slug": "/category/viet69", "title": "Viet69", "type": "Horizontal" },
        { "slug": "/category/clip-hot", "title": "Clip Hot", "type": "Horizontal" },
        { "slug": "/category/heovl", "title": "HeoVL", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "tu-quay", "name": "Tự Quay" },
        { "slug": "viet-nam", "name": "Việt Nam" },
        { "slug": "phim-sex-sinh-vien", "name": "Sinh Viên" },
        { "slug": "cap3", "name": "Cấp 3" },
        { "slug": "clip-hot", "name": "Clip Hot" },
        { "slug": "cliphotvn", "name": "Clip Hot VN" },
        { "slug": "viet69", "name": "Viet69" },
        { "slug": "viet3x", "name": "Viet3x" },
        { "slug": "heovl", "name": "HeoVL" },
        { "slug": "phimconheo", "name": "Phim Con Heo" },
        { "slug": "phimheovip", "name": "Phim Heo VIP" },
        { "slug": "mobiblog", "name": "Mobiblog" },
        { "slug": "jpxnx", "name": "JPXNX" },
        { "slug": "xvideos98", "name": "Xvideos98" },
        { "slug": "xxdem", "name": "XX Đêm" },
        { "slug": "phimsexvn", "name": "Phim Sex VN" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "" },
            { "name": "Phổ biến", "value": "popular" },
            { "name": "Xu hướng", "value": "trending" },
            { "name": "Cũ nhất", "value": "oldest" },
            { "name": "Tiêu đề A-Z", "value": "title_asc" },
            { "name": "Tiêu đề Z-A", "value": "title_desc" }
        ],
        "category": [
            { "slug": "all", "name": "Tất cả thể loại" },
            { "slug": "tu-quay", "name": "Tự Quay" },
            { "slug": "viet-nam", "name": "Việt Nam" },
            { "slug": "phim-sex-sinh-vien", "name": "Sinh Viên" },
            { "slug": "cap3", "name": "Cấp 3" },
            { "slug": "clip-hot", "name": "Clip Hot" },
            { "slug": "cliphotvn", "name": "Clip Hot VN" },
            { "slug": "viet69", "name": "Viet69" },
            { "slug": "viet3x", "name": "Viet3x" },
            { "slug": "heovl", "name": "HeoVL" },
            { "slug": "phimconheo", "name": "Phim Con Heo" },
            { "slug": "phimheovip", "name": "Phim Heo VIP" },
            { "slug": "mobiblog", "name": "Mobiblog" },
            { "slug": "jpxnx", "name": "JPXNX" },
            { "slug": "xvideos98", "name": "Xvideos98" },
            { "slug": "xxdem", "name": "XX Đêm" },
            { "slug": "phimsexvn", "name": "Phim Sex VN" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") === 0) {
            return slug;
        }

        var page = 1;
        var sort = "";
        var cat = "";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.sort) sort = filters.sort;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        cat = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        cat = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var targetPath = slug || "/movies";
        if (cat && cat !== "all") {
            if (cat.indexOf("/category/") === 0) {
                targetPath = cat;
            } else {
                targetPath = "/category/" + cat;
            }
        }
        if (targetPath.indexOf("/") !== 0) {
            targetPath = "/" + targetPath;
        }

        var fullUrl = BASEURL + targetPath;
        var queryParams = [];

        if (sort && fullUrl.indexOf("sort=") === -1) {
            queryParams.push("sort=" + encodeURIComponent(sort));
        }
        if (page > 1 && fullUrl.indexOf("page=") === -1) {
            queryParams.push("page=" + page);
        }

        if (queryParams.length > 0) {
            var sep = fullUrl.indexOf("?") === -1 ? "?" : "&";
            fullUrl += sep + queryParams.join("&");
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + (slug || "/movies");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        try {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page) || 1;
        } catch (e) {}
    }
    var url = BASEURL + "/search?q=" + encodeURIComponent(keyword || "");
    if (page > 1) {
        url += "&page=" + page;
    }
    return url;
}

function getSearchUrl(keyword, page) {
    var p = page || 1;
    var url = BASEURL + "/search?q=" + encodeURIComponent(keyword || "");
    if (p > 1) {
        url += "&page=" + p;
    }
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.indexOf("/") === 0) return BASEURL + slug;
    return BASEURL + "/watch/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function cleanText(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function parseListResponse(html, url) {
    try {
        var items = [];
        var seen = {};

        // Parse HTML cards: <a href="/watch/..." ...>
        var itemRegex = /<a\s+[^>]*href="(\/watch\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            if (seen[href]) continue;

            var inner = match[2];
            var imgMatch = inner.match(/<img[^>]+(?:src|data-src)="([^"]+)"/i);
            var titleMatch = inner.match(/<p[^>]*class="[^"]*line-clamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                             inner.match(/alt="([^"]+)"/i);

            if (imgMatch || titleMatch) {
                seen[href] = true;
                var posterUrl = imgMatch ? imgMatch[1] : "";
                if (posterUrl.indexOf("/") === 0) {
                    posterUrl = BASEURL + posterUrl;
                }

                var title = titleMatch ? cleanText(titleMatch[1]) : "";
                var viewsMatch = inner.match(/<span>([^<]*lượt xem[^<]*)<\/span>/i);
                var duration = viewsMatch ? viewsMatch[1].trim() : "Full HD";

                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": posterUrl,
                    "backdropUrl": posterUrl,
                    "duration": duration,
                    "quality": "HD"
                });
            }
        }

        // Tinh tong so trang
        var totalPages = 99;
        var pageMatches = html.match(/page=(\d+)/g);
        if (pageMatches) {
            for (var p = 0; p < pageMatches.length; p++) {
                var num = parseInt(pageMatches[p].replace("page=", ""));
                if (num > totalPages) {
                    totalPages = num;
                }
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1 }
        });
    }
}

function parseList(html, url) {
    return parseListResponse(html, url);
}

function parseHomeResponse(html, url) {
    return parseListResponse(html, url);
}

function parseSearchResult(html, url) {
    return parseListResponse(html, url);
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function extractStreamUrl(html) {
    // 1. Kiem tra <source src="...m3u8"
    var sourceMatch = html.match(/<source[^>]+src="([^"]+)"/i);
    if (sourceMatch && sourceMatch[1]) {
        var src = sourceMatch[1];
        if (src.indexOf("/") === 0) src = BASEURL + src;
        return src;
    }

    // 2. Kiem tra iframe src (vi du Blogger player)
    var iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
    if (iframeMatch && iframeMatch[1]) {
        var ifSrc = iframeMatch[1];
        if (ifSrc.indexOf("http") === 0) return ifSrc;
    }

    // 3. Kiem tra Astro props streams JSON
    var streamsMatch = html.match(/"streams":\[1,\[\[0,\{([^}]+)\}\]\]\]/);
    if (streamsMatch && streamsMatch[1]) {
        var sBlock = streamsMatch[1];
        var m3u8Match = sBlock.match(/"m3u8_url":\[0,"([^"]+)"\]/);
        var mediaMatch = sBlock.match(/"m3u8_media_url":\[0,"([^"]+)"\]/);
        var embedMatch = sBlock.match(/"embed_url":\[0,"([^"]+)"\]/);

        if (m3u8Match && m3u8Match[1] && m3u8Match[1] !== "null") {
            var mUrl = m3u8Match[1];
            if (mUrl.indexOf("/") === 0) mUrl = BASEURL + mUrl;
            return mUrl;
        }
        if (mediaMatch && mediaMatch[1] && mediaMatch[1] !== "null") {
            var medUrl = mediaMatch[1];
            if (medUrl.indexOf("/") === 0) medUrl = BASEURL + medUrl;
            return medUrl;
        }
        if (embedMatch && embedMatch[1] && embedMatch[1] !== "null") {
            return embedMatch[1];
        }
    }

    // 4. Regex truc tiep m3u8 hoac mp4
    var directM3u8 = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i) ||
                     html.match(/(\/media\/files\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
    if (directM3u8 && directM3u8[1]) {
        var dUrl = directM3u8[1];
        if (dUrl.indexOf("/") === 0) dUrl = BASEURL + dUrl;
        return dUrl;
    }

    return "";
}

function parseMovieDetail(html, url) {
    try {
        var title = "xNhau Video";
        var h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        if (h1Match && h1Match[1]) {
            title = cleanText(h1Match[1]);
        } else {
            var ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i);
            if (ogTitle && ogTitle[1]) {
                title = cleanText(ogTitle[1]);
            }
        }

        var posterUrl = "";
        var ogImg = html.match(/property="og:image"\s+content="([^"]+)"/i);
        if (ogImg && ogImg[1]) {
            posterUrl = ogImg[1];
            if (posterUrl.indexOf("/") === 0) posterUrl = BASEURL + posterUrl;
        }

        var description = "";
        var ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i);
        if (ogDesc && ogDesc[1]) {
            description = cleanText(ogDesc[1]);
        }

        // Parse The loai / Categories
        var catMatches = html.match(/<a[^>]+href="\/category\/[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);
        var categories = [];
        var seenCat = {};
        if (catMatches) {
            for (var c = 0; c < catMatches.length; c++) {
                var cName = cleanText(catMatches[c]);
                if (cName && !seenCat[cName]) {
                    seenCat[cName] = true;
                    categories.push(cName);
                }
            }
        }
        var categoryStr = categories.join(", ");

        // Parse stream / embed URL
        var streamUrl = extractStreamUrl(html);

        var episodes = [];
        if (streamUrl) {
            episodes.push({
                "name": "Full HD",
                "slug": streamUrl,
                "id": streamUrl,
                "posterUrl": posterUrl,
                "thumbnailUrl": posterUrl
            });
        }

        // Parse Related Movies
        var relatedMovies = [];
        var relSeen = {};
        if (url) relSeen[url] = true;

        var relRegex = /<a\s+[^>]*href="(\/watch\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var rMatch;
        while ((rMatch = relRegex.exec(html)) !== null && relatedMovies.length < 12) {
            var rHref = rMatch[1];
            if (relSeen[rHref]) continue;

            var rInner = rMatch[2];
            var rImgMatch = rInner.match(/<img[^>]+(?:src|data-src)="([^"]+)"/i);
            var rTitleMatch = rInner.match(/<p[^>]*class="[^"]*line-clamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                              rInner.match(/alt="([^"]+)"/i);

            if (rImgMatch && rTitleMatch) {
                relSeen[rHref] = true;
                var rPoster = rImgMatch[1];
                if (rPoster.indexOf("/") === 0) rPoster = BASEURL + rPoster;
                var rTitle = cleanText(rTitleMatch[1]);

                relatedMovies.push({
                    "id": rHref,
                    "title": rTitle,
                    "posterUrl": rPoster,
                    "backdropUrl": rPoster
                });
            }
        }

        return JSON.stringify({
            "title": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "category": categoryStr || "18+",
            "quality": "HD",
            "year": 2026,
            "rating": 9.0,
            "status": "Full",
            "servers": [
                {
                    "name": "xNhau Server",
                    "episodes": episodes
                }
            ],
            "relatedMovies": relatedMovies
        });
    } catch (e) {
        return JSON.stringify({
            "title": "Lỗi tải video",
            "posterUrl": "",
            "backdropUrl": "",
            "description": "Lỗi: " + e,
            "servers": []
        });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

function parseDetailResponse(html, url) {
    var streamUrl = extractStreamUrl(html);
    var isEmbed = (streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1);

    return JSON.stringify({
        "url": streamUrl,
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": BASEURL + "/"
        },
        "isEmbed": isEmbed
    });
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}
