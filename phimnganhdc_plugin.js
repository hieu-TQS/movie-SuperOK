// =============================================================================
// VAAPP Plugin - Phim Ngắn HDC (phimnganhdc.com)
// Tối ưu hóa phát trực tiếp ExoPlayer & Giải mã luồng HLS 3 bước chuẩn Core
// =============================================================================

var BASEURL = "https://phimnganhdc.com";

function getManifest() {
    return JSON.stringify({
        "id": "phimnganhdc",
        "name": "Phim Ngắn HDC",
        "description": "Kho phim ngắn, drama ngắn HDC phụ đề tiếng Việt.",
        "info": "Kho phim ngắn, drama ngắn HDC phụ đề tiếng Việt.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://phimnganhdc.com/static/icons/apple-touch-icon-180x180.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/danh-sach/phim-hoan-thanh", "title": "Phim Đã Full", "type": "Horizontal" },
        { "slug": "/danh-sach/top-phim-ngay", "title": "Top Trong Ngày", "type": "Horizontal" },
        { "slug": "/the-loai/phim-ngan", "title": "Phim Mới", "type": "Grid" }
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
        if (slug && (slug.indexOf("http") > -1 || slug.indexOf("search") > -1)) {
            return slug;
        }

        var page = 1;
        var path = slug || "/the-loai/phim-ngan";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === "string" ?
                filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
            try {
                var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
                if (filters.page) page = parseInt(filters.page, 10) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        if (path.charAt(0) !== "/") path = "/" + path;
        var resultUrl = BASEURL + path;
        if (page > 1) {
            resultUrl += (resultUrl.indexOf("?") === -1 ? "?page=" : "&page=") + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        var fixedJson = typeof filtersJson === "string" ?
            filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
        try {
            var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
            if (filters.page) page = parseInt(filters.page, 10) || 1;
        } catch (jsonErr) {}
    }

    var encoded = encodeURIComponent(keyword || "");
    var url = BASEURL + "/?search=" + encoded;
    if (page > 1) url += "&page=" + page;
    return url;
}

function getSearchUrl(keyword, page) {
    var p = parseInt(page || 1, 10);
    var encoded = encodeURIComponent(keyword || "");
    var url = BASEURL + "/?search=" + encoded;
    if (p > 1) url += "&page=" + p;
    return url;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var s = slug.toString().trim();
    if (s.indexOf("http") === 0) return s;
    if (s.charAt(0) !== "/") s = "/" + s;
    return BASEURL + s;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, fetchedUrl) {
    try {
        var items = [];
        var itemRegex = /<div[^>]*class=["'][^"']*item[^"']*["'][\s\S]*?<a[^>]*href=["']([^"']+)["'][\s\S]*?<img[^>]*class=["'][^"']*img-film[^"']*["'][^>]*title=["']([^"']+)["'][^>]*src=["']([^"']+)["']/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var href = match[1];
            var title = match[2].trim();
            var src = match[3];

            if (href && href.indexOf("http") === -1) {
                href = BASEURL + (href.charAt(0) === '/' ? href : '/' + href);
            }
            if (src && src.indexOf("http") === -1) {
                src = BASEURL + (src.charAt(0) === '/' ? src : '/' + src);
            }

            items.push({
                "id": href,
                "title": title,
                "posterUrl": src.replace(/&amp;/g, '&'),
                "backdropUrl": src.replace(/&amp;/g, '&')
            });
        }

        if (items.length === 0) {
            var altRegex = /<a[^>]*href=["'](https?:\/\/phimnganhdc\.com\/[^"']+)["'][^>]*title=["']([^"']+)["'][\s\S]*?<img[^>]*src=["']([^"']+)["']/gi;
            var altMatch;
            var seen = {};
            while ((altMatch = altRegex.exec(html)) !== null) {
                var fUrl = altMatch[1];
                var fTitle = altMatch[2].trim();
                var fImg = altMatch[3];
                if (!seen[fUrl] && fTitle && fUrl.indexOf("/the-loai/") === -1 && fUrl.indexOf("/danh-sach/") === -1) {
                    seen[fUrl] = true;
                    if (fImg.indexOf("http") === -1) fImg = BASEURL + fImg;
                    items.push({
                        "id": fUrl,
                        "title": fTitle,
                        "posterUrl": fImg.replace(/&amp;/g, '&'),
                        "backdropUrl": fImg.replace(/&amp;/g, '&')
                    });
                }
            }
        }

        var currentPage = 1;
        var totalPages = 999;
        var pageMatch = html.match(/[?&]page=(\d+)/) || (fetchedUrl ? fetchedUrl.match(/[?&]page=(\d+)/) : null);
        if (pageMatch) {
            currentPage = parseInt(pageMatch[1], 10);
        }

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": totalPages, "hasNext": items.length >= 10 }
        });

    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}

function parseSearchResponse(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseSearchResult(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseList(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseMovieDetail(html, url) {
    var lurl = url || "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "";
    var cast = "";
    var status = "HD";
    var duration = "";
    var category = "";
    var country = "Trung Quốc";
    var lang = "Thuyết Minh";
    var servers = [];

    try {
        var rmatchImg = html.match(/class=["'][^"']*adspruce-streamlink[^"']*["'][\s\S]*?<img[^>]*src=["']([^"']+)["']/i) ||
                        html.match(/meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (rmatchImg && rmatchImg[1]) {
            limg = rmatchImg[1];
            if (limg.indexOf("http") === -1) limg = BASEURL + limg;
        }

        var rmatchTitle = html.match(/<h1[^>]*class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                          html.match(/meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
        if (rmatchTitle && rmatchTitle[1]) {
            lname = rmatchTitle[1].replace(/<[^>]+>/g, '').trim();
        }

        var rmatchDesc = html.match(/id=["']info-film["'][^>]*>([\s\S]*?)<\/div>/i) ||
                         html.match(/meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
        if (rmatchDesc && rmatchDesc[1]) {
            ldes = rmatchDesc[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        }

        var rmatchStatus = html.match(/<dt[^>]*>Tình trạng[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchStatus && rmatchStatus[1]) status = rmatchStatus[1].replace(/<[^>]+>/g, '').trim();

        var rmatchYear = html.match(/<dt[^>]*>Năm sản xuất[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchYear && rmatchYear[1]) year = parseInt(rmatchYear[1].replace(/\D/g, ''), 10) || 2026;

        var rmatchCast = html.match(/<dt[^>]*>Diễn viên[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchCast && rmatchCast[1]) cast = rmatchCast[1].replace(/<[^>]+>/g, '').trim();

        var rmatchDur = html.match(/<dt[^>]*>Thời lượng[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchDur && rmatchDur[1]) duration = rmatchDur[1].replace(/<[^>]+>/g, '').trim();

        var rmatchCat = html.match(/<dt[^>]*>Thể loại[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchCat && rmatchCat[1]) category = rmatchCat[1].replace(/<[^>]+>/g, '').trim();

        var rmatchCoun = html.match(/<dt[^>]*>Quốc gia[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchCoun && rmatchCoun[1]) country = rmatchCoun[1].replace(/<[^>]+>/g, '').trim();

        var rmatchLang = html.match(/<dt[^>]*>Ngôn ngữ[：:]?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (rmatchLang && rmatchLang[1]) lang = rmatchLang[1].replace(/<[^>]+>/g, '').trim();

        // Bóc tách danh sách tập phim theo server
        var controlBoxRegex = /<div[^>]*class=["'][^"']*control-box[^"']*["'][\s\S]*?<\/div>\s*<\/div>/gi;
        var cbMatch;

        while ((cbMatch = controlBoxRegex.exec(html)) !== null) {
            var block = cbMatch[0];
            var srvTitleMatch = block.match(/class=["'][^"']*server-episode-block[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
            var serverName = srvTitleMatch ? srvTitleMatch[1].replace(/<[^>]+>/g, '').trim() : "Server VIP";

            var epList = [];
            var epRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var epM;
            var tapCount = 0;

            while ((epM = epRegex.exec(block)) !== null) {
                var epHref = epM[1];
                var epName = epM[2].replace(/<[^>]+>/g, '').trim();
                tapCount++;

                if (epHref && epHref.indexOf("http") === -1) {
                    epHref = BASEURL + (epHref.charAt(0) === '/' ? epHref : '/' + epHref);
                }

                epList.push({
                    "id": epHref,
                    "name": epName || ("Tập " + tapCount),
                    "slug": "tap-" + tapCount
                });
            }

            if (epList.length > 0) {
                servers.push({
                    "name": serverName,
                    "episodes": epList
                });
            }
        }

        // Fallback: tìm trực tiếp thẻ link tập phim
        if (servers.length === 0) {
            var directEpList = [];
            var directEpRegex = /<a[^>]*href=["'](https?:\/\/phimnganhdc\.com\/[^"']*\/tap-[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var dMatch;
            var seenEp = {};
            var epNum = 0;

            while ((dMatch = directEpRegex.exec(html)) !== null) {
                var dHref = dMatch[1];
                var dName = dMatch[2].replace(/<[^>]+>/g, '').trim();
                if (!seenEp[dHref]) {
                    seenEp[dHref] = true;
                    epNum++;
                    directEpList.push({
                        "id": dHref,
                        "name": dName || ("Tập " + epNum),
                        "slug": "tap-" + epNum
                    });
                }
            }

            if (directEpList.length > 0) {
                servers.push({
                    "name": "Server VIP",
                    "episodes": directEpList
                });
            }
        }

        servers = sortEpisodesByName(servers);

        return JSON.stringify({
            "id": lurl,
            "title": lname,
            "posterUrl": limg,
            "backdropUrl": limg,
            "description": ldes,
            "servers": servers,
            "quality": status || "Full HD",
            "year": year,
            "status": status,
            "duration": duration,
            "casts": cast,
            "director": direc,
            "country": country,
            "category": category,
            "lang": lang
        });

    } catch (e) {
        return JSON.stringify({
            "id": lurl,
            "title": lname,
            "posterUrl": limg,
            "backdropUrl": limg,
            "description": ldes,
            "servers": servers,
            "quality": "HD",
            "year": year,
            "status": status,
            "duration": duration,
            "casts": cast,
            "director": direc
        });
    }
}

function parseDetail(html, url) {
    return parseMovieDetail(html, url);
}

// =============================================================================
// STREAM RESOLUTION FOR EXOPLAYER (3-Step Pipeline Chuẩn SuperOK Core)
// =============================================================================

// Bước 0: Nhận HTML trang chi tiết + URL tập phim (fetchedUrl = /tap-1-...)
// Trả về { url: fetchedUrl, isEmbed: true } để App tải trang xem ở Background Thread
function parseDetailResponse(html, fetchedUrl) {
    try {
        var targetUrl = fetchedUrl || "";

        // Nếu html đã là trang xem chứa data-link (trường hợp trực tiếp)
        if (html && html.indexOf("data-link=") !== -1) {
            return parseEmbedPlayer(html, targetUrl);
        }

        // Trả config để App fetch trang xem bằng PluginApiClient trên luồng nền
        return JSON.stringify({
            "url": targetUrl,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        return JSON.stringify({ "url": fetchedUrl || "", "isEmbed": false, "headers": {} });
    }
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parsePlayerUrl(html) {
    return parseDetailResponse(html, "");
}

// Bước 1 & 2:
// - Khi nhận Watch Page HTML: trích xuất hash ID và trả POST config tới /player/index.php
// - Khi nhận JSON từ /player/index.php: trích xuất link HLS master.m3u8 trực tiếp cho ExoPlayer
function parseEmbedPlayer(response, requestUrl) {
    try {
        if (!response) {
            return JSON.stringify({ "url": requestUrl || "", "isEmbed": false, "headers": {} });
        }

        // --- GIAI ĐOẠN 2: Nhận JSON từ /player/index.php?do=getVideo ---
        if (response.indexOf("{") !== -1 && (response.indexOf('"hls"') !== -1 || response.indexOf('"securedLink"') !== -1 || response.indexOf('"videoSource"') !== -1)) {
            var jsonStr = response.substring(response.indexOf("{"));
            var dataObj = JSON.parse(jsonStr);
            var directM3u8 = dataObj.securedLink || dataObj.videoSource || "";

            if (directM3u8) {
                var hostMatch = requestUrl ? requestUrl.match(/https?:\/\/[^/]+/) : null;
                var host = hostMatch ? hostMatch[0] : "https://play.streamxemphimhd.site";

                return JSON.stringify({
                    "url": directM3u8,
                    "isEmbed": false,
                    "headers": {
                        "Referer": host + "/",
                        "Origin": host,
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
            }
        }

        // --- GIAI ĐOẠN 1: Nhận HTML trang xem (Watch Page) ---
        var embedUrl = "";
        var hashId = "";
        var host = "https://play.streamxemphimhd.site";

        var serverMatch = response.match(/data-link=["'](https?:\/\/[^"']*(?:streamxemphimhd|phimhdc)[^"']*\/video\/([a-zA-Z0-9]+))["']/i) ||
                          response.match(/data-link=["'](https?:\/\/[^"']+\/video\/([a-zA-Z0-9]+))["']/i) ||
                          response.match(/data-link=["'](https?:\/\/[^"']+)["']/i);

        if (serverMatch) {
            embedUrl = serverMatch[1];
            if (serverMatch[2]) hashId = serverMatch[2];
        }

        if (embedUrl && !hashId) {
            var mHash = embedUrl.match(/\/video\/([a-zA-Z0-9]+)/);
            if (mHash) hashId = mHash[1];
        }

        if (embedUrl) {
            var dMatch = embedUrl.match(/https?:\/\/[^/]+/);
            if (dMatch) host = dMatch[0];
        }

        // Trả POST config để App gửi yêu cầu lấy token link .m3u8 ở vòng lặp kế tiếp
        if (hashId) {
            return JSON.stringify({
                "url": host + "/player/index.php?data=" + hashId + "&do=getVideo",
                "isEmbed": true,
                "postBody": "hash=" + hashId + "&r=" + encodeURIComponent(BASEURL + "/"),
                "headers": {
                    "Referer": host + "/video/" + hashId,
                    "Origin": host,
                    "X-Requested-With": "XMLHttpRequest",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        // Fallback: Tìm trực tiếp .m3u8 trong HTML (bỏ qua 1s_blank.mp4)
        var m3u8Match = response.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*)/i);
        if (m3u8Match && m3u8Match[1] && m3u8Match[1].indexOf("1s_blank") === -1) {
            return JSON.stringify({
                "url": m3u8Match[1],
                "isEmbed": false,
                "headers": {
                    "Referer": "https://play.streamxemphimhd.site/",
                    "Origin": "https://play.streamxemphimhd.site"
                }
            });
        }

        return JSON.stringify({
            "url": requestUrl || "",
            "isEmbed": false,
            "headers": {
                "Referer": BASEURL + "/"
            }
        });

    } catch (e) {
        return JSON.stringify({ "url": requestUrl || "", "isEmbed": false, "headers": {} });
    }
}

function parseEmbedResponse(response, requestUrl) {
    return parseEmbedPlayer(response, requestUrl);
}

// =============================================================================
// UTILITIES
// =============================================================================

function sortEpisodesByName(data) {
    if (!data || !Array.isArray(data)) return [];
    for (var i = 0; i < data.length; i++) {
        var server = data[i];
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var numA = parseInt((a.name || "").replace(/\D/g, ''), 10) || 0;
                var numB = parseInt((b.name || "").replace(/\D/g, ''), 10) || 0;
                return numA - numB;
            });
        }
    }
    return data;
}

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return [
        "/the-loai/phim-bo@@Phim Bộ",
        "/quoc-gia/han-quoc@@Hàn quốc",
        "/quoc-gia/trung-quoc@@Trung Quốc",
        "/quoc-gia/thai-lan@@Thái Lan",
        "/the-loai/huyen-huyen@@Huyền Huyễn",
        "/the-loai/tien-hiep@@Tiên Hiệp",
        "/the-loai/xuyen-khong@@Xuyên Không",
        "/the-loai/chuyen-the@@Chuyển Thể",
        "/the-loai/boy-love@@Boylove",
        "/the-loai/pha-an@@Phá Án",
        "/the-loai/dan-quoc@@Dân Quốc",
        "/the-loai/y-khoa@@Y Khoa",
        "/the-loai/ngon-tinh@@Ngôn Tình",
        "/the-loai/nguoc-luyen@@Ngược Luyến",
        "/the-loai/nghe-nghiep@@Nghề Nghiệp",
        "/the-loai/do-thi@@Đô Thị",
        "/the-loai/hien-dai@@Hiện Đại",
        "/the-loai/toi-pham@@Tội Phạm",
        "/the-loai/lang-man@@Lãng Mạn",
        "/the-loai/phim-hai@@Phim Hài",
        "/the-loai/khoa-hoc-vien-tuong@@Khoa Học Viễn Tưởng",
        "/the-loai/gia-tuong@@Giả Tưởng",
        "/the-loai/gay-can@@Gây Cấn",
        "/the-loai/lich-su@@Lịch Sử",
        "/the-loai/xuyen-sach@@Xuyên Sách",
        "/the-loai/he-thong@@Hệ Thống",
        "/the-loai/bao-thu@@Báo Thù",
        "/the-loai/ky-ao@@Kỳ Ảo",
        "/the-loai/ngot-sung@@Ngọt Sủng",
        "/the-loai/va-mat-tra-nam@@Vả Mặt Tra Nam",
        "/the-loai/trong-sinh@@Trọng Sinh",
        "/the-loai/co-con@@Có con",
        "/the-loai/cuoi-truoc-yeu-sau@@Cưới Trước Yêu Sau",
        "/the-loai/truy-the@@Truy Thê",
        "/the-loai/hanh-dong@@Hành động",
        "/the-loai/hai-huoc@@Hài hước",
        "/the-loai/hoc-duong@@Học đường",
        "/the-loai/co-trang@@Cổ trang",
        "/the-loai/kinh-di@@Kinh dị",
        "/the-loai/tinh-cam@@Tình cảm",
        "/the-loai/vo-thuat@@Võ thuật",
        "/the-loai/phieu-luu@@Phiêu lưu",
        "/the-loai/vien-tuong@@Viễn tưởng",
        "/the-loai/chinh-kich@@Chính kịch",
        "/the-loai/the-thao@@Thể thao",
        "/the-loai/am-nhac@@Âm nhạc",
        "/the-loai/khoa-hoc@@Khoa học",
        "/the-loai/tam-ly@@Tâm lý",
        "/the-loai/hinh-su@@Hình sự",
        "/the-loai/bi-an@@Bí ẩn",
        "/the-loai/gia-dinh@@Gia đình",
        "/the-loai/hoat-hinh@@Hoạt hình",
        "/the-loai/tv-shows@@TV Shows"
    ].join("\n");
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
