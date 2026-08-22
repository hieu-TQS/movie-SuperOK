// =============================================================================
// VAAPP Plugin - Archivebate (archivebate.com)
// Hỗ trợ duyệt danh mục, tìm kiếm người mẫu, hồ sơ kênh và xem video trực tiếp
// Tích hợp giải mã Livewire 2, trích xuất ảnh thumbnail HD riêng cho từng video
// Tương thích tối ưu Rhino JS Engine & ExoPlayer
// =============================================================================

var BASE_URL = "https://archivebate.com";
var DEFAULT_POSTER = "https://archivebate.com/img/thumbnail.jpg";
var DEV = "true";

function log(msg) {
    if (typeof nativeLog !== 'undefined') {
        nativeLog("[Archivebate] " + msg);
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
        .trim();
}

// =============================================================================
// JAVA HTTP HELPER (For Livewire AJAX & Mixdrop Redirects in Rhino)
// =============================================================================

function fetchUrlJava(urlStr, method, customHeaders, postData) {
    try {
        if (typeof java !== 'undefined' && java.net && java.net.URL) {
            var url = new java.net.URL(urlStr);
            var conn = url.openConnection();
            conn.setRequestMethod(method || "GET");
            conn.setConnectTimeout(6000);
            conn.setReadTimeout(6000);
            conn.setInstanceFollowRedirects(true);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            if (customHeaders) {
                for (var k in customHeaders) {
                    if (customHeaders.hasOwnProperty(k)) {
                        conn.setRequestProperty(k, customHeaders[k]);
                    }
                }
            }

            if (postData) {
                conn.setDoOutput(true);
                var os = conn.getOutputStream();
                var bytes = (new java.lang.String(postData)).getBytes("UTF-8");
                os.write(bytes);
                os.flush();
                os.close();
            }

            var code = conn.getResponseCode();

            if (code >= 300 && code < 400) {
                var loc = conn.getHeaderField("Location");
                if (loc) {
                    if (loc.indexOf("//") === 0) loc = "https:" + loc;
                    return fetchUrlJava(loc, "GET", { "Referer": urlStr });
                }
            }

            var is = (code >= 200 && code < 400) ? conn.getInputStream() : conn.getErrorStream();
            if (!is) return null;

            var reader = new java.io.BufferedReader(new java.io.InputStreamReader(is, "UTF-8"));
            var sb = new java.lang.StringBuilder();
            var line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            reader.close();
            is.close();

            var cookiesHeader = conn.getHeaderField("Set-Cookie");
            return {
                status: code,
                body: sb.toString(),
                cookie: cookiesHeader ? cookiesHeader.split(";")[0] : "",
                location: conn.getHeaderField("Location"),
                url: conn.getURL().toString()
            };
        }
    } catch (e) {
        log("fetchUrlJava error: " + e);
    }
    return null;
}

function fetchLivewireComponent(pageHtml, componentName, methodName, pageUrl) {
    try {
        if (!pageHtml) return null;

        var regex = /wire:initial-data=['"]([\s\S]*?)['"]/gi;
        var m;
        var targetInit = null;

        while ((m = regex.exec(pageHtml)) !== null) {
            try {
                var jsonStr = m[1].replace(/&quot;/g, '"');
                var obj = JSON.parse(jsonStr);
                if (obj.fingerprint && obj.fingerprint.name === componentName) {
                    targetInit = obj;
                    break;
                }
            } catch (err) {}
        }

        if (!targetInit) return null;

        var csrfMatch = pageHtml.match(/name=['"]csrf-token['"]\s+content=['"]([^"']+)['"]/i);
        var csrf = csrfMatch ? csrfMatch[1] : "";

        var cookieMatch = pageHtml.match(/XSRF-TOKEN=([^;]+)/i);
        var cookieStr = cookieMatch ? ("XSRF-TOKEN=" + cookieMatch[1]) : "";

        var postData = JSON.stringify({
            fingerprint: targetInit.fingerprint,
            serverMemo: targetInit.serverMemo,
            updates: [
                { type: "callMethod", payload: { id: methodName, method: methodName, params: [] } }
            ]
        });

        var res = fetchUrlJava(
            BASE_URL + "/livewire/message/" + targetInit.fingerprint.name,
            "POST",
            {
                "Content-Type": "application/json",
                "X-Livewire": "true",
                "X-CSRF-TOKEN": csrf,
                "Cookie": cookieStr,
                "Referer": pageUrl || (BASE_URL + "/")
            },
            postData
        );

        if (res && res.body) {
            var resJson = JSON.parse(res.body);
            if (resJson.effects && resJson.effects.html) {
                return resJson.effects.html;
            }
        }
    } catch (e) {
        log("fetchLivewireComponent error: " + e);
    }
    return null;
}

// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "archivebate",
        "name": "Archivebate",
        "description": "Kho lưu trữ video webcam, người mẫu livestream lớn nhất thế giới.",
        "version": "1.1.2",
        "baseUrl": BASE_URL,
        "iconUrl": BASE_URL + "/logo/logo.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer",
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
        { "slug": "home", "title": "Mới Cập Nhật (Recent Videos)", "type": "Horizontal" },
        { "slug": "platform/Y2hhdHVyYmF0ZQ==", "title": "Chaturbate", "type": "Horizontal" },
        { "slug": "platform/c3RyaXBjaGF0", "title": "Stripchat", "type": "Horizontal" },
        { "slug": "platform/Ym9uZ2FjYW1z", "title": "BongaCams", "type": "Horizontal" },
        { "slug": "platform/Y2Ftc29kYQ==", "title": "CamSoda", "type": "Horizontal" },
        { "slug": "platform/b25seWZhbnM=", "title": "OnlyFans", "type": "Horizontal" },
        { "slug": "platform/dHdpdGNo", "title": "Twitch", "type": "Horizontal" },
        { "slug": "gender/ZmVtYWxl", "title": "Nữ (Female Models)", "type": "Horizontal" },
        { "slug": "gender/Y291cGxl", "title": "Cặp Đôi (Couples)", "type": "Horizontal" },
        { "slug": "gender/dHJhbnM=", "title": "Chuyển Giới (Trans)", "type": "Horizontal" },
        { "slug": "home", "title": "Tất Cả Video", "type": "Grid" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "slug": "home", "name": "Mới Cập Nhật" },
        { "slug": "platform/Y2hhdHVyYmF0ZQ==", "name": "Chaturbate" },
        { "slug": "platform/c3RyaXBjaGF0", "name": "Stripchat" },
        { "slug": "platform/Ym9uZ2FjYW1z", "name": "BongaCams" },
        { "slug": "platform/Y2Ftc29kYQ==", "name": "CamSoda" },
        { "slug": "platform/b25seWZhbnM=", "name": "OnlyFans" },
        { "slug": "platform/dHdpdGNo", "name": "Twitch" },
        { "slug": "gender/ZmVtYWxl", "name": "Nữ (Female)" },
        { "slug": "gender/Y291cGxl", "name": "Cặp Đôi (Couple)" },
        { "slug": "gender/dHJhbnM=", "name": "Chuyển Giới (Trans)" }
    ]);
}

function getFilters() {
    return JSON.stringify({
        "category": [
            { "name": "Mới cập nhật", "value": "home" },
            { "name": "Chaturbate", "value": "platform/Y2hhdHVyYmF0ZQ==" },
            { "name": "Stripchat", "value": "platform/c3RyaXBjaGF0" },
            { "name": "BongaCams", "value": "platform/Ym9uZ2FjYW1z" },
            { "name": "CamSoda", "value": "platform/Y2Ftc29kYQ==" },
            { "name": "OnlyFans", "value": "platform/b25seWZhbnM=" },
            { "name": "Twitch", "value": "platform/dHdpdGNo" },
            { "name": "Nữ (Female)", "value": "gender/ZmVtYWxl" },
            { "name": "Cặp đôi (Couple)", "value": "gender/Y291cGxl" },
            { "name": "Chuyển giới (Trans)", "value": "gender/dHJhbnM=" }
        ]
    });
}

function getFilterConfig() {
    return getFilters();
}

// =============================================================================
// URL BUILDERS
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var path = slug || "";

        if (filtersJson) {
            try {
                var fixedJson = typeof filtersJson === 'string'
                    ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
                    : JSON.stringify(filtersJson);
                var filters = (typeof filtersJson === 'object') ? filtersJson : JSON.parse(fixedJson);

                if (filters.page) page = parseInt(filters.page) || 1;
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        path = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'string') {
                        path = filters.category;
                    }
                }
            } catch (err) {}
        }

        if (!path || path === "home" || path === "recent") {
            return BASE_URL + (page > 1 ? "/?page=" + page : "/");
        }

        var fullUrl = (path.indexOf('http') === 0) ? path : (BASE_URL + "/" + path.replace(/^\/+/, ''));
        if (page > 1) {
            fullUrl += (fullUrl.indexOf('?') > -1 ? '&' : '?') + "page=" + page;
        }
        return fullUrl;
    } catch (e) {
        return BASE_URL + "/";
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
    var safeKeyword = encodeURIComponent(keyword || "");
    return BASE_URL + "/api/v1/search?query=" + safeKeyword + "&page=" + page;
}

function getSearchUrl(keyword, page) {
    return getUrlSearch(keyword, page);
}

function getUrlDetail(slug) {
    if (!slug) return "";
    var s = slug.toString().trim();
    if (s.indexOf("http") === 0) return s;
    if (s.indexOf("watch/") === 0 || s.indexOf("/watch/") === 0) {
        return BASE_URL + "/" + s.replace(/^\/+/, '');
    }
    if (s.indexOf("profile/") === 0 || s.indexOf("/profile/") === 0) {
        return BASE_URL + "/" + s.replace(/^\/+/, '');
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

function extractPosterFromSection(sectionHtml) {
    if (!sectionHtml) return DEFAULT_POSTER;

    // 1. Background image (Used by Archivebate for video thumbnails)
    var bgMatch = sectionHtml.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i)
        || sectionHtml.match(/background:\s*url\(['"]?([^'")]+)['"]?\)/i);
    if (bgMatch && bgMatch[1]) {
        var bgUrl = bgMatch[1].replace(/\\/g, '').trim();
        bgUrl = bgUrl.replace('_4x4.jpg', '.jpg');
        if (bgUrl.indexOf("//") === 0) bgUrl = "https:" + bgUrl;
        return bgUrl;
    }

    // 2. Poster attribute or data-src
    var posterMatch = sectionHtml.match(/poster=['"]([^'"]+)['"]/i)
        || sectionHtml.match(/data-src=['"]([^'"]+\.(?:jpg|png|webp|jpeg)[^'"]*)['"]/i)
        || sectionHtml.match(/src=['"]([^'"]+\.(?:jpg|png|webp|jpeg)[^'"]*)['"]/i);

    if (posterMatch && posterMatch[1]) {
        var pUrl = posterMatch[1].replace(/\\/g, '').replace('_4x4.jpg', '.jpg').trim();
        if (pUrl.indexOf("//") === 0) pUrl = "https:" + pUrl;
        return pUrl;
    }

    return DEFAULT_POSTER;
}

function parseVideoItemsFromHtml(htmlText) {
    var items = [];
    if (!htmlText) return items;

    var seenIds = {};
    var itemRegex = /<section[^>]*class=['"][^'"]*video_item[^'"]*['"][^>]*>([\s\S]*?)<\/section>/gi;
    var match;

    while ((match = itemRegex.exec(htmlText)) !== null) {
        var section = match[1];

        var hrefMatch = section.match(/href=['"](https?:\/\/[^'"]*\/watch\/\d+)['"]/i)
            || section.match(/href=['"](\/watch\/\d+)['"]/i);
        if (!hrefMatch) continue;
        var watchUrl = hrefMatch[1];
        if (watchUrl.indexOf("http") !== 0) watchUrl = BASE_URL + watchUrl;

        var vIdMatch = watchUrl.match(/\/watch\/(\d+)/);
        var videoId = vIdMatch ? vIdMatch[1] : "";
        if (!videoId || seenIds[videoId]) continue;
        seenIds[videoId] = true;

        var posterUrl = extractPosterFromSection(section);

        var durationMatch = section.match(/<div[^>]*class=['"]duration[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i);
        var duration = durationMatch ? durationMatch[1].replace(/<[^>]+>/g, '').trim() : "";

        var profileMatch = section.match(/href=['"][^'"]*\/profile\/([^'"]+)['"]/i);
        var modelName = profileMatch ? profileMatch[1] : ("Video #" + videoId);

        var infoMatch = section.match(/<div[^>]*class=['"]info[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i);
        var infoText = infoMatch ? infoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "";

        var title = modelName;
        if (duration) title += " (" + duration + ")";

        items.push({
            "id": watchUrl,
            "title": title,
            "posterUrl": posterUrl,
            "backdropUrl": posterUrl,
            "thumbnailUrl": posterUrl,
            "description": infoText || modelName,
            "duration": duration,
            "quality": "HD",
            "source": "Archivebate",
            "type": "video",
            "isChannel": false
        });
    }
    return items;
}

function parseListResponse(html, fetchedUrl) {
    try {
        if (!html) return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });

        // 1. Search API JSON response (Search returns Channels/Models)
        if (html.trim().charAt(0) === '{') {
            var dataObj = JSON.parse(html);
            var searchItems = [];
            var list = dataObj.data || [];
            for (var i = 0; i < list.length; i++) {
                var it = list[i];
                var uname = it.username || "";
                if (!uname) continue;
                var plat = it.platform || "Cam Model";
                var gen = it.gender || "";
                var desc = (plat ? "[" + plat + "] " : "") + (gen ? gen : "");
                var avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(uname) + "&size=300&background=e0245e&color=fff&rounded=true";
                searchItems.push({
                    "id": BASE_URL + "/profile/" + uname,
                    "title": uname + " (" + plat + ")",
                    "posterUrl": avatarUrl,
                    "backdropUrl": avatarUrl,
                    "thumbnailUrl": avatarUrl,
                    "description": desc,
                    "quality": plat,
                    "source": "Archivebate",
                    "type": "channel",
                    "isChannel": true
                });
            }
            var curPage = (dataObj.meta && dataObj.meta.current_page) || 1;
            var lastPage = (dataObj.meta && dataObj.meta.last_page) || 1;
            return JSON.stringify({
                "items": searchItems,
                "pagination": {
                    "currentPage": curPage,
                    "totalPages": lastPage,
                    "hasNext": curPage < lastPage
                }
            });
        }

        // 2. HTML Response: If contains skeleton placeholders, trigger Livewire loading
        var workingHtml = html;
        if (html.indexOf("skeleton") !== -1 && html.indexOf("wire:initial-data") !== -1) {
            var compName = "home-videos";
            var methodName = "loadVideos";

            if (html.indexOf("filter.platform") !== -1) {
                compName = "filter.platform";
                methodName = "load_platform_videos";
            } else if (html.indexOf("filter.gender") !== -1) {
                compName = "filter.gender";
                methodName = "load_gender_videos";
            }

            var livewireHtml = fetchLivewireComponent(html, compName, methodName, fetchedUrl);
            if (livewireHtml) {
                workingHtml = livewireHtml;
            }
        }

        var videoItems = parseVideoItemsFromHtml(workingHtml);

        var pageNum = 1;
        var pageParam = (fetchedUrl || "").match(/[?&]page=(\d+)/);
        if (pageParam) pageNum = parseInt(pageParam[1], 10) || 1;

        return JSON.stringify({
            "items": videoItems,
            "pagination": {
                "currentPage": pageNum,
                "totalPages": 9999,
                "hasNext": videoItems.length > 0
            }
        });

    } catch (e) {
        log("parseListResponse error: " + e);
        return JSON.stringify({ "items": [], "pagination": { "currentPage": 1, "totalPages": 1 } });
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

        // =========================================================================
        // CASE 1: Profile Page Detail (/profile/{username}) -> Load Channel Videos
        // =========================================================================
        if (fetchedUrl && fetchedUrl.indexOf("/profile/") !== -1) {
            var unameMatch = fetchedUrl.match(/\/profile\/([^/?#]+)/);
            var username = unameMatch ? unameMatch[1] : "Streamer";
            var avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(username) + "&size=300&background=e0245e&color=fff&rounded=true";

            var profileHtml = html;
            if (html.indexOf("profile.model-videos") !== -1) {
                var lwHtml = fetchLivewireComponent(html, "profile.model-videos", "load_profile_videos", fetchedUrl);
                if (lwHtml) {
                    profileHtml = lwHtml;
                }
            }

            var episodes = [];
            var relatedItems = [];
            var seenIds = {};
            var epIdx = 1;

            var sectionRegex = /<section[^>]*class=['"][^'"]*video_item[^'"]*['"][^>]*>([\s\S]*?)<\/section>/gi;
            var sMatch;
            while ((sMatch = sectionRegex.exec(profileHtml)) !== null) {
                var sInner = sMatch[1];
                var hMatch = sInner.match(/href=['"](https?:\/\/[^'"]*\/watch\/(\d+))['"]/i)
                    || sInner.match(/href=['"](\/watch\/(\d+))['"]/i);
                if (!hMatch) continue;

                var vidUrl = hMatch[1];
                if (vidUrl.indexOf("http") !== 0) vidUrl = BASE_URL + vidUrl;
                var vidId = hMatch[2];

                if (!seenIds[vidId]) {
                    seenIds[vidId] = true;
                    var durM = sInner.match(/<div[^>]*class=['"]duration[^'"]*['"][^>]*>([\s\S]*?)<\/div>/i);
                    var dur = durM ? durM[1].replace(/<[^>]+>/g, '').trim() : "";
                    var posterImg = extractPosterFromSection(sInner);

                    episodes.push({
                        "id": vidUrl,
                        "name": "Video #" + epIdx + (dur ? " (" + dur + ")" : ""),
                        "slug": "video-" + vidId,
                        "posterUrl": posterImg,
                        "thumbnailUrl": posterImg,
                        "backdropUrl": posterImg,
                        "duration": dur
                    });

                    relatedItems.push({
                        "id": vidUrl,
                        "title": username + " (Video #" + vidId + ")" + (dur ? " - " + dur : ""),
                        "posterUrl": posterImg,
                        "backdropUrl": posterImg,
                        "thumbnailUrl": posterImg,
                        "duration": dur,
                        "quality": "HD",
                        "type": "video",
                        "isChannel": false
                    });

                    epIdx++;
                }
            }

            // Fallback general link matching if no video_item sections
            if (episodes.length === 0) {
                var vRegex = /href=['"](https?:\/\/[^'"]*\/watch\/(\d+))['"]/gi;
                var vMatch;
                while ((vMatch = vRegex.exec(profileHtml)) !== null) {
                    var vUrl = vMatch[1];
                    var vId = vMatch[2];
                    if (!seenIds[vId]) {
                        seenIds[vId] = true;
                        episodes.push({
                            "id": vUrl,
                            "name": "Video #" + epIdx + " (ID: " + vId + ")",
                            "slug": "video-" + vId,
                            "posterUrl": avatarUrl,
                            "thumbnailUrl": avatarUrl,
                            "backdropUrl": avatarUrl,
                            "duration": ""
                        });
                        relatedItems.push({
                            "id": vUrl,
                            "title": username + " (Video #" + vId + ")",
                            "posterUrl": avatarUrl,
                            "backdropUrl": avatarUrl,
                            "thumbnailUrl": avatarUrl,
                            "duration": "",
                            "quality": "HD",
                            "type": "video",
                            "isChannel": false
                        });
                        epIdx++;
                    }
                }
            }

            if (episodes.length === 0) {
                episodes.push({
                    "id": fetchedUrl,
                    "name": "Chưa có video lưu trữ",
                    "slug": "empty"
                });
            }

            var mainPoster = (relatedItems.length > 0 && relatedItems[0].posterUrl) ? relatedItems[0].posterUrl : avatarUrl;

            return JSON.stringify({
                "title": username + " - Cam Streamer",
                "originName": username,
                "posterUrl": mainPoster,
                "backdropUrl": mainPoster,
                "thumbnailUrl": mainPoster,
                "description": "Hồ sơ lưu trữ webcam & livestream của " + username + " trên Archivebate.\nTổng số video lưu trữ hiển thị: " + episodes.length,
                "casts": username,
                "category": "Cam Model",
                "quality": "HD",
                "lang": "Original",
                "servers": [
                    {
                        "name": "Danh sách Video (" + episodes.length + " video)",
                        "episodes": episodes
                    }
                ],
                "relatedMovies": relatedItems
            });
        }

        // =========================================================================
        // CASE 2: Watch Page Detail (/watch/{id}) -> Play Single Video
        // =========================================================================
        var vidMatch = (fetchedUrl || "").match(/\/watch\/(\d+)/);
        var videoId = vidMatch ? vidMatch[1] : "";

        var modelLinkMatch = html.match(/href=['"][^'"]*\/profile\/([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i);
        var streamerName = modelLinkMatch ? modelLinkMatch[1] : ("Video #" + videoId);

        var poster = extractPosterFromSection(html);

        var infoMatch = html.match(/<div[^>]*class=['"]info['"][^>]*>([\s\S]*?)<\/div>/i);
        var infoText = infoMatch ? infoMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : "";

        var platform = "Cam Model";
        if (infoText.indexOf("Chaturbate") !== -1) platform = "Chaturbate";
        else if (infoText.indexOf("Stripchat") !== -1) platform = "Stripchat";
        else if (infoText.indexOf("Bongacams") !== -1) platform = "BongaCams";
        else if (infoText.indexOf("Camsoda") !== -1) platform = "CamSoda";
        else if (infoText.indexOf("Onlyfans") !== -1) platform = "OnlyFans";
        else if (infoText.indexOf("Twitch") !== -1) platform = "Twitch";

        var mixdropMatch = html.match(/src=['"](https?:\/\/[^'"]*mixdrop\.[a-z]+\/e\/[a-zA-Z0-9_-]+)['"]/i)
            || html.match(/fid=['"](https?:\/\/[^'"]*mixdrop\.[a-z]+\/f\/[a-zA-Z0-9_-]+)['"]/i);
        var embedUrl = mixdropMatch ? mixdropMatch[1] : "";
        if (embedUrl.indexOf("/f/") !== -1) {
            embedUrl = embedUrl.replace("/f/", "/e/");
        }

        var displayTitle = streamerName + " (Video #" + videoId + ")";

        var servers = [
            {
                "name": "Server VIP (Phát trực tiếp MP4)",
                "episodes": [
                    {
                        "id": fetchedUrl || (BASE_URL + "/watch/" + videoId),
                        "name": "Full HD",
                        "slug": "full-mp4"
                    }
                ]
            }
        ];

        if (embedUrl) {
            servers.push({
                "name": "Server Embed (WebPlayer)",
                "episodes": [
                    {
                        "id": embedUrl,
                        "name": "Web Player",
                        "slug": "embed"
                    }
                ]
            });
        }

        return JSON.stringify({
            "title": displayTitle,
            "originName": streamerName,
            "posterUrl": poster,
            "backdropUrl": poster,
            "thumbnailUrl": poster,
            "description": infoText ? (infoText + "\nStreamer: " + streamerName) : ("Video lưu trữ của " + streamerName),
            "casts": streamerName,
            "category": platform,
            "quality": "HD",
            "lang": "Original",
            "servers": servers
        });

    } catch (e) {
        log("parseMovieDetail error: " + e);
        return "null";
    }
}

// =============================================================================
// STREAM RESOLUTION (Watch Page -> Mixdrop Embed -> Unpacked Direct MP4)
// =============================================================================

function unpackMixdrop(html) {
    if (!html) return null;

    // 1. Direct plain MDCore.wurl in HTML
    var directMatch = html.match(/MDCore\.wurl\s*=\s*['"]([^'"]+)['"]/i);
    if (directMatch) {
        var u = directMatch[1];
        if (u.indexOf("//") === 0) u = "https:" + u;
        return u;
    }

    // 2. Unpack Dean Edwards JS packer: eval(function(p,a,c,k,e,d)...)
    var idx = html.indexOf("eval(function(p,a,c,k,e,d)");
    if (idx === -1) idx = html.indexOf("eval(function(p,a,c,k,e,r)");

    if (idx !== -1) {
        var endScript = html.indexOf("</script>", idx);
        var evalScript = html.substring(idx, endScript !== -1 ? endScript : idx + 4000).trim();
        if (evalScript.endsWith(";")) evalScript = evalScript.substring(0, evalScript.length - 1);

        var innerCall = evalScript.replace(/^eval\s*\(/, '').replace(/\)\s*$/, '');
        try {
            var unpacked = (new Function("return (" + innerCall + ")"))();
            if (unpacked) {
                var wMatch = unpacked.match(/wurl\s*=\s*['"]([^'"]+)['"]/i)
                    || unpacked.match(/['"](\/\/[^'"]+\.mp4[^'"]*)['"]/i);
                if (wMatch) {
                    var resUrl = wMatch[1];
                    if (resUrl.indexOf("//") === 0) resUrl = "https:" + resUrl;
                    return resUrl;
                }
            }
        } catch (e) {}
    }

    // Fallback regex algorithm
    var packMatch = html.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\((['"][\s\S]*?['"]),\s*(\d+),\s*(\d+),\s*['"]([^'"]+)['"]\s*\.split\(['"]\|['"]\)/i);
    if (packMatch) {
        var p = packMatch[1];
        if (p.charAt(0) === "'" || p.charAt(0) === '"') {
            p = p.substring(1, p.length - 1);
        }
        var a = parseInt(packMatch[2], 10) || 10;
        var c = parseInt(packMatch[3], 10) || 0;
        var k = packMatch[4].split('|');

        var eFunc = function(cVal) {
            return (cVal < a ? '' : eFunc(parseInt(cVal / a, 10))) + ((cVal = cVal % a) > 35 ? String.fromCharCode(cVal + 29) : cVal.toString(36));
        };

        while (c--) {
            if (k[c]) {
                p = p.replace(new RegExp('\\b' + eFunc(c) + '\\b', 'g'), k[c]);
            }
        }

        var wurlMatch = p.match(/(?:MDCore\.)?wurl\s*=\s*['"]([^'"]+)['"]/i)
            || p.match(/(?:wurl|vurl)\s*=\s*['"]([^'"]+)['"]/i);

        if (wurlMatch) {
            var resUrl2 = wurlMatch[1];
            if (resUrl2.indexOf("//") === 0) resUrl2 = "https:" + resUrl2;
            return resUrl2;
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
                        "Referer": fetchedUrl || "https://miiixdrop.net/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
            }
        }

        // Extract Mixdrop iframe from Archivebate watch page
        var mixdropMatch = html.match(/src=['"](https?:\/\/[^'"]*mixdrop\.[a-z]+\/e\/[a-zA-Z0-9_-]+)['"]/i)
            || html.match(/fid=['"](https?:\/\/[^'"]*mixdrop\.[a-z]+\/f\/[a-zA-Z0-9_-]+)['"]/i)
            || html.match(/<iframe[^>]*src=['"](https?:\/\/[^'"]+)['"]/i);

        if (mixdropMatch) {
            var embedUrl = mixdropMatch[1];
            if (embedUrl.indexOf("/f/") !== -1) {
                embedUrl = embedUrl.replace("/f/", "/e/");
            }

            // Try to resolve direct MP4 in step 1 via Java fetch
            var res = fetchUrlJava(embedUrl, "GET", { "Referer": BASE_URL + "/" });
            if (res && res.body) {
                var streamDirect = unpackMixdrop(res.body);
                if (streamDirect) {
                    return JSON.stringify({
                        url: streamDirect,
                        isEmbed: false,
                        headers: {
                            "Referer": res.url || embedUrl,
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                        }
                    });
                }
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
        log("parseDetailResponse error: " + e);
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
                    "Referer": fetchedUrl || "https://miiixdrop.net/",
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
        log("parseEmbedResponse error: " + e);
        return JSON.stringify({ url: fetchedUrl || "", isEmbed: true, headers: {} });
    }
}

function parseEmbedPlayer(html, fetchedUrl) {
    return parseEmbedResponse(html, fetchedUrl);
}
