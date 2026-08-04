// =============================================================================
// VAAPP Plugin - SEX MUP (Bản vá chuẩn hóa theo cấu trúc Core mới nhất)
// =============================================================================
BASEURL = "https://sexmupxinh.net";

function getManifest() {
    return JSON.stringify({
        "id": "sexmup",          
        "name": "sexmup",
        "description": "XXX Hay",
        "version": "1.3",             
        "baseUrl": "https://sexmupxinh.net",
        "iconUrl": "https://sexmupxinh.net/favicon.ico", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}
/*
{ "slug": "phim-sex-hiep-dam", "title": "Hiếp Dâm", "type": "Horizontal" },
        { "slug": "phim-sex-loan-luan", "title": "Loạn Luân", "type": "Horizontal" },
        { "slug": "phim-sex-vung-trom", "title": "Vụng Trộm", "type": "Horizontal" }, // ĐÃ SỬA: Thêm dấu phẩy hợp lệ ở đây
        { "slug": "phim-sex-chau-au", "title": "Châu Âu", "type": "Horizontal" },
        { "slug": "phim-sex-trung-quoc", "title": "Trung Quốc", "type": "Horizontal" }
    ]);
*/
function getHomeSections() {
    return JSON.stringify([
        { "slug": "", "title": "Clip Mới", "type": "Grid" },
        { "slug": "phim-sex-loan-luan", "title": "Loạn Luân", "type": "Horizontal" },
        { "slug": "phim-sex--khong-che", "title": "Không Che", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Hiếp Dâm", "slug": "phim-sex-hiep-dam"},
        { "name": "Loạn Luân", "slug": "phim-sex-loan-luan"},
        { "slug": "phim-sex-vung-trom", "name": "Vụng Trộm"},
        { "slug": "phim-sex-chau-au", "name": "Châu Âu"},
        { "slug": "phim-sex-trung-quoc", "name": "Trung Quốc"},
        { "slug": "search/?do=search&qh=L%E1%BB%97+Nh%E1%BB%8B", "name": "Lỗ Nhị"},
        { "slug": "search/?do=search&qh=Da+%C4%91en", "name": "Da Đen"}
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
            return BASEURL + "/" + slug + "/page/" + page + "/";
        }
        return BASEURL + "/" + slug;
    } catch (e) {
        return BASEURL + "/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search/?do=search&qh=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
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
        // ĐÃ SỬA: Chỉ bóc cụm nội dung bên trong thẻ <img> để không bị bẫy mất item không có data-src
        var regex = /class="video-list"[\s\S]*?a\s+title="([^"]+)"[\s\S]*?href="([^"]+)"[\s\S]*?<img[^>]*class="video-image[^"]*"([^>]*)/g;
        var match;
        var imageRegex = /\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i;
        
        while ((match = regex.exec(html)) !== null) {
            var title = match[1].trim();
            var id = match[2];
            var imgTagContent = match[3];

            // Tìm thuộc tính src và data-src riêng lẻ
            var srcMatch = imgTagContent.match(/src="([^"]+)"/i);
            var dataSrcMatch = imgTagContent.match(/data-src="([^"]+)"/i);

            var lurl1 = srcMatch ? srcMatch[1].replace(/&amp;/g, '&') : "";
            var lurl2 = dataSrcMatch ? dataSrcMatch[1].replace(/&amp;/g, '&') : "";

            // ĐÃ SỬA: Sửa lại chính xác tên biến lurl1 và lurl2
            var limg = (lurl1 && imageRegex.test(lurl1)) ? lurl1 : 
                       (lurl2 && imageRegex.test(lurl2)) ? lurl2 : 
                       "https://sexmupxinh.net/file/cover/ong-chu-dam-duc-lua-em-nu-sinh-vao-cuoc-may-mua-tao-bao.jpg";
           
            items.push({
                "id": id,          
                "title": title, 
                "posterUrl": limg,
                "backdropUrl": limg
            });
        }

        var currentPage = 1;
        var totalPages = 1;

        if (html) {
            var currentMatch = html.match(/class="pagenavi"[\s\S]*?class="active"[\s\S]*?>(\d+)<\/a>/i);
            var maxMatch = html.match(/>(\d+)<\/a><a[^>]*>→<\/a>/i);

            if (currentMatch && currentMatch[1]) {
                currentPage = parseInt(currentMatch[1], 10);
            }
            if (maxMatch && maxMatch[1]) {
                totalPages = parseInt(maxMatch[1], 10);
            }
        }

        return JSON.stringify({
            "items": items,
            "pagination": { 
                "currentPage": currentPage, 
                "totalPages": totalPages,    
                "totalItems":  24 * totalPages,
                "itemsPerPage": 24
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

    var rmatch = html.match(/link\srel="canonical"[\s\S]*?href="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:image"\s+content="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/<div\s+class="content">([\s\S]*?)<\/div>/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
     
    return JSON.stringify({
        id: lurl,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes,
        servers: [
            {
                name: "Full",
                episodes: [
                    { id: lurl, name: "Full", slug: "" }
                ]
            }
        ],
        quality: "HD",
        year: 2026, // ĐÃ SỬA: Thay "????" bằng số nguyên để không lỗi ép kiểu
        rating: 8.0,
        status: "Full",
        duration: 0, // ĐÃ SỬA: Thay "????" bằng 0 đề phòng lỗi ép kiểu tương tự
        casts: "Diễn viên",
        director: "Đạo diễn",
        category: "18+"
    });
}

function parseDetailResponse(html) {
    try {
        var streamUrl = "";
        var rmatch = html.match(/<div\s+class="video-player mobile"[\s\S]*?iframe\s+src="([\s\S]*?)"/i);
        if (rmatch && rmatch[1]) {
            streamUrl = rmatch[1];
        }	
        var customJs = "var style = document.createElement('style');" +
            "style.innerHTML = '#playback { display: none !important; }';" +
            "document.head.appendChild(style);";

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "Referer": "https://clbphimxua.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Custom-Js": customJs
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
    }
}

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
