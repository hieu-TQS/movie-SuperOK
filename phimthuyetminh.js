// =============================================================================
// PHIMTHUYETMINH Plugin (Rhino JS & Android TV Compatible)
// Website: https://phimthuyetminh.date
// =============================================================================

var BASEURL = "https://phimthuyetminh.date";

function getManifest() {
    return JSON.stringify({
        "id": "phimthuyetminh",
        "name": "Phim Thuyết Minh",
        "version": "1.0.0",
        "description": "Nguồn phim thuyết minh, lồng tiếng chất lượng cao Full HD/4K cập nhật liên tục.",
        "info": "Nguồn phim thuyết minh, lồng tiếng chất lượng cao Full HD/4K cập nhật liên tục.",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/phimtm.png",
        "isEnabled": true,
        "isAdult": false,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/phim-moi", "title": "Phim Mới", "type": "Grid", "path": "phim-moi" },
        { "slug": "/phim-le", "title": "Phim Lẻ", "type": "Grid", "path": "phim-le" },
        { "slug": "/phim-bo", "title": "Phim Bộ", "type": "Grid", "path": "phim-bo" },
        { "slug": "/index.php?view=ajax-tab&section=favorite&tab=favorite", "title": "Phim Yêu Thích", "type": "Horizontal", "path": "favorite" },
        { "slug": "/the-loai/co-trang", "title": "Cổ Trang", "type": "Grid", "path": "the-loai" },
        { "slug": "/the-loai/hanh-dong", "title": "Hành Động", "type": "Grid", "path": "the-loai" },
        { "slug": "/the-loai/hoat-hinh", "title": "Hoạt Hình", "type": "Grid", "path": "the-loai" },
        { "slug": "/the-loai/tinh-cam", "title": "Tình Cảm", "type": "Grid", "path": "the-loai" },
        { "slug": "/the-loai/vo-thuat", "title": "Võ Thuật", "type": "Grid", "path": "the-loai" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Phim Mới", "slug": "/phim-moi" },
        { "name": "Phim Lẻ", "slug": "/phim-le" },
        { "name": "Phim Bộ", "slug": "/phim-bo" },
        { "name": "Hành Động", "slug": "/the-loai/hanh-dong" },
        { "name": "Cổ Trang", "slug": "/the-loai/co-trang" },
        { "name": "Hoạt Hình", "slug": "/the-loai/hoat-hinh" },
        { "name": "Võ Thuật", "slug": "/the-loai/vo-thuat" },
        { "name": "Tình Cảm", "slug": "/the-loai/tinh-cam" },
        { "name": "Hài Hước", "slug": "/the-loai/hai-huoc" },
        { "name": "Kinh Dị", "slug": "/the-loai/kinh-di" },
        { "name": "Viễn Tưởng", "slug": "/the-loai/vien-tuong" },
        { "name": "Hình Sự", "slug": "/the-loai/hinh-su" },
        { "name": "Tâm Lý", "slug": "/the-loai/tam-ly" },
        { "name": "Chiến Tranh", "slug": "/the-loai/chien-tranh" },
        { "name": "Chính Kịch", "slug": "/the-loai/chinh-kich" },
        { "name": "Thần Thoại", "slug": "/the-loai/than-thoai" },
        { "name": "Học Đường", "slug": "/the-loai/hoc-duong" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { "name": "Phim Mới", "value": "/phim-moi" },
            { "name": "Phim Lẻ", "value": "/phim-le" },
            { "name": "Phim Bộ", "value": "/phim-bo" }
        ],
        category: [
            { "name": "Hành Động", "slug": "/the-loai/hanh-dong" },
            { "name": "Cổ Trang", "slug": "/the-loai/co-trang" },
            { "name": "Hoạt Hình", "slug": "/the-loai/hoat-hinh" },
            { "name": "Võ Thuật", "slug": "/the-loai/vo-thuat" },
            { "name": "Tình Cảm", "slug": "/the-loai/tinh-cam" },
            { "name": "Hài Hước", "slug": "/the-loai/hai-huoc" },
            { "name": "Kinh Dị", "slug": "/the-loai/kinh-di" },
            { "name": "Viễn Tưởng", "slug": "/the-loai/vien-tuong" },
            { "name": "Bí Ẩn", "slug": "/the-loai/bi-an" },
            { "name": "Chiến Tranh", "slug": "/the-loai/chien-tranh" },
            { "name": "Chính Kịch", "slug": "/the-loai/chinh-kich" },
            { "name": "Gia Đình", "slug": "/the-loai/gia-dinh" },
            { "name": "Hình Sự", "slug": "/the-loai/hinh-su" },
            { "name": "Học Đường", "slug": "/the-loai/hoc-duong" },
            { "name": "Khoa Học", "slug": "/the-loai/khoa-hoc" },
            { "name": "Kinh Điển", "slug": "/the-loai/kinh-dien" },
            { "name": "Lịch Sử", "slug": "/the-loai/lich-su" },
            { "name": "Phiêu Lưu", "slug": "/the-loai/phieu-luu" },
            { "name": "Thần Thoại", "slug": "/the-loai/than-thoai" },
            { "name": "Thể Thao", "slug": "/the-loai/the-thao" },
            { "name": "Tâm Lý", "slug": "/the-loai/tam-ly" },
            { "name": "Tài Liệu", "slug": "/the-loai/tai-lieu" }
        ],
        country: [
            { "name": "Trung Quốc", "slug": "/quoc-gia/trung-quoc" },
            { "name": "Hàn Quốc", "slug": "/quoc-gia/han-quoc" },
            { "name": "Âu Mỹ", "slug": "/quoc-gia/au-my" },
            { "name": "Nhật Bản", "slug": "/quoc-gia/nhat-ban" },
            { "name": "Hồng Kông", "slug": "/quoc-gia/hong-kong" },
            { "name": "Đài Loan", "slug": "/quoc-gia/dai-loan" },
            { "name": "Việt Nam", "slug": "/quoc-gia/viet-nam" },
            { "name": "Thái Lan", "slug": "/quoc-gia/thai-lan" },
            { "name": "Ấn Độ", "slug": "/quoc-gia/an-do" },
            { "name": "Anh", "slug": "/quoc-gia/anh" },
            { "name": "Pháp", "slug": "/quoc-gia/phap" },
            { "name": "Đức", "slug": "/quoc-gia/duc" },
            { "name": "Nga", "slug": "/quoc-gia/nga" },
            { "name": "Tây Ban Nha", "slug": "/quoc-gia/tay-ban-nha" },
            { "name": "Ý", "slug": "/quoc-gia/y" },
            { "name": "Canada", "slug": "/quoc-gia/canada" }
        ],
        year: [
            { "name": "2026", "value": "/nam/2026" },
            { "name": "2025", "value": "/nam/2025" },
            { "name": "2024", "value": "/nam/2024" },
            { "name": "2023", "value": "/nam/2023" },
            { "name": "2022", "value": "/nam/2022" },
            { "name": "2021", "value": "/nam/2021" },
            { "name": "2020", "value": "/nam/2020" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/phim-moi";

        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                } else if (filters.country) {
                    if (Array.isArray(filters.country) && filters.country.length > 0) {
                        path = filters.country[0].slug || path;
                    } else if (typeof filters.country === "string") {
                        path = filters.country;
                    }
                } else if (filters.year) {
                    var yVal = typeof filters.year === "string" ? filters.year : (filters.year.value || filters.year.name || "");
                    if (yVal) {
                        if (yVal.indexOf("/") === 0) path = yVal;
                        else path = "/nam/" + yVal;
                    }
                } else if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? filters.sort[0].value : "");
                    if (sVal) path = sVal;
                }
            }
        }

        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) !== "/") url = "/" + url;
            url = BASEURL + url;
        }

        if (page > 1) {
            if (url.indexOf("?") > -1) url += "&page=" + page;
            else url += "?page=" + page;
        }

        return url;
    } catch (e) {
        return BASEURL + "/phim-moi";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var filters = null;
        if (typeof filtersJson === "string") {
            try { filters = JSON.parse(filtersJson); } catch (e) {}
        } else {
            filters = filtersJson;
        }
        if (filters && filters.page) page = parseInt(filters.page, 10) || 1;
    }
    return BASEURL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getSearchUrl(keyword, pageOrFilters) {
    if (typeof pageOrFilters === "object") {
        return getUrlSearch(keyword, JSON.stringify(pageOrFilters));
    }
    var page = parseInt(pageOrFilters, 10) || 1;
    return BASEURL + "/?view=tim-kiem&keyword=" + encodeURIComponent(keyword || "") + (page > 1 ? "&page=" + page : "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var id = slug;
    if (id.indexOf("http") === 0) {
        var clean = id.split("?")[0].split("#")[0];
        if (clean.indexOf("/xem/") > -1) {
            return id;
        }
        if (clean.indexOf("/phim/") > -1) {
            id = clean.split("/phim/")[1];
        }
    }
    id = id.replace(/^\/+|\/+$/g, "");
    if (id.indexOf("xem/") === 0) return BASEURL + "/" + id;
    if (id.indexOf("phim/") === 0) id = id.substring(5);
    return BASEURL + "/xem/" + id + "/tap-01";
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    if (episodeSlug && episodeSlug.indexOf("http") === 0) return episodeSlug;
    if (episodeSlug && episodeSlug.charAt(0) === "/") return BASEURL + episodeSlug;
    var base = slug || "";
    if (base.indexOf("http") === 0) {
        base = base.split("?")[0].split("#")[0];
    }
    if (base.indexOf("/xem/") > -1) {
        var p = base.split("/xem/")[1];
        base = p.split("/")[0];
    } else if (base.indexOf("/phim/") > -1) {
        base = base.split("/phim/")[1];
    }
    base = base.replace(/^\/+|\/+$/g, "");
    var ep = episodeSlug || "tap-01";
    return BASEURL + "/xem/" + base + "/" + ep;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return BASEURL; }
function getUrlYears() { return BASEURL; }

// =============================================================================
// PARSERS
// =============================================================================

function cleanStreamUrl(rawUrl) {
    if (!rawUrl) return "";
    var url = rawUrl;
    if (url.indexOf("streamvsmov.com/video/") > -1) {
        var clean = url.split("?")[0].split("#")[0];
        if (clean.charAt(clean.length - 1) === "/") {
            clean = clean.substring(0, clean.length - 1);
        }
        var parts = clean.split("/video/");
        if (parts.length === 2) {
            return parts[0] + "/stream/" + parts[1] + "/master.m3u8";
        }
    }
    return url;
}

function parseListResponse(html, url) {
    try {
        if (!html) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
        }

        // If response is JSON (e.g. from ajax-search)
        var trimmed = html.trim();
        if (trimmed.charAt(0) === "[" || trimmed.charAt(0) === "{") {
            try {
                var json = JSON.parse(trimmed);
                var arr = Array.isArray(json) ? json : (json.data || json.items || []);
                var jItems = [];
                for (var j = 0; j < arr.length; j++) {
                    var m = arr[j];
                    if (!m.slug) continue;
                    jItems.push({
                        "id": BASEURL + "/phim/" + m.slug,
                        "title": m.name || m.title || "",
                        "posterUrl": m.thumb || m.poster || "",
                        "backdropUrl": m.thumb || m.poster || "",
                        "year": m.year || 0,
                        "quality": "FHD",
                        "lang": m.lang || ""
                    });
                }
                return JSON.stringify({
                    "items": jItems,
                    "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
                });
            } catch (je) {}
        }

        var items = [];
        var itemRegex = /<div[^>]+class=["'][^"']*movie-item[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*movie-item[^"']*["']|$)/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var block = match[1];
            var linkMatch = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/i) ||
                            block.match(/title=["']([^"']+)["'][^>]*<a[^>]+href=["']([^"']+)["']/i) ||
                            block.match(/<a[^>]+href=["']([^"']+)["']/i);
            if (!linkMatch) continue;

            var itemUrl = linkMatch[1];
            if (itemUrl.indexOf("${movie.slug}") !== -1) continue;

            var title = (linkMatch[2] || "").trim();
            if (!title) {
                var titleTag = block.match(/class=["'][^"']*movie-title[^"']*["'][^>]*>([^<]+)/i);
                if (titleTag) title = titleTag[1].trim();
            }
            if (!title) {
                var imgAlt = block.match(/alt=["']([^"']+)["']/i);
                if (imgAlt) title = imgAlt[1].trim();
            }
            if (!title) continue;

            if (itemUrl.indexOf("http") !== 0) {
                if (itemUrl.charAt(0) !== "/") itemUrl = "/" + itemUrl;
                itemUrl = BASEURL + itemUrl;
            }

            var thumbMatch = block.match(/<img[^>]*?\bsrc=["']([^"']+)["']/i) ||
                             block.match(/data-src=["']([^"']+)["']/i);
            var thumb = thumbMatch ? thumbMatch[1] : "";
            if (thumb.indexOf("//") === 0) thumb = "https:" + thumb;
            else if (thumb && thumb.indexOf("http") !== 0) {
                thumb = BASEURL + (thumb.charAt(0) === "/" ? "" : "/") + thumb;
            }

            var year = 0;
            var yearMatch = block.match(/class=["'][^"']*movie-year[^"']*["'][^>]*>(\d+)/i);
            if (yearMatch) year = parseInt(yearMatch[1], 10);

            var quality = "";
            var qMatch = block.match(/class=["'][^"']*movie-quality[^"']*["'][^>]*>([^<]+)/i);
            if (qMatch) quality = qMatch[1].trim();

            var epStatus = "";
            var epMatch = block.match(/class=["'][^"']*movie-ep-status[^"']*["'][^>]*>([^<]+)/i);
            if (epMatch) epStatus = epMatch[1].trim();

            var lang = "";
            var lMatch = block.match(/class=["'][^"']*movie-label[^"']*["'][^>]*>([^<]+)/i);
            if (lMatch) lang = lMatch[1].trim();

            items.push({
                "id": itemUrl,
                "title": title,
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "year": year,
                "quality": quality || "FHD",
                "episode_current": epStatus,
                "lang": lang
            });
        }

        var currentPage = 1;
        var totalPages = 1;
        var hasNext = false;

        var curMatch = html.match(/class=["'][^"']*current[^"']*["'][^>]*>(\d+)/i);
        if (curMatch) currentPage = parseInt(curMatch[1], 10) || 1;

        var pageNumbers = [];
        var pRegex = /href=["'][^"']*[?&]page=(\d+)[^"']*["']/gi;
        var pm;
        while ((pm = pRegex.exec(html)) !== null) {
            var pVal = parseInt(pm[1], 10);
            if (pVal > 0) pageNumbers.push(pVal);
        }

        if (pageNumbers.length > 0) {
            for (var p = 0; p < pageNumbers.length; p++) {
                if (pageNumbers[p] > totalPages) totalPages = pageNumbers[p];
            }
        } else {
            totalPages = currentPage;
        }

        var hasNextMatch = html.match(/class=["'][^"']*pagination[^"']*["'][\s\S]*?>»<\/a>/i);
        if (hasNextMatch || currentPage < totalPages) {
            hasNext = true;
            if (totalPages <= currentPage) totalPages = currentPage + 1;
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": hasNext
            }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(html, url) { return parseListResponse(html, url); }
function parseSearchResult(html, url) { return parseListResponse(html, url); }
function parseHomeResponse(html, url) { return parseListResponse(html, url); }
function parseList(html, url) { return parseListResponse(html, url); }

function parseMovieDetail(html, argUrl) {
    try {
        var pageUrl = argUrl || "";
        if (!html) {
            return JSON.stringify({ "id": pageUrl, "title": "Lỗi phân giải", "servers": [] });
        }

        var title = "";
        var tMatch = html.match(/class=["'][^"']*movie-name-vi[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     html.match(/class=["'][^"']*movie-h1[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (tMatch) {
            title = tMatch[1].replace(/<[^>]+>/g, "").replace(/\s*—\s*TẬP[\s\S]*$/i, "").replace(/Xem phim\s*/i, "").trim();
        }

        var originName = "";
        var oMatch = html.match(/class=["'][^"']*movie-name-en[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
                     html.match(/class=["'][^"']*movie-h2[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i);
        if (oMatch) originName = oMatch[1].replace(/<[^>]+>/g, "").trim();

        var posterUrl = "";
        var pMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                     html.match(/class=["']poster-img-box["'][\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
        if (pMatch) posterUrl = pMatch[1];
        if (posterUrl.indexOf("//") === 0) posterUrl = "https:" + posterUrl;
        else if (posterUrl && posterUrl.indexOf("http") !== 0) {
            posterUrl = BASEURL + (posterUrl.charAt(0) === "/" ? "" : "/") + posterUrl;
        }

        var description = "";
        var dMatch = html.match(/class=["'][^"']*movie-desc[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/class=["'][^"']*movie-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (dMatch) {
            description = dMatch[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
        }

        function extractMeta(htmlContent, label) {
            var regex = new RegExp("<li>[\\s\\S]*?" + label + "[\\s\\S]*?:[\\s\\S]*?<span[^>]*>([\\s\\S]*?)<\\/span>", "i");
            var m = htmlContent.match(regex);
            if (!m) {
                var regex2 = new RegExp(label + "[\\s\\S]*?:[\\s\\S]*?<span[^>]*>([\\s\\S]*?)<\\/span>", "i");
                m = htmlContent.match(regex2);
            }
            return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
        }

        var yearStr = extractMeta(html, "Năm");
        var year = parseInt(yearStr, 10) || 0;
        if (!year) {
            var yMatch = originName.match(/\((\d{4})\)/) || title.match(/\((\d{4})\)/);
            if (yMatch) year = parseInt(yMatch[1], 10);
        }

        var status = extractMeta(html, "Tình Trạng");
        var duration = extractMeta(html, "Thời lượng");
        var director = extractMeta(html, "Đạo diễn");
        var casts = extractMeta(html, "Diễn viên");
        var category = extractMeta(html, "Thể loại");
        var country = extractMeta(html, "Quốc gia");

        var servers = [];

        // Check if page contains .source-container and .ep-grid (watch page layout)
        var sourceRegex = /<div[^>]+class=["'][^"']*source-container[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*source-container[^"']*["']|<\/div>\s*<\/div>\s*<div[^>]+class=["']movie-info-block|$)/gi;
        var sMatch;
        while ((sMatch = sourceRegex.exec(html)) !== null) {
            var sBlock = sMatch[1];
            var titleMatch = sBlock.match(/class=["'][^"']*source-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
            var serverName = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : ("Server " + (servers.length + 1));

            var epRegex = /<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*ep-btn[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
            var epMatch;
            var sEpisodes = [];
            while ((epMatch = epRegex.exec(sBlock)) !== null) {
                var epHref = epMatch[1].split("#")[0].trim();
                var epName = epMatch[2].replace(/<[^>]+>/g, "").trim();
                if (epHref.indexOf("http") !== 0) {
                    if (epHref.charAt(0) !== "/") epHref = "/" + epHref;
                    epHref = BASEURL + epHref;
                }
                var epSlug = epHref.split("/").pop();
                sEpisodes.push({
                    "id": epHref,
                    "name": epName,
                    "slug": epSlug
                });
            }
            if (sEpisodes.length > 0) {
                servers.push({
                    "name": serverName,
                    "episodes": sEpisodes
                });
            }
        }

        // Fallback: Detail page layout with btn-watch and latest-eps-container
        if (servers.length === 0) {
            var episodes = [];
            var watchHref = "";
            var watchMatch = html.match(/class=["'][^"']*btn-watch[^"']*["'][^>]*href=["']([^"']+)["']/i) ||
                             html.match(/href=["']([^"']+)["'][^>]*class=["'][^"']*btn-watch[^"']*["']/i);
            if (watchMatch) watchHref = watchMatch[1];

            var isSeries = false;
            var maxEp = 1;
            var baseUrlPart = "";
            var padDigits = 1;

            if (watchHref && watchHref.indexOf("tap-full") === -1 && watchHref.indexOf("tap-Full") === -1 && watchHref.match(/\/tap-/i)) {
                isSeries = true;
                var epRegexFallback = /\/xem\/([^\/]+)\/tap-(\d+)/gi;
                var epMatchFallback;
                while ((epMatchFallback = epRegexFallback.exec(html)) !== null) {
                    baseUrlPart = epMatchFallback[1];
                    var epStr = epMatchFallback[2];
                    if (epStr.length > padDigits) padDigits = epStr.length;
                    var epNum = parseInt(epStr, 10);
                    if (epNum > maxEp) maxEp = epNum;
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
                    var epSlugPart = "tap-";
                    if (padDigits === 2 && i < 10) epSlugPart += "0" + i;
                    else if (padDigits === 3 && i < 10) epSlugPart += "00" + i;
                    else if (padDigits === 3 && i < 100) epSlugPart += "0" + i;
                    else epSlugPart += i;

                    var epUrl = BASEURL + "/xem/" + baseUrlPart + "/" + epSlugPart;
                    episodes.push({
                        "id": epUrl,
                        "name": "Tập " + i,
                        "slug": epSlugPart
                    });
                }
            } else if (watchHref) {
                if (watchHref.indexOf("http") !== 0) {
                    if (watchHref.charAt(0) !== "/") watchHref = "/" + watchHref;
                    watchHref = BASEURL + watchHref;
                }
                episodes.push({
                    "id": watchHref,
                    "name": "Full",
                    "slug": "tap-full"
                });
            }

            if (episodes.length > 0) {
                servers.push({
                    "name": "Thuyết Minh",
                    "episodes": episodes
                });
            }
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
            "category": category,
            "country": country,
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({ "id": argUrl || "", "title": "Lỗi phân giải", "servers": [] });
    }
}

function parseDetail(html, argUrl) {
    return parseMovieDetail(html, argUrl);
}

function parseDetailResponse(html, url) {
    try {
        var pageHtml = html || "";
        var streamUrl = "";
        var isEmbed = false;

        var iframeMatch = pageHtml.match(/id=["']movie-iframe["'][^>]*src=["']([^"']+)["']/i) ||
                          pageHtml.match(/var\s+linkHPro\s*=\s*["']([^"']+)["']/i) ||
                          pageHtml.match(/var\s+linkSPro\s*=\s*["']([^"']+)["']/i) ||
                          pageHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);

        if (iframeMatch && iframeMatch[1]) {
            var rawSrc = iframeMatch[1].trim();

            if (rawSrc.indexOf("&amp;") > -1) {
                rawSrc = rawSrc.replace(/&amp;/g, "&");
            }

            // 1. Phimapi player param
            var urlParamMatch = rawSrc.match(/[?&]url=([^&]+)/i);
            if (urlParamMatch) {
                streamUrl = decodeURIComponent(urlParamMatch[1]);
                isEmbed = false;
            }
            // 2. Streamvsmov video embed -> direct master.m3u8
            else if (rawSrc.indexOf("streamvsmov.com/video/") > -1) {
                streamUrl = cleanStreamUrl(rawSrc);
                isEmbed = false;
            }
            // 3. Direct m3u8 or mp4
            else if (rawSrc.indexOf(".m3u8") > -1 || rawSrc.indexOf(".mp4") > -1) {
                streamUrl = rawSrc;
                isEmbed = false;
            }
            // 4. Other embed iframe (e.g. streamc.xyz)
            else {
                if (rawSrc.indexOf("http") !== 0 && rawSrc.indexOf("//") !== 0) {
                    if (rawSrc.charAt(0) !== "/") rawSrc = "/" + rawSrc;
                    rawSrc = BASEURL + rawSrc;
                }
                streamUrl = rawSrc;
                isEmbed = true;
            }
        }

        // 5. Fallback regex for direct m3u8 in page source
        if (!streamUrl) {
            var directM3u8Match = pageHtml.match(/https?:\/\/[^"'\s<>]+\.m3u8[^\s"']*/i);
            if (directM3u8Match) {
                streamUrl = directM3u8Match[0];
                isEmbed = false;
            }
        }

        if (streamUrl) {
            return JSON.stringify({
                "url": streamUrl,
                "isEmbed": isEmbed,
                "mimeType": streamUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4",
                "headers": {
                    "Referer": BASEURL + "/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        // If no stream found in current HTML (e.g. called on /phim/ detail HTML instead of /xem/ watch HTML),
        // return isEmbed: true so the app fetches the watch page URL and calls parseEmbedResponse
        return JSON.stringify({
            "url": url || "",
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({
            "url": url || "",
            "isEmbed": true,
            "headers": { "Referer": BASEURL + "/" }
        });
    }
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEmbedResponse(html, url) {
    return parseDetailResponse(html, url);
}
