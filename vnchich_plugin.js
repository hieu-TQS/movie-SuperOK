var BASEURL = "https://vnchich.net";

function getManifest() {
    return JSON.stringify({
        "id": "vnchich",
        "name": "VnChich",
        "description": "Kho video VnChich phong phú, cập nhật liên tục.",
        "info": "Kho video VnChich phong phú, cập nhật liên tục.",
        "version": "1.0.0",
        "baseUrl": "https://vnchich.net",
        "BASEURL": "https://vnchich.net",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/vnchich.png",
        "isEnabled": true,
        "isAdult": true,
        "type": "VIDEO",
        "playerType": "exoplayer"
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
    return JSON.stringify([
        { "slug": "latest", "title": "Mới Cập Nhật", "type": "Grid" },
        { "slug": "most-viewed", "title": "Xem Nhiều Nhất", "type": "Horizontal" },
        { "slug": "most-liked", "title": "Yêu Thích Nhất", "type": "Horizontal" },
        { "slug": "kw:vietsub", "title": "Phim Sex Vietsub", "type": "Horizontal" },
        { "slug": "kw:khong che", "title": "Phim Không Che", "type": "Horizontal" },
        { "slug": "kw:show", "title": "Show Livestream", "type": "Horizontal" },
        { "slug": "kw:hoc sinh", "title": "Học Sinh - Sinh Viên", "type": "Horizontal" },
        { "slug": "kw:quay len", "title": "Quay Lén - Vụng Trộm", "type": "Horizontal" },
        { "slug": "kw:some", "title": "Some - Tập Thể", "type": "Horizontal" },
        { "slug": "ch:chichvl", "title": "Kênh ChichVL", "type": "Horizontal" },
        { "slug": "ch:xemcl", "title": "Kênh XemCL", "type": "Horizontal" }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { "name": "Mới nhất", "slug": "latest" },
        { "name": "Xem nhiều nhất", "slug": "most-viewed" },
        { "name": "Yêu thích nhất", "slug": "most-liked" },
        { "name": "Sex Vietsub", "slug": "kw:vietsub" },
        { "name": "Phim Không Che", "slug": "kw:khong che" },
        { "name": "Show Livestream", "slug": "kw:show" },
        { "name": "Học Sinh - Sinh Viên", "slug": "kw:hoc sinh" },
        { "name": "Quay Lén", "slug": "kw:quay len" },
        { "name": "Some - Tập Thể", "slug": "kw:some" },
        { "name": "Kênh ChichVL", "slug": "ch:chichvl" },
        { "name": "Kênh XemCL", "slug": "ch:xemcl" }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới nhất", value: "-publishedAt" },
            { name: "Xem nhiều nhất", value: "-views" },
            { name: "Đánh giá cao", value: "-likes" },
            { name: "Tên A-Z", value: "name" }
        ],
        category: JSON.parse(getPrimaryCategories())
    });
}

function getFilters() {
    return getFilterConfig();
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var page = 1;
        var limit = 24;
        var sort = "-publishedAt";
        var targetSlug = slug || "latest";

        if (filtersJson) {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            try {
                var filters = JSON.parse(fixedJson);
                page = parseInt(filters.page, 10) || 1;
                if (filters.sort) {
                    sort = filters.sort;
                }
                if (filters.category) {
                    if (Array.isArray(filters.category) && filters.category.length > 0) {
                        targetSlug = filters.category[0].slug || filters.category[0].value || filters.category[0];
                    } else if (typeof filters.category === 'object') {
                        targetSlug = filters.category.slug || filters.category.value || targetSlug;
                    } else if (typeof filters.category === 'string') {
                        targetSlug = filters.category;
                    }
                }
            } catch (jsonErr) {}
        }

        var start = (page - 1) * limit;

        if (targetSlug === "most-viewed") {
            sort = "-views";
        } else if (targetSlug === "most-liked") {
            sort = "-likes";
        }

        if (targetSlug.indexOf("kw:") === 0) {
            var keyword = targetSlug.substring(3);
            return BASEURL + "/api/v1/videos?search=" + encodeURIComponent(keyword) + "&start=" + start + "&count=" + limit + "&sort=" + sort;
        }

        if (targetSlug.indexOf("ch:") === 0) {
            var channel = targetSlug.substring(3);
            return BASEURL + "/api/v1/video-channels/" + channel + "/videos?start=" + start + "&count=" + limit + "&sort=" + sort;
        }

        if (targetSlug && targetSlug.indexOf("http") === 0) {
            return targetSlug;
        }

        return BASEURL + "/api/v1/videos?start=" + start + "&count=" + limit + "&sort=" + sort;
    } catch (e) {
        return BASEURL + "/api/v1/videos?start=0&count=24&sort=-publishedAt";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var page = 1;
    var limit = 24;
    if (filtersJson) {
        try {
            var fixedJson = typeof filtersJson === 'string'
                ? filtersJson.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":').replace(/:,/g, ':')
                : JSON.stringify(filtersJson);
            var filters = JSON.parse(fixedJson);
            page = parseInt(filters.page, 10) || 1;
        } catch (e) {}
    }
    var start = (page - 1) * limit;
    return BASEURL + "/api/v1/videos?search=" + encodeURIComponent(keyword || "") + "&start=" + start + "&count=" + limit + "&sort=-publishedAt";
}

function getSearchUrl(keyword, page) {
    var pageNum = typeof page === 'number' ? page : 1;
    var start = (pageNum - 1) * 24;
    return BASEURL + "/api/v1/videos?search=" + encodeURIComponent(keyword || "") + "&start=" + start + "&count=" + 24 + "&sort=-publishedAt";
}

function getUrlDetail(slug) {
    if (!slug) return "";
    if (slug.indexOf("http") === 0) return slug;
    return BASEURL + "/api/v1/videos/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return BASEURL + "/api/v1/videos/categories"; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        if (!apiResponseJson) {
            return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
        }
        var response = JSON.parse(apiResponseJson);
        var data = response.data || [];
        var total = response.total || data.length;

        var items = [];
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var uuid = item.uuid || item.id || "";
            var title = cleanText(item.name || "");

            var thumb = "";
            if (item.thumbnailPath) {
                thumb = item.thumbnailPath.indexOf("http") === 0 ? item.thumbnailPath : BASEURL + item.thumbnailPath;
            } else if (item.thumbnails && item.thumbnails.length > 0) {
                thumb = item.thumbnails[0].fileUrl || "";
            } else if (item.previewPath) {
                thumb = item.previewPath.indexOf("http") === 0 ? item.previewPath : BASEURL + item.previewPath;
            }

            var durationStr = "";
            if (item.duration) {
                var mins = Math.floor(item.duration / 60);
                var secs = item.duration % 60;
                durationStr = mins + ":" + (secs < 10 ? "0" : "") + secs;
            }

            if (uuid) {
                items.push({
                    id: uuid,
                    title: title,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    quality: durationStr || "HD",
                    views: item.views || 0,
                    category: item.category ? item.category.label : ""
                });
            }
        }

        var limit = 24;
        var totalPages = Math.ceil(total / limit) || 1;

        return JSON.stringify({
            items: items,
            pagination: {
                currentPage: 1,
                totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNext: items.length >= limit
            }
        });
    } catch (e) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseList(json) { return parseListResponse(json); }
function parseSearchResponse(json) { return parseListResponse(json); }
function parseSearchResult(json) { return parseListResponse(json); }
function parseHomeResponse(json) { return parseListResponse(json); }

function parseMovieDetail(apiResponseJson) {
    try {
        if (!apiResponseJson) {
            return JSON.stringify({});
        }
        var video = JSON.parse(apiResponseJson);
        var uuid = video.uuid || video.id || "";
        var title = cleanText(video.name || "");

        var thumb = "";
        if (video.thumbnailPath) {
            thumb = video.thumbnailPath.indexOf("http") === 0 ? video.thumbnailPath : BASEURL + video.thumbnailPath;
        } else if (video.thumbnails && video.thumbnails.length > 0) {
            thumb = video.thumbnails[0].fileUrl || "";
        }

        var episodes = [];

        if (video.files && video.files.length > 0) {
            for (var f = 0; f < video.files.length; f++) {
                var file = video.files[f];
                if (file.hasVideo === false) continue;
                var streamUrl = file.fileUrl || file.fileDownloadUrl || "";
                if (streamUrl) {
                    if (streamUrl.indexOf("http") !== 0) {
                        streamUrl = BASEURL + streamUrl;
                    }
                    var label = (file.resolution && file.resolution.label) ? file.resolution.label : (file.height ? file.height + "p" : "HD");
                    episodes.push({
                        name: "Bản " + label,
                        id: streamUrl,
                        slug: uuid
                    });
                }
            }
        }

        if (video.streamingPlaylists && video.streamingPlaylists.length > 0) {
            for (var p = 0; p < video.streamingPlaylists.length; p++) {
                var playlist = video.streamingPlaylists[p];
                var playlistUrl = playlist.playlistUrl || "";
                if (playlistUrl) {
                    if (playlistUrl.indexOf("http") !== 0) {
                        playlistUrl = BASEURL + playlistUrl;
                    }
                    episodes.push({
                        name: "Luồng HLS Stream",
                        id: playlistUrl,
                        slug: uuid
                    });
                }
            }
        }

        if (episodes.length === 0) {
            var embedUrl = BASEURL + "/videos/embed/" + (video.shortUUID || uuid);
            episodes.push({
                name: "Full Video",
                id: embedUrl,
                slug: uuid
            });
        }

        var servers = [{
            name: "VnChich VIP",
            episodes: episodes
        }];

        var durationStr = "";
        if (video.duration) {
            var mins = Math.floor(video.duration / 60);
            var secs = video.duration % 60;
            durationStr = mins + " phút " + secs + " giây";
        }

        var channelName = video.channel ? (video.channel.displayName || video.channel.name) : "";
        var description = cleanText(video.description || video.truncatedDescription || title);
        if (channelName) {
            description = "Kênh: " + channelName + "\n\n" + description;
        }

        return JSON.stringify({
            id: uuid,
            title: title,
            posterUrl: thumb,
            backdropUrl: thumb,
            description: description,
            duration: durationStr,
            views: video.views || 0,
            quality: "HD",
            servers: servers
        });
    } catch (e) {
        return JSON.stringify({});
    }
}

function parseDetail(json) { return parseMovieDetail(json); }
function parseDetailResponse(json) { return parseMovieDetail(json); }
