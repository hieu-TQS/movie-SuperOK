// =============================================================================
// AShemaleTube / AShemaleTV Plugin (Tương thích 100% Rhino JS & Android TV)
// https://ashemaletv.com / https://www.ashemaletube.com
// =============================================================================

var BASEURL = "https://ashemaletv.com";

function getManifest() {
    return JSON.stringify({
        "id": "ashemaletube",
        "name": "AShemaleTube / AshemaleTV",
        "description": "Kho video Trans, Shemale & Ladyboy (Stream HD trực tiếp, Không bị chặn)",
        "version": "1.0.2",
        "baseUrl": BASEURL,
        "iconUrl": "https://ashemaletv.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/", "title": "Mới Nhất (Latest)", "type": "Grid" },
        { "slug": "/top-rated/", "title": "Đánh Giá Cao (Top Rated)", "type": "Grid" },
        { "slug": "/most-popular/", "title": "Xem Nhiều Nhất (Most Popular)", "type": "Grid" },
        { "slug": "/categories/", "title": "Thể Loại (Categories)", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Nhất", value: "/" },
            { name: "Đánh Giá Cao", value: "/top-rated/" },
            { name: "Xem Nhiều Nhất", value: "/most-popular/" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    return [
        { name: "Ladyboy", slug: "/categories/ladyboy/" },
        { name: "Amateur", slug: "/categories/amateur/" },
        { name: "Anal", slug: "/categories/anal/" },
        { name: "Asian", slug: "/categories/asian/" },
        { name: "Bareback", slug: "/categories/bareback/" },
        { name: "Big Cock", slug: "/categories/big-cock/" },
        { name: "Big Tits", slug: "/categories/big-tits/" },
        { name: "Blowjob", slug: "/categories/blowjob/" },
        { name: "Cumshot", slug: "/categories/cumshot/" },
        { name: "Ebony", slug: "/categories/ebony/" },
        { name: "Group", slug: "/categories/group/" },
        { name: "Hardcore", slug: "/categories/hardcore/" },
        { name: "Interracial", slug: "/categories/interracial/" },
        { name: "Latina", slug: "/categories/latina/" },
        { name: "POV", slug: "/categories/pov/" },
        { name: "Solo", slug: "/categories/solo/" },
        { name: "Shemale Fuck Guy", slug: "/categories/shemale-fuck-guy/" },
        { name: "Guy Fuck Shemale", slug: "/categories/guy-fuck-shemale/" },
        { name: "Transgender", slug: "/categories/transgender/" }
    ];
}

// =============================================================================
// HELPER UTILS
// =============================================================================

function decodeEntities(str) {
    if (!str) return "";
    return str.replace(/&#x([0-9a-fA-F]+);/g, function(match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    }).replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(parseInt(dec, 10));
    }).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function cleanTitle(title) {
    if (!title) return "";
    var t = title.replace(/^Video:\s*/i, '').replace(/<[^>]+>/g, '').trim();
    return decodeEntities(t);
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
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
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
            if (url.indexOf("?") > -1) {
                url += "&page=" + page;
            } else {
                if (url.charAt(url.length - 1) !== "/") url += "/";
                url += page + "/";
            }
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
    var safeKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "+");
    var url = BASEURL + "/search/" + safeKeyword + "/";
    if (page > 1) {
        url += page + "/";
    }
    return url;
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

function getUrlCategories() { return BASEURL + "/categories/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, url) {
    try {
        var items = [];
        var seen = {};

        // Pattern 1: Splitting by video item containers (div/a with item/video/thumb/box classes)
        var blocks = html.split(/<div[^>]*class=["'][^"']*(?:item|video|thumb|box)[^"']*["']/i);
        if (blocks.length > 1) {
            for (var i = 1; i < blocks.length; i++) {
                var block = blocks[i];

                var linkMatch = block.match(/href=["']([^"']+\/(?:videos?|watch)\/[^"']+)["']/i) ||
                                block.match(/href=["'](\/video\/[^"']+|\/videos\/[^"']+)["']/i);
                var link = linkMatch ? linkMatch[1] : "";
                if (!link || link.indexOf("javascript") === 0) continue;

                if (link.indexOf("http") !== 0) {
                    if (link.charAt(0) !== '/') link = '/' + link;
                    link = BASEURL + link;
                }

                if (seen[link]) continue;

                var imgMatch = block.match(/data-src=["']([^"']+)["']/i) ||
                               block.match(/data-original=["']([^"']+)["']/i) ||
                               block.match(/data-thumb=["']([^"']+)["']/i) ||
                               block.match(/src=["']([^"']+)["']/i);
                var poster = imgMatch ? imgMatch[1] : "";

                var titleMatch = block.match(/alt=["']([^"']+)["']/i) ||
                                 block.match(/title=["']([^"']+)["']/i) ||
                                 block.match(/class=["'][^"']*(?:title|name)[^"']*["'][^>]*>([\s\S]*?)<\/(?:a|span|div)>/i);
                var title = titleMatch ? cleanTitle(titleMatch[1]) : "";

                var durationMatch = block.match(/class=["'][^"']*(?:duration|time|length)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                                  block.match(/<span>(\d{1,2}:\d{2}(?::\d{2})?)<\/span>/i);
                var duration = durationMatch ? durationMatch[1].replace(/<[^>]+>/g, '').trim() : "HD";

                if (link && (title || poster)) {
                    seen[link] = true;
                    items.push({
                        "id": link,
                        "title": title || "AShemaleTV Video",
                        "posterUrl": poster,
                        "backdropUrl": poster,
                        "quality": duration,
                        "year": 0
                    });
                }
            }
        }

        // Pattern 2: Fallback regex scanning all <a> tags pointing to /videos/ or /video/
        if (items.length === 0) {
            var regex = /<a[^>]+href=["']((?:https?:\/\/[^\s"']*)?\/(?:videos?|watch)\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var match;

            while ((match = regex.exec(html)) !== null) {
                var href = match[1];
                var inner = match[2];

                if (href.indexOf("http") !== 0) {
                    if (href.charAt(0) !== '/') href = '/' + href;
                    href = BASEURL + href;
                }

                if (seen[href] || href.indexOf("/embed/") > -1) continue;

                var imgM = inner.match(/data-src=["']([^"']+)["']/i) || inner.match(/data-original=["']([^"']+)["']/i) || inner.match(/src=["']([^"']+)["']/i);
                var titleM = inner.match(/alt=["']([^"']+)["']/i) || inner.match(/title=["']([^"']+)["']/i);

                var t = titleM ? cleanTitle(titleM[1]) : cleanTitle(inner);
                var p = imgM ? imgM[1] : '';

                if (href && (t || p)) {
                    seen[href] = true;
                    items.push({
                        "id": href,
                        "title": t || "AShemaleTV Video",
                        "posterUrl": p,
                        "backdropUrl": p,
                        "quality": "HD",
                        "year": 0
                    });
                }
            }
        }

        var currentPage = 1;
        var totalPages = 1;

        if (url) {
            var pM = url.match(/\/(\d+)\/?$/) || url.match(/[?&]page=(\d+)/);
            if (pM) currentPage = parseInt(pM[1], 10);
        }

        var maxPMatch = html.match(/\/(\d+)\/?["']/g) || html.match(/[?&]page=(\d+)/g) || [];
        for (var j = 0; j < maxPMatch.length; j++) {
            var num = parseInt(maxPMatch[j].replace(/\D/g, ''), 10);
            if (num && num > totalPages && num < 5000) totalPages = num;
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
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        var title = titleMatch ? cleanTitle(titleMatch[1]) : "AShemaleTV Video";

        var metaImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<video[^>]*poster=["']([^"']+)["']/i);
        var posterUrl = metaImg ? metaImg[1] : "";

        var metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var description = metaDesc ? cleanTitle(metaDesc[1]) : "";

        var servers = [{
            "name": "Server AShemaleTV",
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
            "category": "Trans, Shemale, Ladyboy",
            "country": "",
            "actor": "",
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

        // 1. Check HTML5 <source src="..."> or <video src="...">
        var sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i) ||
                          html.match(/<video[^>]+src=["']([^"']+)["']/i);
        if (sourceMatch) {
            streamUrl = sourceMatch[1];
        }

        // 2. Check JSON-LD contentUrl
        if (!streamUrl) {
            var jsonLdMatch = html.match(/["']contentUrl["']\s*:\s*["']([^"']+)["']/i);
            if (jsonLdMatch) streamUrl = jsonLdMatch[1];
        }

        // 3. Check JS variables
        if (!streamUrl) {
            var vUrlMatch = html.match(/video_url\s*:\s*['"]([^"']+)['"]/i) ||
                            html.match(/video_alt_url\s*:\s*['"]([^"']+)['"]/i) ||
                            html.match(/file\s*:\s*['"]([^"']+)['"]/i) ||
                            html.match(/video_url_hd\s*:\s*['"]([^"']+)['"]/i);
            if (vUrlMatch) streamUrl = vUrlMatch[1];
        }

        // 4. Check m3u8 playlist URL
        if (!streamUrl) {
            var m3u8Match = html.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i);
            if (m3u8Match) streamUrl = m3u8Match[1];
        }

        // 5. Check MP4 with query authorization token (?md5= or ?expires=)
        if (!streamUrl) {
            var tokenMp4 = html.match(/(https?:\/\/[^\s"'<>]+\.mp4\?[^\s"'<>]+)/i);
            if (tokenMp4) streamUrl = tokenMp4[1];
        }

        // 6. Generic MP4 fallback
        if (!streamUrl) {
            var mp4Matches = html.match(/https?:\/\/[^\s"'<>]+\.mp4(?:\?[^\s"'<>]*)?/gi) || [];
            for (var i = 0; i < mp4Matches.length; i++) {
                var candidate = mp4Matches[i];
                if (candidate.indexOf(".jpg") === -1 && candidate.indexOf(".png") === -1 && candidate.indexOf("/thumbs/") === -1) {
                    streamUrl = candidate;
                    break;
                }
            }
        }

        // Unescape HTML entities in streamUrl (&amp; -> &)
        if (streamUrl) {
            streamUrl = decodeEntities(streamUrl);
        }

        var isEmbed = false;
        var mimeType = (streamUrl && streamUrl.indexOf(".m3u8") > -1) ? "application/x-mpegURL" : "video/mp4";

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
