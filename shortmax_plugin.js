var BASEURL = "https://www.shorttv.live";
var BASEAPI = "http://vkey.vn/novahd/api";
var BASELINK = BASEURL;
var popup_html = "<div class='donate-container'><h2 class='donate-heading'>DONATE</h2><p class='donate-description'>Anh em yêu quý có thể mời bọn mình 2 ly cà phê nhé. Để có động lực duy trì App, cập nhật plugin và tìm thêm nhiều nguồn mới và hay cho anh em. Một chút lòng thành cũng làm bọn mình tiếp tục hoạt động tốt hơn, cám ơn anh em.</p><div class='donate-grid'><div class='donate-card'><div class='donate-title'>Donate Tác giả Plugin</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qrht.png' alt='Donate Tác giả Plugin' /></div></div><div class='donate-card'><div class='donate-title'>Donate Tác giả App</div><div class='qr-wrapper'><img src='https://vaxplugin.alokillgtv.workers.dev/img/qryb.png' alt='Donate Tác giả App' /></div></div></div></div><style>.donate-container{max-width:800px;margin:0 auto;padding:10px;box-sizing:border-box;font-family:Arial,sans-serif;text-align:center;color:#eee}.donate-heading{font-size:22px;font-weight:bold;margin:0 0 12px 0;color:#fff;text-transform:uppercase;letter-spacing:1px}.donate-description{font-size:14px;line-height:1.5;margin-bottom:18px;color:#ccc}.donate-grid{display:flex;flex-direction:row;justify-content:center;align-items:stretch;gap:16px}.donate-card{flex:1;min-width:0;background:#22252a;border-radius:12px;padding:14px;border:1px solid #33373e;display:flex;flex-direction:column;align-items:center}.donate-title{font-weight:bold;font-size:15px;margin-bottom:12px;color:#fff}.qr-wrapper{width:100%;max-width:240px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:#181a1d;border-radius:8px;padding:8px;box-sizing:border-box}.qr-wrapper img{width:100%;height:100%;object-fit:contain;border-radius:4px}@media(max-width:600px){.donate-grid{flex-direction:column}.donate-heading{font-size:18px;margin-bottom:8px}.donate-description{font-size:13px;margin-bottom:12px}.qr-wrapper{max-width:180px}}</style>";

function getManifest() {
  try {
    return JSON.stringify({
      "id": "shortmax",
      "name": "Nguồn Shortmax VIP",
      "version": "1.2.0",
      "author": "Alokillgtv",
      "info": "Nguồn phim ngắn ShortMax HD - Hỗ trợ xem mượt mà toàn bộ tập VIP",
      "baseUrl": BASEURL,
      "iconUrl": "https://vaxplugin.alokillgtv.workers.dev/img/shortmax.png",
      "isEnabled": true,
      "isAdult": false,
      "adblock": true,
      "layoutType": "HORIZONTAL",
      "type": "shortfilm",
      "subtitleCat": false,
      "popup_html": popup_html,
      "debug": true,
      "playerType": "exoplayer"
    });
  } catch(e) {
    return JSON.stringify({
      "id": "shortmax",
      "name": "Nguồn Shortmax",
      "version": "1.0",
      "baseUrl": BASEURL,
      "isEnabled": true,
      "type": "shortfilm",
      "playerType": "exoplayer"
    });
  }
}

// ===== HÀM MENU LIST BEGIN ======
function getHomeSections() {
    return JSON.stringify([
        { "slug": "/vi/dramas", "title": "Phim Mới Nhất", "type": "Grid" },
        { "slug": "/vi/genres/t%E1%BB%95ng-t%C3%A0i-200064", "title": "Tổng Tài", "type": "Horizontal" },
        { "slug": "/vi/genres/hi%E1%BB%87n-%C4%91%E1%BA%A1i-200052", "title": "Hiện Đại", "type": "Horizontal" },
        { "slug": "/vi/genres/tr%E1%BB%8Dng-sinh-200063", "title": "Trọng Sinh", "type": "Horizontal" },
        { "slug": "/vi/genres/b%C3%A1o-th%C3%B9-200062", "title": "Báo Thù", "type": "Horizontal" }
    ]);
}

function getLISTmenu() {
    return `[
        {"link":"/vi/genres/hi%E1%BB%87n-%C4%91%E1%BA%A1i-200052","name":"Hiện đại"},
        {"link":"/vi/genres/c%E1%BB%95-%C4%91%E1%BA%A1i-200053","name":"Cổ đại"},
        {"link":"/vi/genres/t%C3%ACnh-y%C3%AAu-ng%C6%B0%E1%BB%9Ci-s%C3%B3i-200071","name":"Người sói"},
        {"link":"/vi/genres/b%C3%A1o-th%C3%B9-200062","name":"Báo thù"},
        {"link":"/vi/genres/tr%E1%BB%8Dng-sinh-200063","name":"Trọng sinh"},
        {"link":"/vi/genres/t%E1%BB%95ng-t%C3%A0i-200064","name":"Tổng tài"},
        {"link":"/vi/genres/h%E1%BB%A3p-%C4%91%E1%BB%93ng-h%C3%B4n-nh%C3%A2n-200065","name":"Hợp đồng hôn nhân"},
        {"link":"/vi/genres/thanh-xu%C3%A2n-200068","name":"Thanh xuân"},
        {"link":"/vi/genres/vi%E1%BB%85n-t%C6%B0%E1%BB%9Fng-200070","name":"Viễn tưởng"},
        {"link":"/vi/genres/si%C3%AAu-n%C4%83ng-l%E1%BB%B1c-200073","name":"Siêu năng lực"},
        {"link":"/vi/genres/huy%E1%BB%81n-huy%E1%BB%85n-200075","name":"Huyền huyễn"},
        {"link":"/vi/genres/gia-%C4%91%C3%ACnh-200077","name":"Gia đình"},
        {"link":"/vi/genres/h%C3%A0o-m%C3%B4n-200082","name":"Hào môn"},
        {"link":"/vi/genres/n%E1%BB%AF-c%C6%B0%E1%BB%9Dng-200085","name":"Nữ cường"},
        {"link":"/vi/genres/h%C3%A0nh-%C4%91%E1%BB%93ng-200087","name":"Hành động"},
        {"link":"/vi/genres/xuy%C3%AAn-kh%C3%B4ng-200088","name":"Xuyên không"},
        {"link":"/vi/genres/l%C3%A3ng-m%E1%BA%A1n-200089","name":"Lãng mạn"},
        {"link":"/vi/genres/%E1%BB%9F-r%E1%BB%83-200094","name":"Ở rể"},
        {"link":"/vi/genres/thi%E1%BA%BFu-gia-200101","name":"Thiếu gia"},
        {"link":"/vi/genres/thi%C3%AAn-kim-th%E1%BA%ADt-gi%E1%BA%A3-200102","name":"Thiên kim thật giả"}
    ]`;
}
// ===== HÀM MENU LIST END ======

// ===== HÀM TẠO URL BEGIN ======
function getUrlList(slug, filtersJson) {
    try {
        if (slug && slug.indexOf("http") > -1) {
            return slug;
        }
        var page = 1;
        var path = slug || "/vi/dramas";
        if (filtersJson) {
            var fixedJson = typeof filtersJson === "string" ?
                filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
            try {
                var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
                if (filters.page) page = parseInt(filters.page, 10) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].link || path;
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (e) {}
        }
        if (path.charAt(0) !== "/") path = "/" + path;
        var resultUrl = BASEURL + path;
        if (page > 1) {
            resultUrl += (resultUrl.indexOf("?") > -1 ? "&page=" : "?page=") + page;
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL + "/vi/dramas";
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var fixedJson = typeof filtersJson === "string" ?
                filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':') : "";
            try {
                var filters = typeof filtersJson === "object" ? filtersJson : JSON.parse(fixedJson);
                if (filters.page) page = parseInt(filters.page, 10) || 1;
            } catch (e) {}
        }
        var encoded = encodeURIComponent(keyword || "");
        var resultUrl = BASEURL + "/vi/search/" + encoded;
        if (page > 1) {
            resultUrl += "?page=" + page;
        }
        return resultUrl.replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return BASEURL;
    }
}
// ===== HÀM TẠO URL END ======

// ===== HÀM TẠO KHỐI LIST PHIM BEGIN ======
function parseListResponse(html, fetchedUrl) {
    try {
        var items = [];
        var seen = {};

        // 1. Parse theo HTML Card Block
        var blocks = html.split(/<div[^>]*class=["'][^"']*(?:drama-card|cards-list-card|search-card)[^"']*["']/i);
        if (blocks.length > 1) {
            for (var i = 1; i < blocks.length; i++) {
                var block = blocks[i];
                var linkMatch = block.match(/href=["'](\/vi\/drama\/[^"']+)["']/i);
                if (!linkMatch) continue;
                var link = linkMatch[1];
                if (link.indexOf('http') !== 0) {
                    if (link.charAt(0) !== '/') link = '/' + link;
                    link = BASEURL + link;
                }
                if (seen[link]) continue;

                var imgMatch = block.match(/src=["']([^"']+)["']/i);
                var poster = imgMatch ? imgMatch[1].replace(/&amp;/g, '&') : '';

                var titleMatch = block.match(/class=["'][^"']*(?:card-subtitle|cards-list-card-content-title)[^"']*["'][^>]*>([\s\S]*?)<\/p>/i) ||
                                 block.match(/alt=["']([^"']+)["']/i) ||
                                 block.match(/title=["']([^"']+)["']/i);
                var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

                if (link && (title || poster)) {
                    seen[link] = true;
                    items.push({
                        "id": link,
                        "title": title || "Phim ShortMax",
                        "quality": "HD",
                        "episode_current": "FULL VIP",
                        "posterUrl": poster,
                        "backdropUrl": poster
                    });
                }
            }
        }

        // 2. Fallback: Parse __NUXT_DATA__ JSON nếu HTML DOM không trích xuất được
        if (items.length === 0) {
            var nuxtMatch = html.match(/id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
            if (nuxtMatch) {
                try {
                    var arr = JSON.parse(nuxtMatch[1]);
                    for (var j = 0; j < arr.length; j++) {
                        var it = arr[j];
                        if (it && typeof it === 'object' && it.title) {
                            var rawUrl = it.url || it.id || "";
                            if (typeof rawUrl === 'string' && rawUrl.indexOf('/vi/drama/') !== -1) {
                                var fullLink = rawUrl.indexOf('http') === 0 ? rawUrl : BASEURL + rawUrl;
                                if (!seen[fullLink]) {
                                    seen[fullLink] = true;
                                    var img = it.imageUrl || it.cover || "";
                                    items.push({
                                        "id": fullLink,
                                        "title": it.title,
                                        "quality": "HD",
                                        "episode_current": "FULL VIP",
                                        "posterUrl": img,
                                        "backdropUrl": img
                                    });
                                }
                            }
                        }
                    }
                } catch(jsonErr) {}
            }
        }

        // 3. Fallback 2: Direct Regex cho <a> tag /vi/drama/
        if (items.length === 0) {
            var aRegex = /<a[^>]*href=["'](\/vi\/drama\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            var aMatch;
            while ((aMatch = aRegex.exec(html)) !== null) {
                var aLink = BASEURL + aMatch[1];
                if (!seen[aLink]) {
                    seen[aLink] = true;
                    items.push({
                        "id": aLink,
                        "title": "Phim ShortMax",
                        "quality": "HD",
                        "episode_current": "FULL VIP",
                        "posterUrl": "",
                        "backdropUrl": ""
                    });
                }
            }
        }

        var currentPage = 1;
        var pageMatch = (fetchedUrl || "").match(/[?&]page=(\d+)/);
        if (pageMatch) currentPage = parseInt(pageMatch[1], 10) || 1;

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": 999,
                "hasNext": items.length >= 10
            }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}
// ===== HÀM TẠO KHỐI LIST PHIM END ======

// ===== HÀM TẠO KHỐI CHI TIẾT PHIM BEGIN ======
function parseMovieDetail(html, pageUrl) {
    try {
        var idMatch = pageUrl.match(/-(\d+)(?:[?#]|$)/) || (html || "").match(/dramaId["']?\s*:\s*["']?(\d+)/);
        var dramaId = idMatch ? idMatch[1] : "";

        if (!dramaId) {
            throw new Error("Không thể trích xuất ID phim từ: " + pageUrl);
        }

        var titleMatch = (html || "").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || (html || "").match(/<title>([\s\S]*?)<\/title>/i);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim().replace(/ - ShortMax.*$/i, '') : "Phim ShortMax";

        var posterMatch = (html || "").match(/<img[^>]*src=["'](https?:[^"']*(?:cover|poster|images)[^"']*)["']/i) || (html || "").match(/https:\/\/akamai-static\.shorttv\.live\/images\/cover\/[^\s"']+/);
        var posterUrl = posterMatch ? (posterMatch[1] || posterMatch[0]).replace(/&amp;/g, '&') : "";

        var descMatch = (html || "").match(/class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : "Phim ngắn ShortMax VIP chất lượng cao";

        // Xác định số tập tối đa
        var maxEpi = 1;
        var epRegex = /\/vi\/episode\/[^\s"']*-(\d+)(?:["']|>)/gi;
        var epMatch;
        while ((epMatch = epRegex.exec(html)) !== null) {
            var num = parseInt(epMatch[1], 10);
            if (!isNaN(num) && num > maxEpi) maxEpi = num;
        }

        var slugMatch = pageUrl.match(/\/vi\/drama\/([^?#]+)/);
        var dramaSlug = slugMatch ? slugMatch[1] : dramaId;

        var servers = [];

        // Server 1: VIP Server (Full All Episodes)
        var vipEpisodes = [];
        for (var j = 1; j <= maxEpi; j++) {
            var vipUrl = "https://shortmax.alokillgtv.workers.dev/?id=" + dramaId + "&ep=" + j + "&lang=vi&sv=1&eq=1&server=server1";
            vipEpisodes.push({
                "id": vipUrl,
                "name": "Tập " + j + " (VIP)",
                "slug": "tap-" + j
            });
        }
        servers.push({
            name: "Server VIP (Tất Cả Tập VIP)",
            episodes: vipEpisodes
        });

        // Server 2: Server Dự Phòng (Direct Web)
        var webEpisodes = [];
        for (var k = 1; k <= maxEpi; k++) {
            var webUrl = "https://www.shorttv.live/vi/episode/" + dramaSlug + "-" + k;
            webEpisodes.push({
                "id": webUrl,
                "name": "Tập " + k + " (Dự Phòng)",
                "slug": "tap-" + k
            });
        }
        servers.push({
            name: "Server Dự Phòng (Direct Web)",
            episodes: webEpisodes
        });

        return JSON.stringify({
            "id": pageUrl,
            "title": title,
            "originName": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "description": description,
            "quality": "HD 1080p",
            "status": "Tập " + maxEpi + " VIP",
            "episode_current": "Tập " + maxEpi,
            "servers": servers
        });
    } catch (e) {
        return JSON.stringify({
            "id": pageUrl,
            "title": "Lỗi chi tiết phim",
            "description": e.message || String(e),
            "servers": []
        });
    }
}
// ===== HÀM TẠO KHỐI CHI TIẾT PHIM END ======

// ===== HÀM TẠO XỬ LÝ STREAM PHIM BEGIN ======
function parseDetailResponse(html, url) {
    try {
        return JSON.stringify({
            "url": url,
            "isEmbed": true,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.shorttv.live/",
                "Origin": "https://www.shorttv.live"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            "mimeType": "video/mp4",
            "isEmbed": false,
            "headers": {},
            "subtitles": []
        });
    }
}

function parseEmbedResponse(html, url) {
    try {
        var streamUrl = "";

        // Case 1: Worker JSON Response
        if (html && (html.trim().charAt(0) === '{' || html.indexOf('"status"') !== -1)) {
            try {
                var responseData = JSON.parse(html);
                var serverPayload = responseData.data && responseData.data.server ? responseData.data : responseData;
                var serverData = serverPayload.server || responseData.server || {};

                if (serverData.qualities && Array.isArray(serverData.qualities) && serverData.qualities.length > 0) {
                    var q1080 = null, q720 = null;
                    for (var i = 0; i < serverData.qualities.length; i++) {
                        var q = serverData.qualities[i];
                        if (q && q.quality && q.quality.indexOf('1080') !== -1) q1080 = q;
                        if (q && q.quality && q.quality.indexOf('720') !== -1) q720 = q;
                    }
                    var chosen = q1080 || q720 || serverData.qualities[0];
                    if (chosen) {
                        streamUrl = chosen.url || chosen.proxyUrl || chosen.playUrl || "";
                    }
                }
                if (!streamUrl) {
                    streamUrl = serverData.playUrl || serverData.proxyUrl || serverData.fallbackUrl || "";
                }
            } catch (jsonErr) {}
        }

        // Case 2: Direct Web HTML Page parsing for .m3u8
        if (!streamUrl) {
            var m3u8Matches = (html || "").match(/https?:\\?\/\\?\/[^\s"']+\.m3u8/gi) || [];
            if (m3u8Matches.length > 0) {
                var cleanM3u8 = [];
                var seenUrl = {};
                for (var m = 0; m < m3u8Matches.length; m++) {
                    var cUrl = m3u8Matches[m].replace(/\\/g, '');
                    if (!seenUrl[cUrl]) {
                        seenUrl[cUrl] = true;
                        cleanM3u8.push(cUrl);
                    }
                }
                var sel1080 = null, sel720 = null;
                for (var n = 0; n < cleanM3u8.length; n++) {
                    if (cleanM3u8[n].indexOf('1080') !== -1) sel1080 = cleanM3u8[n];
                    if (cleanM3u8[n].indexOf('720') !== -1) sel720 = cleanM3u8[n];
                }
                streamUrl = sel1080 || sel720 || cleanM3u8[0] || "";
            }
        }

        if (!streamUrl) {
            streamUrl = "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4";
        }

        var mimeType = streamUrl.indexOf(".m3u8") !== -1 ? "application/x-mpegURL" : "video/mp4";

        return JSON.stringify({
            "url": streamUrl,
            "mimeType": mimeType,
            "isEmbed": false,
            "headers": {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://www.shorttv.live/",
                "Origin": "https://www.shorttv.live"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({
            "url": "https://vaxplugin.alokillgtv.workers.dev/blankvd.mp4",
            "mimeType": "video/mp4",
            "isEmbed": false,
            "headers": {},
            "subtitles": []
        });
    }
}
// ===== HÀM TẠO XỬ LÝ STREAM PHIM END ======

// ==== HÀM TẠO CUSTOMpo SCRIPT BEGIN ====
function rawJS(){
 function LOG(msg, check) {
    var logMsg = msg;
    if (window.SnifferBridge && typeof window.SnifferBridge.log === 'function') {
      window.SnifferBridge.log(logMsg);
      if (check === true) {
        window.SnifferBridge.toast(logMsg, 1000);
      }
    } else if (typeof console !== 'undefined' && console.log) {
      console.log(logMsg);
    }
  }
  try{
    LOG("Test");
  } catch(e){
    LOG("Lỗi CUSTOMJS: \n" + e);
  }
}
// ==== HÀM TẠO CUSTOM SCRIPT END ====


// ==== HIDEMENU ====
{
// ## Hàm Hỗ Trợ. Hide function
function iframe64(url){
  var html = `
  <html><style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }iframe { width: 100%; height: 100%; object-fit: contain; }</style><body style='margin:0;padding:0;background:#000;'><iframe id='player' src='${url}' scrolling='no' frameborder='0' class='openloadvideo lab-pinned-child' allowfullscreen='true' webkitallowfullscreen='true' mozallowfullscreen='true' name='watch'></iframe></body></html>
  `;
  return "data:text/html;base64," + BASE64.encode(html);
  
}
  
  function getUrlDetail(slug) {
      try {
          if (!slug) return "";
          if (slug.indexOf('http') === 0) return slug;
          var detailUrl = BASEURL + "/" + slug;
          log("getUrlDetail[url]: \n" + detailUrl);
          return detailUrl;
      } catch (e) {
          log("getUrlDetail[err]:\n " + e);
          return "";
      }
  }
  function getUrlCategories() { 
      try {
          log("getUrlCategories[url]: \n" + BASEURL);
          return BASEURL; 
      } catch (e) {
          log("getUrlCategories[err]:\n " + e);
          return "";
      }
  }
  function getUrlCountries() { 
      try {
          return ""; 
      } catch (e) {
          log("getUrlCountries[err]:\n " + e);
          return "";
      }
  }
  function getUrlYears() { 
      try {
          return ""; 
      } catch (e) {
          log("getUrlYears[err]:\n " + e);
          return "";
      }
  }
  function parseCategoriesResponse(apiResponseJson) {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify(menulist);
      } catch (e) {
          log("parseCategoriesResponse[err]:\n " + e);
          return JSON.stringify([]);
      }
  }
  function parseCountriesResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseCountriesResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseYearsResponse(html) {
      try {
          return "[]";
      } catch (e) {
          log("parseYearsResponse[err]:\n " + e);
          return "[]";
      }
  }
  function parseSearchResponse(html, url) {
      try {
          log("parseSearchResponse[url]: \n" + url);
          return parseListResponse(html, url);
      } catch (e) {
          log("parseSearchResponse[err]:\n " + e);
          return JSON.stringify({
              "items": [],
              "pagination": {
                  "currentPage": 1,
                  "totalPages": 1
              }
          });
      }
  }
  // Tạo thẻ chủ đè ở menu home lấy dữ liệu ben dưới
  function getPrimaryCategories() {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify(menulist);
      } catch (e) {
          log("getPrimaryCategories[err]:\n " + e);
          return JSON.stringify([]);
      }
  }
  // Tạo thẻ chủ đề filter..
  function getFilterConfig() {
      try {
          var listurl = getLISTmenu();
          var menulist = buildMenu(listurl);
          return JSON.stringify({
              category: menulist
          });
      } catch (e) {
          log("getFilterConfig[err]:\n " + e);
          return JSON.stringify({ category: [] });
      }
  }
  // Hàm chuyển đổi text html %20 sang text thuần
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
          } else { 
              menuItem = { "slug": link, "name": name }; 
          } 
          menulist.push(menuItem); 
      } 
      return menulist; 
  }
  function _$(param) {
      // -------------------------------------------------------------
      // 1. HELPER PARSER & UTILS
      // -------------------------------------------------------------
      function parseHTML(htmlString) {
          let nodes = [];
          let root = { id: 0, tag: "ROOT", attrs: {}, childrenIds: [], parentId: null };
          nodes.push(root);
  
          try {
              let html = (htmlString || "").trim();
              if (!html) return { root, nodes };
  
              const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
              let stack = [0];
              let tagRegex = /<(?:\/([a-zA-Z0-9_-]+)|([a-zA-Z0-9_-]+)([^>]*?)(\/)?)\s*>/g;
              
              let lastIndex = 0;
              let match;
              let maxIter = 50000;
              let iter = 0;
  
              while ((match = tagRegex.exec(html)) !== null && iter++ < maxIter) {
                  let textBefore = html.slice(lastIndex, match.index).trim();
                  let parentId = stack[stack.length - 1];
  
                  if (textBefore) {
                      let textId = nodes.length;
                      nodes.push({ id: textId, tag: "#text", text: textBefore, attrs: {}, childrenIds: [], parentId: parentId });
                      nodes[parentId].childrenIds.push(textId);
                  }
  
                  lastIndex = tagRegex.lastIndex;
                  let isCloseTag = !!match[1];
                  let tagName = (match[1] || match[2] || "").toLowerCase();
                  let attrStr = match[3] || "";
                  let isSelfClosing = !!match[4] || VOID_TAGS.has(tagName);
  
                  if (isCloseTag) {
                      for (let i = stack.length - 1; i > 0; i--) {
                          if (nodes[stack[i]].tag === tagName) {
                              stack.splice(i);
                              break;
                          }
                      }
                  } else {
                      let attrs = {};
                      let attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
                      let attrMatch;
                      while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
                          attrs[attrMatch[1].toLowerCase()] = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";
                      }
  
                      let nodeId = nodes.length;
                      let node = { id: nodeId, tag: tagName, attrs: attrs, childrenIds: [], parentId: parentId };
                      nodes.push(node);
                      nodes[parentId].childrenIds.push(nodeId);
  
                      if (!isSelfClosing) {
                          stack.push(nodeId);
                      }
                  }
              }
  
              let remainingText = html.slice(lastIndex).trim();
              if (remainingText && stack.length > 0) {
                  let parentId = stack[stack.length - 1];
                  let textId = nodes.length;
                  nodes.push({ id: textId, tag: "#text", text: remainingText, attrs: {}, childrenIds: [], parentId: parentId });
                  nodes[parentId].childrenIds.push(textId);
              }
          } catch (err) {
              if (typeof window !== "undefined" && window.log) window.log("parseHTML error: " + err.message);
          }
          return { root, nodes };
      }
  
      function getNodeText(node, nodes, depth) {
          if (!node || (depth || 0) > 20) return "";
          if (node.tag === "#text") return node.text || "";
          let text = "";
          if (node.childrenIds) {
              for (let cid of node.childrenIds) {
                  text += getNodeText(nodes[cid], nodes, (depth || 0) + 1) + " ";
              }
          }
          return text.trim();
      }
  
      // -------------------------------------------------------------
      // 2. QUERY ENGINE & SELECTOR MATCHING
      // -------------------------------------------------------------
      function matchSingleSelector(node, sel, nodes) {
          if (!node || node.tag === "#text" || node.tag === "ROOT") return false;
  
          let cleanSel = sel;
          
          // 1. Tách pseudo positional (:first, :last, :eq)
          cleanSel = cleanSel.replace(/:first|:last|:eq\([0-9]+\)/gi, "").trim();
  
          // 2. Tách pseudo :content(...)
          let pseudoContentArg = null;
          let contentMatch = cleanSel.match(/:content\((['"]?)(.*?)\1\)/i);
          if (contentMatch) {
              pseudoContentArg = contentMatch[2];
              cleanSel = cleanSel.replace(contentMatch[0], "").trim();
          }
  
          // 3. Khớp Selector gốc
          if (cleanSel && cleanSel !== "*") {
              let tagMatch = cleanSel.match(/^[a-zA-Z0-9_-]+/);
              if (tagMatch && node.tag !== tagMatch[0].toLowerCase()) return false;
  
              let idMatch = cleanSel.match(/#([a-zA-Z0-9_-]+)/);
              if (idMatch && (!node.attrs || node.attrs.id !== idMatch[1])) return false;
  
              // Class matching (hỗ trợ Tailwind)
              let classMatches = cleanSel.match(/\.([a-zA-Z0-9_\-\/\\:]+)/g);
              if (classMatches) {
                  if (!node.attrs || !node.attrs.class) return false;
                  let elClasses = node.attrs.class.split(/\s+/);
                  for (let c of classMatches) {
                      let targetClass = c.substring(1);
                      if (!elClasses.includes(targetClass)) return false;
                  }
              }
  
              let attrMatch = cleanSel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?(.*?)['"]?)?\]/);
              if (attrMatch) {
                  let attrName = attrMatch[1].toLowerCase();
                  let attrVal = attrMatch[2];
                  if (!node.attrs || !(attrName in node.attrs)) return false;
                  if (attrVal !== undefined && node.attrs[attrName] !== attrVal) return false;
              }
          }
  
          if (pseudoContentArg !== null) {
              let fullText = getNodeText(node, nodes, 0);
              let keywords = pseudoContentArg.split("|").map(k => k.trim().toLowerCase());
              let found = keywords.some(kw => fullText.toLowerCase().includes(kw));
              if (!found) return false;
          }
  
          return true;
      }
  
      function querySelectorAllSingleLevel(startNode, selector, nodes) {
          let results = [];
          function search(currentId, depth) {
              if (depth > 50) return;
              let current = nodes[currentId];
              if (!current) return;
  
              if (current.tag !== "ROOT" && current.tag !== "#text" && current.id !== startNode.id) {
                  if (matchSingleSelector(current, selector, nodes)) {
                      results.push(current);
                  }
              }
              if (current.childrenIds) {
                  for (let cid of current.childrenIds) {
                      search(cid, depth + 1);
                  }
              }
          }
          search(startNode.id, 0);
  
          if (selector.indexOf(":first") !== -1) return results.slice(0, 1);
          if (selector.indexOf(":last") !== -1) return results.slice(-1);
          
          let eqMatch = selector.match(/:eq\(([0-9]+)\)/i);
          if (eqMatch) {
              let idx = parseInt(eqMatch[1], 10);
              return results[idx] ? [results[idx]] : [];
          }
  
          return results;
      }
  
      function querySelectorAll(startNode, selector, nodes) {
          try {
              if (!startNode || !selector) return [];
  
              if (selector.indexOf(',') !== -1) {
                  let groupSelectors = selector.split(',').map(s => s.trim());
                  let resMap = new Map();
                  for (let gSel of groupSelectors) {
                      let subRes = querySelectorAll(startNode, gSel, nodes);
                      for (let r of subRes) resMap.set(r.id, r);
                  }
                  return Array.from(resMap.values());
              }
  
              let spaceParts = selector.trim().split(/\s+/);
              if (spaceParts.length > 1) {
                  let currentNodes = [startNode];
                  for (let part of spaceParts) {
                      let nextLevelNodes = [];
                      let addedIds = new Set();
                      for (let cNode of currentNodes) {
                          let subResults = querySelectorAllSingleLevel(cNode, part, nodes);
                          for (let r of subResults) {
                              if (!addedIds.has(r.id)) {
                                  addedIds.add(r.id);
                                  nextLevelNodes.push(r);
                              }
                          }
                      }
                      currentNodes = nextLevelNodes;
                      if (currentNodes.length === 0) break;
                  }
                  return currentNodes;
              }
  
              return querySelectorAllSingleLevel(startNode, selector, nodes);
          } catch (err) {
              return [];
          }
      }
  
      // -------------------------------------------------------------
      // 3. MINIJQ CLASS CONSTRUCTOR & PROTOTYPE
      // -------------------------------------------------------------
      function MiniJQ(elements, nodesStore) {
          this.elements = Array.isArray(elements) ? elements : (elements ? [elements] : []);
          this.nodes = nodesStore || [];
          this.length = this.elements.length;
      }
  
      MiniJQ.prototype = {
          find: function(selector) {
              if (this.elements.length === 0) return new MiniJQ([], this.nodes);
              let matched = [];
              let addedIds = new Set();
              for (let el of this.elements) {
                  let res = querySelectorAll(el, selector, this.nodes);
                  for (let r of res) {
                      if (!addedIds.has(r.id)) {
                          addedIds.add(r.id);
                          matched.push(r);
                      }
                  }
              }
              return new MiniJQ(matched, this.nodes);
          },
  
          text: function() {
              if (this.elements.length === 0) return "";
              return getNodeText(this.elements[0], this.nodes, 0);
          },
  
          html: function() {
              if (this.elements.length === 0) return "";
              let self = this;
              let serialize = function(nodeId, depth) {
                  if (depth > 20) return "";
                  let node = self.nodes[nodeId];
                  if (!node) return "";
                  if (node.tag === "#text") return node.text || "";
                  let attrs = Object.entries(node.attrs || {}).map(([k, v]) => ` ${k}="${v}"`).join("");
                  let childrenHTML = (node.childrenIds || []).map(cid => serialize(cid, depth + 1)).join("");
                  return `<${node.tag}${attrs}>${childrenHTML}</${node.tag}>`;
              };
              return (this.elements[0].childrenIds || []).map(cid => serialize(cid, 0)).join("");
          },
  
          attr: function(name, value) {
              if (value !== undefined) {
                  for (let el of this.elements) {
                      if (el && el.tag !== "#text") {
                          if (!el.attrs) el.attrs = {};
                          el.attrs[name] = value;
                      }
                  }
                  return this;
              }
              if (this.elements.length === 0 || !this.elements[0].attrs) return "";
              return this.elements[0].attrs[name] || "";
          },
  
          each: function(callback) {
              if (typeof callback !== 'function') return this;
              this.elements.forEach((el, index) => {
                  let jqEl = new MiniJQ([el], this.nodes);
                  callback.call(jqEl, index, jqEl);
              });
              return this;
          },
  
          textAll: function(delimiter) {
              if (delimiter === undefined) delimiter = " ";
              let texts = [];
              for (let el of this.elements) {
                  texts.push(getNodeText(el, this.nodes, 0));
              }
              return texts.join(delimiter);
          },
  
          first: function() {
              return new MiniJQ(this.elements.length > 0 ? [this.elements[0]] : [], this.nodes);
          },
  
          last: function() {
              return new MiniJQ(this.elements.length > 0 ? [this.elements[this.elements.length - 1]] : [], this.nodes);
          },
  
          eq: function(index) {
              return new MiniJQ(this.elements[index] ? [this.elements[index]] : [], this.nodes);
          },
  
          parent: function() {
              let parents = [];
              let addedIds = new Set();
              for (let el of this.elements) {
                  if (el && el.parentId !== null && el.parentId !== 0) {
                      let pNode = this.nodes[el.parentId];
                      if (pNode && !addedIds.has(pNode.id)) {
                          addedIds.add(pNode.id);
                          parents.push(pNode);
                      }
                  }
              }
              return new MiniJQ(parents, this.nodes);
          },
  
          next: function() {
              let nexts = [];
              for (let el of this.elements) {
                  if (!el || el.parentId === null) continue;
                  let pNode = this.nodes[el.parentId];
                  if (!pNode) continue;
  
                  let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                  let idx = siblings.findIndex(s => s.id === el.id);
                  if (idx !== -1 && idx + 1 < siblings.length) {
                      nexts.push(siblings[idx + 1]);
                  }
              }
              return new MiniJQ(nexts, this.nodes);
          },
  
          before: function() {
              let befores = [];
              for (let el of this.elements) {
                  if (!el || el.parentId === null) continue;
                  let pNode = this.nodes[el.parentId];
                  if (!pNode) continue;
  
                  let siblings = pNode.childrenIds.map(cid => this.nodes[cid]).filter(c => c && c.tag !== "#text");
                  let idx = siblings.findIndex(s => s.id === el.id);
                  if (idx > 0) {
                      befores.push(siblings[idx - 1]);
                  }
              }
              return new MiniJQ(befores, this.nodes);
          },
  
          after: function() {
              return this.next();
          },
  
          closest: function(selector) {
              let matched = [];
              let addedIds = new Set();
              for (let el of this.elements) {
                  let currParentId = el.parentId;
                  let depth = 0;
                  while (currParentId !== null && currParentId !== 0 && depth++ < 30) {
                      let curr = this.nodes[currParentId];
                      if (!curr) break;
                      if (matchSingleSelector(curr, selector, this.nodes)) {
                          if (!addedIds.has(curr.id)) {
                              addedIds.add(curr.id);
                              matched.push(curr);
                          }
                          break;
                      }
                      currParentId = curr.parentId;
                  }
              }
              return new MiniJQ(matched, this.nodes);
          }
      };
  
      // -------------------------------------------------------------
      // 4. MAIN ENTRY POINT LOGIC FOR _$
      // -------------------------------------------------------------
      try {
          if (!param) return new MiniJQ([], []);
          if (param instanceof MiniJQ) return param;
          if (typeof param === "string") {
              let parsed = parseHTML(param);
              return new MiniJQ(parsed.root, parsed.nodes);
          }
          return new MiniJQ(param, []);
      } catch (err) {
          return new MiniJQ([], []);
      }
  }
  function log(msg) {console.log(msg);}
  
BASE64 = {
  encode: function (str) {
    try {
      if (!str) return "";

      // 1. Encode String ra mảng UTF-8 Bytes trước
      var utf8Bytes = [];
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code < 128) {
          utf8Bytes.push(code);
        } else if (code < 2048) {
          utf8Bytes.push((code >> 6) | 192, (code & 63) | 128);
        } else if (
          (code & 0xfc00) === 0xd800 &&
          i + 1 < str.length &&
          (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
        ) {
          // Ký tự Surrogate Pair
          code =
            0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
          utf8Bytes.push(
            (code >> 18) | 240,
            ((code >> 12) & 63) | 128,
            ((code >> 6) & 63) | 128,
            (code & 63) | 128
          );
        } else {
          utf8Bytes.push(
            (code >> 12) | 224,
            ((code >> 6) & 63) | 128,
            (code & 63) | 128
          );
        }
      }

      // 2. Chuyển mảng UTF-8 Bytes thành chuỗi Base64
      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var encoded = "";
      var byte1, byte2, byte3;
      var b1, b2, b3, b4;

      for (var j = 0; j < utf8Bytes.length; j += 3) {
        byte1 = utf8Bytes[j];
        byte2 = j + 1 < utf8Bytes.length ? utf8Bytes[j + 1] : NaN;
        byte3 = j + 2 < utf8Bytes.length ? utf8Bytes[j + 2] : NaN;

        b1 = byte1 >> 2;
        b2 = ((byte1 & 3) << 4) | (isNaN(byte2) ? 0 : byte2 >> 4);
        b3 = isNaN(byte2)
          ? 64
          : ((byte2 & 15) << 2) | (isNaN(byte3) ? 0 : byte3 >> 6);
        b4 = isNaN(byte3) ? 64 : byte3 & 63;

        encoded +=
          chars.charAt(b1) +
          chars.charAt(b2) +
          chars.charAt(b3) +
          chars.charAt(b4);
      }

      return encoded;
    } catch (e) {
      console.log("[BASE64.encode Error]:", e.message || e);
      return "";
    }
  },

  decode: function (base64String) {
    try {
      if (!base64String) return "";

      // 1. Dọn dẹp chuỗi & xử lý nếu URL-encoded (ví dụ: %2B, %2F)
      var str = decodeURIComponent(base64String.trim());

      // Chuyển URL-safe base64 về base64 chuẩn
      str = str.replace(/-/g, "+").replace(/_/g, "/");

      // Bảng ký tự Base64
      var chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = [];
      var buffer = 0,
        bits = 0;

      // 2. Decode Base64 thành Mảng Byte
      for (var i = 0; i < str.length; i++) {
        var char = str.charAt(i);
        if (char === "=") break; // Bỏ qua padding
        var index = chars.indexOf(char);
        if (index === -1) continue; // Bỏ qua ký tự không hợp lệ

        buffer = (buffer << 6) | index;
        bits += 6;

        if (bits >= 8) {
          bits -= 8;
          output.push((buffer >> bits) & 0xff);
        }
      }

      // 3. Decode UTF-8 từ mảng Byte ra String
      var result = "";
      var j = 0;
      while (j < output.length) {
        var c = output[j++];
        if (c < 128) {
          result += String.fromCharCode(c);
        } else if (c > 191 && c < 224) {
          var c2 = output[j++];
          result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        } else if (c > 223 && c < 240) {
          var c2 = output[j++];
          var c3 = output[j++];
          result += String.fromCharCode(
            ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
          );
        } else if (c >= 240) {
          var c2 = output[j++];
          var c3 = output[j++];
          var c4 = output[j++];
          var u =
            (((c & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
            0x10000;
          result += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
        }
      }

      return result;
    } catch (e) {
      console.log("[BASE64.decode Error]:", e.message || e);
      return "";
    }
  }
};

  function checkRaw(scriptStr, returnFixed) {
    try {
      if (!scriptStr || typeof scriptStr !== "string") {
        console.log(
          "[Lỗi escape runJS]\r\n\t Dữ liệu đầu vào không phải là chuỗi hợp lệ!",
        );
        return scriptStr || "";
      }
  
      var lines = scriptStr.split("\n");
      var fixedLines = [];
      var hasError = false;
  
      for (var i = 0; i < lines.length; i++) {
        var currentLine = lines[i];
        var lineNum = i + 1;
        var lineErrorFound = false; // 1. Kiểm tra lỗi escape newline/tab nguy hiểm nằm trần trong chuỗi quote
        // Trường hợp chưa được escape dạng '\\n' hoặc '\\t' trong chuỗi ghép
  
        if (/([^\\]|^)(\r\n|\r|\n)/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện xuống dòng chưa escape ở Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        } // 2. Kiểm tra lỗi quên escape ký tự Tab trần không hợp lệ
  
        if (/\t/.test(currentLine) && !/\\t/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Phát hiện ký tự Tab trần ở Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        } // 3. Kiểm tra dấu xược ngược single trailing backlash ở cuối dòng (dễ làm gãy chuỗi)
  
        if (/([^\\])\\$/.test(currentLine)) {
          console.log(
            "[Lỗi escape runJS]\r\n\t Dấu Backslash (\\) cô đơn ở cuối Dòng " +
              lineNum +
              ": " +
              currentLine.trim(),
          );
          lineErrorFound = true;
        }
  
        if (lineErrorFound) {
          hasError = true;
        } // Tiến hành SỬA LỖI tự động nếu tham số returnFixed = true
  
        var fixedLine = currentLine;
        if (returnFixed) {
          // Chuẩn hóa ký tự xuống dòng và tab đặc biệt
          fixedLine = fixedLine.replace(/\r/g, "").replace(/\t/g, "  "); // Thay Tab trần bằng 2 khoảng trắng cho an toàn
        }
  
        fixedLines.push(fixedLine);
      } // 4. Kiểm tra cú pháp nhanh xem toàn bộ chuỗi có parse được JS không
  
      try {
        new Function(scriptStr);
      } catch (syntaxErr) {
        hasError = true;
        console.log(
          "[Lỗi escape runJS]\r\n\t 💥 LỖI CÚ PHÁP (SyntaxError) toàn cục: " +
            syntaxErr.message,
        );
      }
  
      if (!hasError) {
        console.log("[checkRaw] 🟢 Chuỗi Raw JS hoàn toàn sạch lỗi!");
      } // Trả về bản đã fix hoặc bản gốc theo tham số returnFixed
  
      return returnFixed ? fixedLines.join("\n") : scriptStr;
    } catch (e) {
      console.log(
        "[Lỗi escape runJS]\r\n\t Lỗi ngoại lệ trong hàm checkRaw: " + e.message,
      );
      return scriptStr; // Luôn an toàn: Fallback trả về chuỗi gốc chứ không làm sập script
    }
  }
  function decodeHTMLtext(str) {
      try {
          if (!str) return "";
          return str.replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, (match, dec, hex) => {
              if (dec) {
                  return String.fromCharCode(parseInt(dec, 10));
              }
              if (hex) {
                  return String.fromCharCode(parseInt(hex, 16));
              }
              return match;
          });
      } catch (e) {
          log("decodeHTMLEntities[err]:\n " + e);
      }
  }
  function clearJS(func) {
      if (typeof func !== "function") return "";
      
      // Lấy toàn bộ mã nguồn của hàm dưới dạng string
      var funcStr = func.toString();
      
      // Dùng Regex bóc tách lấy nội dung bên trong cặp ngoặc nhọn {} đầu tiên và cuối cùng
      var match = funcStr.match(/\{([\s\S]*)\}/);
      if (!match) return "";
      
      var innerCode = match[1].trim();
      
      // (Tùy chọn) Bạn có thể tận dụng luôn hàm checkRaw sẵn có trong template của bạn 
      // để nó tự động rà soát và fix các ký tự xuống dòng/tab nguy hiểm cho an toàn tuyệt đối:
      var safeCode = checkRaw(innerCode, true);
      
      return safeCode;
  }
}
// ==== HIDEMENU ====
