// =============================================================================
// PORN00 PLUGIN - porn00.tv
// Optimized for SuperOK / SmartTube Movie Engine (Rhino ES5 compatible)
// =============================================================================

var BASEURL = "https://www.porn00.tv";
var _cachedCategories = null;

function getManifest() {
    return JSON.stringify({
        "id": "porn00",
        "name": "Porn00",
        "description": "Nguồn XXX Hay",
        "version": "1.0.0",
        "baseUrl": BASEURL,
        "iconUrl": "https://www.porn00.tv/static/images/logo.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { "slug": "/latest-vids/", "title": "Phim Mới Nhất", "type": "Grid" },
        { "slug": "/popular-vids/", "title": "Xem Nhiều Nhất", "type": "Grid" },
        { "slug": "/top-vids/", "title": "Đánh Giá Cao", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify(getCachedCategories());
}

function getFilterConfig() {
    return JSON.stringify({
        category: getCachedCategories()
    });
}

function getCachedCategories() {
    if (!_cachedCategories) {
        _cachedCategories = buildMenu(getLISTmenu());
    }
    return _cachedCategories;
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "/latest-vids/";

        if (filtersJson) {
            var filters = null;
            if (typeof filtersJson === "string") {
                try {
                    filters = JSON.parse(filtersJson);
                } catch (e) {
                    var fixedJson = filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
                    filters = JSON.parse(fixedJson);
                }
            } else {
                filters = filtersJson;
            }

            if (filters) {
                if (filters.page) {
                    page = parseInt(filters.page, 10) || 1;
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || path;
                    } else if (typeof filters.category === "string") {
                        path = filters.category;
                    }
                }
            }
        }

        if (path.indexOf("http") === 0) {
            if (page > 1 && path.indexOf("?") === -1 && !path.match(/\/\d+\/?$/)) {
                return path.replace(/\/+$/, "") + "/" + page + "/";
            }
            return path;
        }

        if (path.charAt(0) !== "/") {
            path = "/" + path;
        }

        var cleanPath = path.replace(/\/+$/, "");
        if (page > 1) {
            cleanPath += "/" + page;
        }

        return (BASEURL + cleanPath + "/").replace(/([^:]\/)\/+/g, "$1");
    } catch (e) {
        return (BASEURL + (slug ? "/" + slug : "/latest-vids/")).replace(/([^:]\/)\/+/g, "$1");
    }
}

function getUrlSearch(keyword, filtersJson) {
    try {
        var page = 1;
        if (filtersJson) {
            var filters = typeof filtersJson === "string" ? JSON.parse(filtersJson) : filtersJson;
            if (filters && filters.page) {
                page = parseInt(filters.page, 10) || 1;
            }
        }
        var encodedKey = encodeURIComponent(keyword || "").replace(/%20/g, "+");
        if (page > 1) {
            return BASEURL + "/searching/" + encodedKey + "/" + page + "/";
        }
        return BASEURL + "/searching/" + encodedKey + "/";
    } catch (e) {
        return BASEURL + "/searching/" + encodeURIComponent(keyword || "") + "/";
    }
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    if (slug.charAt(0) !== "/") slug = "/" + slug;
    return BASEURL + slug;
}

function getUrlEpisodePlayer(slug, episodeSlug, serverName) {
    if (episodeSlug && episodeSlug.indexOf("http") === 0) return episodeSlug;
    if (slug && slug.indexOf("http") === 0) return slug;
    return getUrlDetail(slug);
}

function getEpisodeUrl(slug, episodeSlug, serverName) {
    return getUrlEpisodePlayer(slug, episodeSlug, serverName);
}

function getUrlCategories() { return BASEURL; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// STREAM EXTRACTION HELPER
// =============================================================================

function extractStreamsFromHtml(html) {
    var streams = [];
    if (!html) return streams;

    // 1. Quét flashvars theo các trường chất lượng
    var qualitySlots = [
        { uKey: "video_alt_url4", tKey: "video_alt_url4_text" },
        { uKey: "video_alt_url3", tKey: "video_alt_url3_text" },
        { uKey: "video_alt_url2", tKey: "video_alt_url2_text" },
        { uKey: "video_alt_url",  tKey: "video_alt_url_text" },
        { uKey: "video_url",      tKey: "video_url_text" }
    ];

    for (var i = 0; i < qualitySlots.length; i++) {
        var slot = qualitySlots[i];
        var uRegex = new RegExp(slot.uKey + "\\s*:\\s*['\"]([^'\"]+)['\"]", "i");
        var tRegex = new RegExp(slot.tKey + "\\s*:\\s*['\"]([^'\"]+)['\"]", "i");
        var uMatch = html.match(uRegex);
        var tMatch = html.match(tRegex);

        if (uMatch && uMatch[1] && uMatch[1].indexOf("http") > -1) {
            var rawUrl = uMatch[1];
            // QUAN TRỌNG: Không ghép thêm postfix vào đuôi nếu URL đã có ?v-acctoken hoặc .mp4
            var streamUrl = rawUrl;
            var qualText = (tMatch && tMatch[1]) ? tMatch[1].trim() : "HD";
            streams.push({
                url: streamUrl,
                quality: qualText
            });
        }
    }

    // 2. Fallback: Quét HTML5 video / source
    if (streams.length === 0) {
        var srcRegex = /<source[^>]+src=["']([^"']+\.(?:mp4|m3u8)[^"']*)["'][^>]*title=["']?([^"'>\s]*)/gi;
        var srcMatch;
        while ((srcMatch = srcRegex.exec(html)) !== null) {
            var vSrc = srcMatch[1];
            var vQual = srcMatch[2] || "HD";
            streams.push({
                url: vSrc,
                quality: vQual
            });
        }
    }

    // 3. Fallback: Quét link get_file trực tiếp
    if (streams.length === 0) {
        var getFileRegex = /https?:\/\/[^"'\s<>]+\/get_file\/[^"'\s<>]+/gi;
        var gfMatch;
        while ((gfMatch = getFileRegex.exec(html)) !== null) {
            streams.push({
                url: gfMatch[0],
                quality: "HD"
            });
        }
    }

    return streams;
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, $url) {
    try {
        var items = [];
        if (!html) {
            return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false } });
        }

        var itemRegex = /<div[^>]+class=["'][^"']*\bitem\b[^"']*["'][^>]*>([\s\S]*?)(?=<div[^>]+class=["'][^"']*\bitem\b[^"']*["']|$)/gi;
        var itemMatch;

        while ((itemMatch = itemRegex.exec(html)) !== null) {
            var block = itemMatch[1];

            var linkMatch = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["']/i)
                || block.match(/title=["']([^"']+)["'][^>]*<a[^>]+href=["']([^"']+)["']/i)
                || block.match(/<a[^>]+href=["']([^"']+)["']/i);

            if (!linkMatch) continue;

            var itemUrl = "";
            var itemTitle = "";

            if (linkMatch[2]) {
                if (linkMatch[1].indexOf("/video/") > -1 || linkMatch[1].indexOf("http") > -1) {
                    itemUrl = linkMatch[1];
                    itemTitle = linkMatch[2];
                } else {
                    itemUrl = linkMatch[2];
                    itemTitle = linkMatch[1];
                }
            } else {
                itemUrl = linkMatch[1];
                var tMatch = block.match(/<strong[^>]*class=["']title["'][^>]*>([^<]+)<\/strong>/i)
                    || block.match(/title=["']([^"']+)["']/i)
                    || block.match(/<strong[^>]*>([^<]+)<\/strong>/i);
                itemTitle = tMatch ? tMatch[1] : "";
            }

            if (!itemUrl) continue;
            if (itemUrl.indexOf("http") !== 0) {
                if (itemUrl.charAt(0) !== "/") itemUrl = "/" + itemUrl;
                itemUrl = BASEURL + itemUrl;
            }

            var thumb = "";
            var thumbMatch = block.match(/data-original=["']([^"']+)["']/i)
                || block.match(/data-src=["']([^"']+)["']/i)
                || block.match(/data-webp=["']([^"']+)["']/i);
            if (thumbMatch && thumbMatch[1]) {
                thumb = thumbMatch[1].replace(/&amp;/g, "&");
                if (thumb.indexOf("//") === 0) thumb = "https:" + thumb;
            }

            var duration = "";
            var durMatch = block.match(/<(?:div|span)[^>]*class=["'][^"']*duration[^"']*["'][^>]*>([^<]+)<\/(?:div|span)>/i);
            if (durMatch && durMatch[1]) {
                duration = durMatch[1].trim();
            }

            var quality = "HD";
            var hdMatch = block.match(/<span[^>]*class=["'][^"']*(?:is-hd|hd|quality)[^"']*["'][^>]*>/i);
            if (hdMatch) {
                quality = "HD";
            }

            items.push({
                "id": itemUrl,
                "title": itemTitle.trim(),
                "posterUrl": thumb,
                "backdropUrl": thumb,
                "duration": duration,
                "quality": quality
            });
        }

        var currentPage = 1;
        var totalPages = 999;

        var pageMatch = html.match(/class=["'][^"']*(?:current|active)[^"']*["'][^>]*>(\d+)<\/span>/i)
            || html.match(/<span>(\d+)<\/span>/i);
        if (pageMatch && pageMatch[1]) {
            currentPage = parseInt(pageMatch[1], 10) || 1;
        }

        return JSON.stringify({
            "items": items,
            "pagination": { "currentPage": currentPage, "totalPages": totalPages, "hasNext": items.length > 0 }
        });
    } catch (e) {
        return JSON.stringify({
            "items": [],
            "pagination": { "currentPage": 1, "totalPages": 1, "hasNext": false }
        });
    }
}

function parseSearchResponse(html, $url) {
    return parseListResponse(html, $url);
}

function parseMovieDetail(html, $url) {
    try {
        var pageUrl = $url || "";
        var poster = "";
        var title = "Đang cập nhật...";
        var desc = "Không có mô tả.";

        var canonMatch = html.match(/link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
        if (canonMatch && canonMatch[1]) {
            pageUrl = canonMatch[1];
        }

        var imgMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)
            || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (imgMatch && imgMatch[1]) {
            poster = imgMatch[1];
        }

        var titleMatch = html.match(/<title>([^<]+)<\/title>/i) || html.match(/<title>([^<]+)/i);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].replace(/\s*-\s*Porn00.*$/i, "").replace(/\s*-\s*Watch.*$/i, "").trim();
        }

        var descMatch = html.match(/meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
            || html.match(/meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        if (descMatch && descMatch[1]) {
            desc = descMatch[1].trim();
        }

        var streams = extractStreamsFromHtml(html);
        var episodes = [];

        for (var i = 0; i < streams.length; i++) {
            var st = streams[i];
            episodes.push({
                "id": st.url,
                "name": "Chất Lượng: " + st.quality,
                "slug": st.url
            });
        }

        var result = {
            "id": pageUrl,
            "title": title,
            "posterUrl": poster,
            "backdropUrl": poster,
            "description": desc,
            "servers": [
                {
                    "name": "Porn00 VIP",
                    "episodes": episodes
                }
            ],
            "quality": streams.length > 0 ? streams[0].quality : "HD",
            "year": 2026,
            "rating": 9.0,
            "status": "Full",
            "duration": "N/A",
            "casts": "N/A",
            "director": "N/A",
            "category": "18+"
        };

        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({
            "id": $url || "",
            "title": "Lỗi phân giải",
            "posterUrl": "",
            "backdropUrl": "",
            "description": "Lỗi: " + e,
            "servers": []
        });
    }
}

function parseDetailResponse(html, url) {
    try {
        var streamUrl = url || "";
        if (!streamUrl || streamUrl.indexOf("http") !== 0 || streamUrl.indexOf("/video/") > -1) {
            if (html) {
                var streams = extractStreamsFromHtml(html);
                if (streams.length > 0) {
                    streamUrl = streams[0].url;
                }
            }
        }

        var isHls = streamUrl.indexOf(".m3u8") > -1;
        return JSON.stringify({
            "url": streamUrl,
            "isEmbed": false,
            "mimeType": isHls ? "application/x-mpegURL" : "video/mp4",
            "headers": {
                "Referer": BASEURL + "/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            "subtitles": []
        });
    } catch (e) {
        return JSON.stringify({ "url": url || "", "headers": {} });
    }
}

function parsePlayerUrl(html, url) {
    return parseDetailResponse(html, url);
}

function parsePlayerResponse(html, url) {
    return parseDetailResponse(html, url);
}

function parseEpisodePlayer(html, url) {
    return parseDetailResponse(html, url);
}

function parseCategoriesResponse(apiResponseJson) {
    return JSON.stringify(getCachedCategories());
}

function parseCountriesResponse(html) { return "[]"; }
function parseYearsResponse(html) { return "[]"; }

// =============================================================================
// CATEGORIES DATA & PARSER
// =============================================================================

function buildMenu(listurl) {
    var menulist = [];
    if (!listurl) return menulist;

    var lines = listurl.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line.indexOf("@@") === -1) continue;

        var parts = line.split("@@");
        var link = parts[0] ? parts[0].trim() : "";
        var name = parts[1] ? parts[1].trim() : "";

        if (!link || !name) continue;

        menulist.push({
            "slug": link,
            "name": name
        });
    }
    return menulist;
}

function getLISTmenu() {
    return [
        "/category-name/720p/@@720p",
        "/category-name/amateur/@@amateur",
        "/category-name/american/@@American",
        "/category-name/anal/@@anal",
        "/category-name/anal-fingering/@@anal fingering",
        "/category-name/arab/@@arab",
        "/category-name/asian/@@asian",
        "/category-name/asmr/@@ASMR",
        "/category-name/ass-licking/@@ass licking",
        "/category-name/ass-worship/@@ass worship",
        "/category-name/babe/@@babe",
        "/category-name/ballerina/@@ballerina",
        "/category-name/bdsm/@@bdsm",
        "/category-name/bedroom/@@Bedroom",
        "/category-name/big-ass/@@big ass",
        "/category-name/big-dick/@@big dick",
        "/category-name/big-tits/@@big tits",
        "/category-name/bisexual/@@bisexual",
        "/category-name/black-hair/@@black hair",
        "/category-name/blonde/@@blonde",
        "/category-name/blowjob/@@blowjob",
        "/category-name/blue-hair/@@blue hair",
        "/category-name/boss/@@boss",
        "/category-name/brazilian/@@brazilian",
        "/category-name/brown-hair/@@brown hair",
        "/category-name/brunette/@@brunette",
        "/category-name/bubble-butt/@@bubble butt",
        "/category-name/business-woman/@@business woman",
        "/category-name/car-bus-sex/@@car/bus sex",
        "/category-name/casting/@@casting",
        "/category-name/cheating/@@cheating",
        "/category-name/chinese/@@chinese",
        "/category-name/christmas/@@christmas",
        "/category-name/cosplay/@@cosplay",
        "/category-name/couples-fantasies/@@couples fantasies",
        "/category-name/cowgirl/@@cowgirl",
        "/category-name/creampie/@@creampie",
        "/category-name/criminal/@@criminal",
        "/category-name/cuckold/@@cuckold",
        "/category-name/cumshot/@@cumshot",
        "/category-name/czech/@@czech",
        "/category-name/deep-throat/@@deep throat",
        "/category-name/dildo/@@dildo",
        "/category-name/doctor/@@doctor",
        "/category-name/doctor-nurse/@@doctor/nurse",
        "/category-name/doggy/@@doggy",
        "/category-name/doggystyle/@@doggystyle",
        "/category-name/domination/@@domination",
        "/category-name/double-penetration/@@double penetration",
        "/category-name/ebony/@@ebony",
        "/category-name/face-fuck/@@face fuck",
        "/category-name/face-sitting/@@face sitting",
        "/category-name/facial/@@facial",
        "/category-name/family/@@family",
        "/category-name/feet/@@feet",
        "/category-name/femdom/@@femdom",
        "/category-name/first-anal/@@first anal",
        "/category-name/foot-fetish/@@foot fetish",
        "/category-name/footjob/@@footjob",
        "/category-name/force-sex-scene/@@force sex scene",
        "/category-name/foursome/@@foursome",
        "/category-name/fuck-my-wife/@@fuck my wife",
        "/category-name/gagging/@@gagging",
        "/category-name/gangbang/@@gangbang",
        "/category-name/gaping/@@gaping",
        "/category-name/girlfriend/@@girlfriend",
        "/category-name/glasses/@@glasses",
        "/category-name/gonzo/@@gonzo",
        "/category-name/great-ass/@@great ass",
        "/category-name/group-sex/@@group sex",
        "/category-name/hairy-pussy/@@hairy pussy",
        "/category-name/halloween/@@halloween",
        "/category-name/hand/@@hand",
        "/category-name/handjob/@@handjob",
        "/category-name/hardcore/@@hardcore",
        "/category-name/high-heels/@@high heels",
        "/category-name/hospital/@@hospital",
        "/category-name/huge-tits/@@huge tits",
        "/category-name/incest/@@incest",
        "/category-name/interactive-porn/@@interactive porn",
        "/category-name/interracial/@@interracial",
        "/category-name/japanese/@@japanese",
        "/category-name/latin/@@latin",
        "/category-name/latina/@@latina",
        "/category-name/lesbian/@@lesbian",
        "/category-name/lingerie/@@lingerie",
        "/category-name/maid/@@maid",
        "/category-name/mass/@@mass",
        "/category-name/massage/@@massage",
        "/category-name/masturbation/@@masturbation",
        "/category-name/medium-ass/@@medium ass",
        "/category-name/medium-tits/@@medium tits",
        "/category-name/milf/@@milf",
        "/category-name/missionary/@@missionary",
        "/category-name/muslim/@@muslim",
        "/category-name/natural-tits/@@natural tits",
        "/category-name/neighbor/@@neighbor",
        "/category-name/nurse/@@nurse",
        "/category-name/office/@@office",
        "/category-name/onlyfans/@@OnlyFans",
        "/category-name/oral-train/@@oral train",
        "/category-name/orgy/@@orgy",
        "/category-name/parody/@@parody",
        "/category-name/petite/@@petite",
        "/category-name/piercing/@@piercing",
        "/category-name/police/@@police",
        "/category-name/prisoner/@@prisoner",
        "/category-name/public-sex/@@public sex",
        "/category-name/punishment/@@punishment",
        "/category-name/pussy-fingering/@@pussy fingering",
        "/category-name/pussy-licking/@@pussy licking",
        "/category-name/raven/@@raven",
        "/category-name/reality-porn/@@reality porn",
        "/category-name/red-head/@@red head",
        "/category-name/rimjob/@@rimjob",
        "/category-name/rough-sex/@@rough sex",
        "/category-name/russian/@@russian",
        "/category-name/school/@@school",
        "/category-name/school-fantasies/@@school fantasies",
        "/category-name/school-girl/@@school girl",
        "/category-name/sci-fi/@@sci-fi",
        "/category-name/secretary/@@secretary",
        "/category-name/sex-toys/@@sex toys",
        "/category-name/shaved/@@shaved",
        "/category-name/side-fuck/@@side fuck",
        "/category-name/sleeping/@@sleeping",
        "/category-name/small-ass/@@small ass",
        "/category-name/small-tits/@@small tits",
        "/category-name/solo/@@solo",
        "/category-name/spanish/@@spanish",
        "/category-name/spanking/@@spanking",
        "/category-name/spoon/@@spoon",
        "/category-name/sports/@@sports",
        "/category-name/squirt/@@squirt",
        "/category-name/stepaunt/@@stepaunt",
        "/category-name/stepbrother/@@stepbrother",
        "/category-name/stepdad/@@stepdad",
        "/category-name/stepdaughter/@@stepdaughter",
        "/category-name/stepmom/@@stepmom",
        "/category-name/stepsister/@@stepsister",
        "/category-name/stepson/@@stepson",
        "/category-name/stockings/@@stockings",
        "/category-name/stripper/@@stripper",
        "/category-name/stuck/@@stuck",
        "/category-name/sugar-daddy/@@sugar daddy",
        "/category-name/swallow/@@swallow",
        "/category-name/swap/@@swap",
        "/category-name/swingers/@@swingers",
        "/category-name/taboo/@@taboo",
        "/category-name/tattoo/@@tattoo",
        "/category-name/teacher/@@teacher",
        "/category-name/teen/@@teen",
        "/category-name/thanksgiving/@@Thanksgiving",
        "/category-name/thief/@@thief",
        "/category-name/threesome/@@threesome",
        "/category-name/tittyfuck/@@tittyfuck",
        "/category-name/uniform/@@uniform",
        "/category-name/waitress/@@waitress",
        "/category-name/webcam/@@webcam",
        "/category-name/wedding/@@wedding",
        "/category-name/wife/@@wife",
        "/category-name/wife-swap/@@wife swap",
        "/category-name/work-fantasies/@@work fantasies",
        "/category-name/workout/@@workout",
        "/category-name/yoga/@@yoga"
    ].join("\n");
}
