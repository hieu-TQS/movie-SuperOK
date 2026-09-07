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
        "version": "1.0.1",
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
        { "slug": "/", "title": "Mới Cập Nhật", "type": "Grid", "path": "phim-moi" },
        { "slug": "/movies", "title": "Tất Cả Video", "type": "Grid", "path": "phim-moi" },
        { "slug": "/movies?sort=popular", "title": "Phổ Biến", "type": "Horizontal", "path": "popular" },
        { "slug": "/category/tu-quay", "title": "Tự Quay", "type": "Horizontal", "path": "the-loai" },
        { "slug": "/category/viet-nam", "title": "Việt Nam", "type": "Horizontal", "path": "the-loai" },
        { "slug": "/category/phim-sex-sinh-vien", "title": "Sinh Viên", "type": "Horizontal", "path": "the-loai" },
        { "slug": "/category/clip-hot", "title": "Clip Hot", "type": "Horizontal", "path": "the-loai" }
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

function titleFromSlug(slug) {
    if (!slug) return "";
    var clean = slug.split("?")[0].split("#")[0].replace(/\/+$/, "");
    var parts = clean.split("/");
    var last = parts[parts.length - 1] || "";
    if (last === "watch" || last === "v" || last === "video") {
        last = parts[parts.length - 2] || "";
    }
    last = last.replace(/[-_]/g, " ").trim();
    if (!last) return "";
    return last.charAt(0).toUpperCase() + last.slice(1);
}

function parseListResponse(html, url) {
    try {
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
        var items = [];
        var seen = {};

        // Parse HTML cards matching /watch/, /video/, /v/, /clip/, /phim/
        var itemRegex = /<a\s+[^>]*href=["']([^"']*(?:\/watch\/|\/video\/|\/v\/|\/clip\/|\/phim\/)[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            if (href.indexOf("${") !== -1) continue;

            if (href.indexOf("http") !== 0) {
                if (href.charAt(0) !== "/") href = "/" + href;
                href = BASEURL + href;
            }

            if (seen[href]) continue;

            var inner = match[2];
            var imgMatch = inner.match(/<img[^>]+(?:src|data-src|srcset|data-original)=["']([^"'\s]+)["']/i) ||
                             html.substring(match.index - 300, match.index).match(/<img[^>]+(?:src|data-src|srcset|data-original)=["']([^"'\s]+)["']/i);

            var titleMatch = inner.match(/<p[^>]*class=["'][^"']*line-clamp[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
                             inner.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i) ||
                             inner.match(/alt=["']([^"']+)["']/i) ||
                             inner.match(/title=["']([^"']+)["']/i) ||
                             match[0].match(/title=["']([^"']+)["']/i);

            var posterUrl = imgMatch ? imgMatch[1] : "";
            if (posterUrl) {
                if (posterUrl.indexOf("//") === 0) posterUrl = "https:" + posterUrl;
                else if (posterUrl.indexOf("http") !== 0) {
                    if (posterUrl.charAt(0) !== "/") posterUrl = "/" + posterUrl;
                    posterUrl = BASEURL + posterUrl;
                }
            }

            var title = titleMatch ? cleanText(titleMatch[1]) : "";
            if (!title) {
                title = titleFromSlug(href);
            }
            if (!title) continue;

            seen[href] = true;
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

        // Fallback pass: match any card container if items is empty
        if (items.length === 0) {
            var cardRegex = /href=["']([^"']*(?:\/watch\/|\/video\/|\/v\/|\/clip\/|\/phim\/)[^"']+)["']/gi;
            var cMatch;
            while ((cMatch = cardRegex.exec(html)) !== null) {
                var cHref = cMatch[1];
                if (cHref.indexOf("http") !== 0) {
                    if (cHref.charAt(0) !== "/") cHref = "/" + cHref;
                    cHref = BASEURL + cHref;
                }
                if (seen[cHref]) continue;
                seen[cHref] = true;

                var cTitle = titleFromSlug(cHref);
                if (cTitle) {
                    items.push({
                        "id": cHref,
                        "title": cTitle,
                        "posterUrl": "",
                        "backdropUrl": "",
                        "duration": "HD",
                        "quality": "HD"
                    });
                }
            }
        }

        // Tinh tong so trang
        var totalPages = 1;
        var pageMatches = html.match(/page=(\d+)/g);
        if (pageMatches) {
            for (var p = 0; p < pageMatches.length; p++) {
                var num = parseInt(pageMatches[p].replace("page=", ""), 10);
                if (num > totalPages) {
                    totalPages = num;
                }
            }
        } else if (items.length >= 10) {
            totalPages = 99;
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
    if (!html) return "";

    // 1. Direct Astro / JSON props: "m3u8_url":"..." or "m3u8_media_url":"..." or "embed_url":"..."
    var m3u8Match = html.match(/"m3u8_url"\s*:\s*(?:\[0,)?\s*["']([^"']+)["']/i) ||
                    html.match(/"m3u8_media_url"\s*:\s*(?:\[0,)?\s*["']([^"']+)["']/i) ||
                    html.match(/"stream_url"\s*:\s*["']([^"']+)["']/i) ||
                    html.match(/"video_url"\s*:\s*["']([^"']+)["']/i);
    if (m3u8Match && m3u8Match[1] && m3u8Match[1] !== "null") {
        var url = m3u8Match[1].replace(/\\/g, "").trim();
        if (url.indexOf("//") === 0) url = "https:" + url;
        else if (url.indexOf("http") !== 0 && url.charAt(0) === "/") url = BASEURL + url;
        if (url.indexOf("http") === 0 || url.indexOf("https") === 0) return url;
    }

    var embedMatch = html.match(/"embed_url"\s*:\s*(?:\[0,)?\s*["']([^"']+)["']/i);
    if (embedMatch && embedMatch[1] && embedMatch[1] !== "null") {
        var embUrl = embedMatch[1].replace(/\\/g, "").trim();
        if (embUrl.indexOf("//") === 0) embUrl = "https:" + embUrl;
        else if (embUrl.indexOf("http") !== 0 && embUrl.charAt(0) === "/") embUrl = BASEURL + embUrl;
        if (embUrl.indexOf("http") === 0 || embUrl.indexOf("https") === 0) return embUrl;
    }

    // 2. HTML5 <source src="..."> or <video src="...">
    var sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i) ||
                      html.match(/<video[^>]+src=["']([^"']+)["']/i);
    if (sourceMatch && sourceMatch[1]) {
        var src = sourceMatch[1].trim();
        if (src.indexOf("//") === 0) src = "https:" + src;
        else if (src.indexOf("http") !== 0 && src.charAt(0) === "/") src = BASEURL + src;
        return src;
    }

    // 3. iframe src
    var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
        var ifSrc = iframeMatch[1].trim();
        if (ifSrc.indexOf("//") === 0) ifSrc = "https:" + ifSrc;
        else if (ifSrc.indexOf("http") !== 0 && ifSrc.charAt(0) === "/") ifSrc = BASEURL + ifSrc;
        return ifSrc;
    }

    // 4. Direct regex for .m3u8 or .mp4 or /media/files/
    var directStream = html.match(/(https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*)/i) ||
                       html.match(/["'](\/media\/files\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*)["']/i);
    if (directStream && directStream[1]) {
        var dUrl = directStream[1].replace(/\\/g, "").trim();
        if (dUrl.indexOf("http") !== 0 && dUrl.charAt(0) === "/") dUrl = BASEURL + dUrl;
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
            if (posterUrl.indexOf("//") === 0) posterUrl = "https:" + posterUrl;
            else if (posterUrl.indexOf("http") !== 0 && posterUrl.charAt(0) === "/") posterUrl = BASEURL + posterUrl;
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
        var pageUrl = url || "";

        var episodes = [];
        var epId = streamUrl || pageUrl;
        if (epId) {
            episodes.push({
                "name": "Full HD",
                "slug": epId,
                "id": epId,
                "posterUrl": posterUrl,
                "thumbnailUrl": posterUrl
            });
        }

        // Parse Related Movies
        var relatedMovies = [];
        var relSeen = {};
        if (url) relSeen[url] = true;

        var relRegex = /<a\s+[^>]*href=["']([^"']*(?:\/watch\/)[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var rMatch;
        while ((rMatch = relRegex.exec(html)) !== null && relatedMovies.length < 12) {
            var rHref = rMatch[1];
            if (rHref.indexOf("http") !== 0) {
                if (rHref.charAt(0) !== "/") rHref = "/" + rHref;
                rHref = BASEURL + rHref;
            }
            if (relSeen[rHref]) continue;

            var rInner = rMatch[2];
            var rImgMatch = rInner.match(/<img[^>]+(?:src|data-src)="([^"]+)"/i);
            var rTitleMatch = rInner.match(/<p[^>]*class="[^"]*line-clamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
                              rInner.match(/alt="([^"]+)"/i);

            if (rImgMatch && rTitleMatch) {
                relSeen[rHref] = true;
                var rPoster = rImgMatch[1];
                if (rPoster.indexOf("//") === 0) rPoster = "https:" + rPoster;
                else if (rPoster.indexOf("http") !== 0 && rPoster.charAt(0) === "/") rPoster = BASEURL + rPoster;
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
    var reqUrl = url || "";
    var streamUrl = extractStreamUrl(html);

    if (!streamUrl) {
        streamUrl = reqUrl;
    }

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
