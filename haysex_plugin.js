// =============================================================================
// VAAPP Plugin - Xhamster (Bản vá chuẩn hóa theo cấu trúc Core mới nhất)
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "haysex",          
        "name": "HaySex",
        "description": "XXX Hay",
        "version": "1.1",             
        "baseUrl": "https://phimsexsuong3x.net",
        "iconUrl": "https://static.cdnsolutions.media/xh-desktop/images/favicon/favicon-v2-256x256.ico", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embedtoexoplay"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "phim-sex-loan-luan", "title": "Loạn Luân", "type": "Horizontal" },
        { "slug": "onlyfans-leak", "title": "OnlyFans", "type": "Horizontal" },
        { "slug": "phim-sex-vietsub", "title": "Việt Sub", "type": "Horizontal" },
        { "slug": "clip-sex-telegram", "title": "Telegram", "type": "Horizontal" },
        { "slug": "", "title": "Hàng Mới", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
    { "slug": "phim-sex-my", "name": "Âu | Mỹ" },
    { "slug": "phim-sex-nhat-ban", "name": "Nhật Bản" },
    { "slug": "phim-sex-viet-nam", "name": "Việt Nam" },
    { "slug": "phim-sex-trung-quoc", "name": "Trung Quốc" },
    { "slug": "phim-sex-dong-tinh-nam-gay", "name": "Gay" },
    { "slug": "phim-sex-deepfake", "name": "DeepFake" },
    { "slug": "phim-sex-hiep-dam", "name": "Hiếp Dâm" }
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
        
        if (page > 1) {
            return "https://phimsexsuong3x.net/" + slug + "/page/" + page;
        }
        return "https://phimsexsuong3x.net/" + slug;
    } catch (e) {
        return "https://phimsexsuong3x.net/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    return "https://phimsexsuong3x.net/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return "https://phimsexsuong3x.net/" + slug;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        var items = [];
var pattern = /(?=<div[^>]*class="[^"]*video-block[^"]*")/g;
var splitItems = html.split(pattern).filter(Boolean);

for (var j = 1; j < splitItems.length; j++) {
    var block = splitItems[j];
    var hrefMatch = block.match(/href="([^"]+)"/i);
    if (!hrefMatch) continue; // Bỏ qua nếu khối không chứa link

    var id = hrefMatch[1].trim();

    var title = "";
    
    // Thử lấy title từ thuộc tính alt của ảnh trước
    // <span class="title">
    var altMatch = block.match(/<span class="title">([\s\S]*?)<\/span>/i);
    if (altMatch) {
        title = altMatch[1].trim();
    } else {
        // Khử fallback sang aria-label nếu alt không tồn tại
        var labelMatch = block.match(/title="([^"]+)"/i);
        title = labelMatch ? labelMatch[1].trim() : "";
    }
    
    // ĐIỀU KIỆN 1: Nếu tiêu đề rỗng hoặc là "Video không tiêu đề" thì không gán vào items
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
		
        var currentPage = 1;
        var totalPages = 1;

        const activeMatch = html.match(/(?:active|current)[\s\S]*?>\s*(\d+)\s*<\//);
const activePage = activeMatch ? parseInt(activeMatch[1]) : 1;

// 2. Tìm số trang cuối cùng (Quét qua toàn bộ thẻ <a> chứa số thuần túy)
const linkRegex = /<a[\s\S]*?>\s*(\d+)\s*<\/a>/g;
let lastPage = 1;
let match;

while ((match = linkRegex.exec(html)) !== null) {
    let pageNum = parseInt(match[1]);
    if (pageNum > lastPage) {
        lastPage = pageNum;
    }
}
        return JSON.stringify({
            "items": items,
            "pagination": { 
                "currentPage": activePage, 
                "totalPages": lastPage, // ĐÃ SỬA: Đồng bộ đúng biến totalPages động
                "totalItems": 40 * totalPages,
                "itemsPerPage": 40
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

    var rmatch = html.match(/<meta[^>]*?property="og:url"[^>]*?(https?:\/\/[^"\s]+)|<meta[^>]*?(https?:\/\/[^"\s]+)[^>]*?property="og:url"/);
    if (rmatch && rmatch[1]) { lurl = rmatch[1]}

    rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }   
     
     var streamUrl = "";
        
        var rmatch = html.match(/iframe[\s\S]*?data-src="([\s\S]*?)"/i);
   	 if (rmatch && rmatch[1]) { streamUrl = rmatch[1]; }
     
    return JSON.stringify({
        id: lurl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes  + "\r\n\r\n" +lurl + "\r\n\r\n" + streamUrl,
        servers: [
            {
                name: "HaySex",
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
    });
}

function parseDetailResponse(html) {
    try {
      /*
      var rmatch = html.match(/link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1]; }
    */
		var customJs = `
function initCustomVideoFix() {
  // 1. Chèn CSS dọn dẹp giao diện (ẩn footer, sidebar, navbar...)
  const style = document.createElement('style');
  style.innerHTML = '';
  document.head.appendChild(style);
  
  const player = jwplayer("previewPlayer");

// 2. Kiểm tra xem player có tồn tại và đang bị tắt tiếng hay không
if (player && typeof player.getMute === "function") {
    if (player.getMute()) {
        player.setMute(false); // Bật tiếng (Bỏ chế độ Mute)
        console.log("Đã bật tiếng video!");
    } else {
        console.log("Video đã có tiếng sẵn từ trước.");
    }

    // Tiện tay nếu bạn muốn đảm bảo âm thanh ở mức to nhất (ví dụ: 100%)
    player.setVolume(100); 
} else {
    console.error("Không tìm thấy đối tượng JW Player hoặc player chưa sẵn sàng.");
}


}
  // 2. Dùng setInterval để đợi trình phát video v0:480p:,1280x720:720p:,1920x10

// Kiểm tra trạng thái trang để kích hoạt hàm an toàn nhất
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomVideoFix);
} else {
  initCustomVideoFix();
}
`;
		var streamUrl = "";
        var rmatch = html.match(/iframe[\s\S]*?data-src="([\s\S]*?)"/i);
   	 if (rmatch && rmatch[1]) { streamUrl = rmatch[1]; }
   
return JSON.stringify({
    url: streamUrl,
    headers: {
        "Referer": "https://phimsexsuong3x.net",
        "Origin": "https://phimsexsuong3x.net",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Custom-Js": customJs.trim()
    }
});
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
    }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
