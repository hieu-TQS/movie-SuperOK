BASEURL = "https://viet69z.me";

function getManifest() {
    return JSON.stringify({
        "id": "viet69",          
        "name": "Viet69",
        "description": "XXX Hay",
        "version": "1.4",             
        "baseUrl": "https://viet69z.me",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/viet69.png", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "", "title": "Sex Mới", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "sinh-vien", "name": "Sinh Viên" },
        { "slug": "may-bay-ba-gia", "name": "Máy Bay" },
        { "slug": "?s=Vi%E1%BB%87t+nam", "name": "Việt Nam" },
        { "slug": "?s=T%E1%BA%ADp+th%E1%BB%83", "name": "Tập Thể" }, // ĐÃ SỬA: Thêm dấu phẩy ở đây
        { "slug": "?s=Hi%E1%BA%BFp+d%C3%A2m", "name": "Hiếp Dâm" }
    ]);
}

function getFilters() {
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "newest" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        if (filtersJson.category) {
            return BASEURL + "/" + filters.category + "/page/" + page;
        }
        if (page > 1) {
            if (slug.indexOf("s=") > -1) {
                 return BASEURL + "/page/" + page + "/" + slug;
            } else {
                 return BASEURL + "/" + slug + "/page/" + page;
            }
        }
        return BASEURL + "/" + slug;
    } catch (e) {
        return BASEURL + "/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/?s=" + encodeURIComponent(keyword);
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
        var items = [];
        var pattern = /(?=<div[^>]*class="[^"]*entry-video__thumbnail[^"]*")/g;
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
            } else {
                var labelMatch = block.match(/aria-label="([^"]+)"/i); // ĐÃ SỬA: Fallback sang aria-label thay vì trùng lặp quét title
                title = labelMatch ? labelMatch[1].trim() : "";
            }
            
            if (!title || title === "Video không tiêu đề") {
                continue; 
            }
            
            var srcMatch = block.match(/img[\s\S]*?src="([^"]+)"/i);
            var posterUrl = srcMatch ? srcMatch[1].trim() : "https://ic-vt-nss.cdnsolutions.media/a/YjgwNDg0MGRkZWVjZjQ1ZGVhZjc5MzQ0ZWJkMDlhOTA/s(w:1280,h:720),webp/026/522/500/1280x720.17475568.jpg";
            
            items.push({
                "id": id,          
                "title": title, 
                "posterUrl": posterUrl, 
                "backdropUrl": posterUrl
            });
        }
		
        // ĐÃ SỬA: Loại bỏ khai báo trùng lặp var/const cho biến currentPage
        var currentRegex = /aria-current="page"[^>]*>([\d]+)<\/span>/;
        var currentMatch = html.match(currentRegex);
        var parsedCurrentPage = currentMatch ? parseInt(currentMatch[1], 10) : 1;

        // Tìm trang cuối cùng (Last Page)
        var pageNumRegex = /\/page\/([\d]+)\//g;
        var match;
        var maxPage = 1; 

        while ((match = pageNumRegex.exec(html)) !== null) {
            var pageNum = parseInt(match[1], 10);
            if (pageNum > maxPage) {
                maxPage = pageNum;
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": { 
                "currentPage": parsedCurrentPage, 
                "totalPages": maxPage, 
                "totalItems": 20 * maxPage,
                "itemsPerPage": 20
            }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";

    var rmatch = html.match(/<meta[^>]*?property="og:url"[^>]*?content="([^"\s]+)"|<meta[^>]*?content="([^"\s]+)"[^>]*?property="og:url"/i);
    if (rmatch) { lurl = rmatch[1] || rmatch[2]; }

    rmatch = html.match(/property="og:image" content="([^"]+)"/i);
if (rmatch && rmatch[1]) { limg = rmatch[1].replace(/\?[\s\S]*?$/i, ""); }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }   
     
    var streamUrl = "";
    var iframeMatch = html.match(/src="(https:\/\/emb\.cd-vs\.com\/embed\/[^"]+)"/i);
   	if (iframeMatch && iframeMatch[1]) { streamUrl = iframeMatch[1]; }
    var $return = {
        id: lurl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: [
            {
                name: "Server",
                episodes: [
                    { id: lurl, name: "Xem Ngay", slug: "full" }
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
    };
    var jsonreturn = JSON.stringify($return);
    $return.description = jsonreturn;
    return JSON.stringify($return);
}


function parseDetailResponse(html, url) {
    try {
        // Đọc trực tiếp từ thuộc tính của BaseJSON đã lưu ở bước đầu tiên
        var streamUrl = "";
        var iframeMatch = html.match(/iframe[^>]+src="([^"']+)"/i);
        if (iframeMatch && iframeMatch[1]) { streamUrl = iframeMatch[1]; }
        var customjs = textJS(html, url);
        customjs += `
            function runScript($msg){
                showToast("Bước 1: ${streamUrl}", 10000)
                var iframe = document.getElementsByTagName("iframe")[0];
                iframe.style.height = "100%";
                iframe.style.width = "100%";
                iframe.style.position = "fixed";
                iframe.style.top = "0";
                iframe.style.bottom = "0";
                var framehtml = iframe.outerHTML;
                var body = document.getElementsByTagName("html")[0];
                body.style.height = "100%";
                body.style.width = "100%";
                body.innerHTML = framehtml;
            }
        `
        
        return JSON.stringify({
            url: streamUrl,
            isEmbed: true, // Vẫn cần fetch tiếp
            headers: {
                "Referer": url,
                "Custom-Js": customjs.trim()
            }
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}

function parseDetailResponse(html, url) {
    try {
        var customjs = textJS();
        return JSON.stringify({
            "url": url,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                // Đánh lừa thuật toán Client Hints của tường lửa
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?1",
                "Sec-Ch-Ua-Platform": '"Android"',
                
                // Khai báo kiểu dữ liệu được chấp nhận giống như trình duyệt thật
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome",
                "Custom-Js": customjs.trim()
            },
            "subtitles": []
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
}
function textJS() {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=viet69&type=js"; 
const style = document.createElement('style');
var customcss = 'body,html { background: black!important;overflow: hidden!immportant}body,body * {background: black!important;display:none!important}';
style.innerHTML = customcss;
document.head.appendChild(style);
function injectScriptAfterLoad(scriptUrl) {
    function doFetchAndInject() {
        console.log('⏳ Đang tiến hành fetch code từ:', scriptUrl);
        
        fetch(SCRIPTURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Mã phản hồi từ Server không tốt: ' + response.status);
                }
                return response.text(); // Lấy toàn bộ mã nguồn dưới dạng chuỗi chữ
            })
            .then(codeText => {
                // 1. Tạo một thẻ script trống mới hoàn toàn bằng JS
                const scriptElement = document.createElement('script');
                scriptElement.type = 'text/javascript';
                
                // 2. Đổ thẳng nội dung code dạng chữ vào trong thẻ script vừa tạo
                scriptElement.textContent = codeText;
                
                // 3. Nhúng (Inject) thẻ script này vào vị trí cuối cùng của thẻ body
                document.body.appendChild(scriptElement);
               // showToast('🎯 Đã fetch và nhúng thành công script vào sau body,!',5000);
            })
            .catch(error => {
                console.error('❌ Lỗi không thể fetch hoặc nhúng script:', error);
            });
    }
    
    // Kiểm tra trạng thái tải của trang web
    if (document.readyState !== 'loading') {
        // Nếu trang web đã tải xong cấu trúc DOM cơ bản, thực hiện ngay lập tức
        doFetchAndInject();
    } else {
        // Nếu trang web vẫn đang load thô, đợi sự kiện DOMContentLoaded kích hoạt rồi chạy
        document.addEventListener('DOMContentLoaded', doFetchAndInject);
    }
}

function initCustomVideoFix() {
    // SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
    if (SCRIPTURL && SCRIPTURL !== "undefined") {
        injectScriptAfterLoad(SCRIPTURL);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
    initCustomVideoFix();
}

`;
}


function parseCategoriesResponse(html) { return JSON.stringify([
    { "slug": "sinh-vien", "name": "Sinh Viên" },
    { "slug": "may-bay-ba-gia", "name": "Máy Bay" },
    { "slug": "?s=Vi%E1%BB%87t+nam", "name": "Việt Nam" },
    { "slug": "?s=T%E1%BA%ADp+th%E1%BB%83", "name": "Tập Thể" }, // ĐÃ SỬA: Thêm dấu phẩy ở đây
    { "slug": "?s=Hi%E1%BA%BFp+d%C3%A2m", "name": "Hiếp Dâm" }
])}
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
