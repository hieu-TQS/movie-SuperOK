
var BASEURL = "https://hdvnn.xyz";
var USER_COOKIE = "PHPSESSID=480877ab58947c50be5d37b2478fe272; tokentime=%7B%221d6f84c58f7f653b8781edf32141b088%22%3A%221d6f84c58f7f653b8781edf32141b088%22%7D;";

function getManifest() {
    return JSON.stringify({
        "id": "hdvnn",
        "name": "HDvnn",
        "version": "1.0.3",
        "description": "Kho phim HDvnn.xyz Thuyết Minh, Lồng Tiếng, Vietsub chất lượng HD/FHD.",
        "info": "Kho phim HDvnn.xyz Thuyết Minh, Lồng Tiếng, Vietsub chất lượng HD/FHD.",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/hdvnn.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
        console.log("[hdvnn] " + msg);
    }
}

function httpGet(url, headers) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            var client = com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE;
            if (headers) {
                try {
                    var map = new java.util.HashMap();
                    for (var k in headers) {
                        if (headers.hasOwnProperty(k)) map.put(String(k), String(headers[k]));
                    }
                    return String(client.fetchContentString(url, map) || "");
                } catch(me) {
                    return String(client.fetchContentString(url, null) || "");
                }
            }
            return String(client.fetchContentString(url, null) || "");
        }
    } catch(e) {
        log("httpGet error: " + e);
    }
    return "";
}

function httpPost(url, postBody, headers) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            var client = com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE;
            if (headers) {
                try {
                    var map = new java.util.HashMap();
                    for (var k in headers) {
                        if (headers.hasOwnProperty(k)) map.put(String(k), String(headers[k]));
                    }
                    return String(client.fetchContentPost(url, postBody, map) || "");
                } catch(me) {
                    return String(client.fetchContentPost(url, postBody, null) || "");
                }
            }
            return String(client.fetchContentPost(url, postBody, null) || "");
        }
    } catch(e) {
        log("httpPost error: " + e);
    }
    return "";
}

// ===== MENU & CATEGORIES =====

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/the-loai/phim-chieu-rap.html", "title": "Phim Chiếu Rạp", "type": "Horizontal" },
        { "slug": "/loc-phim/W1tdLFtdLFsxXSxbXV0=", "title": "Phim Lẻ Mới", "type": "Horizontal" },
        { "slug": "/loc-phim/W1tdLFtdLFsyXSxbXV0=", "title": "Phim Bộ Mới", "type": "Horizontal" },
        { "slug": "/the-loai/phim-han-quoc.html", "title": "Phim Hàn Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/phim-trung-quoc.html", "title": "Phim Trung Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/hh-trung-quoc.html", "title": "HH Trung Quốc", "type": "Horizontal" },
        { "slug": "/the-loai/anime-nhat-ban.html", "title": "Anime Nhật Bản", "type": "Horizontal" },
        { "slug": "/the-loai/phim-chieu-rap.html", "title": "Tất Cả Phim", "type": "Grid" }
    ]);
}

function getLISTmenu() {
    return [
        { "link": "/the-loai/phim-chieu-rap.html", "name": "Phim Chiếu Rạp" },
        { "link": "/loc-phim/W1tdLFtdLFsxXSxbXV0=", "name": "Phim Lẻ" },
        { "link": "/loc-phim/W1tdLFtdLFsyXSxbXV0=", "name": "Phim Bộ" },
        { "link": "/the-loai/phim-han-quoc.html", "name": "Phim Hàn Quốc" },
        { "link": "/the-loai/phim-trung-quoc.html", "name": "Phim Trung Quốc" },
        { "link": "/the-loai/phim-chau-a.html", "name": "Phim Châu Á" },
        { "link": "/the-loai/phim-au-my.html", "name": "Phim Âu-Mỹ" },
        { "link": "/the-loai/hh-trung-quoc.html", "name": "HH Trung Quốc" },
        { "link": "/the-loai/anime-nhat-ban.html", "name": "Anime Nhật Bản" }
    ];
}

function getPrimaryCategories() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({
                "name": menu[i].name,
                "slug": menu[i].link
            });
        }
        return JSON.stringify(result);
    } catch(e) {
        return "[]";
    }
}

function getFilterConfig() {
    try {
        var menu = getLISTmenu();
        var result = [];
        for (var i = 0; i < menu.length; i++) {
            result.push({
                "name": menu[i].name,
                "slug": menu[i].link
            });
        }
        return JSON.stringify({
            category: result
        });
    } catch(e) {
        return JSON.stringify({ category: [] });
    }
}

function parseCategoriesResponse(html) {
    return getPrimaryCategories();
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// ===== URL GENERATION =====

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") === 0) return slug;

        var page = 1;
        var path = slug || "/the-loai/phim-chieu-rap.html";

        if (filtersJson) {
            try {
                var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
                if (f.page) page = parseInt(f.page, 10) || 1;
                if (f.category) {
                    if (Array.isArray(f.category) && f.category.length > 0) {
                        path = f.category[0].slug || f.category[0].link || path;
                    } else if (typeof f.category === "string") {
                        path = f.category;
                    }
                }
            } catch(e) {}
        }

        var url = path.indexOf("http") === 0 ? path : (BASEURL + (path.indexOf("/") === 0 ? "" : "/") + path);
        if (page > 1) {
            url += (url.indexOf("?") > -1 ? "&p=" : "?p=") + page;
        }
        return url;
    } catch(e) {
        return BASEURL + "/the-loai/phim-chieu-rap.html";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            try {
                var f = typeof filtersJson === "object" ? filtersJson : JSON.parse(filtersJson);
                if (f.page) page = parseInt(f.page, 10) || 1;
            } catch(e) {}
        }
        var kw = encodeURIComponent(keyword || "");
        var url = BASEURL + "/tim-kiem/" + kw + ".html";
        if (page > 1) {
            url += "?p=" + page;
        }
        return url;
    } catch(e) {
        return BASEURL + "/tim-kiem/" + encodeURIComponent(keyword || "") + ".html";
    }
}

function getSearchUrl(keyword, page) {
    var p = typeof page === 'number' ? page : 1;
    return getUrlSearch(keyword, JSON.stringify({ page: p }));
}

function getUrlDetail(id) {
    if (!id) return "";
    if (id.indexOf("http") === 0) return id;
    return BASEURL + (id.indexOf("/") === 0 ? "" : "/") + id;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// ===== PARSE LIST RESPONSE =====

function parseListResponse(html, $url) {
    try {
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });

        var items = [];
        var itemRegex = /<a\s+href="([^"]*thong-tin-phim[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        var seen = {};

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            if (seen[href]) continue;
            seen[href] = true;

            if (href.indexOf("http") !== 0) {
                href = BASEURL + (href.indexOf("/") === 0 ? "" : "/") + href;
            }

            var inner = match[2];
            var titleMatch = match[0].match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            var title = titleMatch ? titleMatch[1].trim() : "";
            if (!title) continue;

            var imgMatch = inner.match(/img[\s\S]*?src="([^"]+)"/i);
            var poster = imgMatch ? imgMatch[1].trim() : "";
            if (poster.indexOf("//") === 0) poster = "https:" + poster;
            else if (poster && poster.indexOf("http") !== 0) poster = BASEURL + (poster.indexOf("/") === 0 ? "" : "/") + poster;

            var epMatch = inner.match(/class="episode-latest"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/i);
            var episodeCurrent = epMatch ? epMatch[1].trim() : "";

            var qMatch = inner.match(/class="score"[^>]*>([\s\S]*?)<\/div>/i);
            var quality = qMatch ? qMatch[1].replace(/<[^>]*>/g, '').trim() : "HD";

            items.push({
                "id": href,
                "title": title,
                "posterUrl": poster,
                "backdropUrl": poster,
                "quality": quality,
                "episode_current": episodeCurrent
            });
        }

        var currentPage = 1;
        if ($url) {
            var pMatch = $url.match(/[?&]p=(\d+)/i);
            if (pMatch) currentPage = parseInt(pMatch[1], 10);
        }

        var totalPages = currentPage;
        var pageLinkRegex = /class="page-link"[^>]*href="[^"]*?[?&]p=(\d+)"/gi;
        var pLinkMatch;
        while ((pLinkMatch = pageLinkRegex.exec(html)) !== null) {
            var pNum = parseInt(pLinkMatch[1], 10);
            if (pNum > totalPages) totalPages = pNum;
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": currentPage < totalPages || items.length >= 30
            }
        });
    } catch(e) {
        log("parseListResponse error: " + e);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseSearchResult(html, url) {
    return parseListResponse(html, url);
}

function parseHomeResponse(html, url) {
    return parseListResponse(html, url);
}

function parseList(html, url) {
    return parseListResponse(html, url);
}

// ===== PARSE MOVIE DETAIL =====

function parseMovieDetail(html, url) {
    try {
        var id = url || "";
        var titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/property="og:title"\s+content="([^"]+)"/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : "HDvnn Movie";

        var imgMatch = html.match(/property="og:image"\s+content="([^"]+)"/i);
        var posterUrl = imgMatch ? imgMatch[1] : "";
        if (posterUrl.indexOf("//") === 0) posterUrl = "https:" + posterUrl;

        var descMatch = html.match(/property="og:description"\s+content="([^"]+)"/i);
        var description = descMatch ? descMatch[1] : "Xem phim chất lượng cao trên HDvnn.";

        var yearMatch = html.match(/(\d{4})/);
        var year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

        var detailHtml = html || "";
        if (detailHtml.indexOf("xem-phim") === -1 && USER_COOKIE && id && id.indexOf("http") === 0) {
            var authDetail = httpGet(id, { "Cookie": USER_COOKIE });
            if (authDetail && authDetail.indexOf("xem-phim") !== -1) {
                detailHtml = authDetail;
            }
        }

        // Fetch watch page to get episode list & server details
        var watchLinks = [];
        var watchRegex = /href="([^"]*xem-phim[^"]*)"/gi;
        var wMatch;
        while ((wMatch = watchRegex.exec(detailHtml)) !== null) {
            var wUrl = wMatch[1];
            if (wUrl.indexOf("http") !== 0) wUrl = BASEURL + (wUrl.indexOf("/") === 0 ? "" : "/") + wUrl;
            if (watchLinks.indexOf(wUrl) === -1) {
                watchLinks.push(wUrl);
            }
        }

        var watchHtml = detailHtml;
        if (watchLinks.length > 0 && detailHtml.indexOf("EpisodeID") === -1) {
            var watchHeaders = USER_COOKIE ? { "Cookie": USER_COOKIE } : null;
            var fetchedWatch = httpGet(watchLinks[0], watchHeaders);
            if (fetchedWatch) watchHtml = fetchedWatch;
        }

        // Parse episodes from watch page
        var episodesRaw = [];
        var epRegex = /<a\s+href="([^"]*xem-phim[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        var seenEps = {};

        while ((epMatch = epRegex.exec(watchHtml)) !== null) {
            var epUrl = epMatch[1];
            if (epUrl.indexOf("http") !== 0) epUrl = BASEURL + (epUrl.indexOf("/") === 0 ? "" : "/") + epUrl;
            var inner = epMatch[2];
            var epName = inner.replace(/<[^>]*>/g, '').trim();

            // Bỏ qua nút 'Xem Ngay', 'Xem Phim' hoặc button action
            if (!epName || epName.toLowerCase().indexOf("xem ngay") !== -1 || epName.toLowerCase().indexOf("xem phim") !== -1) {
                continue;
            }
            if (inner.indexOf("fa-play") !== -1 || epMatch[0].indexOf("button-default") !== -1) {
                continue;
            }

            if (!seenEps[epUrl] && epName.indexOf("script") === -1 && epName.indexOf("jwplayer") === -1) {
                seenEps[epUrl] = true;
                var isNum = /^\d+$/.test(epName);
                episodesRaw.push({
                    id: epUrl,
                    name: isNum ? ("Tập " + epName) : epName,
                    slug: "tap-" + epName.replace(/[^\d]/g, ''),
                    num: isNum ? parseInt(epName, 10) : 0
                });
            }
        }

        // Đảo ngược mảng nếu danh sách tập trên web bị xếp giảm dần (ví dụ 239 -> 1)
        if (episodesRaw.length > 1 && episodesRaw[0].num > episodesRaw[episodesRaw.length - 1].num) {
            episodesRaw.reverse();
        }

        if (episodesRaw.length === 0 && watchLinks.length > 0) {
            for (var k = 0; k < watchLinks.length; k++) {
                episodesRaw.push({
                    id: watchLinks[k],
                    name: "Tập " + (k + 1),
                    slug: "tap-" + (k + 1),
                    num: k + 1
                });
            }
        }

        // Generate server groups
        var servers = [];

        if (episodesRaw.length > 0) {
            // Server 1: Tự động
            servers.push({
                name: "HDvnn (Tự Động)",
                episodes: episodesRaw
            });

            // Server 2: VNN 1 (Embed)
            var epsVNN1 = [];
            for (var v1 = 0; v1 < episodesRaw.length; v1++) {
                epsVNN1.push({
                    id: episodesRaw[v1].id + "#server=vnn_1",
                    name: episodesRaw[v1].name,
                    slug: episodesRaw[v1].slug
                });
            }
            servers.push({
                name: "Server VNN 1",
                episodes: epsVNN1
            });

            // Server 3: VNN 2 (Embed)
            var epsVNN2 = [];
            for (var v2 = 0; v2 < episodesRaw.length; v2++) {
                epsVNN2.push({
                    id: episodesRaw[v2].id + "#server=vnn_2",
                    name: episodesRaw[v2].name,
                    slug: episodesRaw[v2].slug
                });
            }
            servers.push({
                name: "Server VNN 2",
                episodes: epsVNN2
            });

            // Server 4: Abyss (HY)
            var epsHY = [];
            for (var h = 0; h < episodesRaw.length; h++) {
                epsHY.push({
                    id: episodesRaw[h].id + "#server=hy",
                    name: episodesRaw[h].name,
                    slug: episodesRaw[h].slug
                });
            }
            servers.push({
                name: "Server Abyss (HY)",
                episodes: epsHY
            });

            // Server 5: VK
            var epsVK = [];
            for (var vk = 0; vk < episodesRaw.length; vk++) {
                epsVK.push({
                    id: episodesRaw[vk].id + "#server=vk",
                    name: episodesRaw[vk].name,
                    slug: episodesRaw[vk].slug
                });
            }
            servers.push({
                name: "Server VK",
                episodes: epsVK
            });

            // Server 6: Google (PT)
            var epsPT = [];
            for (var p = 0; p < episodesRaw.length; p++) {
                epsPT.push({
                    id: episodesRaw[p].id + "#server=pt",
                    name: episodesRaw[p].name,
                    slug: episodesRaw[p].slug
                });
            }
            servers.push({
                name: "Server Google (PT)",
                episodes: epsPT
            });

            // Server 7: Google (GO)
            var epsGO = [];
            for (var g = 0; g < episodesRaw.length; g++) {
                epsGO.push({
                    id: episodesRaw[g].id + "#server=go",
                    name: episodesRaw[g].name,
                    slug: episodesRaw[g].slug
                });
            }
            servers.push({
                name: "Server Google (GO)",
                episodes: epsGO
            });
        }

        return JSON.stringify({
            id: id,
            title: title,
            name: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            rating: 8.5,
            quality: "FHD",
            status: "Hoàn Thành",
            servers: servers
        });
    } catch(e) {
        log("parseMovieDetail error: " + e);
        return JSON.stringify({
            id: url || "error",
            title: "Lỗi tải chi tiết",
            servers: []
        });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

// ===== DIRECT STREAM EXTRACTORS =====

function decodeBase64(input) {
    if (!input) return "";
    try {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var str = String(input).replace(/=+$/, '');
        var output = '';
        if (str.length % 4 === 1) return '';
        for (var bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
            buffer = chars.indexOf(buffer);
        }
        return String(output);
    } catch(ex) {
        return "";
    }
}

function extractDirectVideoFromVnnHtml(html) {
    if (!html) return "";
    var directMatch = html.match(/https:\/\/lh3\.googleusercontent\.com\/[^\s"'<>\\]+/);
    if (directMatch) return String(directMatch[0]);

    var b64Regex = /aHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29t[A-Za-z0-9+/=_-]+/g;
    var match;
    var m22Url = "";
    var m37Url = "";
    var anyUrl = "";
    while ((match = b64Regex.exec(html)) !== null) {
        var rawB64 = match[0];
        var decoded = decodeBase64(rawB64);
        if (decoded && decoded.indexOf("googleusercontent.com") !== -1) {
            if (decoded.indexOf("=m22") !== -1) {
                m22Url = String(decoded);
            } else if (decoded.indexOf("=m37") !== -1) {
                m37Url = String(decoded);
            } else if (!anyUrl) {
                anyUrl = String(decoded);
            }
        }
    }
    var res = m22Url || m37Url || anyUrl || "";
    return String(res);
}

// ===== PARSE PLAYER & STREAM RESPONSE =====

function parseDetailResponse(html, url) {
    try {
        var reqUrl = url ? String(url) : "";
        var serverTag = "";
        if (reqUrl.indexOf("#server=") !== -1) {
            var parts = reqUrl.split("#server=");
            reqUrl = parts[0];
            serverTag = parts[1];
        }

        if (reqUrl.indexOf(".m3u8") !== -1 || reqUrl.indexOf(".mp4") !== -1 || reqUrl.indexOf("lh3.googleusercontent.com") !== -1) {
            return JSON.stringify({
                "url": reqUrl,
                "isEmbed": false,
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                "subtitles": []
            });
        }

        var pageHtml = html ? String(html) : "";
        if (pageHtml.indexOf("MovieID") === -1 && reqUrl && reqUrl.indexOf("http") === 0) {
            var getHeaders = USER_COOKIE ? { "Cookie": USER_COOKIE } : null;
            pageHtml = httpGet(reqUrl, getHeaders);
        }

        var csrfMatch = pageHtml.match(/name="csrf-token"\s+content="([^"]+)"/i);
        var csrfToken = csrfMatch ? csrfMatch[1] : "";

        var movieIDMatch = pageHtml.match(/MovieID:\s*(\d+)/i) || pageHtml.match(/MovieID\s*=\s*['"]?(\d+)['"]?/i);
        var episodeIDMatch = pageHtml.match(/EpisodeID:\s*(\d+)/i) || pageHtml.match(/EpisodeID\s*=\s*['"]?(\d+)['"]?/i) || reqUrl.match(/episode-id-(\d+)\.html/i);

        var movieId = movieIDMatch ? String(movieIDMatch[1]) : "";
        var episodeId = episodeIDMatch ? String(episodeIDMatch[1]) : "";

        if (!movieId || !episodeId) {
            return JSON.stringify({
                "url": reqUrl,
                "isEmbed": true,
                "headers": { "Referer": BASEURL + "/" }
            });
        }

        var postData = "MovieID=" + movieId + "&EpisodeID=" + episodeId;
        var headers = {
            "X-CSRF-TOKEN": csrfToken,
            "X-Requested-With": "XMLHttpRequest",
            "Referer": reqUrl,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        };
        if (USER_COOKIE) {
            headers["Cookie"] = USER_COOKIE;
        }

        var respStr = httpPost(BASEURL + "/server/ajax/player", postData, headers);
        if (!respStr) {
            return JSON.stringify({ "url": reqUrl, "isEmbed": true, "headers": { "Referer": BASEURL + "/" } });
        }

        var json = JSON.parse(respStr);
        var streamUrl = "";
        var isEmbed = false;

        if (serverTag && json["src_" + serverTag]) {
            streamUrl = String(json["src_" + serverTag]);
            if (serverTag === "vnn_1" || serverTag === "vnn_2" || serverTag === "hy" || serverTag === "vk" || serverTag === "ok" || serverTag === "on" || serverTag === "lt_1" || serverTag === "lt_2") {
                isEmbed = true;
            }
        }

        if (!streamUrl) {
            // Ưu tiên VNN (có thể bóc tách link direct MP4 sang ExoPlayer)
            if (json.src_vnn_1) { streamUrl = String(json.src_vnn_1); isEmbed = true; }
            else if (json.src_vnn_2) { streamUrl = String(json.src_vnn_2); isEmbed = true; }
            else if (json.src_hy) { streamUrl = String(json.src_hy); isEmbed = true; }
            else if (json.src_vk) { streamUrl = String(json.src_vk); isEmbed = true; }
            else if (json.src_ok) { streamUrl = String(json.src_ok); isEmbed = true; }
            else if (json.src_on) { streamUrl = String(json.src_on); isEmbed = true; }
            else if (json.src_lt_1) { streamUrl = String(json.src_lt_1); isEmbed = true; }
            else if (json.src_lt_2) { streamUrl = String(json.src_lt_2); isEmbed = true; }
            else if (json.src_pt) { streamUrl = String(json.src_pt); isEmbed = false; }
            else if (json.src_go) { streamUrl = String(json.src_go); isEmbed = false; }
            else if (json.src_hd) { streamUrl = String(json.src_hd); isEmbed = false; }
            else if (json.src_vip) { streamUrl = String(json.src_vip); isEmbed = false; }
            else if (json.src_dr) { streamUrl = String(json.src_dr); isEmbed = false; }
            else if (json.src_lt_3) { streamUrl = String(json.src_lt_3); isEmbed = false; }
        }

        if (!streamUrl) {
            streamUrl = reqUrl;
            isEmbed = true;
        }

        // Tự động giải mã trực tiếp stream MP4 từ cdn.hdvideo.homes nếu là server VNN
        if (streamUrl.indexOf("cdn.hdvideo.homes") !== -1) {
            var vnnHtml = httpGet(streamUrl, { "Referer": BASEURL + "/" });
            if (vnnHtml) {
                var directMp4 = extractDirectVideoFromVnnHtml(vnnHtml);
                if (directMp4) {
                    return JSON.stringify({
                        "url": String(directMp4),
                        "isEmbed": false,
                        "headers": {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        },
                        "subtitles": []
                    });
                }
            }
        }

        return JSON.stringify({
            "url": String(streamUrl),
            "isEmbed": Boolean(isEmbed),
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            "subtitles": []
        });
    } catch(e) {
        log("parseDetailResponse error: " + e);
        return JSON.stringify({
            "url": url ? String(url) : "",
            "isEmbed": true,
            "headers": { "Referer": BASEURL + "/" }
        });
    }
}

function parseEmbedResponse(html, url) {
    try {
        var pageHtml = html ? String(html) : "";
        var reqUrl = url ? String(url) : "";
        if (pageHtml && (pageHtml.indexOf("cdn.hdvideo.homes") !== -1 || reqUrl.indexOf("cdn.hdvideo.homes") !== -1 || pageHtml.indexOf("aHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29t") !== -1)) {
            var directMp4 = extractDirectVideoFromVnnHtml(pageHtml);
            if (directMp4) {
                return JSON.stringify({
                    "url": String(directMp4),
                    "isEmbed": false,
                    "headers": {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    },
                    "subtitles": []
                });
            }
        }
    } catch(e) {}
    return JSON.stringify({
        "url": url ? String(url) : "",
        "isEmbed": true,
        "headers": { "Referer": BASEURL + "/" }
    });
}

function parseEmbedPlayer(html, url) {
    return parseEmbedResponse(html, url);
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}
