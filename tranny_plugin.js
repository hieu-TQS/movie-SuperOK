// =============================================================================
// VAAPP Plugin - Tranny.one (Bản chuẩn hóa SuperOK / STPhim)
// Hỗ trợ duyệt danh mục, tìm kiếm, lọc và phát luồng MP4 HD / SD trực tiếp
// Sử dụng Mirror Domain nl.tranny.one chống chặn ISP & Cloudflare Timeout
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASEURL = "https://nl.tranny.one";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[Tranny.one] " + msg);
    }
}

function decodeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&mdash;/g, "-")
        .replace(/&ndash;/g, "-")
        .trim();
}

function getManifest() {
    return JSON.stringify({
        "id": "tranny",
        "name": "Tranny.one",
        "description": "Kho video Trans / Shemale chất lượng cao Tranny.one hỗ trợ MP4 HD.",
        "info": "Kho video Trans / Shemale chất lượng cao Tranny.one hỗ trợ MP4 HD.",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/trannyone.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "", "title": "Nổi Bật (Featured)", "type": "Horizontal" },
        { "slug": "recent/", "title": "Mới Nhất (Recent)", "type": "Horizontal" },
        { "slug": "viewed/", "title": "Xem Nhiều Nhất (Most Viewed)", "type": "Horizontal" },
        { "slug": "rating/", "title": "Đánh Giá Cao (Top Rated)", "type": "Horizontal" },
        { "slug": "hd/", "title": "Full HD 1080p", "type": "Horizontal" },
        { "slug": "c2047/asian-ladyboys/", "title": "Châu Á (Asian Ladyboys)", "type": "Horizontal" },
        { "slug": "c2260/thai/", "title": "Thái Lan (Thai Ladyboys)", "type": "Horizontal" },
        { "slug": "c2052/big-tits/", "title": "Vú Bự (Big Tits)", "type": "Horizontal" },
        { "slug": "c2096/shemale-anal/", "title": "Lỗ Nhị (Anal)", "type": "Horizontal" },
        { "slug": "c2095/creampie/", "title": "Xuất Trong (Creampie)", "type": "Horizontal" },
        { "slug": "c2042/shemales-fuck-guys/", "title": "Shemale & Trai", "type": "Horizontal" },
        { "slug": "c2049/shemales-fuck-shemales/", "title": "Shemale & Shemale", "type": "Horizontal" },
        { "slug": "c2106/amateur-trans/", "title": "Tự Quay (Amateur)", "type": "Horizontal" },
        { "slug": "c2100/hardcore/", "title": "Hardcore", "type": "Horizontal" },
        { "slug": "c2062/threesome/", "title": "Chơi 3 (Threesome)", "type": "Horizontal" },
        { "slug": "c2044/group-sex/", "title": "Tập Thể (Group Sex)", "type": "Horizontal" },
        { "slug": "c2381/sissy-femboy-porn/", "title": "Sissy / Femboy", "type": "Horizontal" },
        { "slug": "c2146/hentai/", "title": "Hentai / 3D Animation", "type": "Horizontal" },
        { "slug": "recent/", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "recent/", "name": "Mới Nhất (Recent)" },
        { "slug": "viewed/", "name": "Xem Nhiều Nhất (Most Viewed)" },
        { "slug": "rating/", "name": "Đánh Giá Cao (Top Rated)" },
        { "slug": "hd/", "name": "Full HD" },
        { "slug": "c2047/asian-ladyboys/", "name": "Châu Á (Asian)" },
        { "slug": "c2260/thai/", "name": "Thái Lan (Thai)" },
        { "slug": "c2052/big-tits/", "name": "Vú Bự (Big Tits)" },
        { "slug": "c2096/shemale-anal/", "name": "Lỗ Nhị (Anal)" },
        { "slug": "c2095/creampie/", "name": "Xuất Trong (Creampie)" },
        { "slug": "c2042/shemales-fuck-guys/", "name": "Shemale & Trai" },
        { "slug": "c2049/shemales-fuck-shemales/", "name": "Shemale & Shemale" },
        { "slug": "c2106/amateur-trans/", "name": "Tự Quay (Amateur)" },
        { "slug": "c2100/hardcore/", "name": "Hardcore" },
        { "slug": "c2062/threesome/", "name": "Chơi 3 (Threesome)" },
        { "slug": "c2044/group-sex/", "name": "Tập Thể (Group Sex)" },
        { "slug": "c2381/sissy-femboy-porn/", "name": "Sissy / Femboy" }
    ]);
}

function getFilters() {
    var listurl = getLISTmenu();
    var menulist = buildMenu(listurl);
    return JSON.stringify({
        "sort": [
            { "name": "Mới nhất", "value": "recent/" },
            { "name": "Xem nhiều nhất", "value": "viewed/" },
            { "name": "Đánh giá cao", "value": "rating/" },
            { "name": "Full HD", "value": "hd/" },
            { "name": "Tuần này", "value": "date-last-week/" },
            { "name": "Tháng này", "value": "date-last-month/" },
            { "name": "Năm này", "value": "date-last-year/" }
        ],
        "category": menulist
    });
}

function getFilterConfig() {
    return getFilters();
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";
        var sortValue = "";

        if (filtersJson) {
            try {
                var fixedJson = typeof filtersJson === 'string'
                    ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    : JSON.stringify(filtersJson);
                var filters = (typeof filtersJson === 'object') ? filtersJson : JSON.parse(fixedJson);

                if (filters.page) page = parseInt(filters.page) || 1;
                if (filters.sort) {
                    if (typeof filters.sort === 'string') sortValue = filters.sort;
                    else if (Array.isArray(filters.sort) && filters.sort.length > 0) sortValue = filters.sort[0].value || filters.sort[0];
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (err) {}
        }

        if (sortValue && (!path || path === "recent/" || path === "viewed/" || path === "rating/" || path === "hd/")) {
            path = sortValue;
        }

        if (!path) path = "";

        var fullUrl = (path.indexOf('http') === 0) ? path : (BASEURL + "/" + path.replace(/^\/+/, ''));

        // Replace any www.tranny.one domain with BASEURL
        fullUrl = fullUrl.replace(/https?:\/\/[a-z0-9\-_.]*tranny\.one/i, BASEURL);

        if (page > 1) {
            fullUrl += (fullUrl.indexOf('?') > -1 ? '&' : '?') + 'p=' + page;
        }

        return fullUrl;
    } catch (e) {
        return BASEURL + "/" + (slug || "recent/");
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    if (filtersJson) {
        if (typeof filtersJson === 'number') {
            page = filtersJson;
        } else if (typeof filtersJson === 'string') {
            try {
                var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                var parsed = JSON.parse(fixedJson);
                if (parsed.page) page = parseInt(parsed.page) || 1;
            } catch (e) {}
        } else if (typeof filtersJson === 'object' && filtersJson.page) {
            page = parseInt(filtersJson.page) || 1;
        }
    }
    var cleanKeyword = encodeURIComponent((keyword || "").trim());
    var url = BASEURL + "/search/" + cleanKeyword + "/";
    if (page > 1) {
        url += "?p=" + page;
    }
    return url;
}

function getSearchUrl(keyword, page) {
    return getUrlSearch(keyword, page);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf('http') === 0) {
        return slug.replace(/https?:\/\/[a-z0-9\-_.]*tranny\.one/i, BASEURL);
    }
    return BASEURL + "/" + slug.replace(/^\/+/, '');
}

function getUrlCategories() { return BASEURL + "/trannytube/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    try {
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });

        var items = [];
        var seenKeys = {};

        var blocks = html.split(/<div[^>]+class=['"][^'"]*th\s/i);

        for (var i = 1; i < blocks.length; i++) {
            var block = blocks[i];
            if (block.indexOf('class="th cat') === 0 || block.indexOf('th-ba') === 0) continue;

            // URL
            var hrefMatch = block.match(/href=['"]([^'"]*\/view\/\d+[^'"]*)['"]/i)
                || block.match(/href=['"]([^'"]*\/view\/[^'"]*)['"]/i)
                || block.match(/href=['"]([^'"]*)['"]/i);
            if (!hrefMatch) continue;
            var href = hrefMatch[1];
            if (href.indexOf('/view/') === -1 || href.indexOf('%userid%') !== -1) continue;

            // ID
            var idMatch = block.match(/data-id=['"](\d+)['"]/i) || href.match(/\/view\/(\d+)/i);
            var id = idMatch ? idMatch[1] : href;

            if (seenKeys[id]) continue;
            seenKeys[id] = true;

            // Title
            var titleMatch = block.match(/class=['"][^'"]*video-title[^'"]*['"][^>]*>(?:<span[^>]*>)?([\s\S]*?)(?:<\/span>)?<\/(?:span|p|div|a)>/i)
                || block.match(/title=['"]([^'"]+)['"]/i)
                || block.match(/alt=['"]([^'"]+)['"]/i);
            var title = titleMatch ? decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').replace(/Trans porn|Shemale Porn/gi, '').trim()) : "Video " + id;

            // Poster
            var poster = "";
            var dataSrcMatch = block.match(/data-src=['"]([^'"]+)['"]/i);
            if (dataSrcMatch && dataSrcMatch[1] && dataSrcMatch[1].indexOf('px_4_3.png') === -1 && dataSrcMatch[1].indexOf('nopic.png') === -1) {
                poster = dataSrcMatch[1];
            } else {
                var srcMatch = block.match(/src=['"]([^'"]+)['"]/i);
                if (srcMatch && srcMatch[1] && srcMatch[1].indexOf('px_4_3.png') === -1 && srcMatch[1].indexOf('nopic.png') === -1) {
                    poster = srcMatch[1];
                } else {
                    var dataSrcsetMatch = block.match(/data-srcset=['"]([^'",\s]+)/i);
                    if (dataSrcsetMatch && dataSrcsetMatch[1]) {
                        poster = dataSrcsetMatch[1];
                    }
                }
            }

            // Duration
            var durMatch = block.match(/class=['"][^'"]*btime[^'"]*['"][^>]*>([\s\S]*?)<\/(?:span|p|div)>/i);
            var duration = durMatch ? durMatch[1].replace(/<[^>]+>/g, '').trim() : "N/A";

            // Views
            var viewsMatch = block.match(/class=['"][^'"]*bviews[^'"]*['"][^>]*>([\s\S]*?)<\/(?:span|p|div)>/i);
            var views = viewsMatch ? viewsMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            var cleanSlug = href.replace(/https?:\/\/[a-z0-9\-_.]*tranny\.one/i, '').replace(/^\/+/, '');

            items.push({
                "id": cleanSlug,
                "slug": cleanSlug,
                "title": title,
                "posterUrl": poster,
                "duration": duration,
                "views": views,
                "quality": "HD"
            });
        }

        // Pagination
        var currentPage = 1;
        var totalPages = 1;

        var pageMatch = html.match(/[?&]p=(\d+)/i) || html.match(/data-page=['"](\d+)['"]/i);
        if (pageMatch) {
            currentPage = parseInt(pageMatch[1]) || 1;
        }

        if (items.length >= 20) {
            totalPages = currentPage + 1;
        }

        return JSON.stringify({
            "items": items,
            "pagination": {
                "currentPage": currentPage,
                "totalPages": totalPages,
                "hasNext": items.length >= 20,
                "totalItems": items.length,
                "itemsPerPage": items.length
            }
        });
    } catch (e) {
        log("Lỗi parseListResponse: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
    }
}

function parseList(html) {
    return parseListResponse(html);
}

function parseHomeResponse(html) {
    return parseListResponse(html);
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseSearchResult(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        var title = "Tranny.one Video";
        var poster = "";
        var duration = "N/A";
        var views = "";
        var highUrl = "";
        var lowUrl = "";
        var episodes = [];

        // High & Low streams from videoContainer data attributes
        var highMatch = html.match(/data-high=['"]([^'"]+)['"]/i)
            || html.match(/<source[^>]+src=['"]([^'"]+)['"][^>]+(?:label|res)=['"]high['"]/i)
            || html.match(/res=['"]high['"][^>]+src=['"]([^'"]+)['"]/i);
        if (highMatch && highMatch[1]) highUrl = decodeHtml(highMatch[1]);

        var lowMatch = html.match(/data-low=['"]([^'"]+)['"]/i)
            || html.match(/<source[^>]+src=['"]([^'"]+)['"][^>]+(?:label|res)=['"]low['"]/i)
            || html.match(/res=['"]low['"][^>]+src=['"]([^'"]+)['"]/i);
        if (lowMatch && lowMatch[1]) lowUrl = decodeHtml(lowMatch[1]);

        // Fallback: search for stream.tranny.one URLs
        if (!highUrl && !lowUrl) {
            var streamRegex = /https?:\/\/stream\.tranny\.one\/[^\s"'<>\\]+\.mp4/gi;
            var streamMatches = html.match(streamRegex) || [];
            if (streamMatches.length > 0) {
                highUrl = streamMatches[0];
                if (streamMatches.length > 1) {
                    lowUrl = streamMatches[1];
                }
            }
        }

        // Title
        var titleMatch = html.match(/class=['"][^'"]*movie-title-text[^'"]*['"][^>]*>([\s\S]*?)<\/span>/i)
            || html.match(/<h1[^>]*id=['"]mTitle['"][^>]*>([\s\S]*?)<\/h1>/i)
            || html.match(/title:\s*['"]([^'"]+)['"]/i)
            || html.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            title = decodeHtml(titleMatch[1].replace(/<[^>]+>/g, '').replace(/ - Tranny\.one.*/i, '').trim());
        }

        // Poster
        var posterMatch = html.match(/poster=['"]([^'"]+)['"]/i)
            || html.match(/let\s+poster\s*=\s*[^;]*['"](https?:\/\/[^'"]+)['"]/i)
            || html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^"']+)['"]/i);
        if (posterMatch && posterMatch[1]) {
            poster = posterMatch[1];
        }

        // Duration & Views
        var durMatch = html.match(/<i[^>]*><svg[^>]*bi-clock[\s\S]*?<em>([\s\S]*?)<\/em>/i);
        if (durMatch && durMatch[1]) duration = durMatch[1].trim();

        var viewsMatch = html.match(/<i[^>]*class=['"]views['"][^>]*><svg[^>]*bi-eye[\s\S]*?<em>([\s\S]*?)<\/em>/i);
        if (viewsMatch && viewsMatch[1]) views = viewsMatch[1].trim();

        if (highUrl) {
            episodes.push({ id: highUrl, name: "MP4 HD (Chất lượng cao)", slug: "mp4_high" });
        }
        if (lowUrl && lowUrl !== highUrl) {
            episodes.push({ id: lowUrl, name: "MP4 SD (Tiết kiệm dữ liệu)", slug: "mp4_low" });
        }

        if (episodes.length === 0) {
            var anyMp4 = html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>:]*/i);
            if (anyMp4) {
                episodes.push({ id: anyMp4[0], name: "Xem Ngay (MP4)", slug: "mp4_direct" });
            }
        }

        var mainStream = (episodes[0] && episodes[0].id) ? episodes[0].id : "";

        // Parse related videos
        var relatedMovies = [];
        var relatedSec = html.indexOf('class="thumbs');
        if (relatedSec !== -1) {
            var relHtml = html.substring(relatedSec);
            var parsedRel = JSON.parse(parseListResponse(relHtml));
            relatedMovies = parsedRel.items || [];
        }

        return JSON.stringify({
            id: mainStream,
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: title + (views ? " • " + views + " lượt xem" : "") + (duration !== "N/A" ? " • Thời lượng: " + duration : ""),
            servers: [
                {
                    name: "Tranny.one Server",
                    episodes: episodes
                }
            ],
            quality: "HD",
            year: 2026,
            rating: 9.0,
            status: "Full",
            duration: duration,
            casts: "Tranny.one",
            director: "Tranny.one",
            category: "Trans / Shemale",
            relatedMovies: relatedMovies.slice(0, 20)
        });
    } catch (e) {
        log("Lỗi parseMovieDetail: " + e);
        return JSON.stringify({
            id: "",
            title: "Tranny.one Video",
            posterUrl: "",
            backdropUrl: "",
            description: "",
            servers: [{ name: "Tranny.one Server", episodes: [{ id: "", name: "Lỗi phát", slug: "full" }] }],
            quality: "HD",
            year: 2026,
            rating: 8.0,
            status: "Full",
            duration: "N/A",
            casts: "N/A",
            director: "N/A",
            category: "18+"
        });
    }
}

function parseDetail(html) {
    return parseMovieDetail(html);
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = "";
        var highMatch = html.match(/data-high=['"]([^'"]+)['"]/i)
            || html.match(/<source[^>]+src=['"]([^'"]+)['"][^>]+(?:label|res)=['"]high['"]/i)
            || html.match(/res=['"]high['"][^>]+src=['"]([^'"]+)['"]/i);
        if (highMatch && highMatch[1]) streamUrl = decodeHtml(highMatch[1]);

        if (!streamUrl) {
            var lowMatch = html.match(/data-low=['"]([^'"]+)['"]/i)
                || html.match(/<source[^>]+src=['"]([^'"]+)['"][^>]+(?:label|res)=['"]low['"]/i)
                || html.match(/res=['"]low['"][^>]+src=['"]([^'"]+)['"]/i);
            if (lowMatch && lowMatch[1]) streamUrl = decodeHtml(lowMatch[1]);
        }

        if (!streamUrl) {
            var anyMp4 = html.match(/https?:\/\/[^\s"'<>]+\.mp4[^\s"'<>:]*/i);
            if (anyMp4) streamUrl = anyMp4[0];
        }

        return JSON.stringify({
            url: streamUrl || url,
            headers: {
                "Referer": BASEURL + "/",
                "Origin": BASEURL,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
    } catch (error) {
        return JSON.stringify({ url: "", headers: {} });
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
    return [
        "recent/@@Mới Nhất (Recent)",
        "viewed/@@Xem Nhiều Nhất (Most Viewed)",
        "rating/@@Đánh Giá Cao (Top Rated)",
        "hd/@@Full HD 1080p",
        "c2047/asian-ladyboys/@@Châu Á (Asian Ladyboys)",
        "c2260/thai/@@Thái Lan (Thai Ladyboys)",
        "c2052/big-tits/@@Vú Bự (Big Tits)",
        "c2096/shemale-anal/@@Lỗ Nhị (Anal)",
        "c2095/creampie/@@Xuất Trong (Creampie)",
        "c2042/shemales-fuck-guys/@@Shemale & Trai",
        "c2049/shemales-fuck-shemales/@@Shemale & Shemale",
        "c2048/shemales-fuck-girls/@@Shemale & Gái",
        "c2106/amateur-trans/@@Tự Quay (Amateur)",
        "c2100/hardcore/@@Hardcore",
        "c2062/threesome/@@Chơi 3 (Threesome)",
        "c2044/group-sex/@@Tập Thể (Group Sex)",
        "c2381/sissy-femboy-porn/@@Sissy / Femboy",
        "c2081/big-cock/@@Hàng Khủng (Big Cock)",
        "c2063/masturbation/@@Thủ Dâm (Masturbation)",
        "c2050/stockings/@@Tất Chân (Stockings)",
        "c2064/bareback/@@Trần Trụi (Bareback)",
        "c2059/lingerie/@@Đồ Lót (Lingerie)",
        "c2147/crossdressing/@@Giả Gái (Crossdressing)",
        "c2199/cum-in-mouth/@@Bắn Vào Miệng (Cum in Mouth)",
        "c2110/ebony/@@Da Đen (Ebony)",
        "c2103/bdsm/@@BDSM",
        "c2067/small-tits/@@Ngực Nhỏ (Small Tits)",
        "c2115/homemade/@@Tự Làm (Homemade)",
        "c2099/teen/@@Tuổi Teen 18+ (Teen)",
        "c2201/big-ass/@@Mông Bự (Big Ass)",
        "c2105/japanese/@@Nhật Bản (Japanese)",
        "c2054/shemale-domination/@@Thống Trị (Domination)",
        "c2157/futanari/@@Futanari",
        "c2101/milf/@@MILF (Gái Một Con)",
        "c2198/cum-compilation/@@Tổng Hợp Xuất Tinh",
        "c2104/riding/@@Cưỡi Ngựa (Riding)",
        "c2133/blowjobs/@@Bú Cu (Blowjobs)",
        "c2077/toys/@@Đồ Chơi (Sex Toys)",
        "c2058/outdoor/@@Ngoài Trời (Outdoor)",
        "c2090/pov/@@Góc Nhìn Thứ Nhất (POV)",
        "c2068/blondes/@@Tóc Vàng (Blondes)",
        "c2080/massage/@@Mát-xa (Massage)",
        "c2203/brazilian/@@Brazil (Brazilian)",
        "c2169/3d/@@3D / Hoạt Hình",
        "c2200/foot-fetish/@@Ghiền Chân (Foot Fetish)",
        "c2213/doggy-style/@@Doggy Style",
        "c2194/indian/@@Ấn Độ (Indian)",
        "c2091/public/@@Nơi Công Cộng (Public)",
        "c2086/double-penetration/@@Đâm 2 Lỗ (Double Penetration)",
        "c2118/cumshots/@@Bắn Tinh (Cumshots)",
        "c2045/latina-trannies/@@Latina",
        "c2208/gang-bang/@@Gangbang",
        "c2146/hentai/@@Hentai",
        "c2188/bukkake/@@Bukkake",
        "c2189/femdom/@@Femdom",
        "c2318/cum-swallowing/@@Nuốt Tinh Trùng (Cum Swallowing)",
        "c2223/ass-to-mouth/@@Ass to Mouth"
    ].join("\n");
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
            item = { "slug": link, "name": name };
        }
        menulist.push(item);
    }
    return menulist;
}
