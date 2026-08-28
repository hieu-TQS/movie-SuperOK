// =============================================================================
// VideoCelebs Plugin (Tương thích 100% Rhino JS & Android TV)
// https://videocelebs.net/
// =============================================================================

var BASEURL = "https://videocelebs.net";

function getManifest() {
    return JSON.stringify({
        "id": "videocelebs",
        "name": "VideoCelebs",
        "description": "Kho cảnh người nổi tiếng VideoCelebs HD Stream.",
        "info": "Kho cảnh người nổi tiếng VideoCelebs HD Stream.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/videoceleb.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Video Mới Nhất", "type": "Grid" },
        { "slug": "/top-rated", "title": "Đánh Giá Cao", "type": "Grid" },
        { "slug": "/most-popular", "title": "Xem Nhiều Nhất", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Nhất", value: "/" },
            { name: "Đánh Giá Cao", value: "/top-rated" },
            { name: "Xem Nhiều Nhất", value: "/most-popular" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    return [
        { name: "Nude", slug: "/tag/nude" },
        { name: "Topless", slug: "/tag/topless" },
        { name: "Sex", slug: "/tag/sex" },
        { name: "Butt", slug: "/tag/butt" },
        { name: "Sexy", slug: "/tag/sexy" },
        { name: "Underwear", slug: "/tag/underwear" },
        { name: "Full Frontal", slug: "/tag/full-frontal" },
        { name: "Bush", slug: "/tag/bush" },
        { name: "Cleavage", slug: "/tag/cleavage" },
        { name: "Bikini", slug: "/tag/bikini" },
        { name: "Side Boob", slug: "/tag/side-boob" },
        { name: "Lesbian", slug: "/tag/lesbian" },
        { name: "See Thru", slug: "/tag/see-thru" },
        { name: "Thong", slug: "/tag/thong" },
        { name: "Explicit", slug: "/tag/explicit" },
        { name: "Nipslip", slug: "/tag/nipslip" },
        { name: "Implied Nudity", slug: "/tag/implied-nudity" },
        { name: "Striptease", slug: "/tag/striptease" },
        { name: "Nude Debut", slug: "/tag/nude-debut" }
    ];
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
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else {
                filters = filtersJson;
            }
            if (filters) {
                if (filters.page) page = parseInt(filters.page, 10) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    } else if (filters.category.slug) {
                        path = filters.category.slug;
                    } else if (filters.category.value) {
                        path = filters.category.value;
                    }
                } else if (filters.genre) {
                    if (Array.isArray(filters.genre) && filters.genre.length > 0) {
                        path = filters.genre[0].slug || filters.genre[0].value || path;
                    } else if (typeof filters.genre === "string") {
                        path = filters.genre;
                    } else if (filters.genre.slug) {
                        path = filters.genre.slug;
                    }
                } else if (filters.sort) {
                    var sVal = typeof filters.sort === "string" ? filters.sort : (filters.sort[0] ? (filters.sort[0].value || filters.sort[0].slug) : (filters.sort.value || filters.sort.slug || ""));
                    if (sVal) path = sVal;
                }
            }
        }

        path = path.replace(/\/+$/, "");
        if (path === "") path = "/";

        if (page > 1) {
            if (path === "/") {
                path = "/page/" + page;
            } else if (path.indexOf("?") > -1) {
                path += "&page=" + page;
            } else {
                path = path + "/page/" + page;
            }
        }

        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) !== "/") url = "/" + url;
            url = BASEURL + url;
        }

        return url;
    } catch (e) {
        return BASEURL + "/";
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
    var cleanKeyword = (keyword || "").trim();
    if (page > 1) {
        return BASEURL + "/search/" + encodeURIComponent(cleanKeyword) + "/page/" + page;
    }
    return BASEURL + "/search/" + encodeURIComponent(cleanKeyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var url = slug;
    if (url.indexOf("http") !== 0) {
        if (url.charAt(0) !== '/') url = '/' + url;
        url = BASEURL + url;
    }
    return url;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var seen = {};

        var contentHtml = html;
        var midleIndex = html.indexOf('midle_div');
        if (midleIndex !== -1) {
            contentHtml = html.substring(midleIndex);
        }

        var itemRegex = /<div class="item[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi;
        var match;

        while ((match = itemRegex.exec(contentHtml)) !== null) {
            var inner = match[1];
            var linkMatch = inner.match(/<a[^>]+href=["']([^"']+\.html)["']/i);
            if (!linkMatch) continue;

            var href = linkMatch[1];
            if (seen[href] || href.indexOf("/embed/") > -1) continue;

            var imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["']/i) || inner.match(/data-src=["']([^"']+)["']/i);
            var titleMatch = inner.match(/<h2[^>]*><a[^>]*>([\s\S]*?)<\/a><\/h2>/i) ||
                             inner.match(/alt=["']([^"']+)["']/i) ||
                             inner.match(/title=["']([^"']+)["']/i);

            var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "VideoCelebs Item";
            var poster = imgMatch ? imgMatch[1] : '';

            var yearMatch = title.match(/\((\d{4})\)/);
            var year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

            if (href && (title || poster)) {
                seen[href] = true;
                items.push({
                    "id": href,
                    "title": title,
                    "posterUrl": poster,
                    "backdropUrl": poster,
                    "quality": "HD",
                    "year": year
                });
            }
        }

        if (items.length === 0) {
            var fallbackRegex = /<a[^>]+href=["'](https:\/\/videocelebs\.net\/[^"']+\.html)["'][^>]*>([\s\S]*?)<\/a>/gi;
            while ((match = fallbackRegex.exec(contentHtml)) !== null) {
                var fbHref = match[1];
                var fbInner = match[2];
                if (seen[fbHref] || fbHref.indexOf("/embed/") > -1) continue;

                var fbImgMatch = fbInner.match(/src=["']([^"']+)["']/i) || fbInner.match(/data-src=["']([^"']+)["']/i);
                var fbTitleMatch = fbInner.match(/alt=["']([^"']+)["']/i) || fbInner.match(/title=["']([^"']+)["']/i);

                var fbTitle = fbTitleMatch ? fbTitleMatch[1].replace(/<[^>]+>/g, '').trim() : fbInner.replace(/<[^>]+>/g, '').trim();
                var fbPoster = fbImgMatch ? fbImgMatch[1] : '';

                if (fbHref && (fbTitle || fbPoster)) {
                    seen[fbHref] = true;
                    items.push({
                        "id": fbHref,
                        "title": fbTitle || "VideoCelebs Item",
                        "posterUrl": fbPoster,
                        "backdropUrl": fbPoster,
                        "quality": "HD",
                        "year": 0
                    });
                }
            }
        }

        var currentPage = 1;
        var totalPages = 1;

        var pM = url ? (url.match(/\/page\/(\d+)/) || url.match(/[?&]page=(\d+)/)) : null;
        if (pM) currentPage = parseInt(pM[1], 10);

        var pagesMatch = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
        if (pagesMatch) {
            totalPages = parseInt(pagesMatch[1], 10);
        } else {
            var maxPMatch = html.match(/page\/(\d+)/g) || [];
            for (var i = 0; i < maxPMatch.length; i++) {
                var num = parseInt(maxPMatch[i].replace(/\D/g, ''), 10);
                if (num && num > totalPages && num < 10000) totalPages = num;
            }
        }
        if (currentPage > totalPages) totalPages = currentPage;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages
            }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseMovieDetail(html, url) {
    try {
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "VideoCelebs Item";

        var metaImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var posterUrl = metaImg ? metaImg[1] : "";

        var metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var description = metaDesc ? metaDesc[1].replace(/<[^>]+>/g, '').trim() : "";

        var models = "";
        var modelMatch = html.match(/video_models\s*:\s*['"]([^"']+)['"]/i);
        if (modelMatch) models = modelMatch[1];

        var tags = "";
        var tagMatch = html.match(/video_tags\s*:\s*['"]([^"']+)['"]/i);
        if (tagMatch) tags = tagMatch[1];

        var servers = [{
            "name": "Server VideoCelebs",
            "episodes": [{
                "id": url || BASEURL,
                "name": "Full Video",
                "slug": "full"
            }]
        }];

        return JSON.stringify({
            "id": url || "",
            "title": title,
            "originName": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "year": 0,
            "rating": 0,
            "quality": "HD",
            "category": tags || "Celeb, Nude",
            "country": "",
            "actor": models,
            "director": "",
            "episode_current": "Full",
            "episode_total": "1",
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({ "id": url || "", "title": "Lỗi phân giải", "description": "Lỗi: " + e, "servers": [] });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

function parseDetailResponse(html, fetchedUrl) {
    try {
        var streamUrl = "";
        var vUrlMatch = html.match(/video_url\s*:\s*['"]([^"']+)['"]/i) ||
                        html.match(/video_alt_url\s*:\s*['"]([^"']+)['"]/i);

        if (vUrlMatch) {
            streamUrl = vUrlMatch[1];
        }

        if (!streamUrl) {
            var fileMatch = html.match(/(https?:\/\/[^\s"'<>]+\/get_file\/[^\s"'<>]+)/i) ||
                            html.match(/(https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>]*)/i);
            if (fileMatch) streamUrl = fileMatch[1];
        }

        var isEmbed = false;
        var mimeType = "video/mp4";

        return JSON.stringify({
            "url": streamUrl || fetchedUrl,
            "isEmbed": isEmbed,
            "mimeType": mimeType,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": fetchedUrl || "", "isEmbed": false, "headers": {} });
    }
}

function parseEpisodePlayer(response, url) {
    return parseDetailResponse(response, url);
}

function parsePlayerUrl(response, url) {
    return parseDetailResponse(response, url);
}

function parseCategoriesResponse(apiResponseJson) { return JSON.stringify(getCachedCategories()); }
function parseCountriesResponse(apiResponseJson) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
