// =============================================================================
// VAAPP Plugin - Archivebate (archivebate.com)
// Hỗ trợ xem kho lưu trữ video Webcam & Livestream toàn diện trên SuperOK
// Tích hợp giải mã đa tầng Mixdrop MP4 phát trực tiếp trên ExoPlayer / Media3
// =============================================================================

var BASE_URL = "https://archivebate.com";
var DEFAULT_POSTER = "https://archivebate.com/img/thumbnail.jpg";

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "archivebate",
        "name": "Archivebate",
        "description": "Kho lưu trữ video webcam, cam models và livestream lớn nhất thế giới.",
        "version": "1.0.6",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/logo/logo.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "MOVIE",
        "playerType": "exoplayer",
        "layoutType": "HORIZONTAL",
        "isChannelSource": true
    });
}

function isChannelSource() {
    return true;
}

function isChannelItem(slug) {
    if (!slug) return false;
    return slug.indexOf("/profile/") !== -1 || slug.indexOf("profile/") === 0;
}

function getHomeSections() {
    return JSON.stringify([
        { slug: "platform/Y2hhdHVyYmF0ZQ==", title: "Chaturbate", type: "Horizontal", path: "platform" },
        { slug: "platform/c3RyaXBjaGF0", title: "Stripchat", type: "Horizontal", path: "platform" },
        { slug: "platform/Ym9uZ2FjYW1z", title: "BongaCams", type: "Horizontal", path: "platform" },
        { slug: "platform/Y2Ftc29kYQ==", title: "CamSoda", type: "Horizontal", path: "platform" },
        { slug: "platform/b25seWZhbnM=", title: "OnlyFans", type: "Horizontal", path: "platform" },
        { slug: "platform/dHdpdGNo", title: "Twitch", type: "Horizontal", path: "platform" },
        { slug: "gender/ZmVtYWxl", title: "Nữ (Female Models)", type: "Horizontal", path: "gender" },
        { slug: "gender/Y291cGxl", title: "Cặp đôi (Couples)", type: "Horizontal", path: "gender" },
        { slug: "gender/dHJhbnM=", title: "Chuyển giới (Trans)", type: "Horizontal", path: "gender" },
        { slug: "home", title: "Mới cập nhật (Recent Videos)", type: "Grid", path: "" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: "Mới cập nhật", slug: "home" },
        { name: "Chaturbate", slug: "platform/Y2hhdHVyYmF0ZQ==" },
        { name: "Stripchat", slug: "platform/c3RyaXBjaGF0" },
        { name: "BongaCams", slug: "platform/Ym9uZ2FjYW1z" },
        { name: "CamSoda", slug: "platform/Y2Ftc29kYQ==" },
        { name: "Cam4", slug: "platform/Y2FtNA==" },
        { name: "OnlyFans", slug: "platform/b25seWZhbnM=" },
        { name: "Twitch", slug: "platform/dHdpdGNo" },
        { name: "TikTok", slug: "platform/dGlrdG9r" },
        { name: "Instagram", slug: "platform/aW5zdGFncmFt" },
        { name: "YouTube", slug: "platform/eW91dHViZQ==" },
        { name: "Nữ (Female)", slug: "gender/ZmVtYWxl" },
        { name: "Cặp đôi (Couple)", slug: "gender/Y291cGxl" },
        { name: "Nam (Male)", slug: "gender/bWFsZQ==" },
        { name: "Chuyển giới (Trans)", slug: "gender/dHJhbnM=" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        category: [
            { name: "Mới cập nhật", slug: "home" },
            { name: "Chaturbate", slug: "platform/Y2hhdHVyYmF0ZQ==" },
            { name: "Stripchat", slug: "platform/c3RyaXBjaGF0" },
            { name: "BongaCams", slug: "platform/Ym9uZ2FjYW1z" },
            { name: "CamSoda", slug: "platform/Y2Ftc29kYQ==" },
            { name: "Cam4", slug: "platform/Y2FtNA==" },
            { name: "OnlyFans", slug: "platform/b25seWZhbnM=" },
            { name: "Twitch", slug: "platform/dHdpdGNo" },
            { name: "TikTok", slug: "platform/dGlrdG9r" },
            { name: "Instagram", slug: "platform/aW5zdGFncmFt" },
            { name: "YouTube", slug: "platform/eW91dHViZQ==" },
            { name: "Nữ (Female)", slug: "gender/ZmVtYWxl" },
            { name: "Cặp đôi (Couple)", slug: "gender/Y291cGxl" },
            { name: "Nam (Male)", slug: "gender/bWFsZQ==" },
            { name: "Chuyển giới (Trans)", slug: "gender/dHJhbnM=" }
        ]
    });
}

// =============================================================================
// URL BUILDERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    var filters = {};
    if (filtersJson) {
        if (typeof filtersJson === "string") {
            try {
                filters = JSON.parse(filtersJson);
            } catch (e) {
                filters = {};
            }
        } else {
            filters = filtersJson;
        }
    }

    var page = parseInt(filters.page || 1, 10);
    if (page < 1) page = 1;

    var target = slug || "";
    if (filters.category) {
        if (typeof filters.category === "string") {
            target = filters.category;
        } else if (Array.isArray(filters.category) && filters.category.length > 0) {
            target = filters.category[0].slug || target;
        }
    }

    if (target.indexOf("http") === 0) {
        if (page > 1 && target.indexOf("page=") === -1) {
            target += (target.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
        }
        return target;
    }

    if (target === "" || target === "home" || target === "recent") {
        if (page > 1) {
            return BASE_URL + "/?page=" + page;
        }
        return BASE_URL + "/";
    }

    if (target.charAt(0) !== "/") target = "/" + target;
    var url = BASE_URL + target;
    if (page > 1) {
        url += (url.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
    }
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    if (filtersJson) {
        if (typeof filtersJson === "string") {
            try {
                filters = JSON.parse(filtersJson);
            } catch (e) {
                filters = {};
            }
        } else {
            filters = filtersJson;
        }
    }

    var page = parseInt(filters.page || 1, 10);
    if (page < 1) page = 1;
    var safeKeyword = encodeURIComponent(keyword || "");
    return BASE_URL + "/api/v1/search?query=" + safeKeyword + "&page=" + page;
}

function getSearchUrl(keyword, page) {
    var p = parseInt(page || 1, 10);
    if (p < 1) p = 1;
    var safeKeyword = encodeURIComponent(keyword || "");
    return BASE_URL + "/api/v1/search?query=" + safeKeyword + "&page=" + p;
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var s = slug.toString().trim();
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("watch/") === 0 || s.indexOf("/watch/") === 0) {
        if (s.charAt(0) !== "/") s = "/" + s;
        return BASE_URL + s;
    }
    if (s.indexOf("profile/") === 0 || s.indexOf("/profile/") === 0) {
        if (s.charAt(0) !== "/") s = "/" + s;
        return BASE_URL + s;
    }
    if (/^\d+$/.test(s)) {
        return BASE_URL + "/watch/" + s;
    }
    return BASE_URL + "/profile/" + s;
}

function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(html, fetchedUrl) {
    try {
        if (!html) return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });

        // 1. Search API JSON response (Search result channels/models)
        if (html.trim().charAt(0) === '{') {
            var dataObj = JSON.parse(html);
            var items = [];
            var list = dataObj.data || [];
            for (var i = 0; i < list.length; i++) {
                var it = list[i];
                var uname = it.username || "";
                if (!uname) continue;
                var plat = it.platform || "Cam Model";
                var gen = it.gender || "";
                var desc = (plat ? "[" + plat + "] " : "") + (gen ? gen : "");
                var thumb = DEFAULT_POSTER;
                items.push({
                    id: BASE_URL + "/profile/" + uname,
                    title: uname,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    description: desc,
                    quality: plat,
                    source: "Archivebate",
                    type: "channel",
                    isChannel: true
                });
            }
            var curPage = (dataObj.meta && dataObj.meta.current_page) || 1;
            var lastPage = (dataObj.meta && dataObj.meta.last_page) || 1;
            return JSON.stringify({
                items: items,
                pagination: {
                    currentPage: curPage,
                    totalPages: lastPage,
                    hasNext: curPage < lastPage
                }
            });
        }

        // 2. HTML Response (Livewire rendered videos with real thumbnails)
        var items = [];
        var itemRegex = /<section[^>]*class=["']video_item["'][^>]*>([\s\S]*?)<\/section>/gi;
        var match;

        while ((match = itemRegex.exec(html)) !== null) {
            var section = match[1];

            var hrefMatch = section.match(/href=["'](https?:\/\/[^"']*\/watch\/\d+)["']/i) || section.match(/href=["'](\/watch\/\d+)["']/i);
            if (!hrefMatch) continue;
            var watchUrl = hrefMatch[1];
            if (watchUrl.indexOf("http") !== 0) watchUrl = BASE_URL + watchUrl;

            var videoId = "";
            var vIdMatch = watchUrl.match(/\/watch\/(\d+)/);
            if (vIdMatch) videoId = vIdMatch[1];

            var posterMatch = section.match(/poster=["']([^"']+)["']/i) || section.match(/src=["']([^"']+\.(?:jpg|png|webp|jpeg))["']/i);
            var posterUrl = posterMatch ? posterMatch[1].replace(/\\/g, '') : DEFAULT_POSTER;

            var durationMatch = section.match(/<div[^>]*class=["']duration[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
            var duration = durationMatch ? durationMatch[1].replace(/<[^>]+>/g, '').trim() : "";

            var profileMatch = section.match(/href=["'][^"']*\/profile\/([^"']+)["']/i);
            var modelName = profileMatch ? profileMatch[1] : ("Video #" + videoId);

            var infoMatch = section.match(/<div[^>]*class=["']info[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
            var infoText = infoMatch ? infoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "";

            var title = modelName;
            if (duration) title += " (" + duration + ")";

            items.push({
                id: watchUrl,
                title: title,
                posterUrl: posterUrl,
                backdropUrl: posterUrl,
                description: infoText || modelName,
                duration: duration,
                quality: "HD",
                source: "Archivebate",
                type: "video",
                isChannel: false
            });
        }

        var pageNum = 1;
        var pageParam = (fetchedUrl || "").match(/[?&]page=(\d+)/);
        if (pageParam) pageNum = parseInt(pageParam[1], 10) || 1;

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: pageNum,
                totalPages: 9999,
                hasNext: items.length > 0
            }
        });

    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseSearchResult(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseList(html, fetchedUrl) {
    return parseListResponse(html, fetchedUrl);
}

function parseMovieDetail(html, fetchedUrl) {
    try {
        if (!html) return "null";

        // 1. Profile Page Detail (/profile/{username})
        if (fetchedUrl && fetchedUrl.indexOf("/profile/") !== -1) {
            var unameMatch = fetchedUrl.match(/\/profile\/([^/?#]+)/);
            var username = unameMatch ? unameMatch[1] : "Streamer";
            var avatarUrl = DEFAULT_POSTER;

            // Extract all videos of this streamer on the page
            var episodes = [];
            var seenIds = {};
            var epIdx = 1;

            var sectionRegex = /<section[^>]*class=["']video_item["'][^>]*>([\s\S]*?)<\/section>/gi;
            var sMatch;
            while ((sMatch = sectionRegex.exec(html)) !== null) {
                var sInner = sMatch[1];
                var hMatch = sInner.match(/href=["'](https?:\/\/[^"']*\/watch\/(\d+))["']/i) || sInner.match(/href=["'](\/watch\/(\d+))["']/i);
                if (!hMatch) continue;
                var vidUrl = hMatch[1];
                if (vidUrl.indexOf("http") !== 0) vidUrl = BASE_URL + vidUrl;
                var vidId = hMatch[2];
                if (!seenIds[vidId]) {
                    seenIds[vidId] = true;
                    var durM = sInner.match(/<div[^>]*class=["']duration[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
                    var dur = durM ? durM[1].replace(/<[^>]+>/g, '').trim() : "";
                    episodes.push({
                        id: vidUrl,
                        name: "Video #" + epIdx + (dur ? " (" + dur + ")" : ""),
                        slug: "video-" + vidId
                    });
                    epIdx++;
                }
            }

            // Fallback general link matching if no video_item sections
            if (episodes.length === 0) {
                var vRegex = /href=["'](https?:\/\/[^"']*\/watch\/(\d+))["']/gi;
                var vMatch;
                while ((vMatch = vRegex.exec(html)) !== null) {
                    var vUrl = vMatch[1];
                    var vId = vMatch[2];
                    if (!seenIds[vId]) {
                        seenIds[vId] = true;
                        episodes.push({
                            id: vUrl,
                            name: "Video #" + epIdx + " (ID: " + vId + ")",
                            slug: "video-" + vId
                        });
                        epIdx++;
                    }
                }
            }

            if (episodes.length === 0) {
                episodes.push({
                    id: fetchedUrl,
                    name: "Xem Kênh Trực Tiếp",
                    slug: "full"
                });
            }

            return JSON.stringify({
                title: username + " - Cam Streamer",
                originName: username,
                posterUrl: avatarUrl,
                backdropUrl: avatarUrl,
                description: "Hồ sơ lưu trữ webcam & livestream của " + username + " trên Archivebate.\nTổng số video lưu trữ: " + episodes.length,
                casts: username,
                category: "Cam Model",
                quality: "HD",
                lang: "Original",
                servers: [
                    {
                        name: "Danh sách Video (" + episodes.length + " video)",
                        episodes: episodes
                    }
                ]
            });
        }

        // 2. Watch Page Detail (/watch/{id})
        var vidMatch = (fetchedUrl || "").match(/\/watch\/(\d+)/);
        var videoId = vidMatch ? vidMatch[1] : "";

        // Model username from page
        var modelLinkMatch = html.match(/href=["'][^"']*\/profile\/([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
        var streamerName = modelLinkMatch ? modelLinkMatch[1] : ("Video #" + videoId);

        // Poster thumbnail
        var thumbMatch = html.match(/background:url\(([^)]+)\)/i)
            || html.match(/name=["']t["']\s+value=["']([^"']+)["']/i)
            || html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        var poster = thumbMatch ? thumbMatch[1].replace(/\\/g, '').trim() : DEFAULT_POSTER;

        // Platform & info from page
        var infoMatch = html.match(/<div[^>]*class=["']info["'][^>]*>([\s\S]*?)<\/div>/i);
        var infoText = infoMatch ? infoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "";

        var platform = "Cam";
        if (infoText.indexOf("Chaturbate") !== -1) platform = "Chaturbate";
        else if (infoText.indexOf("Stripchat") !== -1) platform = "Stripchat";
        else if (infoText.indexOf("Bongacams") !== -1) platform = "BongaCams";
        else if (infoText.indexOf("Camsoda") !== -1) platform = "CamSoda";
        else if (infoText.indexOf("Onlyfans") !== -1) platform = "OnlyFans";
        else if (infoText.indexOf("Twitch") !== -1) platform = "Twitch";

        // Mixdrop embed url
        var mixdropMatch = html.match(/src=["'](https?:\/\/[^"']*mixdrop\.[a-z]+\/e\/[a-zA-Z0-9_-]+)["']/i)
            || html.match(/fid=["'](https?:\/\/[^"']*mixdrop\.[a-z]+\/f\/[a-zA-Z0-9_-]+)["']/i);
        var embedUrl = mixdropMatch ? mixdropMatch[1] : "";
        if (embedUrl.indexOf("/f/") !== -1) {
            embedUrl = embedUrl.replace("/f/", "/e/");
        }

        var displayTitle = streamerName + " (Video #" + videoId + ")";

        // Suggested / Related videos
        var relatedItems = [];
        var relatedRegex = /<section[^>]*class=["']video_item["'][^>]*>([\s\S]*?)<\/section>/gi;
        var rMatch;
        while ((rMatch = relatedRegex.exec(html)) !== null) {
            var rSec = rMatch[1];
            var rHref = rSec.match(/href=["'](https?:\/\/[^"']*\/watch\/\d+)["']/i) || rSec.match(/href=["'](\/watch\/\d+)["']/i);
            if (!rHref) continue;
            var rWatchUrl = rHref[1];
            if (rWatchUrl.indexOf("http") !== 0) rWatchUrl = BASE_URL + rWatchUrl;
            var rPoster = (rSec.match(/poster=["']([^"']+)["']/i) || ["", ""])[1] || DEFAULT_POSTER;
            var rProfile = (rSec.match(/href=["'][^"']*\/profile\/([^"']+)["']/i) || ["", ""])[1];
            var rDuration = (rSec.match(/class=["']duration[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) || ["", ""])[1].replace(/<[^>]+>/g, '').trim();
            relatedItems.push({
                id: rWatchUrl,
                title: (rProfile || "Cam Video") + (rDuration ? " (" + rDuration + ")" : ""),
                posterUrl: rPoster,
                backdropUrl: rPoster,
                quality: "HD",
                source: "Archivebate",
                type: "video",
                isChannel: false
            });
        }

        var servers = [
            {
                name: "Server VIP (Phát trực tiếp MP4)",
                episodes: [
                    {
                        id: fetchedUrl || (BASE_URL + "/watch/" + videoId),
                        name: "Full HD",
                        slug: "full-mp4"
                    }
                ]
            }
        ];

        if (embedUrl) {
            servers.push({
                name: "Server Embed (WebPlayer)",
                episodes: [
                    {
                        id: embedUrl,
                        name: "Web Player",
                        slug: "embed"
                    }
                ]
            });
        }

        return JSON.stringify({
            title: displayTitle,
            originName: streamerName,
            posterUrl: poster,
            backdropUrl: poster,
            description: infoText ? (infoText + "\nStreamer: " + streamerName) : ("Video lưu trữ của " + streamerName),
            casts: streamerName,
            category: platform,
            quality: "HD",
            lang: "Original",
            servers: servers,
            relatedMovies: relatedItems
        });

    } catch (e) {
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION (Watch Page -> Mixdrop Embed -> Unpacked Direct MP4)
// =============================================================================

function unpackMixdrop(html) {
    if (!html) return null;

    // 1. Direct plain wurl in HTML
    var directMatch = html.match(/MDCore\.wurl\s*=\s*["']([^"']+)["']/i);
    if (directMatch) {
        var u = directMatch[1];
        if (u.indexOf("//") === 0) u = "https:" + u;
        return u;
    }

    // 2. Unpack JS packer: eval(function(p,a,c,k,e,d)...)
    var packMatch = html.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\((['"][\s\S]*?['"]),\s*(\d+),\s*(\d+),\s*['"]([^'"]+)['"]\.split\(['"]\|['"]\)/i);
    if (packMatch) {
        var p = packMatch[1];
        if (p.charAt(0) === "'" || p.charAt(0) === '"') {
            p = p.substring(1, p.length - 1);
        }
        var k = packMatch[4].split('|');
        var unescaped = p;
        for (var c = k.length - 1; c >= 0; c--) {
            if (k[c]) {
                unescaped = unescaped.replace(new RegExp('\\b' + c + '\\b', 'g'), k[c]);
            }
        }
        var wurlMatch = unescaped.match(/wurl\s*=\s*["']([^"']+)["']/i);
        if (wurlMatch) {
            var resUrl = wurlMatch[1];
            if (resUrl.indexOf("//") === 0) resUrl = "https:" + resUrl;
            return resUrl;
        }
    }
    return null;
}

// Step 1: parseDetailResponse / parseEpisodePlayer
function parseDetailResponse(html, fetchedUrl) {
    try {
        if (!html) return JSON.stringify({ url: "", isEmbed: false, headers: {} });

        // If already Mixdrop HTML
        if (html.indexOf("MDCore") !== -1 || (fetchedUrl && fetchedUrl.indexOf("mixdrop.") !== -1)) {
            var directVideo = unpackMixdrop(html);
            if (directVideo) {
                return JSON.stringify({
                    url: directVideo,
                    isEmbed: false,
                    headers: {
                        "Referer": fetchedUrl || "https://mixdrop.ag/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
            }
        }

        // Extract Mixdrop iframe from Archivebate watch page
        var mixdropMatch = html.match(/src=["'](https?:\/\/[^"']*mixdrop\.[a-z]+\/e\/[a-zA-Z0-9_-]+)["']/i)
            || html.match(/fid=["'](https?:\/\/[^"']*mixdrop\.[a-z]+\/f\/[a-zA-Z0-9_-]+)["']/i)
            || html.match(/<iframe[^>]*src=["'](https?:\/\/[^"']+)["']/i);

        if (mixdropMatch) {
            var embedUrl = mixdropMatch[1];
            if (embedUrl.indexOf("/f/") !== -1) {
                embedUrl = embedUrl.replace("/f/", "/e/");
            }
            return JSON.stringify({
                url: embedUrl,
                isEmbed: true,
                headers: {
                    "Referer": BASE_URL + "/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        return JSON.stringify({ url: fetchedUrl || "", isEmbed: true, headers: {} });

    } catch (e) {
        return JSON.stringify({ url: fetchedUrl || "", isEmbed: true, headers: {} });
    }
}

function parseEpisodePlayer(html, fetchedUrl) {
    return parseDetailResponse(html, fetchedUrl);
}

// Step 2: parseEmbedResponse / parseEmbedPlayer
function parseEmbedResponse(html, fetchedUrl) {
    try {
        if (!html) return JSON.stringify({ url: "", isEmbed: false, headers: {} });

        var directVideo = unpackMixdrop(html);
        if (directVideo) {
            return JSON.stringify({
                url: directVideo,
                isEmbed: false,
                headers: {
                    "Referer": fetchedUrl || "https://mixdrop.ag/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        return JSON.stringify({
            url: fetchedUrl || "",
            isEmbed: true,
            headers: {
                "Referer": BASE_URL + "/"
            }
        });
    } catch (e) {
        return JSON.stringify({ url: fetchedUrl || "", isEmbed: true, headers: {} });
    }
}

function parseEmbedPlayer(html, fetchedUrl) {
    return parseEmbedResponse(html, fetchedUrl);
}
