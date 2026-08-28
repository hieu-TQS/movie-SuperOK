var BASEURL = "https://heovl.im";

function getManifest() {
    return JSON.stringify({
        "id": "heovl",
        "name": "Heovl",
        "description": "Kho phim HeoVL phong phú, xem trực tuyến mượt mà.",
        "info": "Kho phim HeoVL phong phú, xem trực tuyến mượt mà.",
        "version": "1.0.0",
        "BASEURL": "https://heovl.im",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/heovl.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}

function cleanText(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function getCategoryData() {
    return [
        { slug: "categories/viet-nam", name: "Việt Nam" },
        { slug: "categories/vietsub", name: "Vietsub" },
        { slug: "categories/khong-che", name: "Không Che" },
        { slug: "categories/nhat-ban", name: "Nhật Bản" },
        { slug: "categories/phim-cap-3", name: "Phim Cấp 3" },
        { slug: "categories/loan-luan", name: "Loạn Luân" },
        { slug: "categories/vu-to", name: "Vú To" },
        { slug: "categories/tap-the", name: "Tập Thể" },
        { slug: "categories/gai-xinh", name: "Gái Xinh" },
        { slug: "categories/hoc-sinh", name: "Học Sinh" },
        { slug: "categories/choi-lo-dit-anal-sex", name: "Lỗ Nhị (Anal)" },
        { slug: "categories/hiep-dam", name: "Hiếp Dâm" },
        { slug: "categories/massage", name: "Massage" },
        { slug: "categories/vung-trom", name: "Vụng Trộm" },
        { slug: "categories/nga-russia", name: "Nga (Russia)" },
        { slug: "categories/chau-au", name: "Châu Âu" },
        { slug: "categories/trung-quoc", name: "Trung Quốc" },
        { slug: "categories/han-quoc", name: "Hàn Quốc" }
    ];
}

function buildMenu(listurl) {
    var menulist = [];
    var regex = /^([^@\r\n]+)@@([^@\r\n]+)(?:@@([^@\r\n]+))?/gm;
    var match;

    while ((match = regex.exec(listurl)) !== null) {
        var link = match[1].trim();
        var name = match[2].trim();
        var check = match[3] ? match[3].trim() : undefined;

        var item = {};
        if (check === "false") {
            item = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (check === "true") {
            item = { "slug": link, "title": name, "type": "Grid" };
        } else {
            item = { "slug": link, "name": name, "value": link };
        }
        menulist.push(item);
    }
    return menulist;
}

function getHomeSections() {
    var listurl = `
    categories/viet-nam@@Việt Nam@@true
    categories/vietsub@@Vietsub@@false
    categories/khong-che@@Không Che@@false
    categories/nhat-ban@@Nhật Bản@@false
    categories/phim-cap-3@@Phim Cấp 3@@false
    categories/loan-luan@@Loạn Luân@@false
    categories/vu-to@@Vú To@@false
    categories/tap-the@@Tập Thể@@false
    categories/gai-xinh@@Gái Xinh@@false
    categories/choi-lo-dit-anal-sex@@Lỗ Nhị@@false
    categories/nga-russia@@Nga (Russia)@@false
    `;
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getPrimaryCategories() {
    var cats = getCategoryData();
    var list = [];
    for (var i = 0; i < cats.length; i++) {
        list.push({
            slug: cats[i].slug,
            name: cats[i].name,
            value: cats[i].slug
        });
    }
    return JSON.stringify(list);
}

function getFilterConfig() {
    var cats = getCategoryData();
    var catFilters = [];
    for (var i = 0; i < cats.length; i++) {
        catFilters.push({
            name: cats[i].name,
            value: cats[i].slug
        });
    }

    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "latest" },
            { name: "Xem nhiều nhất", value: "most-viewed" },
            { name: "Đánh giá cao", value: "top-rated" }
        ],
        category: catFilters
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
            var filters = null;
            if (typeof filtersJson === "string") {
                try {
                    var fixedJson = filtersJson
                        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                        .replace(/:,/g, ':');
                    filters = JSON.parse(fixedJson);
                } catch (pe) {
                    try {
                        filters = JSON.parse(filtersJson);
                    } catch (pe2) {}
                }
            } else if (typeof filtersJson === "object") {
                filters = filtersJson;
            }

            if (filters) {
                if (filters.page) {
                    page = parseInt(filters.page, 10) || 1;
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === "object") {
                        path = filters.category.slug || filters.category.value || "";
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                }
            }
        }

        if (!path) {
            path = "categories/viet-nam";
        }

        if (path.indexOf("http") === 0) {
            if (page > 1) {
                return path + (path.indexOf("?") > -1 ? "&page=" : "?page=") + page;
            }
            return path;
        }

        path = path.replace(/^\/+/, "").replace(/\/+$/, "");

        var finalUrl = BASEURL + "/" + path;
        if (page > 1) {
            finalUrl += (finalUrl.indexOf("?") > -1 ? "&page=" : "?page=") + page;
        }
        return finalUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "categories/viet-nam").replace(/^\/+/, "");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try { filters = JSON.parse(filtersJson); } catch (e) {}
            } else if (typeof filtersJson === "object") {
                filters = filtersJson;
            }
            if (filters && filters.page) {
                page = parseInt(filters.page, 10) || 1;
            }
        }
        var encoded = encodeURIComponent((keyword || "").trim());
        var url = BASEURL + "/search/" + encoded;
        if (page > 1) {
            url += "?page=" + page;
        }
        return url;
    } catch (e) {
        return BASEURL + "/search/" + encodeURIComponent(keyword || "");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return BASEURL + "/" + slug.replace(/^\/+/, "");
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        if (!html) {
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
        }

        var items = [];
        var chunks = html.split(/class=["'][^"']*videos__box-wrapper[^"']*["']/i);
        
        if (chunks.length <= 1) {
            chunks = html.split(/class=["'][^"']*(?:video-box|item-video|video-item)[^"']*["']/i);
        }

        for (var i = 1; i < chunks.length; i++) {
            var blockHtml = chunks[i];

            if (!blockHtml.match(/href|src|title/i)) {
                continue;
            }

            // 1. Link video
            var urlMatch = blockHtml.match(/<a[\s\S]*?href=["']([^"']+)["']/i);
            if (!urlMatch || !urlMatch[1]) {
                continue;
            }

            var url = urlMatch[1].trim();
            if (url.indexOf("http") !== 0) {
                url = BASEURL + (url.charAt(0) === "/" ? url : "/" + url);
            }

            // 2. Title video
            var title = "";
            var titleMatch = blockHtml.match(/title=["']([^"']+)["']/i) ||
                             blockHtml.match(/<h\d+[\s\S]*?>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
                             blockHtml.match(/class=["'][^"']*title[^"']*["'][^>]*>([\s\S]*?)<\//i);
            if (titleMatch && titleMatch[1]) {
                title = cleanText(titleMatch[1].replace(/<[^>]+>/g, ""));
            }

            // 3. Poster
            var posterMatch = blockHtml.match(/data-src=["']([^"']+)["']/i) ||
                              blockHtml.match(/data-original=["']([^"']+)["']/i) ||
                              blockHtml.match(/data-thumb=["']([^"']+)["']/i) ||
                              blockHtml.match(/src=["']([^"']+)["']/i);
            var poster = posterMatch ? posterMatch[1].trim() : "";
            if (poster && poster.indexOf("http") !== 0) {
                poster = BASEURL + (poster.charAt(0) === "/" ? poster : "/" + poster);
            }

            // 4. Duration
            var duration = "";
            var durMatch = blockHtml.match(/class=["'][^"']*(?:duration|time|badge)[^"']*["'][^>]*>([\s\S]*?)<\//i);
            if (durMatch && durMatch[1]) {
                duration = cleanText(durMatch[1].replace(/<[^>]+>/g, ""));
            }

            if (url && (title || poster)) {
                items.push({
                    id: url,
                    title: title || "Video " + i,
                    posterUrl: poster,
                    duration: duration,
                    type: "VIDEO"
                });
            }
        }

        // Pagination
        var hasNext = false;
        var totalPages = 1;
        var curPage = 1;

        var pageMatch = html.match(/page[=\/](\d+)/gi);
        if (pageMatch && pageMatch.length > 0) {
            for (var p = 0; p < pageMatch.length; p++) {
                var numMatch = pageMatch[p].match(/\d+/);
                if (numMatch) {
                    var n = parseInt(numMatch[0], 10);
                    if (n > totalPages && n < 1000) {
                        totalPages = n;
                    }
                }
            }
        }

        if (items.length >= 12 || html.indexOf('rel="next"') > -1 || html.indexOf('class="next"') > -1 || totalPages > 1) {
            hasNext = true;
            if (totalPages < 2) totalPages = 999;
        }

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: curPage,
                totalPages: totalPages,
                hasNext: hasNext
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1, hasNext: false } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, ourl) {
    var lurl = ourl || "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "";
    var year = 2026;
    var duration = "";
    var servers = [];

    try {
        if (!html) {
            return JSON.stringify({
                id: ourl,
                title: lname,
                posterUrl: limg,
                backdropUrl: limg,
                description: ldes,
                servers: []
            });
        }

        // 1. Meta Tags
        var rmatch = html.match(/meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                     html.match(/meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (rmatch && rmatch[1]) {
            limg = rmatch[1].trim();
            if (limg.indexOf("http") !== 0) limg = BASEURL + (limg.charAt(0) === "/" ? limg : "/" + limg);
        }

        rmatch = html.match(/meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                 html.match(/meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i) ||
                 html.match(/<title>([\s\S]*?)<\/title>/i);
        if (rmatch && rmatch[1]) {
            lname = cleanText(rmatch[1].replace(/- Heovl.*$/i, "").replace(/\|.*$/i, ""));
        }

        rmatch = html.match(/meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                 html.match(/meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        if (rmatch && rmatch[1]) {
            ldes = cleanText(rmatch[1]);
        }

        var durMatch = html.match(/class=["'][^"']*(?:duration|time)[^"']*["'][^>]*>([\s\S]*?)<\//i) ||
                       html.match(/itemprop=["']duration["'][^>]*content=["']([^"']+)["']/i);
        if (durMatch && durMatch[1]) {
            duration = cleanText(durMatch[1].replace(/<[^>]+>/g, ""));
        }

        var episodes = [];
        var addedUrls = {};

        // 2. Tìm tất cả server buttons có data-source
        var btnRegex = /<button[^>]*class=["'][^"']*set-player-source[^"']*["'][\s\S]*?<\/button>/gi;
        var btnMatches = html.match(btnRegex) || [];

        for (var b = 0; b < btnMatches.length; b++) {
            var bHtml = btnMatches[b];
            var srcMatch = bHtml.match(/data-source=["']([^"']+)["']/i);
            if (srcMatch && srcMatch[1]) {
                var sUrl = srcMatch[1].replace(/&amp;/g, "&").trim();
                
                if (sUrl.indexOf("autoplay=") === -1) {
                    sUrl += (sUrl.indexOf("?") > -1 ? "&autoplay=1" : "?autoplay=1");
                }

                if (!addedUrls[sUrl]) {
                    addedUrls[sUrl] = true;
                    
                    var nameMatch = bHtml.match(/data-cdn-name=["']([^"']+)["']/i) ||
                                    bHtml.match(/>([\s\S]*?)<\/button>/i);
                    var sName = nameMatch && nameMatch[1] ? cleanText(nameMatch[1]) : "Server " + (episodes.length + 1);
                    if (!sName) sName = "Server " + (episodes.length + 1);

                    episodes.push({
                        id: sUrl,
                        name: sName,
                        slug: "server-" + (episodes.length + 1)
                    });
                }
            }
        }

        // 3. Fallback regex data-source
        if (episodes.length === 0) {
            var sRegex = /data-source=["']([^"']+)["']/gi;
            var sMatches = html.match(sRegex) || [];
            for (var j = 0; j < sMatches.length; j++) {
                var sVal = sMatches[j].match(/data-source=["']([^"']+)["']/i);
                if (sVal && sVal[1]) {
                    var sUrl2 = sVal[1].replace(/&amp;/g, "&").trim();
                    if (sUrl2.indexOf("autoplay=") === -1) {
                        sUrl2 += (sUrl2.indexOf("?") > -1 ? "&autoplay=1" : "?autoplay=1");
                    }
                    if (!addedUrls[sUrl2]) {
                        addedUrls[sUrl2] = true;
                        episodes.push({
                            id: sUrl2,
                            name: "Server " + (episodes.length + 1),
                            slug: "server-" + (episodes.length + 1)
                        });
                    }
                }
            }
        }

        // 4. Fallback iframe player
        if (episodes.length === 0) {
            var iframeRegex = /class=["'][^"']*video-player[^"']*["'][\s\S]*?<iframe[\s\S]*?src=["']([^"']+)["']/i;
            var iframeMatch = html.match(iframeRegex) || html.match(/<iframe[\s\S]*?src=["']([^"']+)["']/i);
            if (iframeMatch && iframeMatch[1]) {
                var ifSrc = iframeMatch[1].replace(/&amp;/g, "&").trim();
                if (ifSrc.indexOf("//") === 0) ifSrc = "https:" + ifSrc;
                if (ifSrc.indexOf("autoplay=") === -1) {
                    ifSrc += (ifSrc.indexOf("?") > -1 ? "&autoplay=1" : "?autoplay=1");
                }
                episodes.push({
                    id: ifSrc,
                    name: "Server VIP",
                    slug: "server-vip"
                });
            }
        }

        // 5. Fallback URL chính
        if (episodes.length === 0 && ourl) {
            episodes.push({
                id: ourl,
                name: "Server 1",
                slug: "server-1"
            });
        }

        servers = [{
            name: "Heovl HD",
            episodes: episodes
        }];

    } catch (e) {}

    var result = {
        id: ourl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes || lname,
        servers: servers,
        quality: "HD",
        year: year,
        duration: duration || "HD",
        status: "Full HD"
    };

    return JSON.stringify(result);
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = (url || "").replace(/&amp;/g, "&").trim();

        if (html) {
            var directMatch = html.match(/<source[\s\S]*?src=["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i) ||
                              html.match(/file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i) ||
                              html.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^\s"'\\]*)/i);
            if (directMatch && directMatch[1]) {
                var dUrl = directMatch[1].replace(/\\/g, "").trim();
                return JSON.stringify({
                    url: dUrl,
                    isEmbed: false,
                    mimeType: dUrl.indexOf(".m3u8") > -1 ? "application/x-mpegURL" : "video/mp4",
                    headers: { "Referer": BASEURL + "/" }
                });
            }

            if (!streamUrl || streamUrl.indexOf("/play") === -1) {
                var sMatch = html.match(/data-source=["']([^"']+)["']/i);
                if (sMatch && sMatch[1]) {
                    streamUrl = sMatch[1].replace(/&amp;/g, "&").trim();
                }
            }
        }

        if (streamUrl && streamUrl.indexOf("autoplay=") === -1) {
            streamUrl += (streamUrl.indexOf("?") > -1 ? "&autoplay=1" : "?autoplay=1");
        }

        var customjs = textJS(html, streamUrl);

        return JSON.stringify({
            url: streamUrl,
            isEmbed: true,
            headers: {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Custom-Js": customjs.trim()
            }
        });

    } catch (e) {
        return JSON.stringify({ url: url || "", isEmbed: true, headers: {} });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    try {
        var cleanUrl = (sourceUrl || "").replace(/&amp;/g, "&").trim();

        if (html) {
            if (html.indexOf('"sources"') !== -1) {
                try {
                    var jsonObj = JSON.parse(html);
                    if (jsonObj && jsonObj.sources && jsonObj.sources.length > 0) {
                        var streamFile = jsonObj.sources[0].file;
                        if (streamFile) {
                            return JSON.stringify({
                                url: streamFile,
                                isEmbed: false,
                                mimeType: "application/x-mpegURL",
                                headers: {
                                    "Referer": BASEURL + "/",
                                    "Origin": BASEURL,
                                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                                }
                            });
                        }
                    }
                } catch(pe) {}
            }

            var m3u8Match = html.match(/(https?:\/\/[^"'\s\\]+\.m3u8[^\s"'\\]*)/i);
            if (m3u8Match && m3u8Match[1]) {
                var m3u8Url = m3u8Match[1].replace(/\\/g, "").trim();
                return JSON.stringify({
                    url: m3u8Url,
                    isEmbed: false,
                    mimeType: "application/x-mpegURL",
                    headers: {
                        "Referer": BASEURL + "/",
                        "Origin": BASEURL
                    }
                });
            }

            var mp4Match = html.match(/(https?:\/\/[^"'\s\\]+\.mp4[^\s"'\\]*)/i);
            if (mp4Match && mp4Match[1]) {
                var mp4Url = mp4Match[1].replace(/\\/g, "").trim();
                return JSON.stringify({
                    url: mp4Url,
                    isEmbed: false,
                    mimeType: "video/mp4",
                    headers: {
                        "Referer": BASEURL + "/",
                        "Origin": BASEURL
                    }
                });
            }
        }

        if (cleanUrl && cleanUrl.indexOf("autoplay=") === -1) {
            cleanUrl += (cleanUrl.indexOf("?") > -1 ? "&autoplay=1" : "?autoplay=1");
        }

        var customjs = textJS(html, cleanUrl);

        return JSON.stringify({
            url: cleanUrl,
            isEmbed: true,
            headers: {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Custom-Js": customjs.trim()
            }
        });
    } catch (e) {
        return JSON.stringify({ url: sourceUrl, isEmbed: true });
    }
}

function textJS(html, $url) {
    return `
function showToast(message, duration) {
    duration = duration || 2500;
    var container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: '9999999',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none'
        });
        document.body.appendChild(container);
    }
    
    var toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        background: 'rgba(20, 20, 20, 0.9)',
        color: '#fff',
        padding: '10px 22px',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        transform: 'translateY(-20px)',
        opacity: '0'
    });
    
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
            if (container.childElementCount === 0 && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 300);
    }, duration);
}

function initPlayerEnhancer() {
    // 1. CSS tối ưu TV & tinh chỉnh thanh điều khiển Timeline duy nhất của Player
    var style = document.createElement('style');
    style.innerHTML = [
        'html, body { background: #000 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 100vw !important; height: 100vh !important; }',
        '#container, #player-wrapper, #player, .video-container, .jwplayer, .video-js { width: 100vw !important; height: 100vh !important; position: fixed !important; top: 0 !important; left: 0 !important; background: #000 !important; z-index: 10 !important; }',
        '.jw-media, video { width: 100% !important; height: 100% !important; object-fit: contain !important; }',
        '#comments, header, footer, nav, .navbar, .footer, .sidebar, .entry-actions, .entry-header, .entry-info, .entry-content, #related-posts, .chat-button, .chat-iframe, .overlay-ad, .ad, .ads, [class*="banner"], [id*="banner"], [class*="popup"], [id*="popup"] { display: none !important; }',
        /* Chỉ giữ lại duy nhất 1 thanh Controlbar / Timeline của JWPlayer */
        '.jw-controls { z-index: 99999 !important; }',
        '.jw-controlbar { z-index: 99999 !important; background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important; min-height: 50px !important; }',
        '.jw-progress, .jw-slider-time, .jw-slider-horizontal { height: 8px !important; }',
        '.jw-rail { height: 8px !important; background: rgba(255,255,255,0.25) !important; }',
        '.jw-buffer { height: 8px !important; background: rgba(255,255,255,0.45) !important; }',
        '.jw-progress { height: 8px !important; background: #ff2a44 !important; }',
        '.jw-knob { width: 16px !important; height: 16px !important; background: #fff !important; border-radius: 50% !important; }'
    ].join(' ');
    document.head.appendChild(style);

    // 2. Tự động click play
    function triggerAutoPlay() {
        var playBtn = document.getElementById('play-btn') || document.querySelector('.play-button');
        if (playBtn && window.getComputedStyle(playBtn).display !== 'none') {
            playBtn.click();
        }
        var thumb = document.getElementById('thumbnail') || document.querySelector('.thumbnail');
        if (thumb && window.getComputedStyle(thumb).display !== 'none') {
            thumb.click();
        }
    }
    triggerAutoPlay();

    function wakeControls() {
        var container = document.querySelector('.jwplayer, #player, .video-container, body');
        if (container) {
            container.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            container.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        }
    }

    // 3. JWPlayer listener
    if (typeof jwplayer === 'function') {
        try {
            var player = jwplayer('player') || jwplayer('previewPlayer') || jwplayer();
            if (player) {
                if (typeof player.getMute === 'function' && player.getMute()) {
                    player.setMute(false);
                }
                if (typeof player.setVolume === 'function') player.setVolume(100);
                if (typeof player.play === 'function') player.play();

                player.on('ready', function() {
                    player.setMute(false);
                    player.setVolume(100);
                    player.play();
                });

                player.on('seek', function() {
                    wakeControls();
                });

                player.on('pause', function() {
                    wakeControls();
                });
            }
        } catch(e) {}
    }

    // 4. Đồng bộ hàm window.seek và window.togglePlay với remote Android TV
    var prevSeek = window.seek;
    window.seek = function(secs) {
        var handled = false;
        if (typeof jwplayer === 'function') {
            try {
                var p = jwplayer('player') || jwplayer('previewPlayer') || jwplayer();
                if (p && typeof p.getPosition === 'function') {
                    var pos = p.getPosition();
                    var dur = p.getDuration();
                    var target = Math.max(0, Math.min(dur || 0, pos + secs));
                    p.seek(target);
                    wakeControls();
                    showToast((secs > 0 ? "Tua tới +" : "Tua lùi ") + Math.abs(secs) + "s", 1500);
                    handled = true;
                }
            } catch(e) {}
        }

        if (!handled) {
            var v = document.querySelector('video');
            if (v) {
                v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
                wakeControls();
                showToast((secs > 0 ? "Tua tới +" : "Tua lùi ") + Math.abs(secs) + "s", 1500);
                handled = true;
            }
        }

        if (!handled && typeof prevSeek === 'function') {
            return prevSeek(secs);
        }
        return 'ok';
    };

    var prevToggle = window.togglePlay;
    window.togglePlay = function() {
        if (typeof jwplayer === 'function') {
            try {
                var p = jwplayer('player') || jwplayer('previewPlayer') || jwplayer();
                if (p && typeof p.getState === 'function') {
                    var st = p.getState();
                    if (st === 'playing') {
                        p.pause();
                        showToast("Tạm dừng", 1500);
                    } else {
                        p.play();
                        showToast("Tiếp tục phát", 1500);
                    }
                    wakeControls();
                    return 'ok';
                }
            } catch(e) {}
        }
        if (typeof prevToggle === 'function') return prevToggle();
        return 'ok';
    };

    // 5. Lặp kiểm tra skip ad, click play và unmute
    var skipped = false;
    var timer = setInterval(function() {
        triggerAutoPlay();

        // Bỏ qua quảng cáo
        var skipButtons = document.querySelectorAll('#skip-ad, .skip-ad, .skip-button, .ad-skip, .jw-ad-skip, [class*="skip"]');
        for (var i = 0; i < skipButtons.length; i++) {
            var btn = skipButtons[i];
            var btnStyle = window.getComputedStyle(btn);
            if (btnStyle.display !== 'none' && btnStyle.visibility !== 'hidden') {
                btn.click();
                if (!skipped) {
                    skipped = true;
                    showToast("Đã bỏ qua quảng cáo", 2500);
                }
            }
        }

        // Bật tiếng và play cho video HTML5
        var videos = document.querySelectorAll('video');
        for (var v = 0; v < videos.length; v++) {
            var vid = videos[v];
            if (vid.muted) vid.muted = false;
            if (vid.paused && vid.readyState >= 2) {
                vid.play().catch(function() {});
            }
        }
    }, 300);

    // Chặn popup window.open
    window.open = function() { return null; };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerEnhancer);
} else {
    initPlayerEnhancer();
}
`;
}

function parseCategoriesResponse(apiResponseJson) {
    return getPrimaryCategories();
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
