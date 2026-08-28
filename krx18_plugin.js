BASEURL = "https://krx18.com";

function getManifest() {
    return JSON.stringify({
        "id": "krx18",
        "name": "Phim 18+ Hàn",
        "description": "Kho phim 18+ Hàn Quốc đặc sắc, tuyển chọn.",
        "info": "Kho phim 18+ Hàn Quốc đặc sắc, tuyển chọn.",
        "version": "1.0.0",
        "BASEURL": "https://krx18.com",
        "iconUrl": "https://krx18.com/wp-content/uploads/2022/10/krx18B.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}
// https://krx18.com/movies/page/2/
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/movies/", "title": "Phim Có Nội Dung", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

// ĐÃ SỬA: Lỗi cú pháp khai báo biến trong JSON.stringify
function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        category: menulist
    });
}
// =============================================================================
// URL GENERATION
// ===================================================================
function getUrlList(slug, filtersJson) {
    try {
        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if (slug && slug.indexOf("http") > -1 || slug.indexOf("search/") > -1) {
            // thường là link search sẽ bị trả về ở đây
            return slug;
        }
        let page = 1;
        let path = slug || "";
        
        // 2. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            // Nếu có số trang hoặc  có menu categ
            // Sửa lỗi nếu JSON thiếu dấu ngoặc kép ở key hoặc sai cú pháp cơ bản
            let fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');
            // Sửa lỗi nếu truyền kiểu {"page",24} thành {"page":24}
            
            try {
                let filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
                
                // Nếu có category trong JSON, ưu tiên lấy category làm đường dẫn (path)
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {
                //console.log("JSON parse lỗi, dùng giá trị mặc định");
            }
        }
        
        
        // 4. Chuẩn hóa path
        if (!path) {
            path = "/movies/";
        }
        if (path.indexOf("/") !== 0) {
            path = "/" + path;
        }
        if (path.lastIndexOf("/") !== path.length - 1) {
            path = path + "/";
        }
        
        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL + path;
        if (page > 1) {
            resultUrl += "page/" + page + "/";
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
        
    } catch (e) {
        // console.log("Lỗi hệ thống: " + e.message);
        // Trả về URL gốc an toàn nếu có lỗi
        let fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}
// https://krx18.com/genre/china/page/3/
// https://krx18.com/movies/page/4/

//BASEURL = "https://www.trannymovs.com";
//filtersJson = '{"page":5,"category":[{"slug":"/categories/ladyboy/","name":"ladyboy"}]}';
//filtersJson = '{"page":13}';
//console.log(getUrlList("", filtersJson));


function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/" + encodeURIComponent(keyword) + "/";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + slug;
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
        var seenIds = {};
        var regexList = `
class[^>]+movies[\\s\\S]*?
src=["']([^"']+)["'][\\s\\S]*?
alt=["']([^"']+)["'][\\s\\S]*?
href=["']([^"']+)["']
`;
        regexList = regexList.replace(/\r|\n|\t/g, "");
        var regmath = new RegExp(regexList, "g");
        var matchList;
        while ((matchList = regmath.exec(html)) !== null) {
            var itemUrl = matchList[3] ? matchList[3].trim() : "";
            if (itemUrl && itemUrl.indexOf("http") > -1) {
                // Bỏ qua trang chủ, feed hoặc logo
                if (itemUrl === BASEURL || itemUrl === BASEURL + "/" || itemUrl === BASEURL + "/movies" || itemUrl === BASEURL + "/movies/" || itemUrl.indexOf("/feed") > -1) {
                    continue;
                }
                if (seenIds[itemUrl]) {
                    continue;
                }
                seenIds[itemUrl] = true;

                var cleanThumb = matchList[1].replace(/&amp;/g, '&');
                items.push({
                    "id": itemUrl,
                    "title": matchList[2].trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb
                });
            }
        }
        
        var totalPages = 999;
        var currentPage = 1;
        
        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": totalPages }
        });
    } catch (e) {
        var items = [];
        items.push({
            "id": $url,
            "title": "Lỗi: " + e,
            "posterUrl": "",
            "backdropUrl": ""
        });
        return JSON.stringify({ "items": items, "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}
///*
//html = $("html")[0].outerHTML;
//JSON.parse(parseListResponse(html));
// Bỏ dấu / ở đầu chuỗi
//*/



function parseSearchResponse(html) {
    return parseListResponse(html);
}


function parseMovieDetail(html, $url) {
    var lurl = $url || "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";

    var rmatch = html.match(/link\s+rel="canonical"\s+href=["']([^"']+)["']/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1]; }

    rmatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/<title>([^<]+)/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1].replace(/ - Xem Phim.*$/i, "").trim(); }

    rmatch = html.match(/meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }

    var idvideo = "";
    var $linkser = "";
    rmatch = html.match(/id=["']dooplay-ajax-counter["']\s+data-postid=["']([^"']+)["']/i);
    if (rmatch && rmatch[1]) { 
        idvideo = rmatch[1];
        $linkser = BASEURL + "/wp-json/dooplayer/v2/" + idvideo + "/movie/";
    } else {
        rmatch = html.match(/data-post=['"](\d+)['"]/i);
        if (rmatch && rmatch[1]) {
            idvideo = rmatch[1];
            $linkser = BASEURL + "/wp-json/dooplayer/v2/" + idvideo + "/movie/";
        }
    }

    var epi = [];
    var optRegex = /<li[^>]+class=['"][^'"]*dooplay_player_option[^'"]*['"][^>]*data-type=['"]([^'"]+)['"][^>]*data-post=['"]([^'"]+)['"][^>]*data-nume=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/li>/gi;
    var match;
    while ((match = optRegex.exec(html)) !== null) {
        var dtype = match[1];
        var dpost = match[2];
        var dnume = match[3];
        var inner = match[4];
        var titleMatch = inner.match(/<span class=['"]title['"]>([^<]+)<\/span>/i);
        var serverMatch = inner.match(/<span class=['"]server['"]>([^<]+)<\/span>/i);
        var sTitle = titleMatch ? titleMatch[1].trim() : ("Server " + dnume);
        var sName = serverMatch ? (" (" + serverMatch[1].trim() + ")") : "";
        epi.push({
            id: BASEURL + "/wp-json/dooplayer/v2/" + dpost + "/" + dtype + "/" + dnume,
            name: sTitle + sName,
            slug: "full"
        });
    }

    if (epi.length === 0 && idvideo) {
        epi.push({ id: $linkser + "1", name: "Server 1", slug: "full" });
        epi.push({ id: $linkser + "2", name: "Server 2", slug: "full" });
        epi.push({ id: $linkser + "3", name: "Server 3", slug: "full" });
    }

    var $return = {
        id: $url,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: [
            {
                name: "Servers: ",
                episodes: epi
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
    };
    return JSON.stringify($return);
}

function parseDetailResponse(html, url) {
    try {
        // Nếu html đã là chuỗi JSON dooplayer trả về (chứa embed_url)
        if (typeof html === "string" && html.indexOf("embed_url") > -1) {
            var $embed = JSON.parse(html);
            var link = $embed.embed_url || "";

            return JSON.stringify({
                "url": link,
                "isEmbed": true,
                "headers": {
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                "subtitles": []
            });
        }

        // Bước 1: App gọi parseDetailResponse với mã HTML trang detail và URL của server (link dooplayer API)
        // Trả về isEmbed: true để App tiến hành fetch API dooplayer dạng GET
        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "isEmbed": false, "headers": {} });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    try {
        var link = "";
        if (typeof html === "string" && html.indexOf("embed_url") > -1) {
            try {
                var $embed = JSON.parse(html);
                link = $embed.embed_url || "";
            } catch (jsonErr) {
                var m = html.match(/"embed_url"\s*:\s*"([^"]+)"/i);
                if (m) link = m[1].replace(/\\/g, "");
            }
        } else if (typeof html === "string" && html.indexOf("http") === 0) {
            link = html.trim();
        }

        if (link) {
            return JSON.stringify({
                "url": link,
                "isEmbed": false, // Kết thúc đệ quy, đây là link player cuối để mở qua WebView/WebPlayerActivity
                "headers": {
                    "Referer": BASEURL + "/",
                    "Origin": BASEURL,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }
    } catch (e) {}

    return JSON.stringify({ "url": "", "isEmbed": false, "headers": {} });
}

function textJS(html, $url) {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=krx18&type=js"; 
function showToast(message, duration = 7000) {
    let container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '99999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.innerHTML = message;
    
    Object.assign(toast.style, {
        background: 'rgba(50, 50, 50, 0.95)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        minWidth: '200px',
        transition: 'all 0.3s ease',
        transform: 'translateX(120%)',
        opacity: '0'
    });
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        
        setTimeout(() => {
            toast.remove();
            if (container.childElementCount === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
}

function injectScriptAfterLoad(scriptUrl) {
    function doFetchAndInject() {
        console.log('⏳ Đang tiến hành fetch code từ:', scriptUrl);
        
        fetch(scriptUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Mã phản hồi từ Server không tốt: ' + response.status);
                }
                return response.text();
            })
            .then(codeText => {
                const script = document.createElement('script');
                script.type = 'text/javascript';
                // Đổ thẳng nội dung code dạng chữ vào trong thẻ script
                script.textContent = codeText;
                
                document.body.appendChild(script);
                console.log('🎯 Đã fetch và thực thi Script thành công!');
            })
            .catch(error => {
                console.error('❌ Lỗi không thể fetch hoặc chạy script:', error);
            });
    }
    
    // Thay vì đợi 'load' (quá muộn), ta kiểm tra nếu không còn ở trạng thái 'loading' thì chạy luôn
    if (document.readyState !== 'loading') {
        doFetchAndInject();
    } else {
        // Nếu web thực sự đang load dữ liệu thô, đợi DOMContentLoaded cho nhanh (không cần đợi ảnh/video tải xong)
        document.addEventListener('DOMContentLoaded', doFetchAndInject);
    }
}

function initCustomVideoFix() {
    // SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
    
    if (SCRIPTURL && SCRIPTURL !== "undefined") {
        injectScriptAfterLoad(SCRIPTURL);
    }
    
    const style = document.createElement('style');
    var customcss = 'body { background: black; overflow: hidden; }#comments,header,footer,.entry-actions,.entry-header,.entry-info,.entry-content,#related-posts,.entry-content + .mt-2 {display:none}body * {background: black;}';
    
    style.innerHTML = customcss;
    document.head.appendChild(style);

    if (typeof jwplayer === "function") {
        const player = jwplayer("previewPlayer");
        if (player && typeof player.getMute === "function") {
            if (player.getMute()) {
                player.setMute(false);
                showToast("Đã bật tiếng", 3000); // SỬA: Bỏ "duration ="
            }
            player.setVolume(100);
        }
    }
    
    let isSkipping = false;

    const checkAndClick = setInterval(() => {
        const skipButton = document.getElementById("skip-ad");
        
        if (skipButton) {
            const style = window.getComputedStyle(skipButton);
            if (style.display === 'none' || style.visibility === 'hidden') return;

            skipButton.click();
            console.log("🎯 Đã phát hiện và kích hoạt nút bỏ qua quảng cáo!");

            if (!isSkipping) {
                isSkipping = true;
                showToast("Đã bỏ qua quảng cáo", 3000); // SỬA: Bỏ "duration ="
                setTimeout(() => { isSkipping = false; }, 2000);
            }
        }
    }, 250);
    
    // Lưu ý: Đảm bảo hàm runScript() này đã được định nghĩa ở đâu đó trong hệ thống của bạn
    if (typeof runScript === "function") {
        runScript("sssssssss");
    }
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
/genre/korea/@@Korea
/genre/australia/@@Australia
/genre/belgium/@@Belgium
/genre/canada/@@Canada
/genre/china/@@China
/genre/denmark/@@Denmark
/genre/france/@@France
/genre/germany/@@Germany
/genre/indonesia/@@Indonesia
/genre/india/@@India
/genre/italy/@@Italy
/genre/japan/@@Japan
/genre/netherlands/@@Netherlands
/genre/philippines/@@Philippines
/genre/poland/@@Poland
/genre/russia/@@Russia
/genre/singapore/@@Singapore
/genre/spain/@@Spain
/genre/switzerland/@@Switzerland
/genre/taiwan/@@Taiwan
/genre/thailand/@@Thailand
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


