var BASEURL = "https://xsexsub.online";

function getManifest() {
    return JSON.stringify({
        "id": "xsexsub",
        "name": "Phim XXX Vietsub",
        "description": "Kho phim Sex Vietsub HD cập nhật liên tục.",
        "info": "Kho phim Sex Vietsub HD cập nhật liên tục.",
        "version": "1.0.0",
        "BASEURL": "https://xsexsub.online",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/xsexsub.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "embed"
    });
}  

function cleanText(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function getHomeSections() {
    var listurl = `
    /sex-vietsub-moi/@@Phim Mới@@true
    /sex-vietsub/@@Sex Vietsub@@false
    /phim-sex-thuyet-minh/@@Thuyết Minh@@false
    /loan-luan/@@Loạn Luân@@false
    /hiep-dam/@@Hiếp Dâm@@false
    /sex-vietsub-khong-che/@@Không Che@@false
    /sex-tap-the/@@Tập Thể@@false
    /sex-vung-trom/@@Vụng Trộm@@false
    /sex-hoc-sinh/@@Học Sinh@@false
    /quoc-gia/sex-nhat/@@Sex Nhật@@false
    /quoc-gia/sex-trung/@@Sex Trung@@false
    /quoc-gia/sex-my/@@Sex Mỹ@@false
    `;
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

function getPrimaryCategories() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify(menulist);
}

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
        if (slug && (slug.indexOf("http") > -1 || slug.indexOf("search") > -1)) {
            return slug;
        }
        var page = 1;
        var path = slug || "/sex-vietsub-moi/";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);

            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page, 10) || 1;

                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'object') {
                        path = filters.category.slug || filters.category.value || "";
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        if (!path) path = "/sex-vietsub-moi/";
        if (path.indexOf("http") === 0) {
            if (page > 1) {
                return path + (path.indexOf("?") > -1 ? "&page=" : "/page/") + page + "/";
            }
            return path;
        }

        path = path.replace(/^\/+/, "").replace(/\/+$/, "");
        var resultUrl = BASEURL + "/" + path + "/";

        if (page > 1) {
            resultUrl += "page/" + page + "/";
        }

        return resultUrl.replace(/([^:]\/)\/+/g, "$1");

    } catch (e) {
        var fallback = BASEURL + (slug ? "/" + slug : "/sex-vietsub-moi/");
        return fallback.replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    return BASEURL + "/?s=" + encodeURIComponent(keyword || "");
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) return slug;
    return BASEURL + (slug.charAt(0) === '/' ? slug : '/' + slug);
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        if (!html) {
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        }

        var items = [];
        var artRegex = /<article[^>]*class=["'][^"']*video-item[^"']*["'][\s\S]*?<\/article>/gi;
        var match;

        while ((match = artRegex.exec(html)) !== null) {
            var bHtml = match[0];
            var hrefMatch = bHtml.match(/<a[\s\S]*?href=["']([^"']+)["']/i);
            if (!hrefMatch) continue;
            var href = hrefMatch[1].trim();

            var titleMatch = bHtml.match(/class=["'][^"']*title-post[^"']*["'][^>]*>([\s\S]*?)<\//i) ||
                             bHtml.match(/title=["']([^"']+)["']/i);
            var title = titleMatch ? cleanText(titleMatch[1].replace(/<[^>]+>/g, '')) : '';

            var thumbMatch = bHtml.match(/data-bg=["']([^"']+)["']/i) ||
                             bHtml.match(/data-src=["']([^"']+)["']/i) ||
                             bHtml.match(/src=["']([^"']+)["']/i);
            var thumb = thumbMatch ? thumbMatch[1].trim() : '';
            if (thumb && thumb.indexOf('http') === -1) {
                thumb = BASEURL + (thumb.charAt(0) === '/' ? thumb : '/' + thumb);
            }

            if (href && (title || thumb)) {
                items.push({
                    id: href,
                    title: title,
                    posterUrl: thumb,
                    backdropUrl: thumb
                });
            }
        }

        // Pagination
        var hasNext = false;
        var totalPages = 1;
        var pageMatches = html.match(/class=["']page-numbers["'][^>]*>(\d+)</g);
        if (pageMatches) {
            for (var p = 0; p < pageMatches.length; p++) {
                var num = parseInt(pageMatches[p].replace(/\D/g, ''), 10);
                if (num > totalPages) totalPages = num;
            }
        }
        if (items.length >= 10 || totalPages > 1) {
            hasNext = true;
            if (totalPages < 2) totalPages = 999;
        }

        return JSON.stringify({
            items: items,
            pagination: { currentPage: 1, totalPages: totalPages, hasNext: hasNext }
        });

    } catch (e) {
        return JSON.stringify({
            items: [],
            pagination: { currentPage: 1, totalPages: 1 }
        });
    }
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html, url) {
    var limg = "";
    var lname = "Đang cập nhật...";
    var ldes = "Không có mô tả.";
    var cast = "";
    var servers = [];

    try {
        if (html) {
            var imgMatch = html.match(/meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/class=["'][^"']*alignnone[^"']*["'][\s\S]*?src=["']([^"']+)["']/i) ||
                           html.match(/data-bg=["']([^"']+)["']/i);
            if (imgMatch) {
                limg = imgMatch[1].trim();
                if (limg.indexOf("http") === -1) limg = BASEURL + (limg.charAt(0) === '/' ? limg : '/' + limg);
            }

            var titleMatch = html.match(/class=["'][^"']*title-videos[^"']*["'][^>]*>([\s\S]*?)<\//i) ||
                             html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ||
                             html.match(/meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
            if (titleMatch) {
                lname = cleanText(titleMatch[1].replace(/<[^>]+>/g, '').replace(/- xsexsub.*$/i, ''));
            }

            var descMatch = html.match(/<div[^>]*id=["']div2["'][^>]*>([\s\S]*?)<\/div>/i) ||
                            html.match(/meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
            if (descMatch) {
                ldes = cleanText(descMatch[1].replace(/<[^>]+>/g, ''));
            }

            var castMatch = html.match(/class=["'][^"']*dien-vien[^"']*["'][^>]*>([\s\S]*?)<\//i);
            if (castMatch) {
                cast = cleanText(castMatch[1].replace(/<[^>]+>/g, ''));
            }

            var embedMatch = html.match(/id=["']okplayer-frame["'][\s\S]*?src=["']([^"']+)["']/i) ||
                             html.match(/id=["']okplayer-frame["'][\s\S]*?data-base=["']([^"']+)["']/i) ||
                             html.match(/<iframe[\s\S]*?src=["']([^"']*player[^"']*)["']/i);
            var embed = embedMatch ? embedMatch[1].trim() : url;
            if (embed && embed.indexOf("http") === 0 && !embed.endsWith("/") && embed.indexOf("?") === -1) {
                embed = embed + "/";
            }

            servers.push({
                name: "Server VIP",
                episodes: [{ id: embed, name: "Full HD", slug: "full-hd" }]
            });
        }
    } catch (e) {}

    return JSON.stringify({
        id: url,
        title: lname,
        posterUrl: limg,
        backdropUrl: limg,
        description: ldes || lname,
        servers: servers,
        quality: "HD",
        year: 2026,
        status: "Full HD",
        duration: "HD",
        casts: cast,
        director: ""
    });
}

function parseDetailResponse(html, url) {
    try {
        var embed = "";
        if (html) {
            var embedMatch = html.match(/id=["']okplayer-frame["'][\s\S]*?src=["']([^"']+)["']/i) ||
                             html.match(/id=["']okplayer-frame["'][\s\S]*?data-base=["']([^"']+)["']/i) ||
                             html.match(/<iframe[\s\S]*?src=["']([^"']*player[^"']*)["']/i);
            if (embedMatch) {
                embed = embedMatch[1].trim();
            }
        }
        if (!embed) {
            embed = url;
        }
        if (embed && embed.indexOf("http") === 0 && !embed.endsWith("/") && embed.indexOf("?") === -1) {
            embed = embed + "/";
        }

        var customjs = textJS(embed);

        return JSON.stringify({
            url: embed,
            isEmbed: true,
            headers: {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Custom-Js": customjs.trim()
            }
        });

    } catch (e) {
        return JSON.stringify({ url: url || "", isEmbed: true, headers: {} });
    }
}

function parseEmbedResponse(html, sourceUrl) {
    return parseDetailResponse(html, sourceUrl);
}

function textJS($links) {
    return `
function showToast(message, duration) {
    duration = duration || 2500;
    var container = document.getElementById('global-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '30px',
            right: '30px',
            zIndex: '9999999',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none'
        });
        document.body.appendChild(container);
    }
    
    var toast = document.createElement('div');
    toast.innerText = message;
    Object.assign(toast.style, {
        background: 'rgba(20, 20, 20, 0.9)',
        color: '#fff',
        padding: '10px 22px',
        borderRadius: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        transform: 'translateY(-20px)',
        opacity: '0'
    });
    
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
            if (container.childElementCount === 0 && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 300);
    }, duration);
}

function initPlayerEnhancer() {
    // 1. CSS tối ưu TV: Ẩn hoàn toàn browser native controls (chống 2 timeline), chỉ giữ 1 thanh Plyr
    var style = document.createElement('style');
    style.innerHTML = [
        'html, body { background: #000 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; width: 100vw !important; height: 100vh !important; }',
        '.cvp-video-wrapper, .cvp-player-container, .plyr, .plyr__video-wrapper { width: 100vw !important; height: 100vh !important; max-width: 100% !important; max-height: 100% !important; position: fixed !important; top: 0 !important; left: 0 !important; background: #000 !important; z-index: 10 !important; }',
        'video, video.v-node { width: 100% !important; height: 100% !important; object-fit: contain !important; }',
        /* Triệt tiêu hoàn toàn controls gốc của thẻ video (chống đè 2 timeline) */
        'video::-webkit-media-controls { display: none !important; }',
        'video::-webkit-media-controls-enclosure { display: none !important; }',
        /* Ẩn triệt để toàn bộ popup quảng cáo làm đứng video */
        '.sp-frame-overlay, [id*="sp-overlay"], .sp-btn-action, #banner, iframe[src*="adu"], iframe[src*="website"], iframe[src*="300100"], iframe[src*="300250"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }',
        /* Thanh Timeline / Controls duy nhất của Plyr */
        '.plyr__controls { z-index: 99999 !important; display: flex !important; background: linear-gradient(0deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%) !important; min-height: 50px !important; }',
        '.plyr__progress { height: 8px !important; }',
        '.plyr__progress__buffer { background: rgba(255,255,255,0.4) !important; }',
        '.plyr--full-ui input[type="range"] { color: #ff2a44 !important; }',
        '.sv-selector { position: fixed !important; top: 15px !important; right: 20px !important; z-index: 99999 !important; }'
    ].join(' ');
    document.head.appendChild(style);

    // 2. Vô hiệu hóa biến quảng cáo của trang
    window.IS_ADS_ENABLED = false;
    window.TARGET_URL = "";

    // Xóa bỏ hoàn toàn các thẻ overlay quảng cáo khỏi DOM để tránh tự pause video
    function removeAdOverlays() {
        var ads = document.querySelectorAll('.sp-frame-overlay, [id*="sp-overlay"]');
        for (var i = 0; i < ads.length; i++) {
            if (ads[i].parentNode) ads[i].parentNode.removeChild(ads[i]);
        }
    }
    removeAdOverlays();

    // 3. Xóa thuộc tính controls native trên thẻ video (chỉ để Plyr hiển thị timeline)
    function cleanNativeVideoControls() {
        var vids = document.querySelectorAll('video');
        for (var j = 0; j < vids.length; j++) {
            var v = vids[j];
            v.removeAttribute('controls');
            v.controls = false;
        }
    }
    cleanNativeVideoControls();

    function wakeControls() {
        var container = document.querySelector('.plyr, .cvp-player-container, body');
        if (container) {
            container.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
            container.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        }
    }

    // 4. Lấy Active Player hiện tại (của tab đang hiển thị)
    function getActivePlayer() {
        var activeTab = document.querySelector('.cvp-tab-pane.active');
        if (activeTab && typeof players !== 'undefined' && players) {
            var tabId = activeTab.id;
            if (players[tabId]) return players[tabId];
        }
        if (typeof players !== 'undefined' && players) {
            var pList = Object.values(players);
            if (pList.length > 0) return pList[0];
        }
        return null;
    }

    // 5. Đồng bộ Remote Android TV
    var prevSeek = window.seek;
    window.seek = function(secs) {
        var handled = false;
        var p = getActivePlayer();
        if (p && typeof p.forward === 'function' && typeof p.rewind === 'function') {
            if (secs > 0) p.forward(secs); else p.rewind(Math.abs(secs));
            wakeControls();
            showToast((secs > 0 ? "Tua tới +" : "Tua lùi ") + Math.abs(secs) + "s", 1500);
            handled = true;
        }

        if (!handled) {
            var v = document.querySelector('.cvp-tab-pane.active video') || document.querySelector('video');
            if (v) {
                v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
                wakeControls();
                showToast((secs > 0 ? "Tua tới +" : "Tua lùi ") + Math.abs(secs) + "s", 1500);
                handled = true;
            }
        }

        if (!handled && typeof prevSeek === 'function') {
            return prevSeek(secs);
        }
        return 'ok';
    };

    var prevToggle = window.togglePlay;
    window.togglePlay = function() {
        var p = getActivePlayer();
        if (p && typeof p.togglePlay === 'function') {
            p.togglePlay();
            wakeControls();
            showToast(p.playing ? "Tạm dừng" : "Tiếp tục phát", 1500);
            return 'ok';
        }

        var v = document.querySelector('.cvp-tab-pane.active video') || document.querySelector('video');
        if (v) {
            if (v.paused) {
                v.play().catch(function() {});
                showToast("Tiếp tục phát", 1500);
            } else {
                v.pause();
                showToast("Tạm dừng", 1500);
            }
            wakeControls();
            return 'ok';
        }

        if (typeof prevToggle === 'function') return prevToggle();
        return 'ok';
    };

    // 6. Định kỳ dọn dẹp ad overlay và native video controls
    var timer = setInterval(function() {
        removeAdOverlays();
        cleanNativeVideoControls();
    }, 1000);

    // Chặn popup window.open
    window.open = function() { return null; };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerEnhancer);
} else {
    initPlayerEnhancer();
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

function getLISTmenu() {
    return `
/sex-vietsub-moi/@@Phim Mới
/sex-vietsub/@@Sex Vietsub
/loan-luan/@@Loạn Luân
/hiep-dam/@@Hiếp Dâm
/sex-vietsub-khong-che/@@Không Che
/sex-tap-the/@@Tập Thể
/sex-vung-trom/@@Vụng Trộm
/sex-co-trang/@@Cổ Trang
/sex-hoc-sinh/@@Học Sinh
/sex-cong-so/@@Công Sở
/phimsexsub/@@PhimSexSub
/phim-sex-thuyet-minh/@@Thuyết Minh
/quoc-gia/sex-trung/@@Sex Trung
/quoc-gia/sex-nhat/@@Sex Nhật
/quoc-gia/sex-my/@@Sex Mỹ
`;
}

function buildMenu(listurl) {
    var menulist = [];
    if (!listurl) return menulist;
    var lines = listurl.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf('@@') === -1) continue;
        var parts = line.split('@@');
        var link = parts[0] ? parts[0].trim() : "";
        var name = parts[1] ? parts[1].trim() : "";
        var check = parts[2] ? parts[2].trim() : undefined;
        if (!link || !name) continue;
        var item = {};
        if (check === "false") {
            item = { "slug": link, "title": name, "type": "Horizontal" };
        } else if (check === "true") {
            item = { "slug": link, "title": name, "type": "Grid" };
        } else {
            item = { "slug": link, "name": name, "value": link };
        }
        menulist.push(item);
    }
    return menulist;
}
