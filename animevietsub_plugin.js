// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
var BASEURL = "https://animevietsub.gg";

function getManifest() {
    return JSON.stringify({
        "id": "animevietsub",
        "name": "AnimeVietSub",
        "version": "1.0.0",
        "description": "Kho phim Anime Vietsub tổng hợp phong phú và cập nhật mới nhất.",
        "info": "Kho phim Anime Vietsub tổng hợp phong phú và cập nhật mới nhất.",
        "baseUrl": "https://animevietsub.gg",
        "iconUrl": "https://animevietsub.gg/logo.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "exoplayer"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[animevietsub] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[animevietsub] " + msg);
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
        { slug: '/', title: 'Anime Mới Cập Nhật', type: 'Grid' },
        { slug: '/danh-sach/phim-bo', title: 'Anime Bộ', type: 'Horizontal' },
        { slug: '/danh-sach/phim-le', title: 'Anime Lẻ / Movie', type: 'Horizontal' },
        { slug: '/the-loai/hoat-hinh', title: 'Phim Hoạt Hình', type: 'Horizontal' }
    ]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
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
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var resultUrl = BASEURL;
        if (path && path !== "/") {
            resultUrl += (path.indexOf("/") === 0 ? "" : "/") + path;
        }
        if (page > 1) {
            resultUrl += "/" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        var fallback = BASEURL + (slug ? (slug.indexOf("/") === 0 ? slug : "/" + slug) : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/tim-kiem?q=" + encodedKeyword;
        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        return resultUrl;
    } catch (e) {
        return BASEURL + "/tim-kiem?q=" + encodeURIComponent(keyword || "");
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

        var linkRegex = /<a\s+[^>]*href="([^"]*\/phim\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(html)) !== null) {
            var href = m[1];
            if (href.indexOf('/tap-') !== -1) continue;
            if (seen[href]) continue;
            seen[href] = true;

            var fullTag = m[0];
            var inner = m[2];

            var title = "";
            var titleMatch = fullTag.match(/title="([^"]+)"/i) || inner.match(/alt="([^"]+)"/i);
            if (titleMatch) title = titleMatch[1].trim();
            if (!title) continue;

            var src = "";
            var srcMatch = inner.match(/src="([^"]+)"/i);
            if (srcMatch) src = srcMatch[1].trim().replace(/&amp;/g, '&');
            if (src && src.indexOf('http') !== 0) {
                src = BASEURL + (src.indexOf('/') === 0 ? src : '/' + src);
            }

            if (href.indexOf('http') !== 0) {
                href = BASEURL + (href.indexOf('/') === 0 ? href : '/' + href);
            }

            var quality = "";
            var qMatch = inner.match(/class="[^"]*top-0\s+right-1[^"]*"[^>]*>([^<]+)</i) || inner.match(/class="[^"]*bg-yellow-500[^"]*"[^>]*>([^<]+)</i);
            if (qMatch) quality = qMatch[1].trim();

            var lang = "";
            var lMatch = inner.match(/class="[^"]*top-0\s+left-1[^"]*"[^>]*>([^<]+)</i);
            if (lMatch) lang = lMatch[1].trim();

            var current = "";
            var cMatch = inner.match(/class="[^"]*bottom-1[^"]*"[^>]*>([^<]+)</i);
            if (cMatch) current = cMatch[1].trim();

            items.push({
                id: href,
                title: title,
                posterUrl: src,
                backdropUrl: src,
                quality: quality || "FHD",
                lang: lang || "Vietsub",
                episode_current: current
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
        log(e);
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

function parseEpisodesFromHtml(html) {
    var servers = [];
    var serverMap = {};

    var unescaped = (html || "").replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    var epRegex = /"server"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*,\s*"slug"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"\s*,\s*"link"\s*:\s*"([^"]+)"/gi;
    var m;
    while ((m = epRegex.exec(unescaped)) !== null) {
        var sName = m[1].trim();
        // Chuẩn hóa tên server tránh phân mảnh encoding
        sName = sName.replace(/#H.*?N.*?i/i, '#Hà Nội').replace(/L.*?ng\s*Ti.*?ng/i, 'Lồng Tiếng');
        var epName = m[2].trim();
        var epSlug = m[3].trim();
        var epType = m[4].trim();
        var epLink = m[5].trim().replace(/\\\//g, '/');

        if (!epLink || (epLink.indexOf('http://') !== 0 && epLink.indexOf('https://') !== 0)) continue;

        if (!serverMap[sName]) serverMap[sName] = {};

        var numMatch = (epName || "").match(/Tập\s*(\d+)/i) || (epName || "").match(/(\d+)/);
        var num = numMatch ? parseInt(numMatch[1], 10) : 0;

        if (!serverMap[sName][epSlug] || epType === 'm3u8') {
            serverMap[sName][epSlug] = {
                id: epLink,
                name: epName,
                slug: epSlug,
                type: epType,
                num: num
            };
        }
    }

    for (var sName in serverMap) {
        var epObj = serverMap[sName];
        var eps = Object.keys(epObj).map(function(k) { return epObj[k]; });
        eps.sort(function(a, b) { return a.num - b.num; });
        if (eps.length > 0) {
            servers.push({
                name: sName,
                episodes: eps.map(function(it) {
                    return {
                        id: it.id,
                        name: it.name,
                        slug: it.slug
                    };
                })
            });
        }
    }

    return servers;
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
        var rating = 9.0;
        var lactor = "";
        var ldirec = "";
        var lduran = "";
        var status = "";

        var rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1].replace(/ - AnimeVietSub.*$/i, '').replace(/^Phim /i, '');

        rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];

        // 1. Quét danh sách tập trong HTML hiện tại
        var servers = parseEpisodesFromHtml(html);

        // 2. Nếu trang hiện tại là trang chi tiết (chưa có tập), tìm link xem tập 1 và tải trang xem phim
        if (servers.length === 0) {
            var tapMatch = html.match(/href="([^"]*\/tap-[^"]*)"/i);
            var watchPageUrl = "";
            if (tapMatch) {
                var tapPath = tapMatch[1];
                watchPageUrl = tapPath.startsWith('http') ? tapPath : (BASEURL + (tapPath.startsWith('/') ? '' : '/') + tapPath);
            } else if (id && id.indexOf('/phim/') !== -1) {
                watchPageUrl = id.replace(/\/$/, '') + '/tap-01';
            }

            if (watchPageUrl) {
                var watchHtml = httpGet(watchPageUrl);
                if (watchHtml) {
                    servers = parseEpisodesFromHtml(watchHtml);
                }
            }
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
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || ""
        });

    } catch (e) {
        log(e);
        return JSON.stringify({
            id: url || "error",
            title: "error",
            servers: []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";
        var isEmbed = false;

        // 1. Unwrap player.phimapi.com/player/?url=...
        if (streamUrl.indexOf("player.phimapi.com/player/?url=") !== -1) {
            var raw = streamUrl.split("player/?url=")[1];
            if (raw) {
                streamUrl = decodeURIComponent(raw);
            }
        }

        if (streamUrl.indexOf(".m3u8") === -1 && streamUrl.indexOf(".mp4") === -1) {
            isEmbed = true;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "headers": {} });
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
    return `
/danh-sach/phim-le@@Anime Lẻ
/danh-sach/phim-bo@@Anime Bộ
/the-loai/hoat-hinh@@Phim Hoạt Hình
/the-loai/hanh-dong@@Hành Động
/the-loai/tinh-cam@@Tình Cảm
/the-loai/hai-huoc@@Hài Hước
/the-loai/co-trang@@Cổ Trang
/the-loai/chien-tranh@@Chiến Tranh
/the-loai/the-thao@@Thể Thao
/the-loai/vo-thuat@@Võ Thuật
/the-loai/vien-tuong@@Viễn Tưởng
/the-loai/phieu-luu@@Phiêu Lưu
/the-loai/khoa-hoc@@Khoa Học
/the-loai/kinh-di@@Kinh Dị
/the-loai/than-thoai@@Thần Thoại
/the-loai/gia-dinh@@Gia Đình
/the-loai/bi-an@@Bí ẩn
/the-loai/hoc-duong@@Học Đường
/the-loai/harem@@Anime Harem
/the-loai/isekai@@Anime Isekai
/the-loai/shounen@@Anime Shounen
/the-loai/lang-man@@Anime Lãng Mạn
/nam-phat-hanh/2026@@Năm 2026
/nam-phat-hanh/2025@@Năm 2025
/nam-phat-hanh/2024@@Năm 2024
/nam-phat-hanh/2023@@Năm 2023
/nam-phat-hanh/2022@@Năm 2022
/nam-phat-hanh/2021@@Năm 2021
/nam-phat-hanh/2020@@Năm 2020
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
