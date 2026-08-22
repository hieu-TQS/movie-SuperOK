// =============================================================================
// VAAPP Plugin - Xhamster (Bản vá chuẩn hóa theo cấu trúc Core mới nhất)
// =============================================================================
var BASEURL = "https://xhwide.com";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[STPhim] " + msg);
    }
}

function getManifest() {
    return JSON.stringify({
        "id": "xhamster",          
        "name": "Xhamster",
        "description": "XXX Hay",
        "version": "1.3",             
        "baseUrl": "https://xhwide.com",
        "iconUrl": "https://static.cdnsolutions.media/xh-desktop/images/favicon/favicon-v2-256x256.ico", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "categories/vietnamese", "title": "Việt Nam", "type": "Horizontal" },
        { "slug": "categories/bus", "title": "Xe Bus", "type": "Horizontal" },
        { "slug": "categories/uncensored", "title": "Không Che", "type": "Horizontal" },
        { "slug": "best/weekly", "title": "Hay Trong Tuần", "type": "Horizontal" },
        { "slug": "newest", "title": "Hàng Mới", "type": "Grid" },
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "categories/anal", "name": "Lỗ Nhị"},
        { "slug": "categories/big-tits", "name": "Vú Bự"},
        { "slug": "categories/gangbang", "name": "Tập Thể"},
        { "slug": "categories/threesome", "name": "Chơi 3"},
        { "slug": "categories/russian", "name": "Gái Nga"},
        { "slug": "categories/hentai", "name": "Hentai"}
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "newest" }
        ],
        "category": menulist
    });
}

function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "newest" }
        ],
        "category": menulist
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
            try {
                var fixedJson = typeof filtersJson === 'string'
                    ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    : JSON.stringify(filtersJson);
                var filters = (typeof filtersJson === 'object') ? filtersJson : JSON.parse(fixedJson);
                if (filters.page) page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (e) {}
        }
        if (!path) path = "newest";

        var fullUrl = (path.indexOf('http') === 0) ? path : (BASEURL + "/" + path.replace(/^\/+/, ''));
        if (page > 1) {
            if (fullUrl.indexOf('?') > -1) {
                return fullUrl + "&page=" + page;
            } else {
                return fullUrl + "/" + page;
            }
        }
        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "newest");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        if (typeof filtersJson === 'number') {
            page = filtersJson;
        } else if (typeof filtersJson === 'string') {
            try {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                var parsed = JSON.parse(fixedJson);
                if (parsed.page) page = parseInt(parsed.page) || 1;
            } catch(e) {}
        } else if (typeof filtersJson === 'object' && filtersJson.page) {
            page = parseInt(filtersJson.page) || 1;
        }
    }
    var cleanKeyword = encodeURIComponent(keyword || "");
    if (page > 1) {
        return BASEURL + "/search/" + cleanKeyword + "?page=" + page;
    }
    return BASEURL + "/search/" + cleanKeyword;
}

function getSearchUrl(keyword, filtersJson) {
    return getUrlSearch(keyword, filtersJson);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug.replace(/^\/+/, '');
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function decodeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'");
}

function parseListResponse(html) {
    try {
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });

        var script = html.match(/<script[^>]+id=['"]initials-script["'][^>]*>([\s\S]*?)<\/script>/i);

        if (script && script[1]) {
            var scriptText = script[1].trim();
            var jsonMatch = scriptText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                try {
                    var jsonObj = JSON.parse(jsonMatch[0]);
                    
                    var listVideos = null;
                    var paginationProps = null;
                    var keys = Object.keys(jsonObj);
                    
                    for (var i = 0; i < keys.length; i++) {
                        var component = jsonObj[keys[i]];
                        if (component && typeof component === 'object') {
                            if (!listVideos) {
                                if (component.videoThumbProps && Array.isArray(component.videoThumbProps)) {
                                    listVideos = component.videoThumbProps;
                                } else if (component.trendingVideoListProps && Array.isArray(component.trendingVideoListProps.videoThumbProps)) {
                                    listVideos = component.trendingVideoListProps.videoThumbProps;
                                } else if (component.videoListProps && Array.isArray(component.videoListProps.videoThumbProps)) {
                                    listVideos = component.videoListProps.videoThumbProps;
                                }
                            }
                            if (!paginationProps && component.paginationProps) {
                                paginationProps = component.paginationProps;
                            }
                        }
                    }

                    // Fallback theo cấu trúc trực tiếp
                    if (!listVideos && jsonObj.searchResult && Array.isArray(jsonObj.searchResult.videoThumbProps)) {
                        listVideos = jsonObj.searchResult.videoThumbProps;
                    }
                    if (!listVideos && jsonObj.pagesCategoryComponent && jsonObj.pagesCategoryComponent.trendingVideoListProps) {
                        listVideos = jsonObj.pagesCategoryComponent.trendingVideoListProps.videoThumbProps;
                    }
                    if (!listVideos && jsonObj.layoutPage && jsonObj.layoutPage.videoListProps) {
                        listVideos = jsonObj.layoutPage.videoListProps.videoThumbProps;
                    }

                    if (listVideos && Array.isArray(listVideos) && listVideos.length > 0) {
                        var items = [];
                        for (var j = 0; j < listVideos.length; j++) {
                            var itemVideo = listVideos[j];
                            if (!itemVideo) continue;

                            var rawUrl = itemVideo.pageURL || "";
                            var cleanSlug = rawUrl.replace(/^https?:\/\/[^\/]+\//i, "");

                            var thumb = itemVideo.imageURL || itemVideo.thumbURL || itemVideo.previewThumbURL || "";

                            items.push({
                                "id": cleanSlug, 
                                "title": decodeHtml(itemVideo.title || "No Title"),
                                "posterUrl": thumb,
                                "backdropUrl": thumb
                            });
                        }

                        // Thiết lập giá trị phân trang an toàn
                        var currentPage = 1;
                        var totalPages = 1;
                        if (paginationProps) {
                            currentPage = parseInt(paginationProps.currentPageNumber) || 1;
                            totalPages = parseInt(paginationProps.lastPageNumber) || 1;
                        } else if (jsonObj.pagination) {
                            currentPage = parseInt(jsonObj.pagination.active) || 1;
                            totalPages = parseInt(jsonObj.pagination.maxPages || jsonObj.pagination.maxPage) || 1;
                        } else if (jsonObj.entity && jsonObj.entity.paging) {
                            currentPage = parseInt(jsonObj.entity.paging.active) || 1;
                            totalPages = parseInt(jsonObj.entity.paging.maxPages || jsonObj.entity.paging.maxPage) || 1;
                        }

                        return JSON.stringify({
                            "items": items,
                            "pagination": {
                                "currentPage": currentPage,
                                "totalPages": totalPages,
                                "totalItems": items.length,
                                "itemsPerPage": items.length
                            }
                        });
                    }

                } catch (e) {
                    log("Lỗi xử lý dữ liệu JSON: " + e);
                }
            }
        }

        // Fallback parse HTML nếu JSON không có
        var fallbackItems = [];
        var linkRegex = /<a[^>]+class=['"][^'"]*thumb-image-container[^'"]*['"][^>]+href=['"]([^"' \t\r\n]+)['"][^>]*aria-label=['"]([^"'\r\n]+)['"][^>]*>/gi;
        var match;
        while ((match = linkRegex.exec(html)) !== null) {
            var rawLink = match[1];
            var titleStr = match[2];
            var slug = rawLink.replace(/^https?:\/\/[^\/]+\//i, "");
            fallbackItems.push({
                "id": slug,
                "title": decodeHtml(titleStr),
                "posterUrl": "",
                "backdropUrl": ""
            });
        }

        if (fallbackItems.length > 0) {
            return JSON.stringify({
                "items": fallbackItems,
                "pagination": { "currentPage": 1, "totalPages": 1, "totalItems": fallbackItems.length, "itemsPerPage": fallbackItems.length }
            });
        }

    } catch (e) {
        log("Lỗi hệ thống parseListResponse: " + e);
    }
    
    return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
}

//var html = $("html")[0].outerHTML;
//JSON.parse(parseListResponse(html))



function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var streamUrl = "";

    var rmatch = html.match(/link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1].replace("https://xhamster.com", BASEURL); }

    rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lname = decodeHtml(rmatch[1]); }

    rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { ldes = decodeHtml(rmatch[1]); }
    
    rmatch = html.match(/rel="preload"\s+href="([^"]*?m3u8[^"]*)"/i) || html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
    if (rmatch) { streamUrl = rmatch[1] || rmatch[0]; }
        
    return JSON.stringify({
        id: streamUrl || lurl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: [
            {
                name: "Xhamster Stream",
                episodes: [
                    { id: streamUrl || lurl, name: "Xem Ngay", slug: "full" }
                ]
            }
        ],
        quality: "HD",
        year: 2026,
        rating: 8.5,
        status: "Full",
        duration: "N/A",
        casts: "N/A",
        director: "N/A",
        category: "18+"
    });
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        var rmatch = html.match(/rel="preload"\s+href="([^"]*?m3u8[^"]*)"/i) || html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
        if (rmatch) { streamUrl = rmatch[1] || rmatch[0]; }
        
        var customJs = textJS(html, url);

        return JSON.stringify({
            url: streamUrl || url,
            headers: {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJs.trim()
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
    }
}

function textJS(html, $url) {
    // ĐÃ SỬA: Chuẩn hóa lại cú pháp escape ký tự \$ trong Template Literals
    return `
function initCustomVideoFix() {
    const style = document.createElement('style');
    var customcss = 'body { background: black; overflow: hidden; }';
    style.innerHTML = customcss;
    document.head.appendChild(style);
    const video = document.querySelector('video');
    if (video) {
        video.addEventListener('click', () => { autoFullscreenLoop(video); });
        autoFullscreenLoop(video);
    } else {
        
    }
    
    customAlert(JSON.stringify(\$url), JSON.stringify(html));
} 

function customAlert(title, message) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: '99999', opacity: '0', transition: 'opacity 0.2s ease'
    });
    
    const box = document.createElement('div');
    Object.assign(box.style, {
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)', maxWidth: '380px', width: '85%',
        boxSizing: 'border-box', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        transform: 'scale(0.8)', transition: 'transform 0.2s ease'
    });
    
    const titleEl = document.createElement('input');
    titleEl.type = 'text'; 
    titleEl.value = title;
    Object.assign(titleEl.style, {
        display: 'block', width: '100%', boxSizing: 'border-box',
        margin: '0 0 12px 0', padding: '6px 10px', color: '#222222',
        fontSize: '15px', fontWeight: '600', border: '1px solid #ddd', borderRadius: '6px'
    });
    
    const msgEl = document.createElement('textarea');
    msgEl.value = message;
    Object.assign(msgEl.style, {
        display: 'block', width: '100%', boxSizing: 'border-box',
        margin: '0 0 20px 0', padding: '8px 10px', color: '#555555',
        fontSize: '14px', height: '200px', lineHeight: '1.5',
        border: '1px solid #ddd', borderRadius: '6px', resize: 'none'
    });
    
    const btn = document.createElement('button');
    btn.innerText = 'OK';
    Object.assign(btn.style, {
        display: 'block', margin: '0 auto', padding: '10px 28px',
        fontSize: '15px', fontWeight: '600', color: '#ffffff',
        backgroundColor: '#007bff', border: 'none', borderRadius: '6px',
        cursor: 'pointer', outline: 'none', transition: 'background-color 0.1s'
    });
    
    btn.onmouseover = () => btn.style.backgroundColor = '#0056b3';
    btn.onmouseout = () => btn.style.backgroundColor = '#007bff';
    
    const closeAlert = () => {
        overlay.style.opacity = '0';
        box.style.transform = 'scale(0.8)';
        setTimeout(() => { overlay.remove(); }, 200);
    };
    
    btn.onclick = closeAlert;
    overlay.onclick = (e) => { if (e.target === overlay) closeAlert(); };
    
    box.appendChild(titleEl);
    box.appendChild(msgEl);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    
    setTimeout(() => { overlay.style.opacity = '1'; box.style.transform = 'scale(1)'; }, 10);
}

function autoFullscreenLoop(videoElement) {
    if (!videoElement) return;
    const checkInterval = setInterval(() => {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (isFullscreen) { clearInterval(checkInterval); return; }
        videoElement.muted = false;
        if (videoElement.paused) { videoElement.play().catch(err => {}); }
        if (videoElement.requestFullscreen) { videoElement.requestFullscreen().catch(err => {}); }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
    initCustomVideoFix();
}
`;
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
categories/vietnamese@@Vietnamese
4k?formatFrozen=1@@4K Porn
hd?formatFrozen=1@@HD Videos
r?formatFrozen=1@@VR Porn
categories/18-year-old@@18 Year Old
categories/amateur@@Amateur
categories/american@@American
categories/anal@@Anal
categories/asian@@Asian
categories/babe@@Babe
categories/bdsm@@BDSM
categories/beauty@@Beauty
categories/big-ass@@Big Ass
categories/big-cock@@Big Cock
categories/big-natural-tits@@Big Natural Tits
categories/big-tits@@Big Tits
categories/blowjob@@Blowjob
categories/brutal-sex@@Brutal Sex
categories/cartoon@@Cartoon
categories/celebrity@@Celebrity
categories/cheating@@Cheating
categories/chinese@@Chinese
categories/close-up@@Close-up
categories/colombian@@Colombian
categories/cosplay@@Cosplay
categories/cougar@@Cougar
categories/couple@@Couple
categories/cowgirl@@Cowgirl
categories/creampie@@Creampie
categories/cumshot@@Cumshot
categories/cute@@Cute
categories/deep-throat@@Deep Throat
categories/doggy-style@@Doggy Style
categories/double-penetration@@Double Penetration
categories/eating-pussy@@Eating Pussy
categories/european@@European
categories/female-masturbation@@Female Masturbation
categories/fingering@@Fingering
categories/fucking-machine@@Fucking Machine
categories/gangbang@@Gangbang
gay@@Gay Porn
categories/granny@@Granny
categories/group-sex@@Group Sex
categories/hairy@@Hairy
categories/handjob@@Handjob
categories/hardcore@@Hardcore
categories/hentai@@Hentai
categories/homemade@@Homemade
categories/indian@@Indian
categories/indonesian@@Indonesian
categories/japanese@@Japanese
categories/korean@@Korean
categories/lesbian@@Lesbian
categories/massage@@Massage
categories/mature@@Mature
categories/milf@@MILF
categories/moaning@@Moaning
categories/nude@@Nude
categories/orgasm@@Orgasm
categories/perfect-body@@Perfect Body
categories/petite@@Petite
tags/porn@@Porn
categories/porn-for-women@@Porn for Women
categories/pornstar@@Pornstar
categories/pregnant@@Pregnant
categories/public-sex@@Public Sex
categories/pussy@@Pussy
categories/riding@@Riding
categories/rough-sex@@Rough Sex
categories/russian@@Russian
categories/squirting@@Squirting
categories/stranger@@Stranger
categories/taboo@@Taboo
categories/teen@@Teen
categories/thai@@Thai
shemale@@Transgender Porn
categories@@All categories
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
