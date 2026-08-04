var BASEURL = "https://www.trannymovs.com";
function getManifest() {
    return JSON.stringify({
        "id": "trannymovs",          
        "name": "Trannymovs",
        "description": "XXX dành cho người có sở thích đặc biệt",
        "version": "1.6",             
        "baseUrl": "https://www.trannymovs.com",
        "iconUrl": "https://cdn1.tranny.one/trannystatic/v30/common/lib-tr/img/logo-2x.png", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}
// https://www.trannymovs.com/latest-updates/2/
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/latest-updates/", "title": "Hàng Mới", "type": "Grid" }
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
// =============================================================================
// https://www.trannymovs.com/latest-updates/2/
// https://www.trannymovs.com/categories/ladyboy/21/
// https://www.trannymovs.com/search/blacked/

// https://www.trannymovs.com/latest-updates/2/
// https://www.trannymovs.com/categories/ladyboy/21/
// https://www.trannymovs.com/search/blacked/

function getUrlList(slug, filtersJson) {
    try {
        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if (slug && slug.indexOf("http") > -1 || slug.indexOf("search") > -1) {
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
        
        
        // 4. Chuẩn hóa path (Xóa dấu gạch chéo thừa ở đầu/cuối để tránh nhân đôi dấu //)        
        // 5. Nối chuỗi URL kết quả
        let resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        // https://www.tranny.one/recent/?mix=true&pageId=2&_=1783573720196
        if (page > 1) {
            resultUrl += page + "/";
        }
        
        // Trả về kết quả, chỉ gộp dấu // ở phần path, giữ nguyên https://
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
        
    } catch (e) {
        // console.log("Lỗi hệ thống: " + e.message);
        // Trả về URL gốc an toàn nếu có lỗi
        let fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}
// https://www.trannymovs.com/latest-updates/2/
// https://www.trannymovs.com/categories/ladyboy/21/
// https://www.trannymovs.com/search/blacked/

//BASEURL = "https://www.trannymovs.com";
//filtersJson = '{"page":5,"category":[{"slug":"/categories/ladyboy/","name":"ladyboy"}]}';
//filtersJson = '{"page":13}';
//console.log(getUrlList("/latest-updates/", filtersJson));



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
        //.thumb_rel item
        // 
        var regexList = `
class=["']item[^"']+["'][\\s\\S]*?
href="([^"']+)"[\\s\\S]*?
title=["']([^"']+)["'][\\s\\S]*?
data-webp=["']([^"']+)["']
`;
        regexList = regexList.replace(/\r|\n|\t/g, "");
        regmath = new RegExp(regexList, "g");
        var matchList;
        // regexList.exec(html)
        while ((matchList = regmath.exec(html)) !== null) {
            if (matchList[1] && matchList[1].indexOf("http") > -1) {
                var cleanThumb = matchList[3].replace(/&amp;/g, '&');
                // var imgorigin = matchList[0].match(/data-webp=["']([^"']+)["']/i);
                //if(imgorigin && imgorigin[1]){
                //   cleanThumb = imgorigin[1];
                //}
                
                items.push({
                    "id": matchList[1],
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
//var html = $("html")[0].outerHTML;
//var regexList = /class=["']item[^"']+["'][\s\S]*?href="([^"']+)"[\s\S]*?title=["']([^"']+)["'][\s\S]*?src=["']([^"']+)["']/g;
//var math = html.match(regexList)
//math
//regmath.exec(html)
//JSON.parse(parseListResponse(html));
// Bỏ dấu / ở đầu chuỗi


function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html,$url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var streamUrl = ""; // ĐÃ SỬA: Khai báo rõ ràng biến streamUrl tránh lỗi Global leak

    var rmatch = html.match(/link\s+rel="canonical"\s+href=["']([^"]+)["']/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1] }

    rmatch = html.match(/property=["']og:image["']\s+content=["']([^"]+)["']/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/<title>([^<]+)/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+name=["']description["']\s+content=["']([^"]+)["']/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
    //
    var $stream = "";
    var epi = [];
    var $linkURL = html.match(/video_url[^"']+'([^"']+)'/i);
    if ($linkURL && $linkURL[1]) {
      $stream = $linkURL[1];
      epi.push({ id: $stream + "#video.m3u8", name: "Xem Ngay", slug: "full" });
    }

    return JSON.stringify({
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
    });
}
//BASEURL = "https://www.justporn.com";
//var html = $("html")[0].outerHTML;
//var $url = "https://www.justporn.com/video/18058/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseMovieDetail(html,$url))

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
/categories/ladyboy/@@Ladyboy
/categories/teen-18/@@Teen 18+
/categories/shemale/@@Shemale
/categories/threesome/@@Threesome
/categories/tranny/@@Tranny
/categories/beauty/@@Beauty
/categories/big-ass/@@Big Ass
/categories/big-boobs/@@Big Boobs
/categories/big-cock/@@Big Cock
/categories/anal/@@Anal
/categories/60-fps/@@60 FPS
/categories/amateur/@@Amateur
/categories/anal-orgasm/@@Anal Orgasm
/categories/animation/@@Animation
/categories/arab/@@Arab
/categories/asian/@@Asian
/categories/babe/@@Babe
/categories/bareback/@@Bareback
/categories/bbc/@@BBC
/categories/bbw/@@BBW
/categories/bdsm/@@BDSM
/categories/bisexual/@@Bisexual
/categories/black-ebony/@@Black & Ebony
/categories/blonde/@@Blonde
/categories/blowjob/@@Blowjob
/categories/brazilian/@@Brazilian
/categories/brunette/@@Brunette
/categories/bukkake/@@Bukkake
/categories/casting/@@Casting
/categories/compilation/@@Compilation
/categories/creampie/@@Creampie
/categories/crossdressing/@@Crossdressing
/categories/cumshot/@@Cumshot
/categories/deepthroat/@@Deepthroat
/categories/domination/@@Domination
/categories/double-penetration/@@Double Penetration
/categories/fetish/@@Fetish
/categories/fisting/@@Fisting
/categories/futa/@@Futa
/categories/gangbang/@@Gangbang
/categories/girl-fucks-tranny/@@Girl Fucks Tranny
/categories/gloryhole/@@Gloryhole
/categories/granny/@@Granny
/categories/group-sex/@@Group Sex
/categories/guy-fucks-tranny/@@Guy Fucks Tranny
/categories/handjob/@@Handjob
/categories/hardcore/@@Hardcore
/categories/hd-porn/@@HD Porn
/categories/homemade/@@Homemade
/categories/interracial/@@Interracial
/categories/latina/@@Latina
/categories/lingerie/@@Lingerie
/categories/massage/@@Massage
/categories/masturbation/@@Masturbation
/categories/mature/@@Mature
/categories/milf/@@MILF
/categories/orgy/@@Orgy
/categories/outdoor/@@Outdoor
/categories/petite/@@Petite
/categories/pissing/@@Pissing
/categories/pornstar/@@Pornstar
/categories/pov/@@POV
/categories/public/@@Public
/categories/redhead/@@Redhead
/categories/rimming/@@Rimming
/categories/self-sucking/@@Self Sucking
/categories/sissy/@@Sissy
/categories/small-cock/@@Small Cock
/categories/small-tits/@@Small Tits
/categories/solo-tranny/@@Solo Tranny
/categories/squirt/@@Squirt
/categories/striptease/@@Striptease
/categories/tattoo/@@Tattoo
/categories/tranny-fucks-girl/@@Tranny Fucks Girl
/categories/tranny-fucks-guy/@@Tranny Fucks Guy
/categories/tranny-fucks-tranny/@@Tranny Fucks Tranny
/categories/vintage/@@Vintage
/categories/vr/@@VR
/categories/webcam/@@Webcam
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
