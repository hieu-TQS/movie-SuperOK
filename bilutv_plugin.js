// https://phimnganhdc.com
var BASEURL = "https://phimnganhdc.com";

function getManifest() {
    return JSON.stringify({
        "id": "bilutv",
        "name": "Nguồn Bilutv (Phim HDC)",
        "description": "Trang xem phim siêu hay, cập nhật liên tục.",
        "version": "1.6",
        "BASEURL": "https://phimnganhdc.com",
        "iconUrl": "https://phimnganhdc.com/storage/files/logo-phimnganhdc.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[PhimHDCS] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[PhimHDCS] " + msg);
    }
}

function getHomeSections() {
    var listurl = `
/the-loai/phim-18@@Phim 18+@@false
/danh-sach/phim-bo@@Phim Bộ@@false
/danh-sach/phim-le@@Phim Lẻ@@false
/danh-sach/phim-moi@@Phim Mới@@true
`;
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
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

        if (path && path.indexOf("http") > -1) {
            if (page > 1 && path.indexOf("page=") === -1) {
                var sep = path.indexOf("?") > -1 ? "&" : "?";
                path += sep + "page=" + page;
            }
            return path;
        }

        var resultUrl = BASEURL;
        if (path) {
            if (!path.startsWith("/") && !resultUrl.endsWith("/")) {
                resultUrl += "/" + path;
            } else {
                resultUrl += path;
            }
        }

        if (page > 1 && resultUrl.indexOf("page=") === -1) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log("Lỗi getUrlList: " + e.message);
        var fallback = BASEURL + (slug ? (slug.indexOf("http") > -1 ? slug : "/" + slug) : "");
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
        var resultUrl = BASEURL + "/?search=" + encodedKeyword;

        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log("Lỗi getUrlSearch: " + e.message);
        var fallback = BASEURL + "/?search=" + encodeURIComponent(keyword || "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + (slug.startsWith('/') ? '' : '/') + slug;
}

function getUrlCategories() {
    return BASEURL;
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================
function parseListResponse(html, $url) {
    try {
        var items = [];
        var seen = {};

        var aRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        var match;
        while ((match = aRegex.exec(html)) !== null) {
            var fullA = match[0];
            var href = match[1];
            var inner = match[2];

            var titleMatch = fullA.match(/title=["']([^"']+)["']/i);
            var title = titleMatch ? titleMatch[1] : "";

            if (!href || href === "#" || href.indexOf("javascript") > -1) continue;
            if (href.indexOf("/the-loai/") > -1 || href.indexOf("/danh-sach/") > -1 || href.indexOf("/quoc-gia/") > -1) continue;

            var srcMatch = inner.match(/(?:src|data-src|data-original)=["']([^"']+)["']/i);
            var src = srcMatch ? srcMatch[1] : "";

            if (!src) continue;

            if (src && src.indexOf("http") === -1) {
                src = BASEURL + (src.startsWith("/") ? "" : "/") + src;
            }
            var fullHref = href;
            if (fullHref && fullHref.indexOf("http") === -1) {
                fullHref = BASEURL + (fullHref.startsWith("/") ? "" : "/") + fullHref;
            }

            if (fullHref === BASEURL || fullHref === BASEURL + "/") continue;
            if (src.indexOf("logo") > -1 || src.indexOf("banner") > -1) continue;

            if (!seen[fullHref] && title) {
                seen[fullHref] = true;
                var cleanThumb = src.replace(/&amp;/g, '&');
                items.push({
                    "id": fullHref,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb
                });
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });

    } catch (e) {
        return JSON.stringify({
            "items": [{
                "id": $url || BASEURL,
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function formatEpisode(numStr) {
    var num = parseInt(numStr, 10);
    if (isNaN(num)) return "01";
    return num < 10 ? "0" + num : "" + num;
}

function parseMovieDetail(html, url) {
    var lurl = url || BASEURL;
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "????";
    var cast = "????";
    var status = "????";
    var duration = "1:09:00";
    var category = "";
    var country = "";
    var lang = "";
    var servers = [];

    try {
        var imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (imgMatch) limg = imgMatch[1];
        if (limg && limg.indexOf("http") === -1) limg = BASEURL + (limg.startsWith("/") ? "" : "/") + limg;

        var titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
        if (titleMatch) lname = titleMatch[1];

        var descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
        if (descMatch) ldes = descMatch[1];

        var yearMatch = html.match(/Năm\s*phát\s*hành[:\s]*(\d{4})/i);
        if (yearMatch) year = Number(yearMatch[1]);

        var episodes = [];
        var epRegex = /<a[^>]+href=["']([^"']*\/tap-[^"']+)["'][^>]*>(?:<[^>]+>)*\s*([^<]+)\s*(?:<\/[^>]+>)*<\/a>/gi;
        var m;
        var epSeen = {};
        while ((m = epRegex.exec(html)) !== null) {
            var epUrl = m[1];
            var epName = m[2].trim();
            if (!epName || epName.toLowerCase().indexOf("tập") === -1) continue;

            if (epUrl.indexOf("http") === -1) epUrl = BASEURL + (epUrl.startsWith("/") ? "" : "/") + epUrl;

            if (!epSeen[epUrl]) {
                epSeen[epUrl] = true;
                episodes.push({
                    id: epUrl + "?tapplay=1&type=m3u8",
                    name: epName,
                    slug: epUrl.split('/').pop()
                });
            }
        }

        if (episodes.length > 0) {
            episodes.sort(function(a, b) {
                var matchA = a.name.match(/\d+/);
                var matchB = b.name.match(/\d+/);
                var numA = matchA ? parseInt(matchA[0], 10) : 0;
                var numB = matchB ? parseInt(matchB[0], 10) : 0;
                return numA - numB;
            });

            servers.push({
                name: "Server M3U8",
                episodes: episodes
            }, {
                name: "Server EMBED",
                episodes: episodes.map(function(e) {
                    return { id: e.id.replace("type=m3u8", "type=embed"), name: e.name, slug: e.slug };
                })
            });
        } else {
            servers.push({
                name: "Server M3U8",
                episodes: [{ id: lurl + "?tapplay=full&type=m3u8", name: "Xem Ngay", slug: "full" }]
            }, {
                name: "Server EMBED",
                episodes: [{ id: lurl + "?tapplay=full&type=embed", name: "Xem Ngay", slug: "full" }]
            });
        }

        return JSON.stringify({
            id: url,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: year,
            status: status,
            duration: duration,
            casts: cast,
            director: direc,
            country: country,
            category: category,
            lang: lang
        });

    } catch (e) {
        return JSON.stringify({
            id: lurl,
            title: "Lỗi tải thông tin phim: " + e,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: year,
            status: status,
            duration: duration,
            casts: cast,
            director: direc
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var activePage = url || BASEURL;
        return JSON.stringify({
            "url": activePage,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": url || BASEURL,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL
            }
        });
    }
}

function parseEmbedResponse(html, url) {
    try {
        var streamUrl = "";
        var m3u8LinkMatch = html.match(/<a[^>]+data-type=["']m3u8["'][^>]+data-link=["']([^"']+)["']/i) || html.match(/<a[^>]+data-link=["']([^"']+)["'][^>]+data-type=["']m3u8["']/i);
        if (m3u8LinkMatch) streamUrl = m3u8LinkMatch[1];

        if (!streamUrl) {
            var embedLinkMatch = html.match(/<a[^>]+data-type=["']embed["'][^>]+data-link=["']([^"']+)["']/i) || html.match(/<a[^>]+data-link=["']([^"']+)["'][^>]+data-type=["']embed["']/i);
            if (embedLinkMatch) streamUrl = embedLinkMatch[1];
        }

        if (!streamUrl) {
            var dataLinkMatch = html.match(/class=["'][^"']*streaming-server[^"']*["'][^>]+data-link=["']([^"']+)["']/i) || html.match(/data-link=["']([^"']+)["'][^>]+class=["'][^"']*streaming-server[^"']*["']/i);
            if (dataLinkMatch) streamUrl = dataLinkMatch[1];
        }

        if (!streamUrl) {
            var m3u8Direct = html.match(/(https?:\/\/[^"'\s]+\.m3u8[^\s"']*)/i);
            if (m3u8Direct) streamUrl = m3u8Direct[1];
        }

        if (streamUrl && streamUrl.startsWith("//")) {
            streamUrl = "https:" + streamUrl;
        }

        if (!streamUrl) streamUrl = url;

        var isM3u8 = streamUrl.toLowerCase().indexOf(".m3u8") > -1;

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": !isM3u8,
            "mimeType": isM3u8 ? "application/x-mpegURL" : undefined,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": BASEURL
            }
        });
    }
}

function sortEpisodesByName(data) {
    if (!data || !Array.isArray(data)) return data;
    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var matchA = a.name ? a.name.match(/Tập\s*(\d+)/i) : null;
                var matchB = b.name ? b.name.match(/Tập\s*(\d+)/i) : null;
                var numA = matchA ? parseInt(matchA[1], 10) : 0;
                var numB = matchB ? parseInt(matchB[1], 10) : 0;
                return numA - numB;
            });
        }
    });
    return data;
}

function getLISTmenu() {
    return `
/the-loai/short-drama@@Short Drama
/the-loai/co-trang@@Cổ Trang
/the-loai/hai-huoc@@Hài Hước
/the-loai/hinh-su@@Hình Sự
/the-loai/chinh-kich@@Chính kịch
/the-loai/vo-thuat@@Võ Thuật
/the-loai/kinh-di@@Kinh Dị
/the-loai/bi-an@@Bí ẩn
/the-loai/tinh-cam@@Tình Cảm
/the-loai/tam-ly@@Tâm Lý
/the-loai/phieu-luu@@Phiêu Lưu
/the-loai/gia-dinh@@Gia Đình
/the-loai/hoat-hinh@@Hoạt Hình
/the-loai/vien-tuong@@Viễn Tưởng
/the-loai/khoa-hoc@@Khoa Học
/the-loai/the-thao@@Thể Thao
/the-loai/tai-lieu@@Tài Liệu
/the-loai/hanh-dong@@Hành Động
/the-loai/tv-shows@@TV Shows
/the-loai/chien-tranh@@Chiến Tranh
/the-loai/am-nhac@@Âm Nhạc
/the-loai/hoc-duong@@Học Đường
/the-loai/phim-bo@@Phim bộ
/the-loai/gia-tuong@@Giả Tưởng
/the-loai/lang-man@@Lãng Mạn
/the-loai/phim-hai@@Phim Hài
/the-loai/phim-le@@Phim lẻ
/the-loai/khoa-hoc-vien-tuong@@Khoa Học Viễn Tưởng
/the-loai/gay-can@@Gây Cấn
/the-loai/phim-nhac@@Phim Nhạc
/the-loai/tre-em@@Trẻ Em
/the-loai/phim-dang-chieu@@Phim đang chiếu
/the-loai/than-thoai@@Thần Thoại
/the-loai/lich-su@@Lịch Sử
/the-loai/mien-tay@@Miền Tây
/the-loai/phim-18@@Phim 18+
/the-loai/subteam@@Subteam
/the-loai/kinh-dien@@Kinh Điển
/the-loai/phim-ngan@@Phim Ngắn
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
