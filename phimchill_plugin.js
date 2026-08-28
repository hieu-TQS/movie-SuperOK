BASEURL = "https://phimchillhdm.im";

function getManifest() {
    return JSON.stringify({
        "id": "phimchill",          
        "name": "Phim Chill",
        "description": "Phim online",
        "version": "1.0.0",             
        "baseUrl": "https://phimchillhdm.im",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/phimchill.ico", 
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([{
        "slug": "danh-sach/phim-moi.html",
        "title": "Phim Mới",
        "type": "Grid"
    }]);
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
// HELPERS
// =============================================================================

function httpGet(url) {
    try {
        if (typeof com !== 'undefined' && com.liskovsoft && com.liskovsoft.smartyoutubetv2) {
            return String(com.liskovsoft.smartyoutubetv2.common.plugin.api.PluginApiClient.INSTANCE.fetchContentString(url, null) || "");
        }
    } catch(e) {}
    return "";
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    if (slug && slug.indexOf("http") > -1) {
        return slug;
    }

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        var page = parseInt(filters.page) || 1;
        var path = slug || "";

        if (filters.category) {
            if (Array.isArray(filters.category) && filters.category.length > 0) {
                path = filters.category[0].slug || path;
            } else if (typeof filters.category === "string") {
                path = filters.category;
            }
        }

        var url = BASEURL + (path ? "/" + path : "");
        if (page > 1) {
            url += "?page=" + page;
        }

        return url.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var encodedKeyword = encodeURIComponent(keyword || "");
    var page = 1;

    try {
        var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson || "{}") : (filtersJson || {});
        page = parseInt(filters.page) || 1;
    } catch (e) {}

    var url = BASEURL + "/?search=" + encodedKeyword;
    if (page > 1) {
        url += "&page=" + page;
    }

    return url;
}

function getUrlDetail(id) {
    if (!id) return "";
    if (id.indexOf('http') === 0) return id;
    return BASEURL + (id.indexOf('/') === 0 ? id.substring(1) : id);
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

function parseListResponse(html) {
    try {
        var items = [];
        var pattern = /(?=<article[^>]*class="[^"]*max-w-xs[^"]*")/g;
        var splitItems = html.split(pattern).filter(Boolean);

        for (var j = 1; j < splitItems.length; j++) {
            var block = splitItems[j];
            var hrefMatch = block.match(/href="([^"]+)"/i);
            if (!hrefMatch) continue;
            var id = hrefMatch[1].trim();

            var title = "";
            var altMatch = block.match(/title="([^"]+)"/i);
            if (altMatch) {
                title = altMatch[1].trim();
            }
            if (!title || title === "Video không tiêu đề") {
                continue;
            }

            var srcMatch = block.match(/img[\s\S]*?src="([^"]+)"/i);
            var posterUrl = srcMatch ? srcMatch[1].trim() : "";
            if (posterUrl.indexOf('/') === 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + posterUrl;
            } else if (posterUrl.indexOf('http') !== 0 && posterUrl.indexOf('//') !== 0) {
                posterUrl = BASEURL + "/" + posterUrl;
            }
            items.push({
                "id": id,
                "title": title,
                "posterUrl": posterUrl,
                "backdropUrl": posterUrl
            });
        }

        var activeRegex = /active"[\s\S]*?<a[^>]*>\s*(\d+)\s*<\/a>/;
        var activeMatch = html.match(activeRegex);
        var activePage = activeMatch ? parseInt(activeMatch[1]) : 1;

        var lastPageRegex = /(\d+)\s*<\/a>\s*<\/li>\s*<li[^>]*next/;
        var lastPageMatch = html.match(lastPageRegex);
        var lastPage = lastPageMatch ? parseInt(lastPageMatch[1]) : 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": activePage,
                "totalPages": lastPage,
                "totalItems": 48 * lastPage,
                "itemsPerPage": 48
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
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

function parseWatchPageServers(html) {
    var servers = [];
    try {
        var serverRegex = /<span[^>]*>([^<]*Danh Sách[^<]*)<\/span>([\s\S]*?)(?=<span[^>]*>[^<]*Danh Sách|<\/main|<footer|$)/gi;
        var sMatch;
        while ((sMatch = serverRegex.exec(html)) !== null) {
            var sName = sMatch[1].replace(/<[^>]*>/g, '').trim();
            var blockHtml = sMatch[2];
            var eps = [];
            var epRegex = /<a\s+[^>]*href="([^"]*\/tap-[^"]*\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
            var epMatch;
            while ((epMatch = epRegex.exec(blockHtml)) !== null) {
                var epUrl = epMatch[1];
                if (epUrl.indexOf('http') !== 0) epUrl = BASEURL + (epUrl.indexOf('/') === 0 ? epUrl.substring(1) : epUrl);
                var rawName = epMatch[2].replace(/<[^>]*>/g, '').trim();
                var epName = rawName.indexOf('Tập') === -1 ? ("Tập " + rawName) : rawName;
                eps.push({
                    id: epUrl,
                    name: epName,
                    slug: "tap-" + rawName.replace(/[^\d]/g, '')
                });
            }
            if (eps.length > 0) {
                servers.push({
                    name: sName || ("Server " + (servers.length + 1)),
                    episodes: eps
                });
            }
        }

        if (servers.length === 0) {
            var epsFallback = [];
            var allEpRegex = /<a\s+[^>]*href="([^"]*\/tap-[^"]*\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
            var m;
            while ((m = allEpRegex.exec(html)) !== null) {
                var link = m[1];
                if (link.indexOf('http') !== 0) link = BASEURL + (link.indexOf('/') === 0 ? link.substring(1) : link);
                var name = m[2].replace(/<[^>]*>/g, '').trim();
                if (name && !epsFallback.some(function(x) { return x.id === link; })) {
                    var finalName = name.indexOf('Tập') === -1 ? ("Tập " + name) : name;
                    epsFallback.push({
                        id: link,
                        name: finalName,
                        slug: "tap-" + name.replace(/[^\d]/g, '')
                    });
                }
            }
            if (epsFallback.length > 0) {
                servers.push({ name: "VIP", episodes: epsFallback });
            }
        }
    } catch(e) {}
    return servers;
}

function parseMovieDetail(htmlContent, url) {
    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : (url || "");
        
        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var lquality = "HD";
        var lyear = 2026;
        
        var rmatch;
        rmatch = htmlContent.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldes = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="video:director"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) ldirec = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="video:actor"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lactor = rmatch[1];
        
        rmatch = htmlContent.match(/meta\s+property="video:duration"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lduran = rmatch[1];

        rmatch = htmlContent.match(/meta\s+property="video:release_date"\s+content="(\d{4})/i);
        if (rmatch && rmatch[1]) lyear = parseInt(rmatch[1]);

        // === FETCH WATCH PAGE ĐỂ LẤY DANH SÁCH TẬP VÀ SERVER ===
        var servers = [];
        var isPlayPage = htmlContent.indexOf("Danh Sách") !== -1 || /\/tap-[^/]+?\.html/i.test(url || id);
        
        if (isPlayPage) {
            servers = parseWatchPageServers(htmlContent);
        } else {
            var watchBtnMatch = htmlContent.match(/href="([^"]*\/tap-[^"]*\.html)"/i) ||
                                htmlContent.match(/href="([^"]+)"[^>]*>Xem Phim<\/a>/i);
            if (watchBtnMatch) {
                var watchPageUrl = watchBtnMatch[1];
                if (watchPageUrl.indexOf('http') !== 0) {
                    watchPageUrl = BASEURL + (watchPageUrl.indexOf('/') === 0 ? watchPageUrl.substring(1) : watchPageUrl);
                }
                var watchHtml = httpGet(watchPageUrl);
                if (watchHtml) {
                    servers = parseWatchPageServers(watchHtml);
                }
            }
        }

        // Sắp xếp thứ tự ưu tiên các server
        if (servers.length > 0) {
            servers.sort(function(a, b) {
                function getPriority(name) {
                    if (!name) return 3;
                    if (name.indexOf("KK") !== -1 || name.indexOf("OP") !== -1) return 1;
                    if (name.indexOf("Vietsub") !== -1) return 2;
                    if (name.indexOf("NC") !== -1) return 4;
                    return 3;
                }
                return getPriority(a.name) - getPriority(b.name);
            });
        }
        
        return JSON.stringify({
            id: id,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: lquality,
            year: lyear,
            rating: 8.5,
            servers: servers,
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || ""
        });
        
    } catch (e) {
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
        
        // Nếu html đầu vào là trang chi tiết (chưa có data-type/stream link), tải trang xem phim theo url
        if (pageHtml.indexOf('data-type') === -1 && url && url.indexOf('http') === 0) {
            var fetched = httpGet(url);
            if (fetched) pageHtml = fetched;
        }

        var streamUrl = "";
        var isEmbed = false;
        var refererHeader = BASEURL;
        
        // 1. Tìm m3u8 direct data-link
        var m3u8Match = pageHtml.match(/data-type="m3u8"[\s\S]*?data-link="([^"]+)"/i) ||
                        pageHtml.match(/data-link="([^"]+)"[\s\S]*?data-type="m3u8"/i);
        if (m3u8Match) {
            streamUrl = m3u8Match[1];
        }

        // 2. Nếu không có m3u8, tìm embed link
        if (!streamUrl) {
            var embedMatch = pageHtml.match(/data-type="embed"[\s\S]*?data-link="([^"]+)"/i) ||
                             pageHtml.match(/data-link="([^"]+)"[\s\S]*?data-type="embed"/i);
            if (embedMatch) {
                var embedLink = embedMatch[1];
                
                // Giải mã các loại embed server phổ biến (như streamvsmov)
                if (embedLink.indexOf('streamvsmov.com') !== -1) {
                    var vsmMatch = embedLink.match(/https?:\/\/([^/]+)\/video\/([a-f0-9-]+)/i);
                    if (vsmMatch) {
                        streamUrl = "https://" + vsmMatch[1] + "/stream/" + vsmMatch[2] + "/master.m3u8";
                        refererHeader = "https://" + vsmMatch[1] + "/";
                        isEmbed = false;
                    } else {
                        streamUrl = embedLink;
                        isEmbed = true;
                    }
                } else {
                    streamUrl = embedLink;
                    isEmbed = true;
                }
            }
        }

        // 3. Fallback quét url .m3u8 thực trong mã nguồn (bỏ qua 1s_blank.mp4)
        if (!streamUrl) {
            var allM3u8 = pageHtml.match(/https?:\/\/[^"'\s<>]+\.m3u8[^\s"']*/gi);
            if (allM3u8 && allM3u8.length > 0) {
                streamUrl = allM3u8[0];
            }
        }

        if (!streamUrl) {
            streamUrl = url;
            isEmbed = true;
        }

        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": isEmbed,
            "headers": {
                "Referer": refererHeader,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": url,
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

function parseCountriesResponse(html) {
    return "[]";
}

function parseYearsResponse(html) {
    return "[]";
}

function getLISTmenu() {
    return `
danh-sach/phim-le.html@@Phim Lẻ
danh-sach/phim-bo.html@@Phim Bộ
the-loai/short-drama.html@@Phim Ngắn
the-loai/tinh-cam.html@@Tình Cảm
the-loai/am-nhac.html@@Âm Nhạc
the-loai/tam-ly.html@@Tâm Lý
the-loai/kinh-di.html@@Kinh Dị
the-loai/tai-lieu.html@@Tài Liệu
the-loai/tv-shows.html@@TV Shows
the-loai/hanh-dong.html@@Hành Động
the-loai/vien-tuong.html@@Viễn Tưởng
the-loai/than-thoai.html@@Thần Thoại
the-loai/vo-thuat.html@@Võ Thuật
the-loai/chien-tranh.html@@Chiến Tranh
the-loai/chinh-kich.html@@Chính Kịch
the-loai/phieu-luu.html@@Phiêu Lưu
the-loai/hai-huoc.html@@Hài Hước
the-loai/co-trang.html@@Cổ Trang
the-loai/gia-dinh.html@@Gia Đình
the-loai/hoc-duong.html@@Học Đường
the-loai/hinh-su.html@@Hình Sự
the-loai/bi-an.html@@Bí Ẩn
the-loai/phim-18.html@@Phim 18+
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
