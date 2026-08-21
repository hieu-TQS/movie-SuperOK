// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var BASEURL = "https://animehay11.site"; 

function getManifest() {
    return JSON.stringify({
        "id": "animehay",
        "name": "Nguồn Animehay",
        "description": "Anime siêu hay.",
        "version": "1.1.0",
        "info": "Nguồn phim anime chất lượng cao. Cập nhật khá nhanh.",
        "baseUrl": "https://animehay11.site",
        "iconUrl": "https://animehay11.site/themes/img/logo.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[animehay] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[animehay] " + msg);
    }
}

function httpGet(url) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            return String(com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE.fetchContentString(url, null) || "");
        }
    } catch(e) {}
    return "";
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/phim-moi-cap-nhap/tat-ca-1.html", "title": "Phim Mới Cập Nhật", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl, "filter");
    return JSON.stringify({
        category: menulist
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || path;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var resultUrl = BASEURL;
        if (path) {
            resultUrl += (path.indexOf('/') === 0 ? path : '/' + path);
        }
        if (page > 1) {
            if (resultUrl.indexOf('.html') !== -1) {
                resultUrl = resultUrl.replace(/\.html$/i, '') + "/trang-" + page + ".html";
            } else {
                resultUrl += (resultUrl.endsWith('/') ? "" : "/") + "trang-" + page + ".html";
            }
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }
        var encodedKw = encodeURIComponent(keyword || "");
        if (page > 1) {
            return BASEURL + "/tim-kiem/trang-" + page + ".html?keyword=" + encodedKw;
        } else {
            return BASEURL + "/tim-kiem/?keyword=" + encodedKw;
        }
    } catch (e) {
        return BASEURL + "/tim-kiem/?keyword=" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + (slug.indexOf('/') === 0 ? slug : "/" + slug);
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
        var seen = {};

        var linkRegex = /<a\s+[^>]*href="([^"]*\/thong-tin-phim\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(html)) !== null) {
            var href = m[1];
            if (seen[href]) continue;
            seen[href] = true;

            var fullTag = m[0];
            var inner = m[2];

            var title = "";
            var titleMatch = fullTag.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            if (titleMatch) title = titleMatch[1].trim();
            if (!title) continue;

            var src = "";
            var srcMatch = inner.match(/data-src="([^"]+)"/i) || inner.match(/src="([^"]+)"/i);
            if (srcMatch) src = srcMatch[1].trim().replace(/&amp;/g, '&');
            if (src.indexOf("//") === 0) src = "https:" + src;
            else if (src && src.indexOf("http") !== 0) src = BASEURL + (src.indexOf('/') === 0 ? src : '/' + src);

            if (href.indexOf("http") !== 0) {
                href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
            }

            var episode = "";
            var epMatch = inner.match(/class="[^"]*ep-badge[^"]*"[^>]*>([^<]+)</i) || inner.match(/class="[^"]*episode[^"]*"[^>]*>([^<]+)</i);
            if (epMatch) episode = epMatch[1].trim();

            var quality = "";
            var qMatch = inner.match(/class="[^"]*score[^"]*"[^>]*>([^<]+)</i) || inner.match(/class="[^"]*quality[^"]*"[^>]*>([^<]+)</i);
            if (qMatch) quality = qMatch[1].trim();

            items.push({
                id: href,
                title: title,
                posterUrl: src,
                backdropUrl: src,
                quality: quality || "FHD",
                lang: "Vietsub",
                episode_current: episode
            });
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: 999
            }
        });
    } catch (e) {
        log("parseListResponse: " + e);
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}

function parseEpisodesFromWatchHtml(html) {
    var episodes = [];
    var seen = {};

    var epRegex = /<a\s+[^>]*href="([^"]*\/xem-phim\/[^"]*)"[^>]*class="[^"]*wp-ep[^"]*"[^>]*(?:title="([^"]*)")?[^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = epRegex.exec(html)) !== null) {
        var href = m[1];
        if (seen[href]) continue;
        seen[href] = true;

        if (href.indexOf('http') !== 0) {
            href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
        }

        var titleAttr = m[2] || "";
        var innerText = m[3].replace(/<[^>]*>/g, '').trim();
        var rawName = titleAttr || innerText;

        var numMatch = rawName.match(/\d+/);
        var num = numMatch ? parseInt(numMatch[0], 10) : 0;
        var displayName = rawName.indexOf('Tập') === -1 ? ("Tập " + rawName) : rawName;

        episodes.push({
            id: href,
            name: displayName,
            slug: "tap-" + (numMatch ? numMatch[0] : rawName),
            num: num
        });
    }

    episodes.sort(function(a, b) { return a.num - b.num; });

    return episodes.map(function(e) {
        return {
            id: e.id,
            name: e.name,
            slug: e.slug
        };
    });
}

function parseMovieDetail(html, url) {
    try {
        var id = url || "";
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        if (idMatch) id = idMatch[1];

        var lname = "Đang cập nhật...";
        var limg = "";
        var ldes = "Không có mô tả.";
        var category = "";
        var episode_current = "";
        var quality = "FHD";
        var year = 2026;
        var rating = 8.5;

        var rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
        if (limg.indexOf("//") === 0) limg = "https:" + limg;
        else if (limg && limg.indexOf("http") !== 0) limg = BASEURL + (limg.indexOf('/') === 0 ? limg : '/' + limg);

        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1].replace(/ - AnimeHay.*$/i, '').replace(/ - Anime Hay.*$/i, '').replace(/^Phim /i, '');

        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        // 1. Tải trang xem phim để lấy toàn bộ danh sách tập
        var watchPageUrl = id.replace('/thong-tin-phim/', '/xem-phim/');
        var watchHtml = httpGet(watchPageUrl);
        var episodes = [];
        if (watchHtml) {
            episodes = parseEpisodesFromWatchHtml(watchHtml);
            
            // Cập nhật thêm title / poster nếu detail bị thiếu
            var wTitle = watchHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            if (wTitle && (!lname || lname === "Đang cập nhật...")) {
                lname = wTitle[1].replace(/<[^>]*>/g, '').replace(/ - AnimeHay.*$/i, '').trim();
            }
        }

        // Fallback nếu không tải được trang xem phim
        if (episodes.length === 0) {
            episodes = parseEpisodesFromWatchHtml(html);
        }

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "AnimeHay",
                episodes: episodes
            });
        }

        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: quality,
            year: year,
            rating: rating,
            status: "",
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: "",
            casts: "",
            director: ""
        });

    } catch (e) {
        log("parseMovieDetail: " + e);
        return JSON.stringify({
            id: url || "error",
            title: "error",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var pageHtml = html || "";
        if ((!pageHtml || pageHtml.indexOf('embed-jw') === -1) && url && url.indexOf('http') === 0) {
            var fetched = httpGet(url);
            if (fetched) pageHtml = fetched;
        }

        var streamUrl = "";

        // 1. Tìm link embed-jw trong wp_servers
        var embedMatch = pageHtml.match(/https?:\/\/[^"'\s]+\/embed-jw\/\d+/i) ||
                         pageHtml.match(/['"]AHS['"]\s*:\s*['"]([^'"]+)['"]/i);
        
        var embedUrl = "";
        if (embedMatch) {
            embedUrl = embedMatch[1] || embedMatch[0];
        }

        // 2. Tải trang embed-jw để bóc tách M3U8_URL trực tiếp
        if (embedUrl) {
            var embedHtml = httpGet(embedUrl);
            if (embedHtml) {
                var m3u8Match = embedHtml.match(/var\s+M3U8_URL\s*=\s*['"]([^'"]+)['"]/i) ||
                                embedHtml.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
                if (m3u8Match) {
                    streamUrl = m3u8Match[1];
                }
            }
        }

        // 3. Fallback tìm trực tiếp trong pageHtml
        if (!streamUrl) {
            var directM3u8 = pageHtml.match(/var\s+M3U8_URL\s*=\s*['"]([^'"]+)['"]/i) ||
                            pageHtml.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/i);
            if (directM3u8) {
                streamUrl = directM3u8[1] || directM3u8[0];
            }
        }

        // Fallback cuối cùng: dùng embedUrl hoặc url ban đầu
        if (!streamUrl) {
            streamUrl = embedUrl || url;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "headers": {
                "Referer": "https://main.vipah06.xyz/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": url || "",
            "headers": {}
        });
    }
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `[{\"link\":\"/phim-moi-cap-nhap/tat-ca-1.html\",\"name\":\"Phim Mới\"},{\"link\":\"/the-loai/anime-1.html\",\"name\":\"Anime\"},{\"link\":\"/the-loai/hanh-dong-2.html\",\"name\":\"Hành động\"},{\"link\":\"/the-loai/hai-huoc-3.html\",\"name\":\"Hài hước\"},{\"link\":\"/the-loai/tinh-cam-4.html\",\"name\":\"Tình cảm\"},{\"link\":\"/the-loai/harem-5.html\",\"name\":\"Harem\"},{\"link\":\"/the-loai/bi-an-6.html\",\"name\":\"Bí ẩn\"},{\"link\":\"/the-loai/bi-kich-7.html\",\"name\":\"Bi kịch\"},{\"link\":\"/the-loai/gia-tuong-8.html\",\"name\":\"Giả tưởng\"},{\"link\":\"/the-loai/hoc-duong-9.html\",\"name\":\"Học đường\"},{\"link\":\"/the-loai/doi-thuong-10.html\",\"name\":\"Đời thường\"},{\"link\":\"/the-loai/vo-thuat-11.html\",\"name\":\"Võ thuật\"},{\"link\":\"/the-loai/tro-choi-12.html\",\"name\":\"Trò chơi\"},{\"link\":\"/the-loai/tham-tu-13.html\",\"name\":\"Thám tử\"},{\"link\":\"/the-loai/lich-su-14.html\",\"name\":\"Lịch sử\"},{\"link\":\"/the-loai/sieu-nang-luc-15.html\",\"name\":\"Siêu năng lực\"},{\"link\":\"/the-loai/shounen-16.html\",\"name\":\"Shounen\"},{\"link\":\"/the-loai/the-thao-20.html\",\"name\":\"Thể thao\"},{\"link\":\"/the-loai/am-nhac-21.html\",\"name\":\"Âm nhạc\"},{\"link\":\"/the-loai/mecha-23.html\",\"name\":\"Mecha\"},{\"link\":\"/the-loai/drama-25.html\",\"name\":\"Drama\"},{\"link\":\"/the-loai/seinen-26.html\",\"name\":\"Seinen\"},{\"link\":\"/the-loai/sieu-nhien-27.html\",\"name\":\"Siêu nhiên\"},{\"link\":\"/the-loai/phieu-luu-28.html\",\"name\":\"Phiêu lưu\"},{\"link\":\"/the-loai/kinh-di-29.html\",\"name\":\"Kinh dị\"}]`;
}

function buildMenu(menuStr, type) { 
    var menuArray = [];
    try {
        menuArray = JSON.parse(menuStr);
    } catch(e) {
        return [];
    }
    var menulist = []; 
    if (!menuArray || !Array.isArray(menuArray)) return menulist; 
    var typeStr = type !== undefined ? String(type).trim() : undefined; 
    for (var i = 0; i < menuArray.length; i++) { 
        var item = menuArray[i]; 
        if (!item) continue; 
        var link = item.link ? String(item.link).trim() : ""; 
        var name = item.name ? String(item.name).trim() : ""; 
        if (!link || !name) continue; 
        var menuItem = {}; 
        if (typeStr === "false") { 
            menuItem = { "slug": link, "title": name, "type": "Horizontal" }; 
        } else if (typeStr === "true") { 
            menuItem = { "slug": link, "title": name, "type": "Grid" }; 
        } else if (typeStr === "filter") {
            menuItem = { "value": link, "name": name }; 
        } else { 
            menuItem = { "slug": link, "name": name }; 
        } 
        menulist.push(menuItem); 
    } 
    return menulist; 
}
