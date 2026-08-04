
BASEURL = "https://www.xxxfiles.com";
BASEIMG = "https://www.xxxfiles.com/img/logo.png?v=3";
// https://www.xxxfiles.com/favicon-32x32.png
function getManifest() {
    return JSON.stringify({
        "id": "xxxfiles",
        "name": "xxxfiles",
        "description": "XXX Hay",
        "version": "1.9.3",
        "BASEURL": "https://www.xxxfiles.com",
        "iconUrl": "https://www.xxxfiles.com/favicon-32x32.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}



function getHomeSections() {
    var listurl = "latest-updates/@@Hàng Mới@@true";
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
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
// =============================================================================

function getUrlList(slug, filtersJson) {
    var baseUrlClean = (typeof BASEURL !== 'undefined' ? BASEURL : "").replace(/\/$/, "");
    
    var page = 1;
    var path = "";
    
    // 1. Cố gắng parse JSON một cách an toàn
    try {
        if (filtersJson) {
            // Thay thế các key không có dấu nháy bằng key có dấu nháy để sửa lỗi JSON lỏng lẻo
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            var filters = JSON.parse(fixedJson);
            
            page = parseInt(filters.page) || 1;
            
            // Xử lý nếu category là mảng
            if (filters.category) {
                if (Array.isArray(filters.category) && filters.category.length > 0) {
                    path = filters.category[0].slug;
                } else if (typeof filters.category === 'string') {
                    path = filters.category;
                }
            }
        }
    } catch (e) {
        
    }
    
    // 2. Nếu filters không có category, sử dụng slug truyền vào
    if (!path) {
        path = slug || "";
    }
    
    // 3. KIỂM TRA NẾU PATH ĐÃ LÀ URL TUYỆT ĐỐI
    // Nếu path bắt đầu bằng http:// hoặc https://, ta xử lý riêng không cộng BASEURL nữa
    if (/^https?:\/\//i.test(path)) {
        // Chuẩn hóa xóa dấu / ở cuối
        path = path.replace(/\/+$/, "");
        
        if (page > 1) {
            return path + "/" + page + "/";
        } else {
            return path + "/";
        }
    }
    
    // 4. Xử lý cho URL tương đối (slug thông thường)
    if (!path) return baseUrlClean + "/";
    
    path = path.replace(/^\/+|\/+$/g, "");
    var targetUrl = baseUrlClean + "/" + path;
    
    if (page > 1) {
        targetUrl += "/" + page + "/";
    } else {
        targetUrl += "/";
    }
    
    return targetUrl;
}
/*
var BASEURL = "https://www.xxxfiles.com";
// JSON lỗi cú pháp (thiếu nháy kép) của bạn
var filtersJson = '{page:1,category:[{"slug":"categories/teen/","name":"Thiếu niên"}]}'; 
// Trường hợp 1: Truyền URL tuyệt đối vào slug
console.log(getUrlList("https://www.xxxfiles.com/search/black/", filtersJson));
// Kết quả: "https://www.xxxfiles.com/categories/teen/" 
// (Vì trong filtersJson có category nên nó ưu tiên dùng category trước)
// Trường hợp 2: Nếu filtersJson không có category, nó sẽ dùng slug trực tiếp
var filtersJsonNoCat = '{page:2}';
console.log(getUrlList("https://www.xxxfiles.com/search/black/", filtersJsonNoCat));
// Kết quả: "https://www.xxxfiles.com/search/black/2/" (Nhận diện đúng URL và thêm trang)
*/

function getUrlSearch(keyword, filtersJson) {
    return "https://www.xxxfiles.com/search/" + encodeURIComponent(keyword) + "/";
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

//BASEURL = "https://motherless.xxx";
//var html = document.getElementsByTagName("html")[0].outerHTML;
//JSON.parse(parseListResponse(html));



function parseListResponse(html, currentUrl) {
    try {
        var items = [];
        
        // 1. Kiểm tra nếu HTML trống hoặc lỗi
        if (!html || html.indexOf('body') === -1) {
            return JSON.stringify({
                items: [{ id: currentUrl, title: "Lỗi: 1 - " + currentUrl, posterUrl: BASEIMG }],
                pagination: { currentPage: 1, totalPages: 1 }
            });
        }
        
        // 2. Regex linh hoạt hơn cho class (chấp nhận thumb item hoặc item thumb, và các class đi kèm)
        const divRegex = /<div[^>]*class=["'][^"']*(?:thumb\s+item|item\s+thumb)[^"']*["'][^>]*>([\s\S]*?)<\/div>/g;
        let match;
        
        while ((match = divRegex.exec(html)) !== null) {
            const content = match[1];
            
            // Nếu trong khối không chứa các từ khóa quan trọng thì bỏ qua
            if (!content.match(/img|href|video|src/i)) {
                continue;
            }
            
            // 3. Lấy href từ thẻ <a> đầu tiên trong khối
            var urlMatch = content.match(/<a[^>]+href=["']([^"']+)["']/i);
            var itemUrl = "";
            if (urlMatch && urlMatch[1]) {
                itemUrl = urlMatch[1];
            } else {
                continue; // Không có link thì bỏ qua item này
            }
            
            if (!itemUrl.startsWith("http")) {
                itemUrl = BASEURL + (itemUrl.startsWith("/") ? "" : "/") + itemUrl;
            }
            
            // 4. Lấy Title từ thuộc tính alt của ảnh
            var title = "";
            var rmatch = content.match(/alt=["']([^"']+)["']/i);
            if (rmatch && rmatch[1]) {
                title = rmatch[1];
            }
            
            // 5. Lấy Poster (Ưu tiên data-src rồi mới đến src)
            var posterMatch = content.match(/data-src=["']([^"']+)["']/i) || content.match(/src=["']([^"']+)["']/i);
            var poster = posterMatch ? posterMatch[1] : BASEIMG;
            
            if (poster && !poster.startsWith("http")) {
                poster = BASEURL + (poster.startsWith("/") ? "" : "/") + poster;
            }
            
            items.push({
                id: itemUrl,
                title: title,
                posterUrl: poster
            });
        }
        
        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: 999 }
        });
        
    } catch (e) {
        return JSON.stringify({
            items: [{ id: currentUrl, title: "Lỗi: 2 - " + e.message, posterUrl: BASEIMG }],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

// --- Cách chạy thực tế trên Console trình duyệt ---
//var htmlData = document.documentElement.outerHTML; // Lấy toàn bộ HTML chuẩn hơn
//var resultJson = parseListResponse(htmlData, window.location.href);
//JSON.parse(resultJson);
//BASEURL = "https://www.xxxfiles.com";
//var html = document.getElementsByTagName("html")[0].outerHTML;
//JSON.parse(parseListResponse(html));

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, $url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "????";
    var cast = "????";
    var status = "????";
    var duration = "1:09:00 | 16 | 16";
    var servers = [];
    try {
        var rmatch;
        //rmatch = html.match(/meta\s+property=\["']og:image["']\s+content=["']([^"']+)["']/i);
        // if (rmatch && rmatch[1]) { limg = rmatch[1]; }
        
        rmatch = html.match(/property=["']og:title["']\s+content=["']([\s\S]*?)["']/i);
        if (rmatch && rmatch[1]) { lname = rmatch[1].trim(); }
        
        rmatch = html.match(/property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);
        if (rmatch && rmatch[1]) { limg = rmatch[1].trim(); }
        rmatch = html.match(/class=["']links__list["'][^>]*>([\s\S]*?)<\/div>/i);
        if (rmatch && rmatch[1]) {
                var result = rmatch[1].replace(/<[^>]*>/g, '');
                // 2. (Tùy chọn) Khử các thực thể HTML phổ biến như &nbsp;, &amp;, &lt;, &gt;
                result = result.replace(/&nbsp;/g, ' ')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/\r|\n/gi, '')
                    .replace(/\s+/gi, ', ')
                    .replace(/^,|,$/g, "");
                    ldes = result.trim();
        }
        
        
        var episodes = [];
         var $link = "";
          var serverMatches = html.match(/video\s+id=["']video[[\s\S]*?src=["']([\s\S]*?)["']/i);
          if (serverMatches && serverMatches[1]) {
            $link = serverMatches[1]
          }
        
        if (serverMatches && serverMatches[1]) {
            lurl = serverMatches[1];
            episodes.push({
                id: $link + "#video.m3u8",
                name: "Xem Ngay",
                slug: "tap-1"
            });
        }
        servers = [{
            name: "Server",
            episodes: episodes
        }];
        
    } catch (e) {
        console.error("Lỗi parse dữ liệu: ", e);
    }
    
    return JSON.stringify({
        id: $url,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: lurl ? ldes + "\r\n\r\n" + lurl : ldes,
        servers: servers,
        quality: "HD",
        year: year,
        status: status,
        duration: duration,
        casts: cast,
        director: direc
    });
}
//BASEURL = "https://motherless.xxx";
//var html = document.getElementsByTagName("html")[0].outerHTML;
//JSON.parse(parseMovieDetail(html));


function parseDetailResponse(html, url) {
    try {
        return JSON.stringify({
          "url":"",
          "isEmbed": false,
          "mimeType": "video/mp4",
          "headers": {
            "Referer": BASEURL,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          "subtitles": []
        });
        
    } catch (e) {
        return JSON.stringify({ "url": "", "headers": {} });
    }
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
categories/teen/@@Thiếu niên
categories/taboo/@@Cấm Kỵ
categories/mature/@@Già Gân
categories/anal/@@Lỗ Nhị
categories/interracial/@@Khác Tộc
categories/big-ass/@@Mông To
categories/casting/@@Diễn Viên
categories/babe/@@Gái Xinh
categories/amateur/@@Nghiệp Dư
categories/old-and-young2/@@Già và Trẻ
categories/hardcore/@@Hạng Nặng
categories/fetish/@@Đặc biệt
categories/double-penetration2/@@2 Cây Hàng
categories/ebony/@@Da Màu
`
}


// Hàm tách menu bằng list - ĐÃ TỐI ƯU: Không dùng Regex lặp để tránh treo app
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
