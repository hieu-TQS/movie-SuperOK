// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================
BASEURL = "https://animevietsub.wiki"

function getManifest() {
    return JSON.stringify({
        "id": "animevietsub",
        "name": "AnimeVietSub",
        "version": "1.0.8",
        "baseUrl": "https://animevietsub.wiki",
        "iconUrl": "https://animevietsub.wiki/statics/default/images/logo.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'anime-moi-cap-nhat', title: 'Anime Mới Cập Nhật', type: 'Grid', path: '/' },
        { slug: 'anime-bo', title: 'Anime Bộ', type: 'Horizontal', path: 'anime-bo' },
        { slug: 'anime-le', title: 'Anime Lẻ/Movie', type: 'Horizontal', path: 'anime-le' },
        { slug: 'hoat-hinh-trung-quoc', title: 'HH Trung Quốc', type: 'Horizontal', path: 'hoat-hinh-trung-quoc' },
        { slug: 'anime-sap-chieu', title: 'Anime Sắp Chiếu', type: 'Horizontal', path: 'anime-sap-chieu' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Anime Bộ', slug: 'anime-bo' },
        { name: 'Anime Lẻ', slug: 'anime-le' },
        { name: 'HH Trung Quốc', slug: 'hoat-hinh-trung-quoc' },
        { name: 'Anime Sắp Chiếu', slug: 'anime-sap-chieu' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Phiêu Lưu', slug: 'the-loai/phieu-luu' },
        { name: 'Hài Hước', slug: 'the-loai/hai-huoc' },
        { name: 'Phép Thuật', slug: 'the-loai/phep-thuat' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' },
            { name: 'Lượt xem', value: 'view' },
            { name: 'Bình chọn', value: 'rating' }
        ]
    });
}

// Helper log
function log(msg) {
    if (typeof console !== 'undefined' && console.log) {
        console.log("[AnimeVsubPlugin] " + msg);
    }
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "latest";

        var targetSlug = slug;
        if (filters.category) {
            targetSlug = "the-loai/" + filters.category;
        }

        // Clean slug
        if (targetSlug.startsWith("/")) targetSlug = targetSlug.substring(1);
        if (targetSlug.endsWith("/")) targetSlug = targetSlug.substring(0, targetSlug.length - 1);

        var baseUrl = BASEURL;
        
        // Handle Trang chủ (phim mới cập nhật)
        if (targetSlug === 'anime-moi-cap-nhat' || targetSlug === '') {
            if (page === 1) return baseUrl + "/";
            return baseUrl + "/anime-moi-cap-nhat/trang-" + page + ".html";
        }

        // Handle path format
        if (page === 1) {
            return baseUrl + "/" + targetSlug + "/";
        } else {
            return baseUrl + "/" + targetSlug + "/trang-" + page + ".html";
        }
    } catch (e) {
        return BASEURL;
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var cleanKeyword = encodeURIComponent(keyword.trim());
        
        if (page === 1) {
            return BASEURL + "/tim-kiem/" + cleanKeyword + "/";
        } else {
            return BASEURL + "/tim-kiem/" + cleanKeyword + "/trang-" + page + ".html";
        }
    } catch (e) {
        return BASEURL;
    }
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    // Clean slug
    var cleanSlug = slug;
    if (cleanSlug.startsWith("/")) cleanSlug = cleanSlug.substring(1);
    if (cleanSlug.startsWith("phim/")) cleanSlug = cleanSlug.substring(5);
    
    return BASEURL + "/phim/" + cleanSlug;
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return BASEURL; }
function getUrlYears() { return BASEURL; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(htmlContent) {
    try {
        var movies = [];
        var seen = {};

        // Helper: extract movie from card HTML
        function extractMovie(cardHtml) {
            var linkMatch = /<a\s+[^>]*href="([^"]*\/phim\/[^"]+)"[^>]*(?:title="([^"]+)")?/i.exec(cardHtml);
            if (!linkMatch) {
                linkMatch = /<a\s+href="([^"]+)"\s+title="([^"]+)"/i.exec(cardHtml);
            }
            if (!linkMatch) return null;

            var href = linkMatch[1];
            var slug = href;
            var slugMatch = /\/phim\/([^/]+)/.exec(href);
            if (slugMatch) {
                slug = slugMatch[1];
            } else {
                slug = href.substring(href.lastIndexOf('/') + 1) || href;
            }
            // Loại bỏ trailing slash
            slug = slug.replace(/\/$/, '');
            if (seen[slug]) return null;
            seen[slug] = true;

            var epMatch = /<span class="mli-eps">[\s\S]*?<i>([^<]+)<\/i>/i.exec(cardHtml);
            var episode_current = epMatch ? "Tập " + epMatch[1].trim() : "";

            var imgMatch = /<img[^>]*(?:src|data-src)="([^"]+)"/i.exec(cardHtml);
            var posterUrl = imgMatch ? imgMatch[1] : "";

            // Title: h2.Title hoặc div.Title hoặc fallback title attribute
            var titleMatch = /<h2[^>]*class="Title"[^>]*>([\s\S]*?)<\/h2>/i.exec(cardHtml)
                || /<div class="Title">([\s\S]*?)<\/div>/i.exec(cardHtml);
            var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : (linkMatch[2] || "");

            var year = 0;
            var yearMatch = /<span class="Date[^"]*">\s*(\d{4})\s*<\/span>/i.exec(cardHtml)
                || /\((\d{4})\)/.exec(title);
            if (yearMatch) year = parseInt(yearMatch[1]);

            return {
                id: slug,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                year: year,
                quality: "FHD",
                episode_current: episode_current,
                lang: "Vietsub"
            };
        }

        // Pattern 1: <article class="TPost C ..."> (trang danh mục)
        var articlePattern = /<article class="TPost[^"]*">[\s\S]*?<\/article>/gi;
        var match;
        while ((match = articlePattern.exec(htmlContent)) !== null) {
            var movie = extractMovie(match[0]);
            if (movie) movies.push(movie);
        }

        // Pattern 2: <li> trong <ul class="MovieList Newepisode"> (trang chủ)
        if (movies.length === 0) {
            var listBlock = /<ul class="MovieList Newepisode">[\s\S]*?<\/ul>/i.exec(htmlContent);
            if (listBlock) {
                var liPattern = /<li>[\s\S]*?<\/li>/gi;
                while ((match = liPattern.exec(listBlock[0])) !== null) {
                    var movie = extractMovie(match[0]);
                    if (movie) movies.push(movie);
                }
            }
        }

        // Pattern 3: Fallback - <div class="TPost B"> (sidebar cards)
        if (movies.length === 0) {
            var divPattern = /<div class="TPost[^"]*">[\s\S]*?<\/div>\s*<\/div>/gi;
            while ((match = divPattern.exec(htmlContent)) !== null) {
                var movie = extractMovie(match[0]);
                if (movie) movies.push(movie);
            }
        }

        // Parse phân trang
        var totalPages = 1;
        var lastPageMatch = /href="[^"]*trang-(\d+)\.html"[^>]*>Trang Cuối<\/a>/i.exec(htmlContent);
        if (lastPageMatch) {
            totalPages = parseInt(lastPageMatch[1]);
        } else {
            var pagePattern = /class="page[^"]*">(\d+)<\/a>/gi;
            var pMatch;
            while ((pMatch = pagePattern.exec(htmlContent)) !== null) {
                var pNum = parseInt(pMatch[1]);
                if (pNum > totalPages) totalPages = pNum;
            }
        }

        var currentPage = 1;
        var curPageMatch = /class="[^"]*current[^"]*">(\d+)<\/span>/i.exec(htmlContent);
        if (curPageMatch) currentPage = parseInt(curPageMatch[1]);

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages
            }
        });
    } catch (e) {
        log("parseListResponse error: " + e.message);
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(htmlContent) {
    return parseListResponse(htmlContent);
}

function parseMovieDetail(htmlContent) {
    try {
        var idMatch = /<link\s+rel="canonical"\s+href="([^"]+)"/i.exec(htmlContent) || /<meta\s+property="og:url"\s+content="([^"]+)"/i.exec(htmlContent);
        var id = idMatch ? idMatch[1] : "";

        var titleMatch = /<h1[^>]* itemprop="name">([\s\S]*?)<\/h1>/i.exec(htmlContent) || /<h1 class="title">([\s\S]*?)<\/h1>/i.exec(htmlContent);
        var title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var descMatch = /<div class="Description[^"]*" itemprop="description">([\s\S]*?)<\/div>/i.exec(htmlContent) || /<div id="film-info-desc"[^>]*>([\s\S]*?)<\/div>/i.exec(htmlContent);
        var description = descMatch ? descMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var posterMatch = /<img[^>]*class="[^"]*attachment-img-mov-md[^"]*"[^>]*(?:src|data-src)="([^"]+)"/i.exec(htmlContent) || /<img class="poster"[^>]*(?:src|data-src)="([^"]+)"/i.exec(htmlContent);
        var posterUrl = posterMatch ? posterMatch[1] : "";

        var genres = [];
        var genreBlockMatch = /<li>\s*<span class="info-title">Thể loại:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent) || /Thể loại:([\s\S]*?)(?:<br|<\/li>)/i.exec(htmlContent);
        if (genreBlockMatch) {
            var genreMatch;
            var genrePattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((genreMatch = genrePattern.exec(genreBlockMatch[1])) !== null) {
                genres.push(genreMatch[1].trim());
            }
        }

        var countries = [];
        var countryBlockMatch = /<li>\s*<span class="info-title">Quốc gia:<\/span>([\s\S]*?)<\/li>/i.exec(htmlContent);
        if (countryBlockMatch) {
            var countryMatch;
            var countryPattern = /<a[^>]*>([^<]+)<\/a>/gi;
            while ((countryMatch = countryPattern.exec(countryBlockMatch[1])) !== null) {
                countries.push(countryMatch[1].trim());
            }
        }

        var year = 0;
        var yearMatch = /<li>\s*<span class="info-title">Năm phát hành:<\/span>[\s\S]*?<a[^>]*>(\d{4})<\/a>/i.exec(htmlContent) || /Season:[\s\S]*?- (\d{4})/i.exec(htmlContent);
        if (yearMatch) year = parseInt(yearMatch[1]);

        var statusMatch = /<li>\s*<span class="info-title">Trạng thái:<\/span>\s*([\s\S]*?)<\/li>/i.exec(htmlContent);
        var status = statusMatch ? statusMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        var episode_current = "";
        if (status) {
            var epMatch2 = /(Tập \d+|Full|Hoàn Tất)/i.exec(status);
            if (epMatch2) episode_current = epMatch2[1];
        }

        // Parse danh sách tập phim
        var episodes = [];
        var epPattern = /<a\s+[^>]*href="([^"]*\/tap-[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var epMatch;
        while ((epMatch = epPattern.exec(htmlContent)) !== null) {
            var epUrl = epMatch[1];
            var epName = epMatch[2].replace(/<[^>]*>/g, "").trim();
            
            if (epUrl.indexOf('http') !== 0) {
                epUrl = BASEURL + (epUrl.startsWith('/') ? '' : '/') + epUrl;
            }
            
            // Tránh add trùng tập
            var isDuplicate = false;
            for (var i = 0; i < episodes.length; i++) {
                if (episodes[i].id === epUrl) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                episodes.push({
                    id: epUrl,
                    name: epName,
                    slug: epUrl
                });
            }
        }

        // Sắp xếp các tập phim theo thứ tự tăng dần (ví dụ Tập 1 -> Tập 13)
        episodes.sort(function(a, b) {
            var epA = parseInt(a.name) || 0;
            var epB = parseInt(b.name) || 0;
            return epA - epB;
        });

        var servers = [];
        if (episodes.length > 0) {
            servers.push({
                name: "AnimeVsub",
                episodes: episodes
            });
        }

        // Trích xuất slug từ canonical URL hoặc og:url (id)
        var slug = "";
        if (id) {
            var slugMatch = /\/phim\/([^/]+)/.exec(id);
            slug = slugMatch ? slugMatch[1] : id;
        }
        if (!slug) {
            var slugMatch2 = /\/phim\/([^/]+)/.exec(htmlContent);
            slug = slugMatch2 ? slugMatch2[1] : "";
        }

        // Tạo extra url để tải đầy đủ tập từ trang xem-phim
        // Kiểm tra bằng canonical URL (biến id) thay vì search toàn HTML vì trang
        // detail có nav link chứa chuỗi "xem-phim" gây nhận nhầm.
        var extra = "";
        var isPlayPage = (id && id.indexOf("xem-phim") > -1) || htmlContent.indexOf("window.PLAYER_DATA") > -1;
        if (!isPlayPage && slug && slug !== "error") {
            extra = BASEURL + "/phim/" + slug + "/xem-phim.html";
        }

        return JSON.stringify({
            id: slug,
            title: title,
            posterUrl: posterUrl,
            backdropUrl: posterUrl,
            description: description,
            year: year,
            servers: servers,
            episode_current: episode_current,
            lang: "Vietsub",
            quality: "FHD",
            category: genres.join(", "),
            country: countries.join(", "),
            status: status,
            extra: extra
        });
    } catch (e) {
        log("parseMovieDetail error: " + e.message);
        return JSON.stringify({ id: "error", title: "", servers: [] });
    }
}

function parseDetailResponse(htmlContent, pageUrl) {
    try {
        log("parseDetailResponse input pageUrl: " + pageUrl);

        var link = "";
        // Lấy link iframe từ trang hiện tại (PLAYER_DATA)
        var match = /window\.PLAYER_DATA\s*=\s*(\{[\s\S]*?\});/.exec(htmlContent);
        if (match) {
            try {
                var data = JSON.parse(match[1]);
                if (data && data.link) {
                    link = data.link;
                }
            } catch (err) {}
        }
        
        // Fallback quét iframe nếu không tìm thấy PLAYER_DATA
        if (!link) {
            var iframeMatch = htmlContent.match(/<iframe[^>]*src="([^"]+)"/i);
            if (iframeMatch) {
                link = iframeMatch[1];
            }
        }
        
        if (link && link.indexOf('//') === 0) {
            link = "https:" + link;
        }

        var bypassJs = customJS(link);
            
        return JSON.stringify({
            url: pageUrl,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": pageUrl || "https://animevietsub.wiki/",
                "Custom-Js": bypassJs
            },
            subtitles: []
        });
    } catch (e) {
        log("parseDetailResponse error: " + e.message);
        return JSON.stringify({ url: "", isEmbed: false, headers: {}, subtitles: [] });
    }
}

function customJS(initialLink){
  return `
(function() {
    // 0. ĐÈ NGAY LẬP TỨC MÀN HÌNH NỀN TỐI VÀ SPINNER LOADING
    let overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        zIndex: '999998',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
    });
    overlay.innerHTML = \`
        <div style="border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #e50914; border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite;"></div>
        <div style="margin-top: 15px; font-size: 14px; color: #aaa; letter-spacing: 0.5px;">Đang tải tập phim...</div>
        <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    \`;
    
    if (document.body) {
        document.body.appendChild(overlay);
    } else {
        document.documentElement.appendChild(overlay);
    }

    // Kiểm tra lỗi Server 5xx ngay trước khi thực hiện các bước khác
    const bodyText = document.body ? document.body.innerHTML : "";
    const mainTitle = document.querySelector('.main-title');
    const isServerError = bodyText.includes("Lỗi Server 5xx") || (mainTitle && mainTitle.textContent.includes("5xx"));

    if (isServerError) {
        overlay.innerHTML = \`
            <div style="font-size: 45px; margin-bottom: 12px;">💥</div>
            <div style="font-size: 18px; font-weight: bold; color: #ff5555; margin-bottom: 8px;">Lỗi Server 5xx!</div>
            <div style="font-size: 14px; color: #aaa; text-align: center; max-width: 320px; line-height: 1.5; padding: 0 20px;">
                Hệ thống đang gặp sự cố quá tải hoặc bảo trì. Vui lòng quay lại sau khi server được sửa lại nhé!
            </div>
        \`;
        return;
    }

    // Chống nhảy trang quảng cáo nhưng cho phép bấm nút tắt (X) của quảng cáo
    window.addEventListener('click', function(e) {
        if (!e.target.closest('#floating-select-box') && !e.target.closest('#episode-grid-popup')) {
            let aTag = e.target.closest('a');
            if (aTag && (aTag.target === '_blank' || aTag.href)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, true);

    window.open = function() { return null; };

    function showToast(msg) {
        let old = document.getElementById('script-toast');
        if (old) old.remove();
        let toast = document.createElement('div');
        toast.id = 'script-toast';
        toast.textContent = msg;
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999999',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#4ade80',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            transition: 'opacity 0.5s'
        });
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    function init() {
        showToast("🚀 Script đang chạy...");

        // 1. LẤY DANH SÁCH TẬP PHIM TRƯỚC KHI XÓA DOM
        const episodeLinks = document.querySelectorAll(".episode .episode-link");
        const allEpisodes = [];
        episodeLinks.forEach((link, index) => {
            const url = link.getAttribute("href");
            const title = link.getAttribute("title") || ("Tập " + link.textContent.trim());
            if (url) {
                allEpisodes.push({ index, title, url });
            }
        });

        let currentPlayingIndex = 0;
        const currentUrl = window.location.href;
        allEpisodes.forEach((ep) => {
            if (currentUrl.includes(ep.url) || ep.url.includes(currentUrl.split('/').pop())) {
                currentPlayingIndex = ep.index;
            }
        });

        // 2. KIỂM TRA LOCALSTORAGE & XỬ LÝ LỊCH SỬ XEM
        const storageKey = "anime_history_" + window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
        let savedIndex = localStorage.getItem(storageKey);

        if (savedIndex !== null) {
            savedIndex = parseInt(savedIndex, 10);
            // Nếu tập hiện tại khác tập đã lưu VÀ khác tập tiếp theo ngay sau đó (savedIndex + 1)
            if (currentPlayingIndex !== savedIndex && currentPlayingIndex !== savedIndex + 1) {
                if (overlay) overlay.remove();

                let savedEpObj = allEpisodes[savedIndex] || { title: "Tập " + (savedIndex + 1) };
                let nextEpObj = allEpisodes[savedIndex + 1] || { title: "Tập " + (savedIndex + 2) };
                let currentEpObj = allEpisodes[currentPlayingIndex] || { title: "Tập " + (currentPlayingIndex + 1) };

                let modalOverlay = document.createElement('div');
                Object.assign(modalOverlay.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    zIndex: '1000005',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Arial, sans-serif'
                });

                let nextBtnHtml = (savedIndex + 1 < allEpisodes.length) ? 
                    \`<button id="btn-resume-next" style="padding: 10px 14px; border-radius: 8px; border: none; background: #27272a; color: #fff; font-weight: bold; cursor: pointer; font-size: 13px; transition: background 0.2s;">▶️ Xem tập tiếp theo (\${nextEpObj.title})</button>\` : '';

                modalOverlay.innerHTML = \`
                    <div style="background: #18181b; border: 1px solid rgba(255,255,255,0.1); padding: 24px; border-radius: 16px; width: 380px; max-width: 90vw; color: #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.9); text-align: center;">
                        <div style="font-size: 22px; margin-bottom: 10px;">📌</div>
                        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #f43f5e;">Khôi phục lịch sử xem</div>
                        <div style="font-size: 14px; color: #a1a1aa; margin-bottom: 20px; line-height: 1.5;">
                            Bạn đang mở <b>\${currentEpObj.title}</b>, nhưng lịch sử gần đây bạn đang xem đến <b>\${savedEpObj.title}</b>. Bạn có muốn chuyển hướng không?
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button id="btn-resume-saved" style="padding: 10px 14px; border-radius: 8px; border: none; background: #e50914; color: #fff; font-weight: bold; cursor: pointer; font-size: 13px;">💾 Chuyển đến tập đã lưu (\${savedEpObj.title})</button>
                            \${nextBtnHtml}
                            <button id="btn-resume-current" style="padding: 10px 14px; border-radius: 8px; border: none; background: transparent; color: #a1a1aa; cursor: pointer; font-size: 13px;">Vẫn xem tập hiện tại (\${currentEpObj.title})</button>
                        </div>
                    </div>
                \`;
                
                if (document.body) {
                    document.body.appendChild(modalOverlay);
                } else {
                    document.documentElement.appendChild(modalOverlay);
                }

                document.getElementById('btn-resume-saved').onclick = () => {
                    localStorage.setItem(storageKey, savedIndex);
                    window.location.href = allEpisodes[savedIndex].url;
                };

                if (document.getElementById('btn-resume-next')) {
                    document.getElementById('btn-resume-next').onclick = () => {
                        localStorage.setItem(storageKey, savedIndex + 1);
                        window.location.href = allEpisodes[savedIndex + 1].url;
                    };
                }

                document.getElementById('btn-resume-current').onclick = () => {
                    localStorage.setItem(storageKey, currentPlayingIndex);
                    modalOverlay.remove();
                    // Tạo lại overlay loading để tiếp tục chạy app
                    document.documentElement.appendChild(overlay);
                    runApp(currentPlayingIndex, overlay, allEpisodes);
                };

                return; // Dừng init chờ phản hồi từ modal
            }
        }

        // Lưu mốc tập hiện tại vào localStorage
        localStorage.setItem(storageKey, currentPlayingIndex);
        runApp(currentPlayingIndex, overlay, allEpisodes);
    }

    function runApp(currentPlayingIndex, overlay, allEpisodes) {
        // 3. LẤY LINK IFRAME BAN ĐẦU
        let initLink = "` + (initialLink || '') + `";
        if (!initLink) {
            try {
                let scriptTags = document.querySelectorAll('script');
                for (let s of scriptTags) {
                    let m = s.textContent.match(/window\\.PLAYER_DATA\\s*=\\s*(\\{[\\s\\S]*?\\});/);
                    if (m) {
                        let d = JSON.parse(m[1]);
                        if (d && d.link) { initLink = d.link; break; }
                    }
                }
                if (!initLink) {
                    let f = document.querySelector('iframe');
                    if (f) initLink = f.src;
                }
            } catch(e) {}
        }
        if (initLink && initLink.indexOf('//') === 0) {
            initLink = "https:" + initLink;
        }

        // 4. TẠO GIAO DIỆN ĐIỀU KHIỂN CHÍNH (CONTAINER)
        let container = document.createElement("div");
        container.id = "floating-select-box";
        Object.assign(container.style, {
            position: "fixed",
            top: "25px",
            right: "25px",
            transform: "translateX(-50%)",
            zIndex: "999999",
            backgroundColor: "rgba(15, 15, 15, 0.85)",
            backdropFilter: "blur(6px)",
            padding: "10px 16px",
            borderRadius: "14px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            color: "#fff",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "opacity 0.3s ease",
            opacity: "0",
            pointerEvents: "auto"
        });
        container.innerHTML = "<span style='color: #aaa; font-size: 13px;'>⏳ Đang tải...</span>";

        // 5. TẠO BẢNG POPUP LƯỚI CHỌN TẬP (5 CỘT, RỘNG 380px)
        let popupGrid = document.createElement("div");
        popupGrid.id = "episode-grid-popup";
        Object.assign(popupGrid.style, {
            position: "fixed",
            bottom: "85px",
            left: "50%",
            transform: "translateX(-50%) translateY(10px)",
            zIndex: "1000000",
            backgroundColor: "rgba(18, 18, 18, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "14px",
            borderRadius: "16px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.9)",
            width: "380px",
            maxHeight: "260px",
            overflowY: "auto",
            display: "none",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "8px",
            transition: "all 0.25s ease",
            opacity: "0",
            pointerEvents: "none"
        });

        // 6. XOÁ SẠCH BODY VÀ CHÈN IFRAME MỚI
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        document.documentElement.style.width = '100vw';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.background = '#000';

        document.body.innerHTML = "";
        Object.assign(document.body.style, {
            margin: '0',
            padding: '0',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: '#000',
            position: 'relative'
        });

        if (overlay) {
            document.body.appendChild(overlay);
        }

        if (initLink) {
            let newIframe = document.createElement("iframe");
            newIframe.className = "frameMain";
            let autoUrl = initLink.includes("?") ? initLink + "&autoplay=1" : initLink + "?autoplay=1";
            newIframe.src = autoUrl;
            newIframe.width = "100%";
            newIframe.height = "100%";
            newIframe.setAttribute("frameborder", "0");
            newIframe.setAttribute("scrolling", "no");
            newIframe.setAttribute("allowfullscreen", "");
            newIframe.setAttribute("allow", "autoplay; fullscreen");
            
            Object.assign(newIframe.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#000',
                zIndex: '1'
            });

            newIframe.onload = function() {
                if (overlay) {
                    setTimeout(() => {
                        overlay.style.transition = "opacity 0.4s ease";
                        overlay.style.opacity = "0";
                        setTimeout(() => overlay.remove(), 400);
                    }, 300);
                }
            };

            document.body.appendChild(newIframe);
        } else {
            if (overlay) setTimeout(() => { overlay.remove(); }, 2000);
        }

        document.body.appendChild(container);
        document.body.appendChild(popupGrid);

        container.addEventListener("mouseenter", () => container.style.opacity = "1");
        container.addEventListener("mouseleave", () => container.style.opacity = "0.25");
        container.addEventListener("touchstart", () => container.style.opacity = "1");

        // 7. FETCH CÁC TẬP CÒN LẠI VÀ QUẢN LÝ UI
        const listFrame = new Array(allEpisodes.length);
        if (allEpisodes[currentPlayingIndex] && initLink) {
            listFrame[currentPlayingIndex] = {
                title: allEpisodes[currentPlayingIndex].title,
                link: initLink,
                index: currentPlayingIndex,
                url: allEpisodes[currentPlayingIndex].url
            };
            updateSelectUI();
        }

        function fetchPage(episodeObj) {
            if (episodeObj.index === currentPlayingIndex) return;
            fetch(episodeObj.url)
                .then(response => response.text())
                .then(htmlText => {
                    const srcNext = htmlText.match(/window\\.PLAYER_DATA[\\s\\S]*?link["'][^"']["']([^"']+)["']/i);
                    if (srcNext && srcNext[1]) {
                        const framelink = decodeURIComponent(srcNext[1].replaceAll('\\\\/', '/'));
                        listFrame[episodeObj.index] = { title: episodeObj.title, link: framelink, index: episodeObj.index, url: episodeObj.url };
                        updateSelectUI();
                    }
                })
                .catch(error => console.error("Lỗi fetch " + episodeObj.title, error));
        }

        function changeEpisode(targetIndex) {
            const ep = listFrame[targetIndex];
            if (ep && ep.link) {
                currentPlayingIndex = targetIndex;
                
                // Cập nhật lại lịch sử vào localStorage khi chuyển tập trực tiếp
                const storageKey = "anime_history_" + window.location.pathname.replace(/[^a-zA-Z0-9]/g, "_");
                localStorage.setItem(storageKey, currentPlayingIndex);

                const targetIframe = document.querySelector(".frameMain");
                if (targetIframe) {
                    let cleanLink = ep.link.split('&autoplay=')[0].split('?autoplay=')[0];
                    let autoUrl = cleanLink.includes("?") ? cleanLink + "&autoplay=1&t=" + Date.now() : cleanLink + "?autoplay=1&t=" + Date.now();
                    targetIframe.src = autoUrl;
                }
                togglePopup(false);
                updateSelectUI();
            }
        }

        let isPopupOpen = false;
        function togglePopup(forceState) {
            isPopupOpen = forceState !== undefined ? forceState : !isPopupOpen;
            if (isPopupOpen) {
                popupGrid.style.display = "grid";
                setTimeout(() => {
                    popupGrid.style.opacity = "1";
                    popupGrid.style.transform = "translateX(-50%) translateY(0)";
                    popupGrid.style.pointerEvents = "auto";
                }, 10);
            } else {
                popupGrid.style.opacity = "0";
                popupGrid.style.transform = "translateX(-50%) translateY(10px)";
                popupGrid.style.pointerEvents = "none";
                setTimeout(() => {
                    if (!isPopupOpen) popupGrid.style.display = "none";
                }, 250);
            }
        }

        document.addEventListener("click", (e) => {
            if (!container.contains(e.target) && !popupGrid.contains(e.target)) {
                togglePopup(false);
            }
        });

        function updateSelectUI() {
            const validFrames = listFrame.filter(Boolean);
            container.innerHTML = "";

            const btnPrev = document.createElement("button");
            btnPrev.textContent = "⏮";
            btnPrev.title = "Tập trước";
            Object.assign(btnPrev.style, {
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
            });
            btnPrev.onclick = () => {
                if (currentPlayingIndex > 0 && listFrame[currentPlayingIndex - 1]) {
                    changeEpisode(currentPlayingIndex - 1);
                }
            };

            let currentEpObj = listFrame[currentPlayingIndex];
            let currentTitleText = currentEpObj ? currentEpObj.title : ("Tập " + (currentPlayingIndex + 1));
            
            const btnSelector = document.createElement("button");
            btnSelector.textContent = currentTitleText + " ▼";
            Object.assign(btnSelector.style, {
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#1c1c1c",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                outline: "none",
                minWidth: "120px"
            });
            btnSelector.onclick = (e) => {
                e.stopPropagation();
                togglePopup();
            };

            const btnNext = document.createElement("button");
            btnNext.textContent = "⏭";
            btnNext.title = "Tập tiếp theo";
            Object.assign(btnNext.style, {
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#e50914",
                color: "#fff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
            });
            btnNext.onclick = () => {
                if (currentPlayingIndex < listFrame.length - 1 && listFrame[currentPlayingIndex + 1]) {
                    changeEpisode(currentPlayingIndex + 1);
                }
            };

            container.appendChild(btnPrev);
            container.appendChild(btnSelector);
            container.appendChild(btnNext);

            popupGrid.innerHTML = "";
            validFrames.forEach(item => {
                const epBtn = document.createElement("button");
                let shortName = item.title.replace(/Tập\\s*/i, '');
                epBtn.textContent = shortName;
                epBtn.title = item.title;
                
                let isCurrent = (item.index === currentPlayingIndex);
                Object.assign(epBtn.style, {
                    padding: "10px 4px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isCurrent ? "#e50914" : "#252525",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: isCurrent ? "bold" : "normal",
                    textAlign: "center",
                    transition: "background 0.2s"
                });

                epBtn.onmouseenter = () => { if (!isCurrent) epBtn.style.backgroundColor = "#333"; };
                epBtn.onmouseleave = () => { if (!isCurrent) epBtn.style.backgroundColor = "#252525"; };

                epBtn.onclick = () => {
                    changeEpisode(item.index);
                };
                popupGrid.appendChild(epBtn);
            });
        }

        if (allEpisodes.length === 0) {
            container.innerHTML = "<span style='color: #ff5555;'>⚠️ Không tìm thấy danh sách tập!</span>";
        } else {
            allEpisodes.forEach(episode => {
                fetchPage(episode);
            });
        }
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
  `;
}

/*
function parseEmbedResponse(htmlContent, url) {
    try {
        // Thử trích xuất direct HLS stream từ player page
        var m3u8Match = /["'](https?:\/\/[^"'\s]*\.m3u8[^"'\s]*?)["']/i.exec(htmlContent);
        if (m3u8Match) {
            log("Found m3u8 stream: " + m3u8Match[1]);
            return JSON.stringify({
                url: m3u8Match[1],
                isEmbed: false,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Referer": "https://animevietsub.wiki/"
                },
                subtitles: []
            });
        }

        // Không tìm thấy m3u8 → trả embed với Block-Scripts chặn avs-shield
        // Trích xuất nextUrl từ URL embed hiện tại để làm Referer chuẩn
        var nextUrlMatch = url.match(/nextUrl=([^&]+)/);
        var referer = nextUrlMatch ? decodeURIComponent(nextUrlMatch[1]) : "https://animevietsub.wiki/";

        return JSON.stringify({
            url: url,
            isEmbed: false,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": referer,
                "Block-Scripts": "avs-shield"
            },
            subtitles: []
        });
    } catch (e) {
        log("parseEmbedResponse error: " + e.message);
        return JSON.stringify({ url: url, isEmbed: true, headers: {}, subtitles: [] });
    }
}
*/
// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(htmlContent) {
    try {
        var categories = [];
        // Parse menu thể loại từ trang chủ
        var menuBlock = /<ul class="sub-menu[^"]*">([\s\S]*?)<\/ul>/i.exec(htmlContent);
        if (menuBlock) {
            var catPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var catMatch;
            while ((catMatch = catPattern.exec(menuBlock[1])) !== null) {
                var catSlug = catMatch[1].replace(/\//g, "");
                var catName = catMatch[2].trim();
                if (catSlug && catName) {
                    categories.push({ name: catName, slug: catSlug });
                }
            }
        }
        // Fallback: quét toàn trang nếu không tìm thấy trong submenu
        if (categories.length === 0) {
            var fallbackPattern = /<a\s+href="[^"]*\/the-loai\/([^"]+)"[^>]*>([^<]+)<\/a>/gi;
            var fbMatch;
            while ((fbMatch = fallbackPattern.exec(htmlContent)) !== null) {
                var fbSlug = fbMatch[1].replace(/\//g, "");
                var fbName = fbMatch[2].trim();
                var exists = false;
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].slug === fbSlug) { exists = true; break; }
                }
                if (!exists && fbSlug && fbName) {
                    categories.push({ name: fbName, slug: fbSlug });
                }
            }
        }
        return JSON.stringify(categories);
    } catch (e) {
        log("parseCategoriesResponse error: " + e.message);
        return "[]";
    }
}

function parseCountriesResponse(htmlContent) { return "[]"; }
function parseYearsResponse(htmlContent) { return "[]"; }