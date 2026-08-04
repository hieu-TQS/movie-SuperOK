// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "misskon",
        "name": "MissKon",
        "version": "1.0.1",
        "baseUrl": "https://misskon.com",
        "iconUrl": "https://misskon.com/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "type": "MANGA",
        "layoutType": "HORIZONTAL"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'top3', title: 'Top 3', type: 'Horizontal', path: '' },
        { slug: 'top7', title: 'Top 7', type: 'Horizontal', path: '' },
        { slug: 'top30', title: 'Top 30', type: 'Horizontal', path: '' },
        { slug: 'top60', title: 'Top 60', type: 'Horizontal', path: '' },
        { slug: '', title: 'Mới Cập Nhật', type: 'Grid', path: '' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'AI Generated', slug: 'tag/ai-generated' },
        { name: 'Cosplay', slug: 'tag/cosplay' },
        { name: 'Japanese', slug: 'tag/jp' },
        { name: 'MyGirl', slug: 'tag/mygirl' },
        { name: 'JVAD', slug: 'tag/jvad' },
        { name: 'Other', slug: 'tag/otherxxx' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới nhất', value: 'latest' }
        ],
        category: [
            { name: "XIUREN", value: "xiuren" },
            { name: "XiaoYu", value: "xiaoyu" },
            { name: "XingYan", value: "xingyan" },
            { name: "MyGirl", value: "mygirl" },
            { name: "MFStar", value: "mfstar" }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var baseUrl = "https://misskon.com";

    var path = "";
    if (filters.category) {
        path = "/tag/" + filters.category;
    } else if (slug) {
        path = "/" + slug;
    }

    if (page > 1) {
        return baseUrl + path + "/page/" + page + "/";
    }
    return baseUrl + path + "/";
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    if (page > 1) {
        return "https://misskon.com/page/" + page + "/?s=" + encodeURIComponent(keyword);
    }
    return "https://misskon.com/?s=" + encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return "https://misskon.com/" + slug + "/";
}

function getUrlCategories() { return "https://misskon.com/"; }
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

    // Sahifa/TieLabs item structure: article.item-list
    var itemRegex = /<article[^>]*class="[^"]*item-list[^"]*"[^>]*>([\s\S]*?)<\/article>/gi;
    var match;

    while ((match = itemRegex.exec(html)) !== null) {
        var itemHtml = match[1];

        // Extract Link and Slug
        var linkMatch = itemHtml.match(/<h2[^>]*class="[^"]*post-box-title[^"]*"[^>]*>\s*<a[^>]+href="https?:\/\/misskon\.com\/([^"\/]+)\/?"/i) ||
            itemHtml.match(/<div[^>]*class="post-thumbnail"[^>]*>\s*<a[^>]+href="https?:\/\/misskon\.com\/([^"\/]+)\/?"/i);
        if (!linkMatch) continue;

        var slug = linkMatch[1];
        var title = "";
        var titleM = itemHtml.match(/<h2[^>]*class="[^"]*post-box-title[^"]*"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/i);
        if (titleM) title = PluginUtils.cleanText(titleM[1]);

        var thumb = "";
        var thumbM = itemHtml.match(/<img[^>]+data-src="([^"]+)"/i) ||
            itemHtml.match(/<img[^>]+src="([^"]+)"/i);
        if (thumbM) {
            thumb = thumbM[1];
            // If thumb is an SVG placeholder, ignore it and look for data-src
            if (thumb.indexOf("data:image/svg+xml") !== -1) {
                var dataSrcM = itemHtml.match(/data-src="([^"]+)"/i);
                if (dataSrcM) thumb = dataSrcM[1];
            }
        }

        if (slug && !foundSlugs[slug]) {
            items.push({
                id: slug,
                title: title,
                posterUrl: thumb,
                backdropUrl: thumb,
                description: "",
                episode_current: "Gallery",
                quality: "HD",
                lang: "China"
            });
            foundSlugs[slug] = true;
        }
    }

    // Pagination
    var totalPages = 1;
    var currentPage = 1;

    var currentMatch = html.match(/<span[^>]*class="current"[^>]*>(\d+)<\/span>/i);
    if (currentMatch) currentPage = parseInt(currentMatch[1]);

    var pageRegex = /class="page"[^>]*>(\d+)<\/a>/g;
    var pMatch;
    while ((pMatch = pageRegex.exec(html)) !== null) {
        var p = parseInt(pMatch[1]);
        if (p > totalPages) totalPages = p;
    }

    return JSON.stringify({
        items: items,
        pagination: {
            currentPage: currentPage,
            totalPages: totalPages,
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
        var titleMatch = html.match(/<h1[^>]*class="name post-title entry-title"[^>]*>([\s\S]*?)<\/h1>/i) ||
            html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        var poster = "";
        // Try og:image
        var ogMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
        if (ogMatch) {
            poster = ogMatch[1];
        } else {
            // Try twitter:image
            var twMatch = html.match(/<meta name="twitter:image" content="([^"]+)"/i);
            if (twMatch) {
                poster = twMatch[1];
            } else {
                // Try to find in LD+JSON or schema
                var schemaMatch = html.match(/"image":\s*\{\s*"@type":\s*"ImageObject",\s*"url":\s*"([^"]+)"/i) ||
                    html.match(/"image":\s*"([^"]+)"/i);
                if (schemaMatch) {
                    poster = schemaMatch[1].replace(/\\/g, "");
                } else {
                    // Final fallback: use the first content image from the whole page
                    var firstImgMatch = html.match(/<img[^>]+(?:data-src|src)="([^"]+(?:misskon\.com\/uploads|\/media\/|pok\.misskon\.com)[^"]+)"/i);
                    if (firstImgMatch) poster = firstImgMatch[1];
                }
            }
        }

        // Chapters - handle post pagination
        var channels = [];
        // Page 1
        var currentUrlM = html.match(/<link rel="canonical" href="([^"]+)"/i);
        var baseUrl = currentUrlM ? currentUrlM[1].replace(/\/$/, "") : "";

        // Find other pages
        var pages = [{ id: baseUrl + "/", name: "Trang 1", slug: "1" }];
        var pageRegex = /<a[^>]+href="([^"]+)"[^>]*class="post-page-numbers"[^>]*>(\d+)<\/a>/gi;
        var pm;
        var seenPages = { "1": true };

        while ((pm = pageRegex.exec(html)) !== null) {
            var pUrl = pm[1];
            var pNum = pm[2];
            if (!seenPages[pNum]) {
                pages.push({
                    id: pUrl,
                    name: "Trang " + pNum,
                    slug: pNum
                });
                seenPages[pNum] = true;
            }
        }

        // Sort pages just in case
        pages.sort(function (a, b) { return parseInt(a.slug) - parseInt(b.slug); });

        var servers = [{
            name: "Default",
            episodes: pages
        }];

        return JSON.stringify({
            id: "",
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: "",
            servers: servers,
            category: "Gallery, Model",
            status: "Thành công",
            quality: "HD",
            lang: "China"
        });

    } catch (e) {
        return "null";
    }
}

function parseDetailResponse(html) {
    try {
        var images = [];

        // 1. Target the main article block
        var articleMatch = html.match(/<article[^>]*id="the-post"[^>]*>([\s\S]*?)<\/article>/i);
        var contentHtml = articleMatch ? articleMatch[1] : html;

        // 2. Remove YARPP (related posts) section
        contentHtml = contentHtml.replace(/<div[^>]*class="[^"]*yarpp-related[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi, "");
        contentHtml = contentHtml.replace(/<div[^>]*class="[^"]*yarpp-related[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, "");

        // 3. Scan for content images in the filtered block
        var imgTagRegex = /<img[^>]+>/gi;
        var tagMatch;
        while ((tagMatch = imgTagRegex.exec(contentHtml)) !== null) {
            var tagHtml = tagMatch[0];

            // Prioritize data-src over src for lazyload
            var urlMatch = tagHtml.match(/data-src="([^"]+)"/i) || tagHtml.match(/src="([^"]+)"/i);
            if (urlMatch) {
                var url = urlMatch[1];

                // Content images on MissKon usually reside in pok.misskon.com, cdn, uploads, or /media/
                var isContentImg = url.indexOf("misskon.com") !== -1 ||
                    url.indexOf("/media/") !== -1 ||
                    url.indexOf("/uploads/") !== -1;

                // Exclude obvious non-content images
                var isGarbage = url.indexOf("data:image/svg+xml") !== -1 ||
                    url.indexOf("misskon.ico") !== -1 ||
                    url.indexOf("/ads/") !== -1 ||
                    url.indexOf("ad-provider") !== -1 ||
                    url.indexOf("gravatar") !== -1 ||
                    url.indexOf("logo.2026") !== -1;

                if (isContentImg && !isGarbage) {
                    if (images.indexOf(url) === -1) {
                        images.push(url);
                    }
                }
            }
        }

        return JSON.stringify({
            images: images,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://misskon.com/"
            }
        });
    } catch (e) {
        return "{}";
    }
}

function parseCategoriesResponse(html) {
    return JSON.stringify([
        { name: 'XIUREN', slug: 'tag/xiuren' },
        { name: 'XiaoYu', slug: 'tag/xiaoyu' },
        { name: 'XingYan', slug: 'tag/xingyan' },
        { name: 'MFStar', slug: 'tag/mfstar' },
        { name: 'MyGirl', slug: 'tag/mygirl' }
    ]);
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }
