// https://bilutv.asia
BASEURL = "https://bilutv.asia";

function getManifest() {
    return JSON.stringify({
        "id": "bilutv",
        "name": "Nguồn Bilutv",
        "description": "Trang xem phim siêu hay.",
        "version": "1.5",
        "BASEURL": "https://bilutv.asia",
        "iconUrl": "https://bilutv.asia/img/bilutvlogo-ngang.jpg",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "auto"
    });
}

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[PhimHDCS] " + msg);
    } else if (typeof console !== 'undefined' && console.log) {
        console.log("[PhimHDCS] " + msg);
    }
}

// https://bilutv.asia/danh-sach/phim-moi?page=2
function getHomeSections() {
    var listurl = `
/the-loai/phim-18@@Phim 18+@@false
/danh-sach/phim-bo@@Phim Bộ@@false
/danh-sach/phim-le@@Phim Lẻ@@false
/danh-sach/phim-moi@@Phim Mới@@true
`;
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
    try {
        var page = 1;
        var path = slug || "";

        // 1. Xử lý an toàn filtersJson nếu có truyền vào
        if (filtersJson) {
            // Sửa lỗi JSON lỏng lẻo (thiếu nháy kép ở key, dư dấu phẩy)
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;

                // Ưu tiên lấy category làm đường dẫn (path) nếu có trong bộ lọc
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {
                // Parse lỗi thì bỏ qua, dùng giá trị mặc định
            }
        }

        // 2. Kiểm tra nếu path/slug là link tuyệt đối (chứa http)
        if (path && path.indexOf("http") > -1) {
            if (page > 1 && path.indexOf("page=") === -1) {
                var sep = path.indexOf("?") > -1 ? "&" : "?";
                path += sep + "page=" + page;
            }
            return path;
        }

        // 3. Nối chuỗi URL kết quả từ BASEURL
        var resultUrl = BASEURL;
        if (path) {
            if (!path.startsWith("/") && !resultUrl.endsWith("/")) {
                resultUrl += "/" + path;
            } else {
                resultUrl += path;
            }
        }

        // 4. Ghép tham số trang (tự động nhận biết ? hay &)
        if (page > 1 && resultUrl.indexOf("page=") === -1) {
            var separator = resultUrl.indexOf("?") > -1 ? "&" : "?";
            resultUrl += separator + "page=" + page;
        }

        // 5. Chuẩn hóa loại bỏ dấu // thừa (giữ lại https://)
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log("Lỗi getUrlList: " + e.message);
        var fallback = BASEURL + (slug ? (slug.indexOf("http") > -1 ? slug : "/" + slug) : "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;

        // 1. Giải mã filtersJson để lấy trang (nếu có)
        if (filtersJson) {
            var fixedJson = filtersJson
                .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                .replace(/:,/g, ':');

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page) || 1;
            } catch (jsonErr) {}
        }

        // 2. Tạo URL tìm kiếm kèm từ khóa đã mã hóa
        var encodedKeyword = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/?search=" + encodedKeyword;

        // 3. Nếu trang > 1 thì nối thêm &page=
        if (page > 1) {
            resultUrl += "&page=" + page;
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        console.log("Lỗi getUrlSearch: " + e.message);
        var fallback = BASEURL + "/?search=" + encodeURIComponent(keyword || "");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + "/" + slug;
}

function getUrlCategories() {
    return BASEURL;
}

function getUrlCountries() {
    return "";
}

function getUrlYears() {
    return "";
}

// =============================================================================
// PARSERS
// =============================================================================
function parseListResponse(html, $url) {
    try {
        var items = [];

        _$(html).find(".bs").find("a").each(function () {
            var year = "";
            var lang = "";
            var current = this.find(".epx").text();;
            var quality = "HD";
            var href = this.attr("href");
            var title = this.attr("title");
            var src = this.find("img").attr("src");
            if (src.indexOf("http") == -1) {
                src = BASEURL + src;
            }

            if (href && href.indexOf("http") > -1) {
                var cleanThumb = src.replace(/&amp;/g, '&');

                items.push({
                    "id": href,
                    "title": title.trim(),
                    "posterUrl": cleanThumb,
                    "backdropUrl": cleanThumb
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
        return JSON.stringify({
            "items": [{
                "id": $url,
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
//var BASEURL = "https://onflix.lat";
//var BASEAPI = "https://k8s.onflixcdn.com/api";
//var htmlsource = $("#labHtmlEditorWrap #labHtmlTreeContainer .lab-dom-pure-text").html();
//JSON.parse(parseListResponse(outerHTML, BASEURL));

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function formatEpisode(numStr) {
    var num = parseInt(numStr, 10);
    if (isNaN(num)) return "01";
    return num < 10 ? "0" + num : "" + num;
}

function parseMovieDetail(html, url) {
    var lurl = "";
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var year = 2026;
    var direc = "????";
    var cast = "????";
    var status = "????";
    var duration = "1:09:00 | 16 | 16";
    var rating = "????";
    var servers = [{}];
    var $info = "";
    var category = "";
    var country = "";
    var lang = "";
    var streamUrl = "";
    try {
        limg = _$(html).find('meta[property="og:image"]').attr("content");
        if (limg.indexOf("http") == -1) {
            limg = BASEURL + limg;
        }
        lname = _$(html).find('meta[property="og:title"]').attr("content");
        ldes = _$(html).find('div[itemprop="description"]').find("p").text();
        year = _$(html).find('b:content("Năm phát hành")').parent().text().replace("Năm phát hành:",
            "").replace(/\s+/g, "");
        year = Number(year);
        status = _$(html).find('b:content("Status:")').parent().text().replace("Status:", "")
            .replace(/\s\s/g, "");;
        duration = _$(html).find('b:content("Thời lượng:")').parent().text().replace("Thời lượng:",
            "").replace(/\s\s/g, "");;
        cast = _$(html).find('b:content("Diễn viên:")').parent().text().replace("Diễn viên:", "")
            .replace(/\s\s/g, "");;
        direc = _$(html).find('b:content("Đạo diễn:")').parent().text().replace("Đạo diễn:", "")
            .replace(/\s\s/g, "");;
        country = _$(html).find('b:content("Quốc gia:")').parent().text().replace("Quốc gia:", "")
            .replace(/\s\s/g, "");;
        category = _$(html).find('b:content("Định dạng:")').parent().text().replace("Định dạng:",
            "").replace(/\s\s/g, "");
        lang = _$(html).find('b:content("Chất lượng:")').parent().text().replace(
            /Chất lượng:|\s\s|^\s/g, "");
        servers = [];
        var epiOne = _$(html).find('span:content("Tập đầu")').parent().attr("href");
        var servers = [];
        var epiM3U8 = [];
        var epiEMBED = [];
        var epiEnd = _$(html).find('.epcurlast').text().match(/(\d+)/i);
        var EndNumber = 1;
        if (epiOne) {
            if (epiEnd && epiEnd[1]) {
                EndNumber = Number(epiEnd[1]) + 1;
            }

            for (var $j = 1; $j < EndNumber; $j++) {
                var numberEpi = formatEpisode($j);
                var urlM3U8 = epiOne + "?tapplay=" + numberEpi + "&type=m3u8";
                var urlEMBED = epiOne + "?tapplay=" + numberEpi + "&type=embed";
                var nameEpi = "Tập " + numberEpi;
                var slugEpi = "tap-" + numberEpi;
                epiM3U8.push({
                    id: urlM3U8,
                    name: nameEpi,
                    slug: slugEpi
                });
                epiEMBED.push({
                    id: urlEMBED,
                    name: nameEpi,
                    slug: slugEpi
                });
            }
            servers.push({
                name: "Server M3U8",
                episodes: epiM3U8
            }, {
                name: "Server EMBED",
                episodes: epiEMBED
            });
        } else {
            var epiOne = _$(html).find(".bookmark").attr("href");;
            var urlM3U8 = epiOne + "?tapplay=full&type=m3u8";
            var urlEMBED = epiOne + "?tapplay=full&type=embed";
            epiM3U8.push({
                id: urlM3U8,
                name: "Xem Ngay",
                slug: "full"
            });
            epiEMBED.push({
                id: urlEMBED,
                name: "Xem Ngay",
                slug: "full"
            });
            servers.push({
                name: "Server M3U8",
                episodes: epiM3U8
            }, {
                name: "Server EMBED",
                episodes: epiEMBED
            });
        }
        return JSON.stringify({
            id: url,
            title: lname,
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: year,
            status: status,
            duration: duration,
            casts: cast,
            director: direc,
            country: country,
            category: category,
            lang: lang
        });

    } catch (e) {
        return JSON.stringify({
            id: lurl,
            title: "Lỗi rồi bạn ơi. Tên miền đã bị đổi",
            posterUrl: limg,
            backdropUrl: limg,
            description: ldes,
            servers: servers,
            quality: "HD",
            year: year,
            status: status,
            duration: duration,
            casts: cast,
            director: direc
        });
    }
}

//BASEURL = "https://phimnganhdc.com";
//var html = outerHTML;
//var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseMovieDetail(outerHTML,$url));

function parseDetailResponse(html, url) {
    try {
        var activePage = "";
        // Bọc an toàn khi lấy tham số type và tapplay từ URL
        var matchType = url.match(/type=(\w+)/);
        var typeVD = matchType ? matchType[1] : "m3u8";

        var matchCurent = url.match(/tapplay=(\d+)/);
        var curentRaw = matchCurent ? matchCurent[1] : "1";
        var curent = formatEpisode(curentRaw); // "01", "02"...

        if (url.indexOf("full") === -1) {
            var foundActive = false;

            // Duyệt qua danh sách tập thực tế trên web để tìm tập khớp với tập giả lập
            _$(html).find(".episodelist").find("li").each(function (index, el) {
                var link = _$(el).find("a").attr("href");
                var text = _$(el).attr("data-name") || _$(el).text() || "";
                var matchText = text.match(/([0-9]+)/);
                var numberRaw = matchText ? matchText[1] : "1";
                var number = formatEpisode(numberRaw);

                if (number === curent && link) {
                    // Tạo url đích hoàn chỉnh chứa đủ thông tin để hàm parseEmbedResponse phía sau xử lý
                    activePage = link;
                    if (activePage.indexOf("http") === -1) {
                        activePage = BASEURL + (activePage.indexOf("/") === 0 ? "" : "/") +
                            activePage;
                    }
                    // Giữ lại tham số để truyền tiếp cho bước sau
                    activePage += (activePage.indexOf("?") > -1 ? "&" : "?") + "tapplay=" +
                        number + "&type=" + typeVD;
                    foundActive = true;
                }
            });

            // Fallback: Nếu không parse được danh sách tập thực tế, dùng luôn URL hiện tại
            if (!foundActive) {
                activePage = url;
            }
        } else {
            activePage = url + (url.indexOf("?") > -1 ? "&" : "?") + "check=false";
        }

        return JSON.stringify({
            "url": activePage,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL,
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Accept": "*/*",
                "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
                "X-Requested-With": "com.android.chrome"
            },
            "subtitles": []
        });

    } catch (e) {
        // Trả về chính URL truyền vào thay vì chuỗi rỗng để tránh làm chết luồng phát phim
        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "Referer": BASEURL
            }
        });
    }
}

//BASEURL = "https://phimnganhdc.com";
//var html = outerHTML;
//var $url = "https://phimnganhdc.com/hot-babe-remy-cheats-with-bbc/";
//JSON.parse(parseDetailResponse(html, url))

function parseEmbedResponse(html, url) {
    try {
        if (url.toLowerCase().includes(".m3u8")) {
            return JSON.stringify({
                "url": url,
                "isEmbed": false,
                "mimeType": "application/x-mpegURL",
                "headers": {
                    "Referer": BASEURL,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                "subtitles": []
            });
        } else {
            var matchType = url.match(/type=(\w+)/i);
            var $type = matchType ? matchType[1] : "m3u8";

            var streamUrl = "";
            if ($type === "m3u8") {
                streamUrl = _$(html).find('a[data-type="m3u8"]').attr("data-link");
            } else {
                streamUrl = _$(html).find('a[data-type="embed"]').attr("data-link");
            }

            // Nếu không tìm thấy link qua thuộc tính data-link, thử tìm link trong thẻ iframe/embed dự phòng
            if (!streamUrl) {
                streamUrl = _$(html).find('iframe').attr("src") || _$(html).find('embed').attr(
                    "src") || "";
            }

            var checkepi = "false";
            var typevideo = "true";
            if (url.indexOf("true") > -1) {
                checkepi = "true";
            } else {
                var matchCurent = url.match(/tapplay=(\d+)/);
                var curentRaw = matchCurent ? matchCurent[1] : "1";
                var curent = formatEpisode(curentRaw);

                var titleText = _$(html).find("h2").text() || _$(html).find("h1").text() || "Phim";
                checkepi = titleText.trim() + " - Tập " + curent;
            }
            var customJs = textJS(typevideo, checkepi, url, streamUrl);
            // "Custom-Js": customJs.trim()
            if ($type == "m3u8") {
                return JSON.stringify({
                    "url": streamUrl,
                    "isEmbed": false,
                    "mimeType": "application/x-mpegURL",
                    "headers": {
                        "Referer": BASEURL,
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    },
                    "subtitles": []
                });
            } else {
                return JSON.stringify({
                    "url": streamUrl,
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
                        "Custom-Js": customJs.trim()
                    },
                    "subtitles": []
                });
            }
        }

    } catch (e) {
        log(e);
        return JSON.stringify({
            url: url,
            headers: {
                "Referer": BASEURL
            }
        });
    }
}
/*
var html = outerHTML;
var url = "https://bilutv.asia/phim/kinh-thanh-ky-tham/tap-tap-01-398150?tapplay=12&type=m3u8";
JSON.parse(parseEmbedResponse(html, url))
function textJS(typevideo, checkepi){
    return `
    typevideo = '${typevideo}';
    checkepi = '${checkepi}';
    `
}
*/

function sortEpisodesByName(data) {
    data.forEach(server => {
        if (server.episodes && Array.isArray(server.episodes)) {
            server.episodes.sort((a, b) => {
                // Sử dụng Regex để tìm số đứng ngay sau chữ "Tập" (Không phân biệt hoa thường)
                const matchA = a.name.match(/Tập\s*(\d+)/i);
                const matchB = b.name.match(/Tập\s*(\d+)/i);

                // Nếu tìm thấy số thì chuyển thành kiểu Int, nếu không thấy thì mặc định là 0
                const numA = matchA ? parseInt(matchA[1], 10) : 0;
                const numB = matchB ? parseInt(matchB[1], 10) : 0;

                // Sắp xếp tăng dần: Số nhỏ xếp trước (lên trên), số lớn xếp sau (xuống dưới)
                return numA - numB;
            });
        }
    });
    return data;
}

function textJS($links, checkepi, url, stream) {
    // Sử dụng biến $url từ tham số truyền vào thay vì ghi cứng link
    return `
LINKVIDEO = ${JSON.stringify($links)};
CHECKEPI = ${JSON.stringify(checkepi)};
URLPAGE = ${JSON.stringify(url)};
STREMLINL = ${JSON.stringify(stream)};
SCRIPTURL = "https://script.google.com/macros/s/AKfycbwsvLFzWMdxvX9ZH-3wnP3GJzS58v0CtT_0mlEYeOz6cOsgen9IR3c6VPv_EssPXMFzwQ/exec?name=bilutv&type=js";  
const style = document.createElement('style');
var customcss = 'body { background: black; overflow: hidden; }body * {background: black}';
style.innerHTML = customcss;
document.head.appendChild(style);

/* Build Video Begin*/

    var DEVELOPE = false;
// ─── HÀM TOAST ĐƯỢC ĐƯA RA NGOÀI (Có thể gọi ở mọi nơi) ───
globalThis.toastScrollQueue = globalThis.toastScrollQueue || [];
globalThis.isToastScrollRunning = globalThis.isToastScrollRunning || false;
globalThis.showToast = function(message, duration, check, scroll) {
        if (typeof duration === 'undefined') duration = 7000;
        if (typeof check === 'undefined') check = true;
        if (typeof scroll === 'undefined') scroll = false;
        if (check === false) return;
        
        if (scroll) {
            globalThis.toastScrollQueue.push({ message, duration });
            function processScrollQueue() {
                if (globalThis.isToastScrollRunning || globalThis.toastScrollQueue.length === 0) return;
                globalThis.isToastScrollRunning = true;
                var current = globalThis.toastScrollQueue.shift();
                var topContainer = document.getElementById('global-toast-top-container');
                if (!topContainer) {
                    topContainer = document.createElement('div');
                    topContainer.id = 'global-toast-top-container';
                    topContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9999999;background:rgba(0,0,0,0.75);color:#fff;font-family:sans-serif;font-size:13px;padding:6px 15px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:28px;box-shadow:0 2px 10px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s ease;';
                    document.body.appendChild(topContainer);
                }
                topContainer.innerHTML = '';
                topContainer.style.opacity = '1';
                var textEl = document.createElement('span');
                textEl.style.cssText = 'white-space:nowrap;border-right:2px solid transparent;letter-spacing:0.5px;';
                topContainer.appendChild(textEl);
                var fullText = current.message;
                var charIndex = 0;
                var typingTimer;
                function typeWriter() {
                    if (charIndex < fullText.length) {
                        textEl.innerHTML += fullText.charAt(charIndex);
                        charIndex++;
                        typingTimer = setTimeout(typeWriter, 40);
                    } else {
                        setTimeout(function() {
                            topContainer.style.opacity = '0';
                            setTimeout(function() {
                                topContainer.remove();
                                globalThis.isToastScrollRunning = false;
                                processScrollQueue();
                            }, 300);
                        }, 10000);
                    }
                }
                typeWriter();
            }
            processScrollQueue();
            return;
        }
        
        var container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        var toastEl = document.createElement('div');
        toastEl.innerHTML = message;
        toastEl.style.cssText = 'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;font-size:14px;min-width:200px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
        container.appendChild(toastEl);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(0)';
            toastEl.style.opacity = '1';
        }, 10);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(120%)';
            toastEl.style.opacity = '0';
            setTimeout(function() {
                toastEl.remove();
                if (container.childElementCount === 0) container.remove();
            }, 300);
        }, duration);
};
function runVideo(){
    'use strict';
    var DEVELOPE = false;
    
    function GetlinkVideo() {
        // 1. Tìm thẻ video gốc ĐANG PHÁT trên trang
        var originalVideo = document.querySelector('video');
        if (!originalVideo) {
            console.log("❌ Không tìm thấy thẻ video gốc trên trang!");
            return;
        }

        // 2. Chặn đứng các script quảng cáo chạy ngầm (popup, chuyển trang giữa chừng)
        var highestId = window.setTimeout(function() {
            for (var i = highestId; i >= 0; i--) {
                window.clearInterval(i);
                window.clearTimeout(i);
            }
        }, 0);

        // 3. Quét playlist và cấu trúc server trước khi thay đổi DOM
        var playlist = scanSources();
        var stream1 = originalVideo.src || '';
        var stream2 = window.location.href;
        
        // 4. Gọi hàm build đè giao diện lên video gốc
        showToast("Đang khởi chạy trình phát tốt hơn.", 5000, true, true);
        buildVideoWithOriginal(originalVideo, stream1, stream2, playlist);
    }

    // ─── QUÉT NGUỒN PHÁT VÀ PLAYLIST (GIỮ NGUYÊN CODE) ───
    function scanSources() {
        var activeSrc = '';
        var servers = [];
        var episodes = [];
        var seen = new Set();
        var els = document.querySelectorAll('[class*="video"], [class*="player"], video, iframe');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var src = el.src || el.getAttribute('data-src') || '';
            if (!src) {
                var s = el.querySelector('source');
                if (s) src = s.src || s.getAttribute('src') || '';
            }
            if (src && (src.indexOf('.mp4') > -1 || src.indexOf('.m3u8') > -1 || src.indexOf('embed') > -1)) {
                if (!activeSrc) activeSrc = src;
                if (!seen.has(src)) {
                    seen.add(src);
                    var lbl = 'Server ' + (servers.length + 1);
                    if (src.indexOf('embed') > -1) lbl = 'Nhúng ' + (servers.length + 1);
                    servers.push({ label: lbl, src: src, type: 'server' });
                }
            }
        }
        var allLinks = document.querySelectorAll('a, button, [role="button"], [data-link]');
        for (var k = 0; k < allLinks.length; k++) {
            var el2 = allLinks[k];
            var href = el2.href || el2.getAttribute('href') || el2.getAttribute('data-src') || el2.getAttribute('data-link') || '';
            var txt = (el2.textContent || el2.innerText || '').trim();
            if (!href || href === '#' || href === window.location.href || seen.has(href)) continue;
            if (/(server|sv|nguồn|source|embed|link)/i.test(txt + ' ' + el2.className)) {
                if (href.indexOf('.mp4') > -1 || href.indexOf('.m3u8') > -1 || href.indexOf('embed') > -1) {
                    seen.add(href);
                    servers.push({ label: txt || 'Server ' + (servers.length + 1), src: href, type: 'server' });
                }
            }
        }
        var aTags = document.querySelectorAll('a');
        for (var j = 0; j < aTags.length; j++) {
            var a = aTags[j];
            var aHref = a.href || a.getAttribute('href');
            var aTxt = (a.textContent || a.innerText || '').trim();
            if (!aHref || aHref === '#' || aHref === window.location.href) continue;
            var isEpisode = false;
            if (/(tập|tap|ep|episode|chap|part)\s*(\d+|[ivx]+)/i.test(aTxt)) isEpisode = true;
            if (/(tập|tap|ep|episode|chap|part)[-\s]?(\d+|[ivx]+)/i.test(aHref)) isEpisode = true;
            if (a.className && /(^|\s)(ep|episode|tap|chapter|part|tapphim)(\d+|$)/i.test(a.className)) isEpisode = true;
            if (isEpisode) {
                episodes.push({ label: aTxt || 'Tập ' + (episodes.length + 1), src: aHref, type: 'episode' });
            }
        }
        return { activeSrc: activeSrc, servers: servers, episodes: episodes };
    }

    // ─── HÀM TOAST CHỮ CHẠY GÕ PHÍM ───
    globalThis.toastScrollQueue = globalThis.toastScrollQueue || [];
    globalThis.isToastScrollRunning = globalThis.isToastScrollRunning || false;
    globalThis.showToast = function(message, duration, check, scroll) {
        if (typeof duration === 'undefined') duration = 7000;
        if (typeof check === 'undefined') check = true;
        if (typeof scroll === 'undefined') scroll = false;
        if (check === false) return;
        
        if (scroll) {
            globalThis.toastScrollQueue.push({ message, duration });
            function processScrollQueue() {
                if (globalThis.isToastScrollRunning || globalThis.toastScrollQueue.length === 0) return;
                globalThis.isToastScrollRunning = true;
                var current = globalThis.toastScrollQueue.shift();
                var topContainer = document.getElementById('global-toast-top-container');
                if (!topContainer) {
                    topContainer = document.createElement('div');
                    topContainer.id = 'global-toast-top-container';
                    topContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:9999999;background:rgba(0,0,0,0.75);color:#fff;font-family:sans-serif;font-size:13px;padding:6px 15px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;min-height:28px;box-shadow:0 2px 10px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s ease;';
                    document.body.appendChild(topContainer);
                }
                topContainer.innerHTML = '';
                topContainer.style.opacity = '1';
                var textEl = document.createElement('span');
                textEl.style.cssText = 'white-space:nowrap;border-right:2px solid transparent;letter-spacing:0.5px;';
                topContainer.appendChild(textEl);
                var fullText = current.message;
                var charIndex = 0;
                var typingTimer;
                function typeWriter() {
                    if (charIndex < fullText.length) {
                        textEl.innerHTML += fullText.charAt(charIndex);
                        charIndex++;
                        typingTimer = setTimeout(typeWriter, 40);
                    } else {
                        setTimeout(function() {
                            topContainer.style.opacity = '0';
                            setTimeout(function() {
                                topContainer.remove();
                                globalThis.isToastScrollRunning = false;
                                processScrollQueue();
                            }, 300);
                        }, 10000);
                    }
                }
                typeWriter();
            }
            processScrollQueue();
            return;
        }
        
        var container = document.getElementById('global-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-toast-container';
            container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999999;display:flex;flex-direction:column;gap:10px;';
            document.body.appendChild(container);
        }
        var toastEl = document.createElement('div');
        toastEl.innerHTML = message;
        toastEl.style.cssText = 'background:rgba(50,50,50,0.95);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);font-family:sans-serif;font-size:14px;min-width:200px;transition:all 0.3s ease;transform:translateX(120%);opacity:0;';
        container.appendChild(toastEl);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(0)';
            toastEl.style.opacity = '1';
        }, 10);
        setTimeout(function() {
            toastEl.style.transform = 'translateX(120%)';
            toastEl.style.opacity = '0';
            setTimeout(function() {
                toastEl.remove();
                if (container.childElementCount === 0) container.remove();
            }, 300);
        }, duration);
    };

    // ─── HÀM GIỮ LẠI THẺ VIDEO GỐC ĐỂ CHỐNG ĐEN MÀN HÌNH ───
    // ─── ĐOẠN CODE ĐÃ ĐƯỢC CHỈNH SỬA ───
    function buildVideoWithOriginal(video, stream1, stream2, playlistData) {
        video.id = 'main-video';
        
        // Đã thay object-fit: contain thành cover (hoặc fill tùy bạn) và thêm outline:none
        video.style.cssText = 'width:100%;height:100%;object-fit:contain;cursor:pointer;background:#000;outline:none;border:none;box-shadow:none;';

        video.controls = false;
        
        var container = document.createElement('div');
        container.id = 'custom-video-player';
        
        // Thêm outline:none và box-shadow:none cho container để triệt tiêu hoàn toàn viền vàng
        container.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;font-family:Segoe UI,Roboto,sans-serif;user-select:none;-webkit-user-select:none;outline:none;border:none;box-shadow:none;';

        var spinner = document.createElement('div');
        spinner.id = 'video-spinner';
        spinner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite;z-index:10;pointer-events:none;display:none;';
        var spinStyle = document.createElement('style');
        spinStyle.textContent = '@keyframes spin{0%{transform:translate(-50%,-50%) rotate(0deg);}100%{transform:translate(-50%,-50%) rotate(360deg);}}';
        document.head.appendChild(spinStyle);

        var controls = document.createElement('div');
        controls.id = 'video-controls';
        controls.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;background:linear-gradient(transparent,rgba(0,0,0,0.85));padding:12px 16px 20px;box-sizing:border-box;transition:opacity 0.3s;opacity:0;z-index:20;';
        var progressWrap = document.createElement('div');
        progressWrap.style.cssText = 'width:100%;height:6px;background:rgba(255,255,255,0.3);border-radius:3px;cursor:pointer;position:relative;margin-bottom:12px;';
        var progressBar = document.createElement('div');
        progressBar.style.cssText = 'height:100%;background:#e74c3c;width:0%;border-radius:3px;position:relative;pointer-events:none;';
        var progressHandle = document.createElement('div');
        progressHandle.style.cssText = 'position:absolute;right:-6px;top:-4px;width:14px;height:14px;background:#e74c3c;border-radius:50%;opacity:0;transition:opacity 0.2s;pointer-events:none;';
        progressBar.appendChild(progressHandle);
        progressWrap.appendChild(progressBar);
        
        progressWrap.onmouseenter = function() { progressHandle.style.opacity = '1'; };
        progressWrap.onmouseleave = function() { progressHandle.style.opacity = '0'; };
        
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;align-items:center;gap:12px;';

        var btnPlay = createBtn('⏸', 'Phát / Tạm dừng');
        var btnMute = createBtn('🔊', 'Tắt / Bật âm lượng');
        var timeDisplay = document.createElement('span');
        timeDisplay.style.cssText = 'color:#fff;font-size:13px;min-width:100px;';
        timeDisplay.textContent = '0:00 / 0:00';
        var btnReload = createBtn('🔄', 'Tải lại nguồn video');
        var spacer = document.createElement('div');
        spacer.style.cssText = 'flex:1;';
        var speedIndicator = document.createElement('span');
        speedIndicator.style.cssText = 'color:#fff;font-size:12px;opacity:0.8;';
        speedIndicator.textContent = '1.0x';
        var btnFullscreen = createBtn('⛶', 'Toàn màn hình');
        var btnPlaylist = createBtn('☰', 'Danh sách phát / Server');

        btnRow.appendChild(btnPlay);
        btnRow.appendChild(btnMute);
        btnRow.appendChild(timeDisplay);
        btnRow.appendChild(spacer);
        btnRow.appendChild(speedIndicator);
        btnRow.appendChild(btnReload);
        btnRow.appendChild(btnFullscreen);

        controls.appendChild(progressWrap);
        controls.appendChild(btnRow);
        
        var bigPlayBtn = document.createElement('div');
        bigPlayBtn.id = 'big-play-btn';
        bigPlayBtn.textContent = '▶';
        bigPlayBtn.style.cssText = 'text-indent:10px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;background:rgba(0,0,0,0.6);border-radius:50%;display:none;align-items:center;justify-content:center;color:#fff;font-size:36px;cursor:pointer;z-index:15;';

        var seekOverlay = document.createElement('div');
        seekOverlay.id = 'seek-overlay';
        seekOverlay.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:#fff;padding:12px 24px;border-radius:8px;font-size:18px;font-weight:bold;pointer-events:none;opacity:0;transition:opacity 0.3s;z-index:30;';
        
        var playlistPanel = document.createElement('div');
        playlistPanel.id = 'playlist-panel';
        playlistPanel.style.cssText = 'position:fixed;top:0;right:0;width:300px;max-width:80%;height:100%;background:rgba(15,15,15,0.97);z-index:40;transform:translateX(100%);transition:transform 0.25s ease;overflow-y:auto;padding:20px;box-sizing:border-box;color:#fff;font-family:Segoe UI,Roboto,sans-serif;';
        var plHeader = document.createElement('div');
        plHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.2);';
        plHeader.innerHTML = '<span style="font-size:16px;font-weight:bold;">📋 Playlist</span>';
        var plClose = document.createElement('button');
        plClose.textContent = '✕';
        plClose.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;';
        plClose.onclick = function(e) { if (e) e.stopPropagation(); playlistPanel.style.transform = 'translateX(100%)'; };
        plHeader.appendChild(plClose);
        playlistPanel.appendChild(plHeader);

        var plContent = document.createElement('div');
        plContent.id = 'playlist-content';
        playlistPanel.appendChild(plContent);
        
        var playlistState = {
            servers: (playlistData && playlistData.servers) ? playlistData.servers.slice() : [],
            episodes: (playlistData && playlistData.episodes) ? playlistData.episodes.slice() : []
        };
        
        function buildSection(title, items, onClick, parent) {
            if (!items || items.length === 0) return;
            var sec = document.createElement('div');
            sec.style.cssText = 'margin-bottom:20px;';
            var secTitle = document.createElement('div');
            secTitle.textContent = title;
            secTitle.style.cssText = 'font-size:13px;text-transform:uppercase;opacity:0.6;margin-bottom:10px;';
            sec.appendChild(secTitle);
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    var btn = document.createElement('button');
                    btn.textContent = item.label;
                    btn.style.cssText = 'display:block;width:100%;text-align:left;padding:10px 12px;margin-bottom:6px;background:rgba(255,255,255,0.08);border:none;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;transition:background 0.2s;';
                    btn.onmouseenter = function() { btn.style.background = 'rgba(231,76,60,0.3)'; };
                    btn.onmouseleave = function() { btn.style.background = 'rgba(255,255,255,0.08)'; };
                    btn.onclick = function(e) { if (e) e.stopPropagation(); onClick(item); };
                    sec.appendChild(btn);
                })(items[i]);
            }
            parent.appendChild(sec);
        }

        function renderPlaylist() {
            plContent.innerHTML = '';
            var hasAny = false;
            if (playlistState.servers.length > 1) {
                buildSection('🎥 Chuyển Server', playlistState.servers, function(item) { switchSource(item.src); }, plContent);
                hasAny = true;
            }
            if (playlistState.episodes.length > 0) {
                buildSection('📁 Tập phim', playlistState.episodes, function(item) { savePosition(); window.location.href = item.src; }, plContent);
                hasAny = true;
            }
            if (hasAny) {
                if (!btnPlaylist.parentNode) btnRow.appendChild(btnPlaylist);
                if (!playlistPanel.parentNode) container.appendChild(playlistPanel);
            } else {
                if (btnPlaylist.parentNode) btnPlaylist.parentNode.removeChild(btnPlaylist);
            }
        }

        // CHÌA KHÓA: "Bốc" thẻ video cũ bỏ vào Container mới mà KHÔNG LÀM MẤT STREAM
        container.appendChild(video);
        container.appendChild(spinner);
        container.appendChild(bigPlayBtn);
        container.appendChild(seekOverlay);
        container.appendChild(controls);
        container.appendChild(playlistPanel);

        // Clear toàn bộ HTML cũ của trang web phim để xóa sạch khung quảng cáo rác
        var htmlTAG = document.getElementsByTagName("html")[0];
        htmlTAG.innerHTML = '';
        document.body = document.createElement('body');
        document.body.appendChild(container);
        document.head.innerHTML = '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
        document.head.appendChild(spinStyle);
        document.title = 'Dẹp hết quảng cáo rồi nha bạn.';

        var isPlaying = false;
        var isMuted = false;
        var currentSpeed = 1.0;
        var controlsTimeout = null;
        var isDraggingProgress = false;
        var isDraggingVideo = false;
        var lastSaveTime = 0;

        function generateVideoKey() {
            if (!video || !video.duration || isNaN(video.duration)) return null;
            var totalSeconds = Math.floor(video.duration);
            var hours = Math.floor(totalSeconds / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;
            var pad = function(num) { return num < 10 ? '0' + num : num; };
            return 'VIDEO_' + pad(hours) + '_' + pad(minutes) + '_' + pad(seconds);
        }
        
        function savePosition() {
            if (!video || video.ended || !video.currentTime || isNaN(video.currentTime)) return;
            var saveKey = generateVideoKey();
            if (!saveKey) return;
            var now = Date.now();
            if (now - lastSaveTime < 4000) return;
            lastSaveTime = now;
            try {
                if (video.currentTime > 5 && (video.currentTime < video.duration - 5)) {
                    localStorage.setItem(saveKey, JSON.stringify({ time: video.currentTime, duration: video.duration, savedAt: now }));
                }
            } catch (e) {}
        }
        
        function clearSavedPosition() {
            try {
                var saveKey = generateVideoKey();
                if (saveKey) localStorage.removeItem(saveKey);
            } catch (e) {}
        }
        
        function restorePosition() {
            try {
                var saveKey = generateVideoKey();
                if (!saveKey) return false;
                var saved = localStorage.getItem(saveKey);
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data && data.time && data.time > 5) {
                        if (data.time >= video.duration - 5) return false;
                        video.currentTime = data.time;
                        showToast('⏩ Đã tiếp tục phát từ ' + formatTime(data.time), 4000, true);
                        return true;
                    }
                }
            } catch (e) {}
            return false;
        }

        function switchSource(newSrc) {
            var wasPlaying = !video.paused;
            var prevTime = video.currentTime;
            stream1 = newSrc;
            video.src = newSrc;
            video.load();
            spinner.style.display = 'block';
            video.onloadeddata = function() {
                spinner.style.display = 'none';
                if (!restorePosition() && prevTime > 0) video.currentTime = prevTime;
                if (wasPlaying) video.play();
                showToast('Đã chuyển nguồn phát');
            };
            video.onerror = function() {
                spinner.style.display = 'none';
                showToast('Không thể phát nguồn này!');
            };
            playlistPanel.style.transform = 'translateX(100%)';
        }

        function createBtn(icon, title) {
            var btn = document.createElement('button');
            btn.textContent = icon;
            btn.title = title;
            btn.style.cssText = 'background:none;border:none;color:#fff;font-size:18px;cursor:pointer;padding:4px 8px;border-radius:4px;transition:background 0.2s;outline:none;';
            btn.onmouseenter = function() { btn.style.background = 'rgba(255,255,255,0.2)'; };
            btn.onmouseleave = function() { btn.style.background = 'none'; };
            return btn;
        }

        function showSeekOverlay(text) {
            seekOverlay.textContent = text;
            seekOverlay.style.opacity = '1';
            clearTimeout(seekOverlay._timer);
            seekOverlay._timer = setTimeout(function() { seekOverlay.style.opacity = '0'; }, 800);
        }

        // Sửa lỗi hiển thị giây/phút bị NaN thời gian đầu load video
        function formatTime(sec) {
            if (!sec || isNaN(sec)) return '0:00';
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ':' + (s < 10 ? '0' + s : s);
        }

        function updateProgress() {
            if (video.duration && !isNaN(video.duration) && !isDraggingProgress) {
                var pct = (video.currentTime / video.duration) * 100;
                progressBar.style.width = pct + '%';
            }
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        }

        function seekVideo(seconds) {
            var newTime = video.currentTime + seconds;
            if (newTime < 0) newTime = 0;
            if (video.duration && !isNaN(video.duration) && newTime > video.duration) newTime = video.duration;
            video.currentTime = newTime;
            showSeekOverlay((seconds > 0 ? '+' : '') + seconds + 's');
        }

        function togglePlay() {
            if (video.paused) {
                video.play().then(function() {
                    isPlaying = true; btnPlay.textContent = '⏸'; bigPlayBtn.style.display = 'none'; spinner.style.display = 'none';
                }).catch(function(e) {
                    video.muted = true;
                    video.play().then(function() { isMuted = true; btnMute.textContent = '🔇'; isPlaying = true; btnPlay.textContent = '⏸'; bigPlayBtn.style.display = 'none'; spinner.style.display = 'none'; });
                });
            } else {
                video.pause(); isPlaying = false; btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex';
            }
        }

        function toggleMute() {
            video.muted = !video.muted;
            isMuted = video.muted;
            btnMute.textContent = isMuted ? '🔇' : '🔊';
            showToast(isMuted ? 'Đã tắt tiếng' : 'Đã bật tiếng');
        }

        function reloadVideo() {
            spinner.style.display = 'block';
            var currentTime = video.currentTime;
            var wasPlaying = !video.paused;
            video.src = stream1 + (stream1.indexOf('?') > -1 ? '&' : '?') + '_reload=' + Date.now();
            video.load();
            video.onloadeddata = function() {
                spinner.style.display = 'none';
                video.currentTime = currentTime;
                restorePosition();
                if (wasPlaying) video.play();
                showToast('Đã tải lại nguồn video');
            };
            video.onerror = function() {
                spinner.style.display = 'none';
                if (stream2 && stream2 !== stream1) {
                    showToast('Nguồn 1 lỗi, thử nguồn dự phòng...');
                    stream1 = stream2;
                    video.src = stream1;
                    video.load();
                } else {
                    showToast('Lỗi tải video! Kiểm tra nguồn.');
                }
            };
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) container.requestFullscreen().catch(function() {});
            else document.exitFullscreen().catch(function() {});
        }

        function showControls() {
            controls.style.opacity = '1';
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(function() { if (!isDraggingProgress) controls.style.opacity = '0'; }, 3000);
        }

        video.addEventListener('loadeddata', function() {
            spinner.style.display = 'none';
            updateProgress();
            if (isMuted && video.muted) { video.muted = false; isMuted = false; btnMute.textContent = '🔊'; }
            restorePosition();
        });
        video.addEventListener('loadedmetadata', function() { restorePosition(); });
        video.addEventListener('waiting', function() { spinner.style.display = 'block'; });
        video.addEventListener('playing', function() { spinner.style.display = 'none'; bigPlayBtn.style.display = 'none'; });
        video.addEventListener('error', function() { spinner.style.display = 'none'; showToast('Lỗi phát hoặc quảng cáo đang chặn luồng. Nhấn 🔄 để tải lại.'); btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; });
        video.addEventListener('timeupdate', function() { updateProgress(); savePosition(); });
        video.addEventListener('ended', function() { btnPlay.textContent = '▶'; bigPlayBtn.style.display = 'flex'; isPlaying = false; clearSavedPosition(); });
        
        video.addEventListener('click', function(e) {
			    e.stopPropagation();
			    if (isDraggingVideo) { isDraggingVideo = false; return; }
			    
			    // Tính toán trực tiếp dựa trên độ rộng hiển thị của viewport để click chính xác hơn
			    var width = window.innerWidth;
			    var x = e.clientX;
			    
			    if (x < width * 0.3) seekVideo(-10);
			    else if (x > width * 0.7) seekVideo(10);
			    else togglePlay();
			});


        video.addEventListener('volumechange', function() { btnMute.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊'; });
        btnPlay.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });
        btnMute.addEventListener('click', function(e) { e.stopPropagation(); toggleMute(); });
        btnReload.addEventListener('click', function(e) { e.stopPropagation(); reloadVideo(); });
        btnFullscreen.addEventListener('click', function(e) { e.stopPropagation(); toggleFullscreen(); });
        btnPlaylist.addEventListener('click', function(e) { e.stopPropagation(); playlistPanel.style.transform = 'translateX(0)'; });
        
        progressWrap.addEventListener('click', function(e) {
            e.stopPropagation();
            var rect = progressWrap.getBoundingClientRect();
            var pct = (e.clientX - rect.left) / rect.width;
            if (video.duration && !isNaN(video.duration)) video.currentTime = pct * video.duration;
            updateProgress();
        });
        progressWrap.addEventListener('mousedown', function(e) { isDraggingProgress = true; showControls(); });
        document.addEventListener('mousemove', function(e) {
            if (isDraggingProgress && video.duration && !isNaN(video.duration)) {
                var rect = progressWrap.getBoundingClientRect();
                var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                progressBar.style.width = (pct * 100) + '%';
                video.currentTime = pct * video.duration;
                updateProgress();
            }
        });
        document.addEventListener('mouseup', function() { isDraggingProgress = false; });
        container.addEventListener('mousemove', showControls);
        container.addEventListener('click', showControls);
        bigPlayBtn.addEventListener('click', function(e) { e.stopPropagation(); togglePlay(); });

        // LẮP BỘ PHÍM TẮT ĐIỀU KHIỂN XỊN
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            showControls();
            switch (e.key) {
                case 'ArrowLeft': e.preventDefault(); e.shiftKey ? seekVideo(-30) : (e.ctrlKey || e.altKey) ? seekVideo(-5) : seekVideo(-10); break;
                case 'ArrowRight': e.preventDefault(); e.shiftKey ? seekVideo(30) : (e.ctrlKey || e.altKey) ? seekVideo(5) : seekVideo(10); break;
                case ' ': case 'k': case 'K': e.preventDefault(); togglePlay(); break;
                case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); showToast('Âm lượng: ' + Math.round(video.volume * 100) + '%'); break;
                case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); showToast('Âm lượng: ' + Math.round(video.volume * 100) + '%'); break;
                case 'm': case 'M': e.preventDefault(); toggleMute(); break;
                case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
                case 'r': case 'R': e.preventDefault(); reloadVideo(); break;
                case 'Home': e.preventDefault(); video.currentTime = 0; showToast('Về đầu video'); break;
                case 'End': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration - 1; break;
                case '>': case '.': e.preventDefault(); currentSpeed = Math.min(4, currentSpeed + 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '<': case ',': e.preventDefault(); currentSpeed = Math.max(0.25, currentSpeed - 0.25); video.playbackRate = currentSpeed; speedIndicator.textContent = currentSpeed.toFixed(1) + 'x'; showToast('Tốc độ: ' + currentSpeed.toFixed(1) + 'x'); break;
                case '0': e.preventDefault(); video.currentTime = 0; break;
                case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9': e.preventDefault(); if (video.duration && !isNaN(video.duration)) video.currentTime = video.duration * (parseInt(e.key) / 10); break;
            }
        });

        // BỘ CẢM ỨNG ĐIỀU HƯỚNG SẠCH QUẢNG CÁO VUỐT CHẠY
        var touchStartX = 0, touchStartY = 0, isSwiping = false;
        container.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; isSwiping = false; }, { passive: true });
        container.addEventListener('touchmove', function(e) {
            if (e.touches.length !== 1) return;
            var dx = e.touches[0].clientX - touchStartX;
            var dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
                isSwiping = true;
                var seekSec = Math.round(dx / 15);
                if (Math.abs(seekSec) >= 1) { seekVideo(seekSec); touchStartX = e.touches[0].clientX; }
            }
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 20) {
                isSwiping = true;
                if (touchStartX > window.innerWidth / 2) {
                    var volChange = -dy / 200;
                    video.volume = Math.max(0, Math.min(1, video.volume + volChange));
                    showToast('🔊 ' + Math.round(video.volume * 100) + '%');
                    touchStartY = e.touches[0].clientY;
                }
            }
        }, { passive: true });

        // TUA VÙNG CHUỘT KÉO (REGION MOUSE SELECT) KHÔNG LO QUẢNG CÁO
        var regionStartX = 0, regionOverlay = null;
        video.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            isDraggingVideo = false;
            regionStartX = e.clientX;
            regionOverlay = document.createElement('div');
            regionOverlay.style.cssText = 'position:fixed;top:0;height:100vh;background:rgba(231,76,60,0.3);pointer-events:none;z-index:25;';
            document.body.appendChild(regionOverlay);
        });
        document.addEventListener('mousemove', function(e) {
            if (!regionOverlay) return;
            isDraggingVideo = true;
            var left = Math.min(regionStartX, e.clientX);
            var width = Math.abs(e.clientX - regionStartX);
            regionOverlay.style.left = left + 'px';
            regionOverlay.style.width = width + 'px';
        });
        document.addEventListener('mouseup', function(e) {
            if (!regionOverlay) return;
            var deltaX = e.clientX - regionStartX;
            if (Math.abs(deltaX) > 50 && video.duration && !isNaN(video.duration)) {
                var startPct = Math.min(regionStartX, e.clientX) / window.innerWidth;
                video.currentTime = startPct * video.duration;
                showToast('⏩ Đã tua đến vùng chọn: ' + formatTime(video.currentTime));
                if (video.paused) togglePlay();
            }
            regionOverlay.remove();
            regionOverlay = null;
        });

        // BẮT ĐẦU PHÁT TRÊN THẺ GỐC (GIỮ NGUYÊN TRẠNG THÁI LUỒNG BLOB)
        if (video.paused) {
            video.play().then(function() {
                isPlaying = true; btnPlay.textContent = '⏸';
                showToast('🎉 Đã bọc Player thành công lên video gốc! Xem phim mượt mà, sạch quảng cáo.', 5000, true, true);
            }).catch(function() {
                video.muted = true; isMuted = true; btnMute.textContent = '🔇';
                video.play();
                showToast('Đã phát tự động (Muted) - Bấm 🔊 hoặc phím M để bật tiếng');
            });
        } else {
            isPlaying = true;
            btnPlay.textContent = '⏸';
            showToast('🎉 Xem vui nhé các bạn.  ', 5000, true, true);
        }

        renderPlaylist();
        showControls();

        // PHƠI BÀY API LÀM VIỆC (GIỮ NGUYÊN)
        window.VideoPlayerAPI = {
            addServer: function(item) { if (!item || !item.src) return; playlistState.servers.push(item); renderPlaylist(); },
            addServerAt: function(index, item) { if (!item || !item.src) return; playlistState.servers.splice(index, 0, item); renderPlaylist(); },
            addEpisode: function(item) { if (!item || !item.src) return; playlistState.episodes.push(item); renderPlaylist(); },
            addEpisodeAt: function(index, item) { if (!item || !item.src) return; playlistState.episodes.splice(index, 0, item); renderPlaylist(); },
            removeServer: function(label) { playlistState.servers = playlistState.servers.filter(function(s) { return s.label !== label; }); renderPlaylist(); },
            removeEpisode: function(label) { playlistState.episodes = playlistState.episodes.filter(function(s) { return s.label !== label; }); renderPlaylist(); },
            clearServers: function() { playlistState.servers = []; renderPlaylist(); },
            clearEpisodes: function() { playlistState.episodes = []; renderPlaylist(); },
            getServers: function() { return playlistState.servers.slice(); },
            getEpisodes: function() { return playlistState.episodes.slice(); },
            switchSource: function(src) { switchSource(src); },
            refresh: function() { renderPlaylist(); }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', GetlinkVideo);
    } else {
        GetlinkVideo();
    }
}
function checkResume() {
	// SỬA: Lấy động giá trị từ tham số $url truyền vào hàm textJS bên ngoài
	// Thay thế đoạn checkAndClick cũ ở cuối script bằng logic này:
	// Thay thế đoạn initVideoFlow cũ ở cuối script bằng logic tối ưu này:
	(function initVideoFlow() {
		// Bước 1: Kiểm tra nhanh lần đầu tiên xem có video luôn không
		if (document.querySelector('video')) {
			console.log("🎯 Tìm thấy thẻ video ngay lập tức. Khởi chạy luôn!");
			runVideo();
			return;
		}
		
		console.log("⏳ Chưa thấy video. Bắt đầu quét tìm video hoặc nút resumeBtn mỗi 1 giây...");
		let secondsPassed = 0;
		const maxSeconds = 20;
		const checkInterval = setInterval(function() {
			secondsPassed++;
			
			// Truy vấn cả 2 phần tử ở mỗi chu kỳ quét
			const videoElement = document.querySelector('video');
			const skipButton = document.getElementById("resumeBtn");
			
			// ĐIỀU KIỆN 1: Nếu tự nhiên tìm thấy thẻ video xuất hiện
			if (videoElement) {
				clearInterval(
					checkInterval); // Xóa lặp ngay lập tức để tránh lỗi click ngầm về sau
				console.log(
					"✓ Tìm thấy thẻ video xuất hiện trong vòng lặp! Khởi chạy ngay."
				);
				runVideo();
				return;
			}
			
			// ĐIỀU KIỆN 2: Nếu tìm thấy nút resumeBtn trước
			if (skipButton) {
				// Kiểm tra ẩn/hiển thị bằng CSS thực tế
				const style = window.getComputedStyle(skipButton);
				if (style.display !== 'none' && style.visibility !== 'hidden') {
					
					clearInterval(
						checkInterval); // Xóa lặp ngay lập tức để an toàn cho DOM mới
					console.log(
						"🎯 Đã tìm thấy nút resumeBtn hiển thị! Click và đợi 2s...");
					
					skipButton.click(); // Click vào nút
					
					setTimeout(function() {
						runVideo(); // Chạy runVideo sau khi click 2 giây
					}, 2000);
					return;
				}
			}
			
			// ĐIỀU KIỆN 3: Đã quét hết 20 giây mà cả video lẫn nút đều "bặt vô âm tín"
			if (secondsPassed >= maxSeconds) {
				clearInterval(checkInterval); // Dừng vòng lặp hẳn
				console.log("⏱ Đã hết 20 giây quét mà không tìm thấy gì.");
				
				// Hiển thị Toast thông báo yêu cầu người dùng tương tác trong 20s
				showToast(
					"⚠️ Vui lòng nhấn vào màn hình hoặc nút Xem Tiếp để tiếp tục phát phim!",
					20000,
					true,
					false
				);
				
				// Ép chạy hàm runVideo() luôn sau đó để dựng giao diện player custom lên
				runVideo();
			}
		}, 1000); // Quét lại sau mỗi 1 giây (1000ms)
	})();
}
setTimeout(checkResume, 1000);




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
								if (CHECKEPI == "true") {
									showToast('Tập phim bạn chọn chưa có hoặc đã lỗi. Đã tự động đưa bạn về tập 1!', 60000, true);
								}
								else{
									showToast(CHECKEPI, 30000, true,true);
								}
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

function parseCategoriesResponse(apiResponseJson) {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
// https://k8s.onflixcdn.com/api/movies?sort=year_desc&limit=24&category=chien-tranh
function getLISTmenu() {
    return `
/the-loai/short-drama@@Short Drama
/the-loai/co-trang@@Cổ Trang
/the-loai/hai-huoc@@Hài Hước
/the-loai/hinh-su@@Hình Sự
/the-loai/chinh-kich@@Chính kịch
/the-loai/vo-thuat@@Võ Thuật
/the-loai/kinh-di@@Kinh Dị
/the-loai/bi-an@@Bí ẩn
/the-loai/tinh-cam@@Tình Cảm
/the-loai/tam-ly@@Tâm Lý
/the-loai/phieu-luu@@Phiêu Lưu
/the-loai/gia-dinh@@Gia Đình
/the-loai/hoat-hinh@@Hoạt Hình
/the-loai/vien-tuong@@Viễn Tưởng
/the-loai/khoa-hoc@@Khoa Học
/the-loai/the-thao@@Thể Thao
/the-loai/tai-lieu@@Tài Liệu
/the-loai/hanh-dong@@Hành Động
/the-loai/tv-shows@@TV Shows
/the-loai/chien-tranh@@Chiến Tranh
/the-loai/am-nhac@@Âm Nhạc
/the-loai/hoc-duong@@Học Đường
/the-loai/phim-bo@@Phim bộ
/the-loai/gia-tuong@@Giả Tưởng
/the-loai/lang-man@@Lãng Mạn
/the-loai/phim-hai@@Phim Hài
/the-loai/phim-le@@Phim lẻ
/the-loai/khoa-hoc-vien-tuong@@Khoa Học Viễn Tưởng
/the-loai/gay-can@@Gây Cấn
/the-loai/phim-nhac@@Phim Nhạc
/the-loai/tre-em@@Trẻ Em
/the-loai/phim-dang-chieu@@Phim đang chiếu
/the-loai/than-thoai@@Thần Thoại
/the-loai/lich-su@@Lịch Sử
/the-loai/mien-tay@@Miền Tây
/the-loai/phim-18@@Phim 18+
/the-loai/subteam@@Subteam
/the-loai/kinh-dien@@Kinh Điển
/the-loai/phim-ngan@@Phim Ngắn
`
}

function buildMenu(listurl){let menulist=[];if (!listurl)return menulist;let lines=listurl.split('\n');for (let i=0;i < lines.length;i++){let line=lines[i].trim();if (!line||line.indexOf('@@')===-1)continue;let parts=line.split('@@');let link=parts[0]?parts[0].trim():"";let name=parts[1]?parts[1].trim():"";let check=parts[2]?parts[2].trim():undefined;if (!link||!name)continue;let item={};if (check==="false"){item={"slug":link,"title":name,"type":"Horizontal"};}else if (check==="true"){item={"slug":link,"title":name,"type":"Grid"};}else{item={"slug":link,"name":name};}menulist.push(item);}return menulist;}
function _$(htmlOrBlock){if (htmlOrBlock&&typeof htmlOrBlock==='object'&&htmlOrBlock.elements){return htmlOrBlock;}var instance={sourceHtml:typeof htmlOrBlock==='string'?htmlOrBlock:'',elements:Array.isArray(htmlOrBlock)?htmlOrBlock:(htmlOrBlock?[htmlOrBlock]:[]),find:function(selector){var results=[];var contentFilter="";if (selector.indexOf(":content(")!==-1){var contentMatch=selector.match(/:content\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);if (contentMatch){contentFilter=contentMatch[1]||contentMatch[2]||contentMatch[3]||"";selector=selector.replace(/:content\((?:"[^"]*"|'[^']*'|[^)]*)\)/,"");}}var attrNameFilter="";var attrValueFilter="";var hasAttrFilter=false;var attrMatch=selector.match(/\[([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\]"']*))\]/);if (attrMatch){hasAttrFilter=true;attrNameFilter=attrMatch[1];attrValueFilter=attrMatch[2]||attrMatch[3]||attrMatch[4]||"";selector=selector.replace(/\[.*?\]/,"");}var notSelector="";if (selector.indexOf(":not(")!==-1){var notMatch=selector.match(/:not\(([^)]+)\)/);if (notMatch){notSelector=notMatch[1];selector=selector.replace(/:not\([^)]+\)/,"");}}var isFirstFilter=selector.indexOf(":first")!==-1;var isLastFilter=selector.indexOf(":last")!==-1;selector=selector.replace(/:first|:last/g,"");var isClass=selector.indexOf('.')===0;var isId=selector.indexOf('#')===0;var isAttrOnly=(selector===""&&hasAttrFilter);var targetClasses=[];var targetId="";var targetTagName="";if (isClass){targetClasses=selector.split('.').filter(function(c){return c.length > 0;});}else if (isId){targetId=selector.substring(1);}else if (!isAttrOnly){targetTagName=selector.toLowerCase();}for (var i=0;i < this.elements.length;i++){var currentHtml=this.elements[i];var pos=0;var subResults=[];while ((pos=currentHtml.indexOf('<',pos))!==-1){if (currentHtml.charAt(pos+1)==='/'||currentHtml.charAt(pos+1)==='!'){pos++;continue;}var endOpenTag=currentHtml.indexOf('>',pos);if (endOpenTag===-1)break;var fullOpenTag=currentHtml.substring(pos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName="";if (spacePos===-1){currentTagName=fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase();}else{currentTagName=fullOpenTag.substring(1,spacePos).toLowerCase();}var isMatched=false;if (isClass){var classMatchStr="";var classPos=fullOpenTag.indexOf('class="');if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{classPos=fullOpenTag.indexOf("class='");if (classPos!==-1){var startQuote=classPos+7;classMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (classMatchStr){var currentClasses=classMatchStr.split(/\s+/);var matchCount=0;for (var c=0;c < targetClasses.length;c++){if (currentClasses.indexOf(targetClasses[c])!==-1)matchCount++;}if (matchCount===targetClasses.length)isMatched=true;}}else if (isId){var idMatchStr="";var idPos=fullOpenTag.indexOf('id="');if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf('"',startQuote));}else{idPos=fullOpenTag.indexOf("id='");if (idPos!==-1){var startQuote=idPos+4;idMatchStr=fullOpenTag.substring(startQuote,fullOpenTag.indexOf("'",startQuote));}}if (idMatchStr===targetId)isMatched=true;}else if (isAttrOnly){isMatched=true;}else{if (currentTagName===targetTagName)isMatched=true;}if (isMatched&&hasAttrFilter){var searchStr1=attrNameFilter+'="'+attrValueFilter+'"';var searchStr2=attrNameFilter+"='"+attrValueFilter+"'";if (fullOpenTag.indexOf(searchStr1)===-1&&fullOpenTag.indexOf(searchStr2)===-1){isMatched=false;}}if (isMatched){var startTagPos=pos;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var scanPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&scanPos < currentHtml.length){var nextOpen=currentHtml.indexOf(openStr,scanPos);var nextClose=currentHtml.indexOf(closeStr,scanPos);if (nextClose===-1){scanPos=currentHtml.length;break;}if (nextOpen!==-1&&nextOpen < nextClose){depth++;scanPos=nextOpen+openStr.length;}else{depth--;scanPos=nextClose+closeStr.length;if (depth===0)endTagPos=nextClose+closeStr.length;}}}var foundBlock=currentHtml.substring(startTagPos,endTagPos);if (contentFilter){var pureText=foundBlock.replace(/<[^>]+>/g,"").trim();if (pureText.indexOf(contentFilter)===-1){pos=endTagPos;continue;}}if (notSelector){var isNotClass=notSelector.indexOf('.')===0;var isNotId=notSelector.indexOf('#')===0;var notValue=notSelector.substring(1);var hasNot=false;if (isNotClass&&fullOpenTag.indexOf('class="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (isNotId&&fullOpenTag.indexOf('id="')!==-1&&fullOpenTag.indexOf(notValue)!==-1)hasNot=true;if (!hasNot)subResults.push(foundBlock);}else{subResults.push(foundBlock);}pos=endTagPos;}else{pos++;}}if (isFirstFilter&&subResults.length > 0)subResults=[subResults[0]];if (isLastFilter&&subResults.length > 0)subResults=[subResults[subResults.length-1]];results=results.concat(subResults);}var newInstance=_$(results);newInstance.sourceHtml=this.sourceHtml||currentHtml;return newInstance;},each:function(callback){for (var i=0;i < this.elements.length;i++){var childInstance=_$(this.elements[i]);childInstance.sourceHtml=this.sourceHtml;callback.call(childInstance,i,this.elements[i]);}return this;},eq:function(index){if (index < 0)index=this.elements.length+index;var matchedElement=this.elements[index];this.elements=matchedElement?[matchedElement]:[];return this;},attr:function(attrName){if (this.elements.length===0)return "";var elem=this.elements[0];var searchStr=attrName+'="';var pos=elem.indexOf(searchStr);if (pos===-1){searchStr=attrName+"='";pos=elem.indexOf(searchStr);}if (pos===-1)return "";var start=pos+searchStr.length;var quoteType=elem.charAt(start-1);var end=elem.indexOf(quoteType,start);return end===-1?"":elem.substring(start,end);},html:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start)return elem.substring(start,end);return "";},text:function(){if (this.elements.length===0)return "";var elem=this.elements[0];var start=elem.indexOf('>')+1;var end=elem.lastIndexOf('</');if (start > 0&&end > start){var content=elem.substring(start,end);return content.replace(/<\/?[^>]+(>|$)/g,"").trim();}return "";},next:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx===-1)continue;var scanPos=idx+elem.length;var nextOpen=this.sourceHtml.indexOf('<',scanPos);if (nextOpen!==-1){if (this.sourceHtml.charAt(nextOpen+1)==='/') continue;var endOpenTag=this.sourceHtml.indexOf('>',nextOpen);if (endOpenTag===-1)continue;var fullOpenTag=this.sourceHtml.substring(nextOpen,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var startTagPos=nextOpen;var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}results.push(this.sourceHtml.substring(startTagPos,endTagPos));}}var nextInstance=_$(results);nextInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;},parent:function(){var results=[];if (!this.sourceHtml)return this;for (var i=0;i < this.elements.length;i++){var elem=this.elements[i];var idx=this.sourceHtml.indexOf(elem);if (idx <=0)continue;var scanPos=idx-1;while (scanPos >=0){var openTagPos=this.sourceHtml.lastIndexOf('<',scanPos);if (openTagPos===-1)break;if (this.sourceHtml.charAt(openTagPos+1)!=='/'&&this.sourceHtml.charAt(openTagPos+1)!=='!'){var endOpenTag=this.sourceHtml.indexOf('>',openTagPos);if (endOpenTag!==-1&&endOpenTag > openTagPos){var fullOpenTag=this.sourceHtml.substring(openTagPos,endOpenTag+1);var spacePos=fullOpenTag.indexOf(' ');var currentTagName=(spacePos===-1)?fullOpenTag.substring(1,fullOpenTag.length-1).toLowerCase():fullOpenTag.substring(1,spacePos).toLowerCase();var endTagPos=endOpenTag+1;var selfClosingTags=['img','source','input','br','hr','link','meta'];if (selfClosingTags.indexOf(currentTagName)===-1&&fullOpenTag.indexOf('/>')===-1){var depth=1;var sPos=endOpenTag+1;var openStr='<'+currentTagName;var closeStr='</'+currentTagName+'>';while (depth > 0&&sPos < this.sourceHtml.length){var nOpen=this.sourceHtml.indexOf(openStr,sPos);var nClose=this.sourceHtml.indexOf(closeStr,sPos);if (nClose===-1)break;if (nOpen!==-1&&nOpen < nClose){depth++;sPos=nOpen+openStr.length;}else{depth--;sPos=nClose+closeStr.length;if (depth===0)endTagPos=nClose+closeStr.length;}}}if (endTagPos >=idx+elem.length){var parentBlock=this.sourceHtml.substring(openTagPos,endTagPos);if (results.indexOf(parentBlock)===-1)results.push(parentBlock);break;}}}scanPos=openTagPos-1;}}var parentInstance=_$(results);parentInstance.sourceHtml=this.sourceHtml;this.elements=results;return this;}};return instance;};