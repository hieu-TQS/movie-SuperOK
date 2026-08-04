// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "topxx",
        "name": "TopXX",
        "version": "1.0.1",
        "baseUrl": "https://topxx.vip",
        "iconUrl": "https://topxx.vip/favicon.ico",
        "isEnabled": true,
        "isAdult": true,
        "layoutType": "HORIZONTAL",
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'vn', title: 'Việt Nam', type: 'Horizontal', path: 'vn' },
        { slug: 'cn', title: 'Trung Quốc', type: 'Horizontal', path: 'cn' },
        { slug: 'jp', title: 'Nhật Bản', type: 'Horizontal', path: 'jp' },
        { slug: 'us', title: 'Mỹ', type: 'Horizontal', path: 'us' },
        { slug: 'latest', title: 'Mới Nhất', type: 'Grid', path: 'latest' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Hôm nay', slug: 'today' },
        { name: 'Mới nhất', slug: 'latest' },
        { name: 'Diễn viên', slug: 'actors' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'latest' }
        ]
    });
}

// =============================================================================
// HELPERS
// =============================================================================

function getTransTranslation(item, key) {
    if (!item || (!item.trans && !item.translations)) return "";
    var transList = item.trans || item.translations || [];
    for (var i = 0; i < transList.length; i++) {
        if (transList[i].locale === 'vi' && transList[i][key]) return transList[i][key];
    }
    for (var i = 0; i < transList.length; i++) {
        if (transList[i].locale === 'en' && transList[i][key]) return transList[i][key];
    }
    if (transList.length > 0 && transList[0][key]) return transList[0][key];
    return "";
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;

        var baseUrl = "https://topxx.vip/api/v1";
        var finalPath = "";

        if (slug === 'today') {
            finalPath = "/movies/today";
        } else if (slug === 'latest') {
            finalPath = "/movies/latest";
        } else if (slug === 'actors') {
            finalPath = "/actors";
        } else if (['vn', 'cn', 'jp', 'us'].indexOf(slug) !== -1) {
            finalPath = "/countries/" + slug + "/movies";
        } else if (slug.indexOf('genre-') === 0) {
            finalPath = "/genres/" + slug.replace('genre-', '') + "/movies";
        } else if (slug.indexOf('country-') === 0) {
            finalPath = "/countries/" + slug.replace('country-', '') + "/movies";
        } else if (slug.indexOf('actor-') === 0) {
            return getUrlSearch(slug.replace('actor-', ''), filtersJson);
        } else {
            finalPath = "/genres/" + slug + "/movies";
        }

        var url = baseUrl + finalPath + "?page=" + page;
        return url;
    } catch (e) {
        return "https://topxx.vip/api/v1/movies/latest";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    // Tạm thời fallback gọi movies list theo keyword nếu có API search
    return "https://topxx.vip/api/v1/movies/latest?q=" + encodeURIComponent(keyword) + "&page=" + page;
}

function getUrlDetail(slug) {
    return "https://topxx.vip/api/v1/movies/" + slug;
}

function getUrlCategories() { return "https://topxx.vip/api/v1/genres"; }
function getUrlCountries() { return "https://topxx.vip/api/v1/countries"; }
// function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data || [];

        // Handle variations in response format just in case
        if (response.data && response.data.items) {
            items = response.data.items;
        } else if (response.data && response.data.data) {
            items = response.data.data;
        } else if (Array.isArray(response.data)) {
            items = response.data;
        } else if (Array.isArray(response)) {
            items = response;
        }

        var movies = items.map(function (item) {
            var isActorItem = item.hasOwnProperty('gender') || item.hasOwnProperty('avatar');

            if (isActorItem) {
                var name = getTransTranslation(item, 'name');
                var code = item.code || getTransTranslation(item, 'slug');
                if (!code && item.avatar) {
                    var match = item.avatar.match(/actors\/([^\/]+)-avatar/);
                    if (match) code = match[1];
                }
                if (!code) code = (name || "").toLowerCase().replace(/\s+/g, '-');

                return {
                    id: "actor-" + code,
                    title: name || code,
                    posterUrl: item.avatar || "",
                    backdropUrl: item.avatar || "",
                    year: 0,
                    quality: "ACTRESS",
                    episode_current: "",
                    lang: ""
                };
            }

            var backdrop = "";
            if (item.images && item.images.length > 0) {
                backdrop = item.images[0].path;
            } else {
                backdrop = item.thumbnail || "";
            }

            return {
                id: item.code,
                title: getTransTranslation(item, 'title') || item.code,
                posterUrl: item.thumbnail || "",
                backdropUrl: backdrop,
                year: item.publish_at ? parseInt(item.publish_at.substring(0, 4)) : 0,
                quality: item.quality || "",
                episode_current: item.duration || "",
                lang: ""
            };
        });

        var currentPage = 1;
        var totalPages = 1;

        if (response.meta) {
            currentPage = response.meta.current_page || 1;
            totalPages = response.meta.last_page || 1;
        }

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: movies.length,
                itemsPerPage: movies.length
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = response.data || {};

        var title = getTransTranslation(movie, 'title') || movie.code;
        var desc = getTransTranslation(movie, 'content') || getTransTranslation(movie, 'description') || "";

        var backdrop = "";
        if (movie.images && movie.images.length > 0) {
            backdrop = movie.images[0].path;
        } else {
            backdrop = movie.thumbnail || "";
        }

        var categoryList = [];
        if (movie.genres) {
            movie.genres.forEach(function (g) {
                var name = getTransTranslation(g, 'name');
                if (name) categoryList.push("[" + name + "](genre-" + g.code + ")");
            });
        }
        var categories = categoryList.join(', ');

        var countryList = [];
        if (movie.countries) {
            movie.countries.forEach(function (c) {
                var name = getTransTranslation(c, 'name');
                if (name) countryList.push("[" + name + "](country-" + c.code + ")");
            });
        }
        var countries = countryList.join(', ');

        var castList = [];
        if (movie.actors) {
            movie.actors.forEach(function (a) {
                var name = getTransTranslation(a, 'name');
                if (name) {
                    var code = a.code || getTransTranslation(a, 'slug');
                    if (!code && a.avatar) {
                        var match = a.avatar.match(/actors\/([^\/]+)-avatar/);
                        if (match) code = match[1];
                    }
                    if (!code) code = name.toLowerCase().replace(/\s+/g, '-');
                    castList.push("[" + name + "](actor-" + code + ")");
                }
            });
        }
        var casts = castList.join(', ');

        var servers = [];
        if (movie.sources && movie.sources.length > 0) {
            var episodes = [];
            movie.sources.forEach(function (src, index) {
                var link = src.link;
                // Convert embed to m3u8
                if (src.type === 'embed' && link && link.indexOf('/player/') > -1) {
                    var id = link.split('/player/')[1];
                    link = "https://embed.streamxx.net/stream/" + id + "/main.m3u8";
                }

                episodes.push({
                    id: link,
                    name: "Server " + (index + 1),
                    slug: "ep-" + (index + 1)
                });
            });

            if (episodes.length > 0) {
                servers.push({ name: "VIP", episodes: episodes });
            }
        }

        return JSON.stringify({
            id: movie.code,
            title: title,
            originName: title,
            posterUrl: movie.thumbnail || "",
            backdropUrl: backdrop,
            description: desc,
            year: movie.publish_at ? parseInt(movie.publish_at.substring(0, 4)) : 0,
            rating: 0,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.duration || "",
            lang: "",
            category: categories,
            country: countries,
            director: "",
            casts: casts,
            tmdbId: "",
            tmdbSeason: 0,
            tmdbType: ""
        });
    } catch (error) { return "null"; }
}

function parseDetailResponse(apiResponseJson) {
    try {
        var streamUrl = "";

        // Nếu input là direct URL m3u8 thay vì json
        if (apiResponseJson.indexOf("http") === 0) {
            streamUrl = apiResponseJson;
        } else {
            var response = JSON.parse(apiResponseJson);
            if (response.data && response.data.sources && response.data.sources.length > 0) {
                var src = response.data.sources[0];
                var link = src.link;
                if (src.type === 'embed' && link && link.indexOf('/player/') > -1) {
                    var id = link.split('/player/')[1];
                    streamUrl = "https://embed.streamxx.net/stream/" + id + "/main.m3u8";
                } else {
                    streamUrl = link;
                }
            }
        }

        return JSON.stringify({
            url: streamUrl,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://embed.streamxx.net/"
            },
            subtitles: []
        });
    } catch (error) {
        // Fallback return input if parsing string failed
        return JSON.stringify({
            url: apiResponseJson,
            headers: {}
        });
    }
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data || [];
        return JSON.stringify(items.map(function (i) {
            return { name: getTransTranslation(i, 'name') || i.code, slug: "genre-" + i.code };
        }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data || [];
        return JSON.stringify(items.map(function (i) {
            return { name: getTransTranslation(i, 'name') || i.code, value: "country-" + i.code };
        }));
    } catch (e) { return "[]"; }
}
