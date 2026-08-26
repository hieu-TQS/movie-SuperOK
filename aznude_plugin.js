// =============================================================================
// AZNude Plugin (Tương thích 100% Rhino JS & Android TV)
// https://www.aznude.com/
// =============================================================================

var BASEURL = "https://www.aznude.com";

function getManifest() {
    return JSON.stringify({
        "id": "aznude",
        "name": "AZNude",
        "description": "Kho cảnh nhạy cảm & người nổi tiếng AZNude.com (HD/4K Stream)",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://cdn.aznude.com/images/logo/v5/main-logo.svg",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/browse/videos/recent/1.html", "title": "Video Mới Nhất", "type": "Grid" },
        { "slug": "/browse/videos/popular/1.html", "title": "Video Phổ Biến", "type": "Grid" },
        { "slug": "/browse/movies/recent/1.html", "title": "Phim Mới Nhất", "type": "Grid" },
        { "slug": "/top100videos.html", "title": "Top 100 Video", "type": "Grid" },
        { "slug": "/top100celebs.html", "title": "Top 100 Celebs", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Video Mới Nhất", value: "/browse/videos/recent/1.html" },
            { name: "Video Phổ Biến", value: "/browse/videos/popular/1.html" },
            { name: "Phim Mới", value: "/browse/movies/recent/1.html" },
            { name: "Top 100 Video", value: "/top100videos.html" },
            { name: "Top 100 Celebs", value: "/top100celebs.html" }
        ],
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    return [
        { name: "Nude", slug: "/tags/vids/nude/1.html" },
        { name: "Lesbian", slug: "/tags/vids/lesbian/1.html" },
        { name: "Real Sex", slug: "/tags/vids/realsex/1.html" },
        { name: "Breasts", slug: "/tags/vids/breasts/1.html" },
        { name: "Butt", slug: "/tags/vids/butt/1.html" },
        { name: "Sexy", slug: "/tags/vids/sexy/1.html" },
        { name: "Bikini", slug: "/tags/vids/bikini/1.html" },
        { name: "Underwear", slug: "/tags/vids/underwear/1.html" },
        { name: "Thong", slug: "/tags/vids/thong/1.html" },
        { name: "Bush", slug: "/tags/vids/bush/1.html" },
        { name: "Interracial", slug: "/tags/vids/interracial/1.html" }
    ];
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/browse/videos/recent/1.html";

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

        // Adjust page number in URL pattern
        if (page > 1) {
            if (path.match(/\/\d+\.html$/)) {
                path = path.replace(/\/\d+\.html$/, "/" + page + ".html");
            } else if (path.indexOf(".html") > -1) {
                path = path.replace(".html", "/" + page + ".html");
            } else {
                if (path.charAt(path.length - 1) !== '/') path += '/';
                path += page + ".html";
            }
        }

        var url = path;
        if (url.indexOf("http") !== 0) {
            if (url.charAt(0) !== "/") url = "/" + url;
            url = BASEURL + url;
        }

        return url;
    } catch (e) {
        return BASEURL + "/browse/videos/recent/1.html";
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
    var safeKeyword = encodeURIComponent(keyword || "").replace(/%20/g, "-");
    return BASEURL + "/search/all/" + safeKeyword + "/" + page + ".html";
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

        // Pattern 1: media-list-item blocks
        var blocks = html.split(/class=["']media-list-item/i);
        if (blocks.length > 1) {
            for (var i = 1; i < blocks.length; i++) {
                var block = blocks[i];

                var linkMatch = block.match(/href=["']([^"']+)["']/i);
                var link = linkMatch ? linkMatch[1] : "";
                if (!link || link.indexOf("javascript") === 0) continue;

                if (link.indexOf("http") !== 0) {
                    if (link.charAt(0) !== '/') link = '/' + link;
                    link = BASEURL + link;
                }

                if (seen[link]) continue;

                var thumbMatch = block.match(/data-thumb=["']([^"']+)["']/i) ||
                                 block.match(/src=["']([^"']+)["']/i) ||
                                 block.match(/data-src=["']([^"']+)["']/i);
                var thumb = thumbMatch ? thumbMatch[1] : "";

                var titleMatch = block.match(/alt=["']([^"']+)["']/i) ||
                                 block.match(/title=["']([^"']+)["']/i) ||
                                 block.match(/class=["']video-title["'][^>]*>([\s\S]*?)<\/a>/i);
                var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "";

                if (!title) {
                    var innerMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
                    if (innerMatch) title = innerMatch[1].replace(/<[^>]+>/g, '').trim();
                }

                var durationMatch = block.match(/class=["']video-timestamp["'][^>]*>([\s\S]*?)<\/span>/i);
                var duration = durationMatch ? durationMatch[1].trim() : "";

                if (link && (title || thumb)) {
                    seen[link] = true;
                    items.push({
                        "id": link,
                        "title": title || "AZNude Item",
                        "posterUrl": thumb,
                        "backdropUrl": thumb,
                        "quality": duration || "HD",
                        "year": 0
                    });
                }
            }
        }

        // Fallback: parse <a> tags pointing to /azncdn/ or /view/
        if (items.length === 0) {
            var linkRegex = /<a[^>]+href=["'](\/azncdn\/[^\s"']+|\/view\/[^\s"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var match;
            while ((match = linkRegex.exec(html)) !== null) {
                var href = match[1];
                var inner = match[2];

                if (href.indexOf("http") !== 0) {
                    if (href.charAt(0) !== '/') href = '/' + href;
                    href = BASEURL + href;
                }

                if (seen[href]) continue;

                var imgM = inner.match(/src=["']([^"']+)["']/i) || inner.match(/data-thumb=["']([^"']+)["']/i);
                var tM = inner.match(/alt=["']([^"']+)["']/i) || inner.match(/title=["']([^"']+)["']/i);

                var t = tM ? tM[1] : inner.replace(/<[^>]+>/g, '').trim();
                var p = imgM ? imgM[1] : '';

                if (href && (t || p)) {
                    seen[href] = true;
                    items.push({
                        "id": href,
                        "title": t || "AZNude Item",
                        "posterUrl": p,
                        "backdropUrl": p,
                        "quality": "HD",
                        "year": 0
                    });
                }
            }
        }

        // Pagination extraction
        var currentPage = 1;
        var totalPages = 1;

        if (url) {
            var pM = url.match(/\/(\d+)\.html/);
            if (pM) currentPage = parseInt(pM[1], 10);
        }

        var pageMatches = html.match(/\/(\d+)\.html/g) || [];
        for (var j = 0; j < pageMatches.length; j++) {
            var num = parseInt(pageMatches[j].replace(/\D/g, ''), 10);
            if (num && num > totalPages && num < 1000) totalPages = num;
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
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : "AZNude Video";

        var metaImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
        var posterUrl = metaImg ? metaImg[1] : "";

        var metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
        var description = metaDesc ? metaDesc[1].replace(/<[^>]+>/g, '').trim() : "";

        var servers = [];

        // Check if page is a celeb / movie list page (/view/...)
        if (url && url.indexOf("/view/") > -1) {
            var sceneList = [];
            var seen = {};

            var sceneRegex = /<a[^>]+href=["'](\/azncdn\/[^\s"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var match;
            while ((match = sceneRegex.exec(html)) !== null) {
                var epUrl = BASEURL + match[1];
                if (seen[epUrl]) continue;
                seen[epUrl] = true;

                var inner = match[2];
                var epTitleMatch = inner.match(/alt=["']([^"']+)["']/i) || inner.match(/title=["']([^"']+)["']/i);
                var epName = epTitleMatch ? epTitleMatch[1].replace(/<[^>]+>/g, '').trim() : ("Scene " + (sceneList.length + 1));

                sceneList.push({
                    "id": epUrl,
                    "name": epName,
                    "slug": "scene-" + (sceneList.length + 1)
                });
            }

            if (sceneList.length > 0) {
                servers.push({
                    "name": "Server AZNude",
                    "episodes": sceneList
                });
            }
        }

        // Fallback for single video page (/azncdn/...)
        if (servers.length === 0) {
            servers.push({
                "name": "Server AZNude",
                "episodes": [{
                    "id": url || BASEURL,
                    "name": "Full Video",
                    "slug": "full"
                }]
            });
        }

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
            "category": "Celeb, Nude",
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
        var m3u8Match = html.match(/(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/i);
        var streamUrl = m3u8Match ? m3u8Match[1] : "";

        if (!streamUrl) {
            var mp4Match = html.match(/(https?:\/\/[^\s"'\\]+_hd\.mp4[^\s"'\\]*)/i) ||
                           html.match(/(https?:\/\/[^\s"'\\]+\.mp4[^\s"'\\]*)/i);
            if (mp4Match) streamUrl = mp4Match[1];
        }

        var isEmbed = false;
        var mimeType = streamUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4";

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
