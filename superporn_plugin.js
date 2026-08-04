BASEURL = "https://www.superporn.com";

function getManifest() {
    return JSON.stringify({
        "id": "superporn",          
        "name": "SuperPorn",
        "description": "XXX Hay",
        "version": "3.6.1",             
        "baseUrl": "https://www.superporn.com",
        "iconUrl": "https://superporn.com/favicon.ico", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
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
        { "slug": "japanese", "title": "Gái Nhật", "type": "Horizontal" },
        { "slug": "teen", "title": "Gái Trẻ", "type": "Horizontal" },
        { "slug": "series/full-movies", "title": "Phim Dài", "type": "Horizontal" },
        { "slug": "", "title": "Clip Mới", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "shemale", "name": "Shemale"},
        { "slug": "japanese", "name": "Gái Nhật"},
        { "slug": "cheating", "name": "Chơi Lén"},
        { "slug": "gay", "name": "Gay"},
        { "slug": "russian-porn", "name": "Gái Nga"},
        { "slug": "dad-and-daughter", "name": "Cha Con"},
        { "slug": "mom-and-son", "name": "Mẹ Con"}
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
            return BASEURL + "/" + slug + "/" + page;
        }
        return BASEURL + "/" + slug;
    } catch (e) {
        return BASEURL + "/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/search?q=" + encodeURIComponent(keyword);
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
/*
<div class="thumb-video  ">
    <a href="https://www.superporn.com/video/hard-black-cock-for-tori-black" class="thumb-duracion">
    <img alt="Hard black cock for Tori Black" loading="lazy" class="lazy " src="https://img2.superporn.com/videos/146/14658/thumbs/thumbs_0012_custom_1678794635.1263.jpg" width="332" height="186" data-loaded="true">
    <span class="duracion">
    26:41
  </span>
*/
function parseListResponse(html) {
    try {
        var items = [];
        var cleanHtml = html.replace(/<!--[\s\S]*?-->/g,""); // Xóa comment[cite: 5]
        
        // Bóc chính xác thẻ <a> và thẻ <img> nằm bên trong cụm class="thumb-video"
        var regex = /div class="thumb-video[^>]*>[\s\S]*?href="([^"]+)"[\s\S]*?<img\s+alt="([^"]+)"[\s\S]*?src="(http[^"]+)"/gi;
        var match;
        
        while ((match = regex.exec(cleanHtml)) !== null) {
            var id = match[1].trim();
            var title = match[2].trim();
            var limg = match[3].trim();
            
            items.push({
                "id": id,          
                "title": title, 
                "posterUrl": limg,
                "backdropUrl": limg
            });
        }

        var currentPage = 1;
        var totalPages = 1;

        if (cleanHtml) {
            var currentMatch = cleanHtml.match(/btn-pagination--selected[^>]*>(\d+)<\/a>/i);
            //var maxMatch = cleanHtml.match(/<a[^>]*>(\d+)<\/a>\s*<\/li>\s*<li[^>]*class="[^"]*next/i);
			var maxMatch = cleanHtml.match(/results__search--videos[\s\S]*?count-results[\s\S]*?(\d+)/i);
			
            if (currentMatch && currentMatch[1]) {
                currentPage = parseInt(currentMatch[1], 10);
            }
            if (maxMatch && maxMatch[1]) {
                var totalPage = parseInt(maxMatch[1], 10);
                var totalPages = Math.floor(totalPage / 56)
            }
            else{
            	var maxMatch = cleanHtml.match(/count-results[\s\S]*?(\d+)/i);
            	if (maxMatch && maxMatch[1]) {
                	var totalPage = parseInt(maxMatch[1], 10);
                	var totalPages = Math.floor(totalPage / 56)
          	  }	
			}
        }

        return JSON.stringify({
            "items": items,
            "pagination": { 
                "currentPage": currentPage, 
                "totalPages": 10,    
                "totalItems":  56 * totalPages,
                "itemsPerPage": 56
            }
        });
    } catch (e) {
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html,$url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
	// <link rel="canonical" href="https://www.superporn.com/video/japanese-and-german-girls-massage-each-other-s-giant-boobs">
    var rmatch = html.match(/link\srel="canonical"[\s\S]*?href="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:image"\s+content="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:title"\s+content="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+property="og:description"\s+content="([\s\S]*?)"/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
    var $link = "";
    var serverMatches = html.match(/<video[^>]*>[\s\S]*?\bsrc=["']([^"']+)["']/i);
    if (serverMatches && serverMatches[1]) {
      $link = serverMatches[1]
    }

     
    return JSON.stringify({
        id: $url,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes + "\r\n" + $link  + "#video.m3u8",
        servers: [
            {
                name: "Full",
                episodes: [
                    { id: $link  + "#video.m3u8", name: "Full", slug: "" }
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

function parseDetailResponse(html, url) {
  try {
    return JSON.stringify({
      "url": "",
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

function parseCategoriesResponse(html) { return "[]"; }
function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
