// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "sayhentai",
        "name": "SayHentai",
        "version": "1.0.4",
        "baseUrl": "https://sayhentai.sh",
        "iconUrl": "https://sayhentai.sh/favicon-32x32.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MANGA",
        "layoutType": "VERTICAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: '', title: 'Truyện Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới Nhất', slug: '' },
        { name: 'Manhwa', slug: 'genre/manhwa' },
        { name: 'Truyện Full', slug: 'genre/completed' },
        { name: 'Romance', slug: 'genre/romance' },
        { name: 'Drama', slug: 'genre/drama' },
        { name: 'Học Đường', slug: 'genre/hoc-duong' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' },
            { name: 'A-Z', value: 'alphabet' },
            { name: 'Lượt xem', value: 'views' }
        ],
        category: [
            { name: "Manhwa", value: "manhwa" },
            { name: "Truyện Màu", value: "truyen-mau" },
            { name: "Yuri", value: "yuri" },
            { name: "NTR", value: "ntr" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://sayhentai.sh";

    if (filters.category) {
        return baseUrl + "/genre/" + filters.category + "?page=" + page;
    }

    if (slug && slug.indexOf('genre/') === 0) {
        return baseUrl + "/" + slug + "?page=" + page;
    }

    if (page > 1) {
        return baseUrl + "?page=" + page;
    }

    return baseUrl + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // WordPress Madara search structure
    return "https://sayhentai.sh/page/" + page + "/?s=" + encodeURIComponent(keyword) + "&post_type=wp-manga";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return "https://sayhentai.sh/" + slug + (slug.endsWith('.html') ? "" : ".html");
}

function getUrlCategories() { return "https://sayhentai.sh/"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// UTILS
// =============================================================================

var PluginUtils = {
    cleanText: function (text) {
        if (!text) return "";
        return text.replace(/<[^>]*>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s+/g, " ")
            .trim();
    }
};

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html) {
    var items = [];
    var foundSlugs = {};

    // Match .page-item-detail blocks
    var itemRegex = /<div[^>]*class="[^"]*page-item-detail[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    var match;

    while ((match = itemRegex.exec(html)) !== null) {
        var itemHtml = match[1];

        // Extract Link and Slug
        var linkMatch = itemHtml.match(/<h3[^>]*class="[^"]*font-title[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"/i) ||
            itemHtml.match(/<div[^>]*class="[^"]*item-thumb[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"/i);
        if (!linkMatch) continue;

        var fullUrl = linkMatch[1];
        var slug = fullUrl.replace("https://sayhentai.sh/", "").replace(/\/$/, "");

        // Extract Title
        var titleMatch = itemHtml.match(/title="([^"]+)"/i) ||
            itemHtml.match(/<a[^>]+>([^<]+)<\/a><\/h3>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "Unknown";

        // Extract Thumbnail
        var thumbMatch = itemHtml.match(/<img[^>]+src="([^"]+)"/i) ||
            itemHtml.match(/<img[^>]+data-src="([^"]+)"/i) ||
            itemHtml.match(/<img[^>]+data-lazy-src="([^"]+)"/i);
        var thumb = thumbMatch ? thumbMatch[1] : "";

        if (thumb && thumb.indexOf("http") !== 0) {
            if (thumb.indexOf("/") === 0) {
                thumb = "https://sayhentai.sh" + thumb;
            } else {
                thumb = "https://sayhentai.sh/" + thumb;
            }
        }

        // Extract Latest Chapter
        var chapterMatch = itemHtml.match(/<span[^>]*class="[^"]*chapter[^"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        var chapter = chapterMatch ? PluginUtils.cleanText(chapterMatch[1]) : "";

        if (slug && !foundSlugs[slug]) {
            items.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                description: "",
                episode_current: chapter,
                quality: "HD",
                lang: "Vietsub"
            });
            foundSlugs[slug] = true;
        }
    }

    // Pagination
    var totalPages = 1;
    var currentPage = 1;

    // Find current page from <li class="active"><span>2</span></li> or <span class="current">2</span>
    var currentMatch = html.match(/<li[^>]*class="[^"]*active[^"]*"[^>]*>\s*<span[^>]*>(\d+)<\/span>\s*<\/li>/i) ||
        html.match(/<span[^>]*class="[^"]*current[^"]*"[^>]*>(\d+)<\/span>/i);
    if (currentMatch) {
        currentPage = parseInt(currentMatch[1]);
    }

    // Find total pages from links like ?page=X or /page/X/
    var pageRegex = /[?&]page=(\d+)/g;
    var pMatch;
    while ((pMatch = pageRegex.exec(html)) !== null) {
        var p = parseInt(pMatch[1]);
        if (p > totalPages) totalPages = p;
    }

    // Also check for highest number in labels like 283
    var pageNumRegex = /<a[^>]*href="[^"]*[?&]page=(\d+)[^"]*"[^>]*>(\d+)<\/a>/g;
    var numMatch;
    while ((numMatch = pageNumRegex.exec(html)) !== null) {
        var p1 = parseInt(numMatch[1]);
        var p2 = parseInt(numMatch[2]);
        if (p1 > totalPages) totalPages = p1;
        if (p2 > totalPages) totalPages = p2;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages || 1,
            totalItems: items.length * totalPages,
            itemsPerPage: items.length
        }
    });
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}

function parseMovieDetail(html) {
    try {
        // Title
        var titleMatch = html.match(/<div[^>]*class="post-title"[^>]*>\s*<h1>([\s\S]*?)<\/h1>/i) ||
            html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        // Description
        var descMatch = html.match(/<div[^>]*class="description-summary"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/<div[^>]*class="summary__content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        // Poster
        var poster = "";
        var posterMatch = html.match(/<div[^>]*class="summary_image[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
            html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (posterMatch) poster = posterMatch[1];

        // Chapters
        var chapters = [];
        var chapterRegex = /<li[^>]*class="wp-manga-chapter[^"]*"[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        var cMatch;
        while ((cMatch = chapterRegex.exec(html)) !== null) {
            var cUrl = cMatch[1];
            var cTitle = PluginUtils.cleanText(cMatch[2]);
            var cSlug = cUrl.replace("https://sayhentai.sh/", "").replace(/\/$/, "");

            chapters.push({
                id: cUrl, // Using full URL as ID for reader extraction
                name: cTitle,
                slug: cSlug
            });
        }

        // Madara theme usually lists chapters from newest to oldest. Reverse it.
        chapters.reverse();

        var servers = [{
            name: "Server 1",
            episodes: chapters
        }];

        // Categories
        var categories = [];
        var catRegex = /<div[^>]*class="genres-content"[^>]*>([\s\S]*?)<\/div>/i;
        var catBlock = html.match(catRegex);
        if (catBlock) {
            var cSingleRegex = /<a[^>]*rel="tag"[^>]*>([^<]+)<\/a>/gi;
            var cm;
            while ((cm = cSingleRegex.exec(catBlock[1])) !== null) {
                categories.push(PluginUtils.cleanText(cm[1]));
            }
        }

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            servers: servers,
            category: categories.join(", "),
            status: "Đang tiến hành",
            quality: "HD",
            lang: "Vietsub"
        });

    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    try {
        var images = [];
        // Match .page-break img
        var imgRegex = /<div[^>]*class="page-break[^"]*"[^>]*>\s*<img[^>]+(?:src|data-src|data-lazy-src)="([^"]+)"/gi;
        var match;
        while ((match = imgRegex.exec(html)) !== null) {
            images.push(match[1].replace(/&amp;/g, "&"));
        }

        // Fallback: search all images in reading-content
        if (images.length === 0) {
            var readerMatch = html.match(/<div[^>]*class="reading-content"[^>]*>([\s\S]*?)<\/div>/i);
            if (readerMatch) {
                var readerHtml = readerMatch[1];
                var fallbackRegex = /<img[^>]+(?:src|data-src|data-lazy-src)="([^"]+)"/gi;
                var fm;
                while ((fm = fallbackRegex.exec(readerHtml)) !== null) {
                    images.push(fm[1].replace(/&amp;/g, "&"));
                }
            }
        }

        return JSON.stringify({
            images: images,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://sayhentai.sh/"
            }
        });
    } catch (e) {
        return "{}";
    }
}

function parseCategoriesResponse(html) {
    var categories = [];
    var catRegex = /<ul[^>]*class="genres-menu[^"]*"[^>]*>([\s\S]*?)<\/ul>/i;
    var block = html.match(catRegex);
    if (block) {
        var linkRegex = /<a[^>]+href="https:\/\/sayhentai\.sh\/genre\/([^"\/]+)"[^>]*>([^<]+)<\/a>/gi;
        var m;
        while ((m = linkRegex.exec(block[1])) !== null) {
            categories.push({ name: PluginUtils.cleanText(m[2]), slug: "genre/" + m[1] });
        }
    }
    return JSON.stringify(categories);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
