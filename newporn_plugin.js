BaseURL = "https://www.18porn.sex";

function getManifest() {
    return JSON.stringify({
        "id": "newporn",          
        "name": "18porn",
        "description": "Nguồn xem phim XXX ổn định",
        "version": "1.3.4",             
        "baseUrl": "https://www.18porn.sex",
        "iconUrl": "https://raw.githubusercontent.com/alokillgtv-gif/VAXAPPSCRIPT/main/img/18porn.jpg", 
      "info":"Nguồn phim chất lượng 4K nên load hơi lâu, bạn chịu khó đợi tí nha.",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
 return JSON.stringify([
  { slug: 'new/', title: 'Hàng Mới', type: 'Grid' }
 ]);
}
//"/search/" + encodeURIComponent(keyword);
function getPrimaryCategories() {
 return JSON.stringify([
  { name: 'Vú Bự', slug: 'categories/big-tits/' },
  { name: 'Xinh Đẹp', slug: 'categories/beuatiful/' },
  { name: 'Châu Á', slug: 'categories/asian/' },
  { name: 'Chơi 3', slug: 'categories/threesome/' },
  { name: 'Lỗ Nhị', slug: 'categories/anal/' },
  { name: 'Black', slug: '/search/black/' },
  { name: 'Clip Hay', slug: 'best/' }
 ]);
}

function getFilters() {
 return JSON.stringify({
  "sort": [
   { "name": "Mới nhất", "value": "newest" }
  ]
 });
}


function getUrlList(slug, filtersJson) {
    try {
        // Tương thích linh hoạt với cả BaseURL lẫn BASEURL
        var baseUrl = typeof BaseURL !== 'undefined' ? BaseURL : (typeof BASEURL !== 'undefined' ? BASEURL : "");
        var baseUrlClean = baseUrl.replace(/\/+$/, "");

        var page = 1;
        var path = slug || "";

        // 1. Cố gắng parse JSON an toàn (xử lý cả key không ngoặc kép và dấu phẩy thừa)
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                // Nếu không truyền slug trực tiếp, lấy category từ JSON
                if (!slug && filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        // 2. Nếu path đã là URL tuyệt đối (chứa http:// hoặc https://)
        if (/^https?:\/\//i.test(path)) {
            path = path.replace(/\/+$/, "");
            if (page > 1) {
                return (path + "/" + page).replace(/([^:]\/)\/+/g, "$1");
            } else {
                return (path + "/").replace(/([^:]\/)\/+/g, "$1");
            }
        }

        // 3. Xử lý đường dẫn tương đối
        if (!path) return baseUrlClean + "/";

        path = path.replace(/^\/+|\/+$/g, "");
        var targetUrl = baseUrlClean + "/" + path;

        if (page > 1) {
            targetUrl += "/" + page;
        } else {
            if (path.indexOf("?") !== 0) {
                targetUrl += "/";
            }
        }

        return targetUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log(e);
        var fallbackBase = typeof BaseURL !== 'undefined' ? BaseURL : (typeof BASEURL !== 'undefined' ? BASEURL : "");
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = fallbackBase + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var baseUrl = typeof BaseURL !== 'undefined' ? BaseURL : (typeof BASEURL !== 'undefined' ? BASEURL : "");
        var baseUrlClean = baseUrl.replace(/\/+$/, "");

        var page = 1;

        // 1. Cố gắng parse JSON an toàn để lấy thông tin trang (page)
        if (filtersJson) {
            var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        // 2. Tạo URL tìm kiếm theo cấu trúc /search/keyword/ hoặc /search/keyword/page
        var encodedKeyword = encodeURIComponent(keyword || "");
        var targetUrl = baseUrlClean + "/search/" + encodedKeyword;

        if (page > 1) {
            targetUrl += "/" + page + "/";
        } else {
            targetUrl += "/";
        }

        return targetUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log(e);
        var fallbackBase = typeof BaseURL !== 'undefined' ? BaseURL : (typeof BASEURL !== 'undefined' ? BASEURL : "");
        var fallback = fallbackBase + "/search/" + encodeURIComponent(keyword || "") + "/";
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlDetail(slug) {
 if (!slug) return "";
 if (slug.indexOf('http') === 0) return slug;
 return BaseURL + "/" + slug;
}

function getUrlCategories() { return BaseURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }


// =============================================================================
// PARSERS - 18 PORN
// =============================================================================

function parseListResponse(html) {
 try {
  var items = [];
  var pattern = /(?=<div[^>]*class="[^"]*item[^"]*")/g;
  var splitItems = html.split(pattern).filter(Boolean);
  
  for (var j = 1; j < splitItems.length; j++) {
   var block = splitItems[j];
   var hrefMatch = block.match(/href="([^"]+)"/i);
   if (!hrefMatch) continue;
   
   var id = hrefMatch[1].trim().replace("/ttt/click?url=","");
   var title = "";
   
   var altMatch = block.match(/title="([^"]+)"/i);
   if (altMatch) {
    title = altMatch[1].trim();
   } else {
    var labelMatch = block.match(/alt="([^"]+)"/i); 
    title = labelMatch ? labelMatch[1].trim() : "";
   }
   
   if (!title || title === "Video không tiêu đề") {
    continue;
   }
   
   var srcMatch = block.match(/data-src="([^"]+)"/i);
   var posterUrl = srcMatch ? srcMatch[1].trim() : "";
   
   items.push({
    "id": id,
    "title": title,
    "posterUrl": posterUrl,
    "backdropUrl": posterUrl
   });
  }
  
  let currentPage = 1;
  let currentMatch = html.match(/class="page-current"[^>]*>\s*<span>\s*(\d+)/i);
  if (currentMatch) {
    currentPage = parseInt(currentMatch[1], 10);
  }
  
  let lastPage = 1;
  let lastMatch = html.match(/class="last"[^>]*>\s*<a\s+href="[^"]*\/(\d+)\/"/i);
  if (lastMatch) {
    lastPage = parseInt(lastMatch[1], 10);
  }
  
  return JSON.stringify({
   items: items,
   pagination: {
    currentPage: currentPage,
    totalPages: lastPage,
    totalItems: items.length * lastPage,
    itemsPerPage: items.length
   }
  });
 } catch (error) {
  return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
 }
}

function parseSearchResponse(html) {
 return parseListResponse(html);
}

function parseMovieDetail(html,url) {
 var limg = "";
 var lname = "Đang cập nhật...";
 var ldes = "Không có mô tả.";
 var year = 2026;
 var direc = "????";
 var cast = "????";
 var status = "????";
 var duration = "1:09:00 | 16 | 16";
 var servers = [];
 var categories = "????";
 
 try {
  let rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (rmatch && rmatch[1]) { limg = rmatch[1]; }
  
  rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
  if (rmatch && rmatch[1]) { lname = rmatch[1]; }
  
  rmatch = html.match(/meta\s+property="og:description"\s+content="([^"]+)"/i);
  if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
  
  rmatch = html.match(/class="item"[\s\S]*?Models:([\s\S]*?)<\/div>/i);
  if (rmatch && rmatch[1]) { cast = rmatch[1].trim().replace(/<[^>]*>|\r|Models:/g, "").replace(/\n+/g, ", "); }
  
  rmatch = html.match(/Duration:[\s\S]*?em>([\s\S]*?)<\/em>/i);
  if (rmatch && rmatch[1]) { duration = rmatch[1].trim().replace("min", "phút").replace("sec", "giây"); }
  
  var elink = "";
  var dlink = "";
  
  rmatch = html.match(/video_id[\s\S]*?\'(\d+)\'/);
  if (rmatch && rmatch[1]) { 
   var idvideo = rmatch[1].trim();
   elink = BaseURL + "/embed/" + idvideo;
  }
  
  rmatch = html.match(/video_url:\s*['"](https:\/\/[^'"]+)['"]/i);
  if (rmatch && rmatch[1]) { 
   dlink = rmatch[1].trim(); 
  }
  
  // SỬA ĐÚNG CHUẨN: Tách thành 2 Server riêng biệt để người dùng chọn nguồn
  servers = [
    {
     name: "Server",
     episodes: [{ id: dlink + "#video.m3u8", name: "Xem Ngay", slug: "full" }]
    }
  ];

  return JSON.stringify({
   id: url,
   title: lname,
   originName: lname || "",
   posterUrl: limg,
   backdropUrl: limg,
   description: ldes,
   year: year,
   quality: "HD",
   duration: duration || "",
   servers: servers,
   category: categories,
   director: direc,
   casts: cast,
   status: status || ""
  });
  
 } catch (error) {
  return "null";
 }
}

/**
 * SỬA ĐÚNG CHUẨN: Trả về trực tiếp đường dẫn ID truyền vào để phát video
 */

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
  return JSON.stringify({
   "url": "",
   "headers": {}
  });
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
new/@@Mới Nhất
categories/dildo/@@Dildo
categories/blonde/@@Blonde
categories/small-tits/@@Small Tits
categories/stockings/@@Stockings
categories/brunette/@@Brunette
categories/beuatiful/@@Beautiful
categories/solo/@@Solo
categories/masturbation/@@Masturbation
categories/lesbian/@@Lesbian
categories/blowjob/@@Blowjob
categories/hairy-pussy/@@Hairy Pussy
categories/redhead/@@Redhead
categories/latina/@@Latina
categories/asian/@@Asian
categories/creampie/@@Creampie
categories/fisting/@@Fisting
categories/cumshot/@@Cumshot
categories/threesome/@@Threesome
categories/big-tits/@@Big Tits
categories/cum-in-mouth/@@Cum In Mouth
categories/anal/@@Anal
categories/cum-on-face/@@Cum On Face
categories/striptease/@@Striptease
categories/webcam/@@Webcam
categories/outdoors/@@Outdoors
categories/amateur/@@Amateur
categories/toys/@@Toys
categories/teen/@@Teen
categories/pussy-licking/@@Pussy Licking
categories/shaved-pussy/@@Shaved Pussy
categories/group/@@Group
categories/hardcore/@@Hardcore
categories/rimming/@@Rimming
categories/interracial/@@Interracial
categories/old-and-young/@@Old and Young
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

function trimHTML(inhtml) {
 var result = inhtml.replace(/<[^>]*>/g, '');
 result = result.replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\n|\r/gi, ' - ')
  .replace(/\s+/gi, ' ')
  .replace(/^,+|,+$/g, "");
 return result;
}