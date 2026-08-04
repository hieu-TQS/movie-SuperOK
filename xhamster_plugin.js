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
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page) || 1;
            // Chỉ lấy category từ JSON nếu không truyền slug vào hà
            if (filters.category) {
                if (Array.isArray(filters.category) && filters.category.length > 0) {
                    path = filters.category[0].slug;
                } else if (typeof filters.category === 'string') {
                    path = filters.category;
                }
                return BASEURL + "/" + path + "/" + page;
            }
            if (page > 1 && slug.indexOf("http") == -1) {
                return BASEURL + "/" + slug + "/" + page;
            }
            if (page > 1 && slug.indexOf("http") > -1) {
                return slug + "/" + page;
            }
        }
        return BASEURL + "/" + slug;
        
    } catch (e) {
        return BASEURL + "/" + slug;
    }
}
function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        // ĐÃ SỬA: Không khai báo lại 'var html = ...' trùng tên với tham số truyền vào hàm nữa
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });

        var script = html.match(/<script[^>]+id=['"]initials-script["']>([\s\S]*?)<\/script>/i);

        if (script && script[1]) {
            var scriptText = script[1].trim();
            
            // 1. Dùng RegExp bóc tách lấy từ dấu { đầu tiên cho đến dấu } cuối cùng
            var jsonMatch = scriptText.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
                var jsonText = jsonMatch[0]; // Chuỗi JSON sạch
                
                try {
                    var jsonObj = JSON.parse(jsonText); // ĐÃ SỬA: log -> console.log
                    
                    // 2. Cơ chế quét động tìm mảng Video và Phân trang (Tránh lỗi Undefined ở trang Search/Home)
                    var listVideos = null;
                    var paginationProps = null;
                    var keys = Object.keys(jsonObj);
                    
                    for (var i = 0; i < keys.length; i++) {
                        var component = jsonObj[keys[i]];
                        if (component) {
                            if (!listVideos && component.trendingVideoListProps && component.trendingVideoListProps.videoThumbProps) {
                                listVideos = component.trendingVideoListProps.videoThumbProps;
                            }
                            if (!listVideos && component.videoListProps && component.videoListProps.videoThumbProps) {
                                listVideos = component.videoListProps.videoThumbProps;
                            }
                            if (!paginationProps && component.paginationProps) {
                                paginationProps = component.paginationProps;
                            }
                        }
                    }

                    // Fallback nếu duyệt qua cấu trúc động không thấy, lấy theo cấu trúc tĩnh cũ của bạn
                    if (!listVideos && jsonObj.pagesCategoryComponent && jsonObj.pagesCategoryComponent.trendingVideoListProps) {
                        listVideos = jsonObj.pagesCategoryComponent.trendingVideoListProps.videoThumbProps;
                    }
                    if (!paginationProps && jsonObj.pagesCategoryComponent && jsonObj.pagesCategoryComponent.paginationProps) {
                        paginationProps = jsonObj.pagesCategoryComponent.paginationProps;
                    }

                    // Nếu hoàn toàn không có dữ liệu video thì trả về mảng rỗng
                    if (!listVideos || !Array.isArray(listVideos)) {
                        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
                    }

                    var items = [];
                    for (var j = 0; j < listVideos.length; j++) {
                        var itemVideo = listVideos[j];
                        if (!itemVideo) continue;

                        // Đồng bộ bóc tách slug an toàn
                        var cleanSlug = itemVideo.pageURL ? itemVideo.pageURL.replace("https://xhwide.com/", "").replace("https://xhamster.com/", "") : "";

                        items.push({
                            "id": cleanSlug, 
                            "title": itemVideo.title || "No Title",
                            "posterUrl": itemVideo.imageURL || itemVideo.previewThumbURL || "",
                            "backdropUrl": itemVideo.imageURL || ""
                        });
                    }

                    // Thiết lập giá trị phân trang an toàn
                    var currentPage = 1;
                    var totalPages = 1;
                    if (paginationProps) {
                        currentPage = parseInt(paginationProps.currentPageNumber) || 1;
                        totalPages = parseInt(paginationProps.lastPageNumber) || 1;
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

                } catch (e) {
                    log("Lỗi xử lý dữ liệu JSON:", e);
                }
            } else {
                log("Không tìm thấy cấu trúc Object trong script");
            }
        }
    } catch (e) {
        log("Lỗi hệ thống parseListResponse:", e);
    }
    
    // ĐÃ SỬA: Sắp xếp lại các dấu đóng ngoặc chuẩn xác để luôn trả về cấu trúc mặc định nếu lỗi
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
    var streamUrl = ""; // ĐÃ SỬA: Khai báo rõ ràng biến streamUrl tránh lỗi Global leak

    var rmatch = html.match(/link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1].replace("https://xhamster.com", BASEURL); }

    rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
    
    // ĐÃ SỬA: Loại bỏ khai báo trùng lặp `var rmatch`
    rmatch = html.match(/rel="preload"\shref="([\s\S]*?m3u8)"/i);
    if (rmatch && rmatch[1]) { streamUrl = rmatch[1]; }
        
    return JSON.stringify({
        id: streamUrl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes + "\r\n\r\n" + streamUrl + "\r\n\r\n" + lurl,
        servers: [
            {
                name: "Xhamster Stream",
                episodes: [
                    { id: streamUrl, name: "Xem Ngay", slug: "full" }
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
        var rmatch = html.match(/rel="preload"\shref="([\s\S]*?m3u8)"/i);
        if (rmatch && rmatch[1]) { streamUrl = rmatch[1]; }
        
        var customJs = textJS(html, url);

        return JSON.stringify({
            url: streamUrl,
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
    let menulist = [];
    if (!listurl) return menulist;
    
    let lines = listurl.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        
        let parts = line.split('@@');
        let link = parts[0] ? parts[0].trim() : "";
        let name = parts[1] ? parts[1].trim() : "";
        let check = parts[2] ? parts[2].trim() : undefined;
        
        if (!link || !name) continue;
        
        let item = {};
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