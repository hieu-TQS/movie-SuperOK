var BASEURL = "https://www.tranny.one";
function getManifest() {
    return JSON.stringify({
        "id": "trannyone",          
        "name": "Tranny One",
        "description": "XXX dành cho người có sở thích đặc biệt",
        "version": "2.3.5",             
        "baseUrl": "https://www.tranny.one",
        "iconUrl": "https://cdn1.tranny.one/trannystatic/v30/common/lib-tr/img/logo-2x.png", 
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}
// https://www.tranny.one/recent/
// https://www.tranny.one/c2096/shemale-anal/?mix=true&pageId=4&_=1783573037242
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/recent/", "title": "Hàng Mới", "type": "Grid" }
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
// https://www.tranny.one/c2096/shemale-anal/?mix=true&pageId=4
// https://www.tranny.one/search/blacked/?mix=true&pageId=5
// https://www.tranny.one/recent/?mix=true&pageId=2&_=1783573720196

function getUrlList(slug, filtersJson) {
    try {
        // 1. Kiểm tra nếu slug là link tuyệt đối (chứa http) và không có bộ lọc thì trả về luôn
        if (slug && slug.indexOf("http") > -1) {
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
            resultUrl += "?mix=true&pageId=" + page;
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


// --- KHU VỰC TEST CÁC TRƯỜNG HỢP ---
// https://www.tranny.one/c2096/shemale-anal/?mix=true&pageId=4
// https://www.tranny.one/search/blacked/?mix=true&pageId=5
// https://www.tranny.one/recent/?mix=true&pageId=2&_=1783573720196
//BASEURL = "https://www.tranny.one";
//filtersJson = '{"page":5,"category":[{"slug":"/c2096/shemale-anal/","name":"anal"}]}';
//filtersJson = '{"page":13}';
//console.log(getUrlList("/search/blacked/", filtersJson));



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
        var regexList = /class=["'][^"']+movie-[\s\S]*?href="([^"']+)"[\s\S]*?alt="([^"']+)"[\s\S]*?src="([^"']+)"/g;
        var matchList;
        // regexList.exec(html)
        while ((matchList = regexList.exec(html)) !== null) {
            if (matchList[1] && matchList[1].indexOf("http") > -1) {	
                var cleanThumb = matchList[3].replace(/&amp;/g, '&');
                var fullblock = matchList[0].match(/data-src=["']([^"']+)"/i);
                if(fullblock && fullblock[1]){
cleanThumb = fullblock[1];
                }
                
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
//var regexList = /class=["'][^"']+movie-[\s\S]*?href="([^"']+)"[\s\S]*?alt="([^"']+)"[\s\S]*?src="([^"']+)"/g;
//var math = html.match(regexList)
//math
//regexList.exec(html)
//JSON.parse(parseListResponse(html))


function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html,$url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var streamUrl = ""; // ĐÃ SỬA: Khai báo rõ ràng biến streamUrl tránh lỗi Global leak

    var rmatch = html.match(/link\s+rel="canonical"\s+href="([^"]+)"/i);
    if (rmatch && rmatch[1]) { lurl = rmatch[1].replace("https://xhamster.com", BASEURL); }

    rmatch = html.match(/rel=["']preload["'][^>]+as=["']image["'][^>]+href=["']([^"']+)["']/i);
    if (rmatch && rmatch[1]) { limg = rmatch[1]; }

    rmatch = html.match(/<title>([^<]+)/i);
    if (rmatch && rmatch[1]) { lname = rmatch[1]; }

    rmatch = html.match(/meta\s+name="description"\s+content="([^"]+)"/i);
    if (rmatch && rmatch[1]) { ldes = rmatch[1]; }
    
    var episodes = [];
    var mathser = html.match(/videoContainer[^>]+data-low=["']([^"']+)["'][^>]+data-high=["']([^"']+)["']/i)
    if (mathser && mathser[1]) {
      episodes.push({
        id: mathser[1] + "#video.m3u8",
        name: "Độ Phân Giải Cao",
        slug: "full"
      });
    }
    if (mathser && mathser[2]) {
      episodes.push({
        id: mathser[2] + "#video.m3u8",
        name: "Độ Phân Giải Thấp",
        slug: "full"
      });
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
                episodes: episodes
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
// var flashvars = {

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
function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

function getLISTmenu() {
    return `
/c2047/asian-ladyboys/@@Asian Ladyboy
/c2096/shemale-anal/@@Anal
/c2061/asian/@@Asian
/c2094/black/@@Black
/c2106/amateur-trans/@@Amateur
/c2100/hardcore/@@Hardcore
/c2052/big-tits/@@Big Tits
/c2081/big-cock/@@Big Cock
/c2381/sissy-femboy-porn/@@Sissy
/c2097/tits/@@Tits
/c2062/threesome/@@Threesome
/c2060/interracial/@@Interracial
/c2063/masturbation/@@Masturbation
/c2050/stockings/@@Stockings
/c2064/bareback/@@Bareback
/c2059/lingerie/@@Lingerie
/c2147/crossdressing/@@Crossdressing
/c2199/cum-in-mouth/@@Cum In Mouth
/c2095/creampie/@@Creampie
/c2042/shemales-fuck-guys/@@Shemales with Guys
/c2048/shemales - fuck - girls / @ @Shemales with Girls /
    c2049 / shemales - fuck - shemales / @ @Shemale with Shemale
/c2110/ebony/@@Ebony
/c2103/bdsm/@@BDSM
/c2067/small-tits/@@Small Tits
/c2115/homemade/@@Homemade
/c2043/black-trannies/@@Black Trannies
/c2123/mature/@@Mature
/c2099/teen/@@Teen(18 + )
/c2201/big-ass/@@Big Ass
/c2105/japanese/@@Japanese
/c2085/tattoo/@@Tattoo
/c2157/futanari/@@Futanari
/c2101/milf/@@Milf
/c2054/shemale-domination/@@Shemale Domination
/c2046/gorgeous-shemales/@@Gorgeous Shemales
/c2198/cum-compilation/@@Cum Compilation
/c2104/riding/@@Riding
/c2133/blowjobs/@@Blowjobs
/c2077/toys/@@Toys
/c2058/outdoor/@@Outdoor
/c2088/big-dick/@@Big Dick
/c2053/webcams/@@Webcams
/c2129/fetish/@@Fetish
/c2300/babes/@@Babes
/c2044/group-sex/@@Group Sex
/c2080/massage/@@Massage
/c2068/blondes/@@Blondes
/c2203/brazilian/@@Brazilian
/c2253/shemale-compilations/@@Shemale Compilations
/c2057/teen-trannies/@@Teen Trannies(18 + )
/c2078/skinny/@@Skinny
/c2200/foot-fetish/@@Foot Fetish
/c2213/doggy-style/@@Doggy Style
/c2194/indian/@@Indian
/c2171/bedroom/@@Bedroom
/c2122/chubby/@@Chubby
/c2091/public/@@Public
/c2086/double-penetration/@@Double Penetration
/c2168/kissing/@@Kissing
/c2118/cumshots/@@Cumshots
/c2208/gang-bang/@@Gang Bang
/c2045/latina-trannies/@@Latina Trannies
/c2074/latex/@@Latex
/c2260/thai/@@Thai
/c2117/pussy/@@Pussy
/c2143/pissing/@@Pissing
/c2120/white/@@White
/c2167/vintage/@@Vintage
/c2189/femdom/@@Femdom
/c2223/ass-to-mouth/@@Ass To Mouth
/c2232/3 d-futanari/@@3D Futanari
/c2318/cum-swallowing/@@Cum Swallowing
/c2193/chinese/@@Chinese
/c2155/european/@@European
/c2121/pornstars/@@Pornstars
/c2246/pussy-licking/@@Pussy Licking
/c2132/russian/@@Russian
/c2140/foursome/@@Foursome
/c2144/bondage/@@Bondage
/c2072/fishnet/@@Fishnet
/c2237/cosplay/@@Cosplay
/c2163/german/@@German
/c2153/fisting/@@Fisting
/c2314/high-heels/@@High Heels
/c2145/anime/@@Anime
/c2146/hentai/@@Hentai
/c2212/solo-girls/@@Solo Girls
/c2179/colombian/@@Colombian
/c2188/bukkake/@@Bukkake
/c2127/fingering/@@Fingering
/c2112/party/@@Party
/c2102/petite/@@Petite
/c2070/uniform/@@Uniform
/c2291/granny/@@Granny
/c2268/face-sitting/@@Face Sitting
/c2149/kitchen/@@Kitchen
/c2270/cuckold/@@Cuckold
/c2107/pantyhose/@@Pantyhose
/c2134/british/@@British
/c2209/brunettes/@@Brunettes
/c2051/office/@@Office
/c2230/panties/@@Panties
/c2202/ass-licking/@@Ass Licking
/c2073/bathroom/@@Bathroom
/c2154/smoking/@@Smoking
/c2087/glasses/@@Glasses
/c2137/brazil/@@Brazil
/c2329/humiliation/@@Humiliation
/c2224/facials/@@Facials
/c2172/beach/@@Beach
/c2098/babysitter/@@Babysitter
/c2113/french/@@French
/c2247/piercing/@@Piercing
/c2225/redheads/@@Redheads
/c2191/dildos/@@Dildos
/c2114/shower/@@Shower
/c2084/sex-orgy/@@Sex Orgy
/c2176/italian/@@Italian
/c2190/handjobs/@@Handjobs
/c2341/mistress/@@Mistress
/c2185/latinas/@@Latinas
/c2187/sport/@@Sport
/c2119/bikini/@@Bikini
/c2214/nipples/@@Nipples
/c2205/prison/@@Prison
/c2065/tanned/@@Tanned
/c2166/reality/@@Reality
/c2344/mexican/@@Mexican
/c2207/deep-throat/@@Deep Throat
/c2306/funny/@@Funny
/c2128/school/@@School
/c2195/casting/@@Casting
/c2296/glamour/@@Glamour
/c2076/nurses/@@Nurses
/c2226/pick-up/@@Pick up
/c2196/nylon/@@Nylon
/c2164/oiled/@@Oiled
/c2108/boots/@@Boots
/c2055/strapon/@@Strapon
/c2243/shemale-pmv/@@Shemale PMV
/c2382/cougars/@@Cougars
/c2160/gagging/@@Gagging
/c2159/spanish/@@Spanish
/c2340/medical/@@Medical
/c2204/czech/@@Czech
/c2175/footjob/@@Footjob
/c2227/shorts/@@Shorts
/c2220/assholes/@@Assholes
/c2126/girlfriends/@@Girlfriends
/c2289/korean/@@Korean
/c2258/cum-on-tits/@@Cum on Tits
/c2261/punishment/@@Punishment
/c2197/fucking-machines/@@Fucking Machines
/c2238/shemale-cartoons/@@Shemale Cartoons
/c2342/prostate/@@Prostate
/c2335/pregnant/@@Pregnant
/c2083/christmas/@@Christmas
/c2333/air-hostesses/@@Air Hostesses
/c2165/toilet/@@Toilet
/c2234/maids/@@Maids
/c2093/glory-hole/@@Glory Hole
/c2082/xxl-dildos/@@XXL dildos
/c2345/braces/@@Braces
/c2323/upskirt/@@Upskirt
/c2148/club/@@Club
/c2357/canadian/@@Canadian
/c2066/bodystocking/@@BodyStocking
/c2262/forest/@@Forest
/c2150/spanking/@@Spanking
/c2152/butts/@@Butts
/c2321/amateur-bdsm/@@Amateur BDSM
/c2178/cheerleaders/@@Cheerleaders
/c2174/whores/@@Whores
/c2273/closeups/@@Closeups
/c2229/gonzo/@@Gonzo
/c2228/locker-room/@@Locker Room
/c2183/striptease/@@Striptease
/c2249/3 d-comics/@@3D Comics
/c2216/cock-selfies/@@Cock selfies
/c2390/ashemaletube/@@Ashemaletube
/c2397/shemalez/@@Shemalez
/c2391/tgtube/@@Tgtube
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