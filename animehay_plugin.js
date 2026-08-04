var BASEURL = "https://animehay09.site"; 
// https://www.whoreshub.com/categories/4k-porn/
function getManifest() {
    return JSON.stringify({
      "id": "animehay",
      "name": "Nguồn Animehay",
      "description": "Anime siêu hay.",
      "version": "1.0.2",
      "info": "Nguồn phim anime chất lượng cao. Cập nhật khá nhanh.",
      "baseUrl": "https://animehay09.site",
      "iconUrl": "https://animehay09.site/themes/img/logo.png",
      "isEnabled": true,
      "type": "MOVIE",
      "playerTpye": "exoplayer"
    })
};

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("["+BASEURL+"] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("["+BASEURL+"] " + msg);
    }
}

function getHomeSections() {
    var listurl = '[{\"link\":\"/phim-moi-cap-nhap/tat-ca-1.html\",\"name\":\"Phim Mới\"}]';
    var menulist = buildMenu(listurl, true);
    return JSON.stringify(menulist);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}



function getFilterConfig() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl,"filter");
    return JSON.stringify({
        category: menulist
    });
}

// =============================================================================
// HELPER: CURSOR BASE64 ENCODE / DECODE
// =============================================================================
function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }

        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            var fixedJson2 = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
            try {
                var filters = JSON.parse(fixedJson2);
                page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var resultUrl = BASEURL;
        if (path) {
            resultUrl += path;
        }
        if (page > 1) {
            resultUrl += "/trang-" + page + ".html";
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        console.log(e);
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var fallback = BASEURL + (slug ? "/" + slug : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    if (filtersJson) {
        var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':');
        try {
            var filters = JSON.parse(fixedJson);
            var page = parseInt(filters.page) || 1;
            if (page > 1) {
                return BASEURL + "/tim-kiem/trang-" + page + ".html?keyword=" + keyword;
            } else {
                return BASEURL + "/tim-kiem/?keyword=" + encodeURIComponent(keyword);
            }
        } catch (jsonErr) {
            return BASEURL + "/tim-kiem/?keyword=" + encodeURIComponent(keyword);
        }
    }
}
/*
// https://animehay09.site/tim-kiem/trang-3.html?keyword=girl
// https://animehay09.site/phim-moi-cap-nhap/tat-ca-1.html
// https://animehay09.site/lich-su
// https://animehay09.site/the-loai/hanh-dong-2.html
// https://animehay09.site/the-loai/hanh-dong-2.html/trang-5.html
var BASEURL = "https://animehay09.site";
var filtersJson = '{page:2}';
console.log(getUrlList("/phim-moi-cap-nhap/tat-ca-1.html", filtersJson));
//console.log(getUrlSearch("the boy"))
*/

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

function fixHref(href) {
    if (!href) return '';

    // 1. Loại bỏ khoảng trắng thừa ở đầu và cuối
    let cleanHref = href.trim();

    // 2. Các mẫu đường dẫn cần bỏ qua (không gắn thêm BASEURL)
    const ignorePattern = /^(#|https?:\/\/|\/\/|mailto:|tel:|javascript:|data:|blob:)/i;

    if (ignorePattern.test(cleanHref)) {
        return cleanHref;
    }

    // 3. Xử lý trường hợp đường dẫn bắt đầu bằng dấu / (server-relative path)
    if (cleanHref.startsWith('/')) {
        try {
            const urlObj = new URL(BASEURL);
            return urlObj.origin + cleanHref;
        } catch (e) {
            return BASEURL + cleanHref;
        }
    }

    // 4. Đường dẫn tương đối thông thường
    return BASEURL + cleanHref;
}


function parseListResponse(html, $url) {
    try {
        var items = [];
        _$(html).find(".mc").each(function() {
            var href = this.find("a").attr("href");
            href = fixHref(href);
            var title = this.find("a").attr("title");
            var src = this.find("img").attr("src");
            src = fixHref(src)

            var episode_current = this.find(".mc__ep-badge").text().trim();
            var quality = this.find(".mc__score").text().trim();

// Hàm kiểm tra URL có phải là link thật hay chứa mã JS rác
function isValidMediaUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    var cleanUrl = url.trim();

    // 1. Loại bỏ nếu dính chuỗi nối code JS, biến hoặc hàm (như _spEsc, +, ', ${...)
    if (cleanUrl.indexOf('_spEsc') > -1 || 
        cleanUrl.indexOf("'+") > -1 || 
        cleanUrl.indexOf("+'") > -1 || 
        cleanUrl.indexOf("${") > -1 ||
        cleanUrl.indexOf("javascript:") > -1) {
        return false;
    }

    // 2. Kiểm tra định dạng URL http/https hợp lệ (không chứa khoảng trắng, ngoặc đơn/kép, dấu +)
    var httpPattern = /^https?:\/\/[^\s"'<>+]+$/i;
    return httpPattern.test(cleanUrl);
}

// =============================================================================
// ĐOẠN XỬ LÝ TRONG HÀM PARSE CỦA BẠN
// =============================================================================

            if (isValidMediaUrl(href)) {
                var cleanThumb = (src || "").replace(/&amp;/g, '&').trim();
                
                // Đảm bảo cleanThumb cũng là link ảnh hợp lệ, nếu không có thì fallback
                if (cleanThumb && cleanThumb.indexOf('http') !== 0) {
                    cleanThumb = 'https:' + cleanThumb;
                }
            
                items.push({
                    "id": href.trim(),
                    "title": (title || "").trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb,
                    "quality": quality || "",
                    "lang": "",
                    "episode_current": episode_current || ""
                });
            }
        });

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": 1,
                "totalPages": 999
            }
        });
    } catch (e) {
        log("parseListResponse: " + e);
        return JSON.stringify({
            "items": [{
                "id": $url || "error_url",
                "title": "Lỗi: " + e,
                "posterUrl": "",
                "backdropUrl": ""
            }],
            "pagination": {
                "currentPage": 1,
                "totalPages": 1
            }
        });
    }
}

/*
var BASEURL = "https://animehay09.site/lich-su";
//var BASEAPI = "https://k8s.onflixcdn.com/api";
var htmlsource = $("#labHtmlEditorWrap #labHtmlTreeContainer .lab-dom-pure-text").html();
JSON.parse(parseListResponse(sourceHTML, BASEURL));
//var html = outerHTML;

*/



function parseSearchResponse(html, url) {
    return parseListResponse(html, url);
}
function parseMovieDetail(html, url) {
    try {
        // === BƯỚC 1: ĐỒNG NHẤT ID PHIM BẰNG REGEX META (Y hệt tác giả) ===
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(html) ||
            /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(html);
        var id = idMatch ? idMatch[1] : (url || "");

        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/_.]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/_.]+)/.exec(html);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // === BƯỚC 2: TRÍCH XUẤT THÔNG TIN PHIM ===
        var lurl = "";
        var limg = "";
        var lname = "Đang cập nhật...";
        var ldes = "Không có mô tả.";
        var ldirec = "";
        var lactor = "";
        var lduran = "";
        var status = "";
        var category = "";
        var episode_current = "";

        var rmatch = html.match(/meta\s+property="og:url"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lurl = rmatch[1];

        rmatch = html.match(/meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) limg = rmatch[1];

        if (limg.indexOf("//") === 0) {
            limg = "https:" + limg;
        } else if (limg.indexOf("http") === -1) {
            limg = BASEURL + limg;
        }
        rmatch = html.match(/meta\s+property="og:title"\s+content="([^"]+)"/i);
        if (rmatch && rmatch[1]) lname = rmatch[1];

        var ldes = _$(html).find("#aim-desc-content").text();
        var year = 2026;
        var extra = "";

        var rawText = _$(html).find(".aim-hero__meta").find("span:first").text();

        // 1. Dùng Regex lọc chính xác 4 chữ số năm (dạng 19xx hoặc 20xx)
        var match = rawText.match(/\b(19|20)\d{2}\b/);

        if (match) {
            // 2. Ép kiểu về Số Nguyên bằng parseInt với cơ số 10
            year = parseInt(match[0], 10);
        }

        // 3. Chốt chặn an toàn: Nếu parse thất bại (NaN), trả về năm mặc định
        if (isNaN(year)) {
            year = 2026;
        }
        status = _$(html).find(".aim-hero__meta").find(".aim-status--airing").text();

        var categoryResult = [];
        _$(html).find(".aim-cate-chip").each(function() {
            var link = this.attr("href") || this.find("a").attr("href");
            var name = this.text().replace(/\s+/g, ' ').trim();

            if (name && link) {
                var slug = typeof getSlug === 'function' ? getSlug(link) : link;
                categoryResult.push("[" + name + "](" + slug + ")");
            }
        });

        // THÊM DÒNG NÀY: Chuyển mảng thành Chuỗi nối nhau bằng dấu phẩy
        category = categoryResult.join(", ");

        episode_current = _$(html).find(".aim-hero__meta").find("span:last").text();

        var servers = [];
        var items = [];
        _$(html).find(".aim-ep-btn").each(function() {
            var link = this.attr("href");
            var name = this.attr("title");
            items.push({
                id: link,
                name: name,
                slug: name.replace(/[\s\S]*?(\d+)/, "tap-$1")
            })
        })
        servers.push({
            name: "Server",
            episodes: items
        })
        servers = sortEpisodesByName(servers);
        // === BƯỚC 5: TRẢ VỀ KẾT QUẢ ĐỒNG NHẤT ID ===
        return JSON.stringify({
            id: id, // BẮT BUỘC: ID phải là slug rút gọn của bộ phim để cả 2 lần fetch khớp nhau
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            quality: "HD",
            year: year,
            rating: 8.5,
            status: status,
            category: category,
            episode_current: episode_current,
            servers: servers, // Lần 1 (trang chi tiết) sẽ là []. Lần 2 (khi chạy qua extra) sẽ có đầy đủ tập
            duration: lduran || "",
            casts: lactor || "",
            director: ldirec || "",
            extra: extra // Lần 2 (trang xem phim) extra sẽ rỗng để dừng chu kỳ tải ngầm
        });

    } catch (e) {
        log("parseMovieDetail:" + e)
        return JSON.stringify({
            id: slug || url || "error",
            title: "error",
            servers: []
        });
    }
}

/*
// https://edge.narto-drama.com/e/rs/detail/watch/tro-choi-cong-so/9/refresh-source?lang=vi-VN


BASEURL = "https://animehay09.site";
var html = sourceHTML;
var $url = "https://animehay09.site/thong-tin-phim/tenkou-saki-no-seiso-karen-na-bishoujo-ga-4780.html";
JSON.parse(parseMovieDetail(sourceHTML, $url));
// https://edge.narto-drama.com/e/rs/detail/watch/tro-choi-cong-so/check-new-episodes?_t=1784684483895&_=1784684480875
//*/

function sortEpisodesByName(data) {
    if (!Array.isArray(data)) return data;

    data.forEach(function(server) {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort(function(a, b) {
                var nameA = a.name || '';
                var nameB = b.name || '';

                // Bắt chuỗi số đầu tiên xuất hiện trong tên (hỗ trợ cả số thập phân như 2.5)
                var matchA = nameA.match(/\d+(\.\d+)?/);
                var matchB = nameB.match(/\d+(\.\d+)?/);

                var numA = matchA ? parseFloat(matchA[0]) : null;
                var numB = matchB ? parseFloat(matchB[0]) : null;

                // 1. Nếu cả 2 đều tìm thấy số -> so sánh theo giá trị số
                if (numA !== null && numB !== null) {
                    if (numA !== numB) {
                        return numA - numB;
                    }
                }

                // 2. Nếu 1 bên có số, 1 bên không -> ưu tiên item có số đứng trước
                if (numA !== null) return -1;
                if (numB !== null) return 1;

                // 3. Nếu cả 2 không có số (hoặc số bằng nhau) -> sắp xếp tự nhiên theo chuỗi
                return nameA.localeCompare(nameB, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });
        }
    });

    return data;
}

function parseDetailResponse(html, url) {
    try {
        var script = _$(html).find("script:content('wp_servers')").html();
        var embed = script.match(/AHS["'][^"']+["']([^"']+)["']/i);
        var stream = "";
        if (embed && embed[1]) {
            stream = embed[1];
        }
        return JSON.stringify({
            "url": stream,
            "isEmbed": true, // Chuyển về false để ưu tiên ExoPlayer native
            //"mimeType": "application/x-mpegURL", // Dùng biến mimeType đã xử lý
            "headers": {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        log("stream error: " + e);
        return JSON.stringify({
            "url": "",
            "headers": {}
        });
    }
}

function parseEmbedResponse(html, url) {
    try {
        var linkstream = "";

        // Tìm link m3u8 ẩn trong mã nguồn của trang iframe
        var linkmatch = html.match(/(https?:\/\/[^"'\s]+\.(?:m3u8|mp4)[^"'\s]*)/i);
        if (linkmatch && linkmatch[1]) {
            linkstream = linkmatch[1].replace(/\\/g, "");
        }

        return JSON.stringify({
            url: linkstream,
            isEmbed: false, // Tắt Embed, ép VAX đẩy thẳng link cho ExoPlayer
            mimeType: linkstream.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4",
            headers: {
                "Referer": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (e) {
        log(e);
        return JSON.stringify({
            url: "",
            isEmbed: false
        });
    }
}
/*

BASEURL = "https://animehay09.site";
var html = sourceHTML;
//JSON.parse(parseDetailResponse(sourceHTML, BASEURL))
JSON.parse(parseEmbedResponse(sourceHTML, BASEURL))
// 'AHS': 'https://ahay.stream/embed-jw/75913'

*/


function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// /phim-moi-cap-nhap/tat-ca-1.html
// {\"link\":\"/phim-moi-cap-nhap/tat-ca-1.html\",\"name\":\"Phim Mới\"},
function getLISTmenu() {
    return `[{\"link\":\"/phim-moi-cap-nhap/tat-ca-1.html\",\"name\":\"Phim Mới\"},{\"link\":\"/the-loai/anime-1.html\",\"name\":\"Anime\"},{\"link\":\"/the-loai/hanh-dong-2.html\",\"name\":\"Hành động\"},{\"link\":\"/the-loai/hai-huoc-3.html\",\"name\":\"Hài hước\"},{\"link\":\"/the-loai/tinh-cam-4.html\",\"name\":\"Tình cảm\"},{\"link\":\"/the-loai/harem-5.html\",\"name\":\"Harem\"},{\"link\":\"/the-loai/bi-an-6.html\",\"name\":\"Bí ẩn\"},{\"link\":\"/the-loai/bi-kich-7.html\",\"name\":\"Bi kịch\"},{\"link\":\"/the-loai/gia-tuong-8.html\",\"name\":\"Giả tưởng\"},{\"link\":\"/the-loai/hoc-duong-9.html\",\"name\":\"Học đường\"},{\"link\":\"/the-loai/doi-thuong-10.html\",\"name\":\"Đời thường\"},{\"link\":\"/the-loai/vo-thuat-11.html\",\"name\":\"Võ thuật\"},{\"link\":\"/the-loai/tro-choi-12.html\",\"name\":\"Trò chơi\"},{\"link\":\"/the-loai/tham-tu-13.html\",\"name\":\"Thám tử\"},{\"link\":\"/the-loai/lich-su-14.html\",\"name\":\"Lịch sử\"},{\"link\":\"/the-loai/sieu-nang-luc-15.html\",\"name\":\"Siêu năng lực\"},{\"link\":\"/the-loai/shounen-16.html\",\"name\":\"Shounen\"},{\"link\":\"/the-loai/shounen-ai-17.html\",\"name\":\"Shounen AI\"},{\"link\":\"/the-loai/shoujo-18.html\",\"name\":\"Shoujo\"},{\"link\":\"/the-loai/shoujo-ai-19.html\",\"name\":\"Shoujo AI\"},{\"link\":\"/the-loai/the-thao-20.html\",\"name\":\"Thể thao\"},{\"link\":\"/the-loai/am-nhac-21.html\",\"name\":\"Âm nhạc\"},{\"link\":\"/the-loai/psychological-22.html\",\"name\":\"Psychological\"},{\"link\":\"/the-loai/mecha-23.html\",\"name\":\"Mecha\"},{\"link\":\"/the-loai/quan-doi-24.html\",\"name\":\"Quân đội\"},{\"link\":\"/the-loai/drama-25.html\",\"name\":\"Drama\"},{\"link\":\"/the-loai/seinen-26.html\",\"name\":\"Seinen\"},{\"link\":\"/the-loai/sieu-nhien-27.html\",\"name\":\"Siêu nhiên\"},{\"link\":\"/the-loai/phieu-luu-28.html\",\"name\":\"Phiêu lưu\"},{\"link\":\"/the-loai/kinh-di-29.html\",\"name\":\"Kinh dị\"},{\"link\":\"/the-loai/ma-ca-rong-30.html\",\"name\":\"Ma cà rồng\"},{\"link\":\"/the-loai/tokusatsu-31.html\",\"name\":\"Tokusatsu\"},{\"link\":\"/the-loai/samurai-32.html\",\"name\":\"Samurai\"},{\"link\":\"/the-loai/vien-tuong-33.html\",\"name\":\"Viễn tưởng\"},{\"link\":\"/the-loai/cn-animation-34.html\",\"name\":\"CN Animation\"},{\"link\":\"/the-loai/tien-hiep-35.html\",\"name\":\"Tiên hiệp\"},{\"link\":\"/the-loai/kiem-hiep-36.html\",\"name\":\"Kiếm hiệp\"},{\"link\":\"/the-loai/xuyen-khong-37.html\",\"name\":\"Xuyên không\"},{\"link\":\"/the-loai/trung-sinh-38.html\",\"name\":\"Trùng sinh\"},{\"link\":\"/the-loai/huyen-ao-39.html\",\"name\":\"Huyền ảo\"},{\"link\":\"/the-loai/cna-ngon-tinh-40.html\",\"name\":\"[CNA] Ngôn tình\"},{\"link\":\"/the-loai/di-gioi-41.html\",\"name\":\"Dị giới\"},{\"link\":\"/the-loai/cna-hai-huoc-42.html\",\"name\":\"[CNA] Hài hước\"},{\"link\":\"/the-loai/dam-my-43.html\",\"name\":\"Đam mỹ\"},{\"link\":\"/the-loai/vo-hiep-44.html\",\"name\":\"Võ hiệp\"},{\"link\":\"/the-loai/ecchi-45.html\",\"name\":\"Ecchi\"},{\"link\":\"/the-loai/demon-46.html\",\"name\":\"Demon\"},{\"link\":\"/the-loai/live-action-47.html\",\"name\":\"Live Action\"},{\"link\":\"/the-loai/thriller-48.html\",\"name\":\"Thriller\"},{\"link\":\"/the-loai/khoa-huyen-49.html\",\"name\":\"Khoa huyễn\"}]`  
}

function buildMenu(menuStr, type) { 
    var menuArray = JSON.parse(menuStr); 
    let menulist = []; 
    if (!menuArray || !Array.isArray(menuArray)) return menulist; 
    var typeStr = type !== undefined ? String(type).trim() : undefined; 
    for (var i = 0; i < menuArray.length; i++) { 
        var item = menuArray[i]; 
        if (!item) continue; 
        var link = item.link ? String(item.link).trim() : ""; 
        var name = item.name ? String(item.name).trim() : ""; 
        if (!link || !name) continue; 
        var menuItem = {}; 
        if (typeStr === "false") { 
            menuItem = { "slug": link, "title": name, "type": "Horizontal" }; 
        } else if (typeStr === "true") { 
            menuItem = { "slug": link, "title": name, "type": "Grid" }; 
        } else if(typeStr === "filter"){
          	menuItem = { "value": link, "name": name}; 
        }
        
        else { 
            menuItem = { "slug": link, "name": name }; 
        } 
        menulist.push(menuItem); 
    } 
    return menulist; 
}




function _$(htmlOrBlock){ if (htmlOrBlock && typeof htmlOrBlock === 'object' && htmlOrBlock.elements) { return htmlOrBlock; } var instance = { sourceHtml: typeof htmlOrBlock === 'string' ? htmlOrBlock : '', elements: Array.isArray(htmlOrBlock) ? htmlOrBlock : (htmlOrBlock ? [htmlOrBlock] : []), length: 0, find: function (selector) { if (selector.indexOf(',') !== -1) { var results = []; var selectors = selector.split(',').map(function (s) { return s.trim(); }); for (var s = 0; s < selectors.length; s++) { if (selectors[s] === "") continue; var subInstance = this.find(selectors[s]); for (var r = 0; r < subInstance.elements.length; r++) { var element = subInstance.elements[r]; if (results.indexOf(element) === -1) { results.push(element); } } } var multiInstance = _$(results); multiInstance.sourceHtml = this.sourceHtml; return multiInstance; } var results = []; var contentFilter = ""; if (selector.indexOf(":content(") !== -1) { var contentMatch = selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/); if (contentMatch) { contentFilter = contentMatch[1] || contentMatch[2] || contentMatch[3] || ""; selector = selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/, ""); } } var attrNameFilter = ""; var attrValueFilter = ""; var attrOperator = "="; var hasAttrFilter = false; var attrMatch = selector.match(/\[([a-zA-Z0-9_-]+)\s*([*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/); if (attrMatch) { hasAttrFilter = true; attrNameFilter = attrMatch[1]; attrOperator = attrMatch[2]; attrValueFilter = attrMatch[3] || attrMatch[4] || attrMatch[5] || ""; selector = selector.replace(/\[.*?\]/, ""); } var notSelector = ""; if (selector.indexOf(":not(") !== -1) { var notMatch = selector.match(/:not\(([^)]+)\)/); if (notMatch) { notSelector = notMatch[1]; selector = selector.replace(/:not\([^)]+\)/, ""); } } var isFirstFilter = selector.indexOf(":first") !== -1; var isLastFilter = selector.indexOf(":last") !== -1; selector = selector.replace(/:first|:last/g, ""); var targetTagName = ""; var targetId = ""; var targetClasses = []; var selectorToParse = selector.trim(); if (selectorToParse !== "") { var idIndex = selectorToParse.indexOf('#'); if (idIndex !== -1) { var afterId = selectorToParse.substring(idIndex + 1); var nextDot = afterId.indexOf('.'); targetId = nextDot === -1 ? afterId : afterId.substring(0, nextDot); selectorToParse = selectorToParse.substring(0, idIndex) + (nextDot === -1 ? "" : "." + afterId.substring(nextDot + 1)); } var classParts = selectorToParse.split('.'); var possibleTag = classParts.shift(); if (possibleTag) { targetTagName = possibleTag.toLowerCase(); } targetClasses = classParts.filter(function (c) { return c.length > 0; }); } for (var i = 0; i < this.elements.length; i++) { var currentHtml = this.elements[i]; var pos = 0; var subResults = []; while ((pos = currentHtml.indexOf('<', pos)) !== -1) { if (currentHtml.charAt(pos + 1) === '/' || currentHtml.charAt(pos + 1) === '!') { pos++; continue; } var endOpenTag = -1; var insideQuote = false; var quoteChar = ''; for (var j = pos + 1; j < currentHtml.length; j++) { var char = currentHtml.charAt(j); if ((char === '"' || char === "'") && currentHtml.charAt(j - 1) !== '\\') { if (!insideQuote) { insideQuote = true; quoteChar = char; } else if (char === quoteChar) { insideQuote = false; } } if (char === '>' && !insideQuote) { endOpenTag = j; break; } } if (endOpenTag === -1) break; var fullOpenTag = currentHtml.substring(pos, endOpenTag + 1); var tagMatch = fullOpenTag.match(/^<([a-zA-Z0-9_-]+)/); var currentTagName = tagMatch ? tagMatch[1].toLowerCase() : ""; var isMatched = true; if (targetTagName && targetTagName !== currentTagName) { isMatched = false; } var getClassAttr = fullOpenTag.match(/class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var classMatchStr = getClassAttr ? (getClassAttr[1] || getClassAttr[2] || getClassAttr[3] || "") : ""; var getIdAttr = fullOpenTag.match(/id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i); var idMatchStr = getIdAttr ? (getIdAttr[1] || getIdAttr[2] || getIdAttr[3] || "") : ""; if (isMatched && targetId && idMatchStr !== targetId) { isMatched = false; } if (isMatched && targetClasses.length > 0) { if (classMatchStr) { var currentClasses = classMatchStr.trim().split(/\s+/); for (var c = 0; c < targetClasses.length; c++) { if (currentClasses.indexOf(targetClasses[c]) === -1) { isMatched = false; break; } } } else { isMatched = false; } } if (isMatched && hasAttrFilter) { var actualValue = ""; if (attrNameFilter === "class") { actualValue = classMatchStr; } else if (attrNameFilter === "id") { actualValue = idMatchStr; } else { var getAnyAttr = fullOpenTag.match(new RegExp(attrNameFilter + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); actualValue = getAnyAttr ? (getAnyAttr[1] || getAnyAttr[2] || getAnyAttr[3] || "") : ""; } var attrExists = fullOpenTag.search(new RegExp(attrNameFilter + '\\s*=', 'i')) !== -1; if (!attrExists) { isMatched = false; } else { if (attrOperator === "=") { if (attrNameFilter === "class") { var classes = actualValue.trim().split(/\s+/); if (classes.indexOf(attrValueFilter) === -1) isMatched = false; } else if (actualValue !== attrValueFilter) { isMatched = false; } } else if (attrOperator === "*=") { if (actualValue.indexOf(attrValueFilter) === -1) isMatched = false; } else if (attrOperator === "^=") { if (actualValue.indexOf(attrValueFilter) !== 0) isMatched = false; } else if (attrOperator === "$=") { if (actualValue.slice(-attrValueFilter.length) !== attrValueFilter) isMatched = false; } } } if (isMatched) { var startTagPos = pos; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(currentHtml)) !== null) { var isClose = match[1] === '/'; var fullMatched = match[0]; if (isClose) { depth--; } else if (fullMatched.indexOf('/>') === -1) { depth++; } if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } if (depth > 0) { endTagPos = currentHtml.length; } } var foundBlock = currentHtml.substring(startTagPos, endTagPos); if (contentFilter) { var pureText = ""; if (currentTagName === "script" || currentTagName === "style") { var innerStart = foundBlock.indexOf('>') + 1; var innerEnd = foundBlock.search(/<\/(?:script|style)/i); pureText = innerEnd !== -1 ? foundBlock.substring(innerStart, innerEnd) : foundBlock.substring(innerStart); } else { pureText = foundBlock.replace(/<[^>]+>/g, "").trim(); } var keywords = contentFilter.split('|'); var isContentMatched = false; for (var k = 0; k < keywords.length; k++) { if (pureText.indexOf(keywords[k].trim()) !== -1) { isContentMatched = true; break; } } if (!isContentMatched) { pos = endTagPos; continue; } } if (notSelector) { var isNotClass = notSelector.indexOf('.') === 0; var isNotId = notSelector.indexOf('#') === 0; var notValue = notSelector.substring(1); var hasNot = false; if (isNotClass && classMatchStr.indexOf(notValue) !== -1) hasNot = true; if (isNotId && idMatchStr.indexOf(notValue) !== -1) hasNot = true; if (!hasNot) subResults.push(foundBlock); } else { subResults.push(foundBlock); } pos = endTagPos; } else { pos++; } } if (isFirstFilter && subResults.length > 0) subResults = [subResults[0]]; if (isLastFilter && subResults.length > 0) subResults = [subResults[subResults.length - 1]]; results = results.concat(subResults); } var newInstance = _$(results); newInstance.sourceHtml = this.sourceHtml || currentHtml; return newInstance; }, each: function (callback) { for (var i = 0; i < this.elements.length; i++) { var childInstance = _$(this.elements[i]); childInstance.sourceHtml = this.sourceHtml; callback.call(childInstance, i, this.elements[i]); } return this; }, eq: function (index) { if (index < 0) index = this.elements.length + index; var matchedElement = this.elements[index]; this.elements = matchedElement ? [matchedElement] : []; this.length = this.elements.length; return this; }, attr: function (attrName) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var getAttr = elem.match(new RegExp(attrName + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i')); return getAttr ? (getAttr[1] || getAttr[2] || getAttr[3] || "") : ""; }, html: function () { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var matchClose = elem.match(/<\/([a-zA-Z0-9_-]+)\s*>\s*$/i); if (matchClose) { var end = elem.lastIndexOf(matchClose[0]); if (start > 0 && end >= start) return elem.substring(start, end); } return start > 0 ? elem.substring(start) : ""; }, text: function (separator) { if (this.elements.length === 0) return ""; var elem = this.elements[0]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); if (typeof separator === 'string') { return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(separator); } return pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); } return ""; }, textAll: function (separator) { if (this.elements.length === 0) return ""; var sep = typeof separator === 'string' ? separator : " "; var allTexts = []; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var start = elem.indexOf('>') + 1; var end = elem.lastIndexOf('</'); if (start > 0 && end > start) { var content = elem.substring(start, end); var pureText = content.replace(/<\/?[^>]+(>|$)/g, "\n"); var cleanText = pureText .split('\n') .map(function (item) { return item.trim(); }) .filter(function (item) { return item !== ''; }) .join(' '); if (cleanText !== '') { allTexts.push(cleanText); } } } return allTexts.join(sep); }, next: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx === -1) continue; var scanPos = idx + elem.length; var nextOpen = this.sourceHtml.indexOf('<', scanPos); if (nextOpen !== -1) { if (this.sourceHtml.charAt(nextOpen + 1) === '/') continue; var endOpenTag = this.sourceHtml.indexOf('>', nextOpen); if (endOpenTag === -1) continue; var fullOpenTag = this.sourceHtml.substring(nextOpen, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var startTagPos = nextOpen; var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(this.sourceHtml)) !== null) { if (match[1] === '/') depth--; else if (match[0].indexOf('/>') === -1) depth++; if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } } results.push(this.sourceHtml.substring(startTagPos, endTagPos)); } } var nextInstance = _$(results); nextInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, parent: function () { var results = []; if (!this.sourceHtml) return this; for (var i = 0; i < this.elements.length; i++) { var elem = this.elements[i]; var idx = this.sourceHtml.indexOf(elem); if (idx <= 0) continue; var scanPos = idx - 1; while (scanPos >= 0) { var openTagPos = this.sourceHtml.lastIndexOf('<', scanPos); if (openTagPos === -1) break; if (this.sourceHtml.charAt(openTagPos + 1) !== '/' && this.sourceHtml.charAt(openTagPos + 1) !== '!') { var endOpenTag = this.sourceHtml.indexOf('>', openTagPos); if (endOpenTag !== -1 && endOpenTag > openTagPos) { var fullOpenTag = this.sourceHtml.substring(openTagPos, endOpenTag + 1); var spacePos = fullOpenTag.indexOf(' '); var currentTagName = (spacePos === -1) ? fullOpenTag.substring(1, fullOpenTag.length - 1).toLowerCase() : fullOpenTag.substring(1, spacePos).toLowerCase(); var endTagPos = endOpenTag + 1; var selfClosingTags = ['img', 'source', 'input', 'br', 'hr', 'link', 'meta']; if (selfClosingTags.indexOf(currentTagName) === -1 && fullOpenTag.indexOf('/>') === -1) { var depth = 1; var tagRegex = new RegExp('<(/?)' + currentTagName + '(?:\\s+[^>]*|\\s*>)', 'gi'); tagRegex.lastIndex = endOpenTag + 1; var match; while ((match = tagRegex.exec(this.sourceHtml)) !== null) { if (match[1] === '/') depth--; else if (match[0].indexOf('/>') === -1) depth++; if (depth === 0) { endTagPos = tagRegex.lastIndex; break; } } } if (endTagPos >= idx + elem.length) { var parentBlock = this.sourceHtml.substring(openTagPos, endTagPos); if (results.indexOf(parentBlock) === -1) results.push(parentBlock); break; } } } scanPos = openTagPos - 1; } } var parentInstance = _$(results); parentInstance.sourceHtml = this.sourceHtml; this.elements = results; this.length = results.length; return this; }, closest: function (selector) { var results = []; if (!this.sourceHtml || this.elements.length === 0) return _$([]); for (var i = 0; i < this.elements.length; i++) { var currentElem = this.elements[i]; var currentObj = _$(currentElem); currentObj.sourceHtml = this.sourceHtml; var selfCheck = _$(this.sourceHtml).find(selector); var isSelfMatched = false; for (var s = 0; s < selfCheck.elements.length; s++) { if (selfCheck.elements[s] === currentElem) { isSelfMatched = true; break; } } if (isSelfMatched) { if (results.indexOf(currentElem) === -1) results.push(currentElem); continue; } var parentObj = currentObj.parent(); while (parentObj.elements.length > 0) { var parentElem = parentObj.elements[0]; var checkMatch = _$(this.sourceHtml).find(selector); var isMatched = false; for (var j = 0; j < checkMatch.elements.length; j++) { if (checkMatch.elements[j] === parentElem) { isMatched = true; break; } } if (isMatched) { if (results.indexOf(parentElem) === -1) results.push(parentElem); break; } parentObj = parentObj.parent(); } } var closestInstance = _$(results); closestInstance.sourceHtml = this.sourceHtml; return closestInstance; } }; instance.length = instance.elements.length; return instance; };