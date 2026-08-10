// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "ophim",
        "name": "OPhim",
        "version": "1.0.5",
        "baseUrl": "https://ophim1.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/ophim.ico",
        "isEnabled": true,
        "type": "MOVIE"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-chieu-rap', title: 'Phim Chiếu Rạp', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tien' },
        { name: 'Phim bộ đang chiếu', slug: 'phim-bo-dang-chieu' },
        { name: 'Phim bộ đã hoàn thành', slug: 'phim-bo-hoan-thanh' },
        { name: 'Phim sắp chiếu', slug: 'phim-sap-chieu' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'modified.time' },
            { name: 'Năm xuất bản', value: 'year' },
            { name: 'Lượt xem', value: 'view' }
        ],
        type: [
            { name: 'Tất cả', value: '' },
            { name: 'Phim bộ', value: 'series' },
            { name: 'Phim lẻ', value: 'single' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlHome() {
    return "https://ophim1.com/v1/api/home";
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        var baseUrl = "https://ophim1.com/v1/api";
        var finalPath = "";

        var mainLists = ['phim-le', 'phim-bo', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap', 'phim-moi', 'phim-sap-chieu', 'phim-vietsub', 'phim-thuyet-minh', 'phim-long-tien', 'phim-bo-dang-chieu', 'phim-bo-hoan-thanh', 'subteam'];

        if (mainLists.indexOf(slug) >= 0) {
            finalPath = "/danh-sach/" + slug;
        } else if (/^\d{4}$/.test(slug)) {
            finalPath = "/nam-phat-hanh/" + slug;
        } else if (filters.year) {
            finalPath = "/nam-phat-hanh/" + filters.year;
        } else if (filters.category) {
            if (filters.category.indexOf(',') > -1) {
                finalPath = "/danh-sach/" + filters.category;
            } else {
                finalPath = "/the-loai/" + filters.category;
            }
        } else if (filters.country) {
            finalPath = "/quoc-gia/" + filters.country;
        } else {
            finalPath = "/the-loai/" + slug;
        }

        var url = baseUrl + finalPath + "?page=" + page + "&limit=" + limit;

        if (filters.category && finalPath.indexOf(filters.category) === -1) {
            url += "&category=" + filters.category;
        }
        if (filters.country && finalPath.indexOf(filters.country) === -1) {
            url += "&country=" + filters.country;
        }
        if (filters.year && finalPath.indexOf(filters.year) === -1) {
            url += "&year=" + filters.year;
        }
        if (filters.sort) {
            url += "&sort_field=" + filters.sort;
        }
        if (filters.sort_type) {
            url += "&sort_type=" + filters.sort_type;
        }
        if (filters.type) {
            url += "&type=" + filters.type;
        }

        return url;
    } catch (e) {
        return "https://ophim1.com/v1/api/danh-sach/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var limit = filters.limit || 24;
    return "https://ophim1.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=" + limit;
}

function getSearchUrl(keyword, pageOrFilters) {
    if (typeof pageOrFilters === 'object') {
        return getUrlSearch(keyword, JSON.stringify(pageOrFilters));
    }
    var page = pageOrFilters || 1;
    return "https://ophim1.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=24";
}

function getUrlDetail(slug) {
    return "https://ophim1.com/v1/api/phim/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return "https://ophim1.com/v1/api/the-loai"; }
function getUrlCountries() { return "https://ophim1.com/v1/api/quoc-gia"; }
function getUrlYears() { return "https://ophim1.com/v1/api/nam-phat-hanh"; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = data.items || [];
        var params = data.params || {};
        var pagination = params.pagination || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        });

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: pagination.totalPages || Math.ceil((pagination.totalItems || 0) / (pagination.totalItemsPerPage || 24)),
                totalItems: pagination.totalItems || 0,
                itemsPerPage: pagination.totalItemsPerPage || 24
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseList(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseSearchResult(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseHomeResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = data.items || [];

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current: item.episode_current || "",
                lang: item.lang || ""
            };
        });

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: movies.length,
                itemsPerPage: movies.length
            }
        });
    } catch (error) {
        return JSON.stringify({ items: [], pagination: { currentPage: 1, totalPages: 1 } });
    }
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = (response.data && response.data.item) || response.movie || {};
        var rawEpisodes = (movie && movie.episodes) || response.episodes || [];

        var servers = [];
        for (var s = 0; s < rawEpisodes.length; s++) {
            var server = rawEpisodes[s];
            var episodes = [];
            if (server.server_data) {
                for (var e = 0; e < server.server_data.length; e++) {
                    var ep = server.server_data[e];
                    episodes.push({
                        id: ep.link_embed || ep.link_m3u8 || "",
                        name: ep.name,
                        slug: ep.slug
                    });
                }
            }
            if (episodes.length > 0) {
                servers.push({ name: server.server_name, episodes: episodes });
            }
        }

        var rating = 0;
        if (movie.tmdb && movie.tmdb.vote_average) {
            rating = movie.tmdb.vote_average;
        } else if (movie.imdb && movie.imdb.vote_average) {
            rating = movie.imdb.vote_average;
        }

        var categories = [];
        if (movie.category) {
            for (var c = 0; c < movie.category.length; c++) {
                categories.push(movie.category[c].name);
            }
        }
        var countries = [];
        if (movie.country) {
            for (var ct = 0; ct < movie.country.length; ct++) {
                countries.push(movie.country[ct].name);
            }
        }
        var directors = [];
        if (movie.director) {
            for (var d = 0; d < movie.director.length; d++) {
                directors.push(movie.director[d]);
            }
        }
        var actors = [];
        if (movie.actor) {
            for (var a = 0; a < movie.actor.length; a++) {
                actors.push(movie.actor[a]);
            }
        }

        var tmdbId = movie.tmdb && movie.tmdb.id ? movie.tmdb.id : "";
        var tmdbSeason = movie.tmdb && movie.tmdb.season ? parseInt(movie.tmdb.season, 10) : 0;
        var tmdbType = movie.tmdb && movie.tmdb.type ? movie.tmdb.type : "";

        return JSON.stringify({
            id: movie.slug,
            title: movie.name,
            originName: movie.origin_name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description: (movie.content || "").replace(/<[^>]*>/g, ""),
            year: movie.year || 0,
            rating: rating,
            quality: movie.quality || "",
            servers: servers,
            episode_current: movie.episode_current || "",
            episode_total: movie.episode_total || "",
            lang: movie.lang || "",
            status: movie.status || "",
            type: movie.type || "",
            time: movie.time || "",
            category: categories.join(", "),
            country: countries.join(", "),
            director: directors.join(", "),
            casts: actors.join(", "),
            tmdbId: String(tmdbId),
            tmdbSeason: tmdbSeason || 0,
            tmdbType: tmdbType || "",
            trailerUrl: movie.trailer_url || ""
        });
    } catch (error) { return "null"; }
}

function parseDetail(apiResponseJson) {
    return parseMovieDetail(apiResponseJson);
}

function parseDetailResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var movie = (response.data && response.data.item) || response.movie || {};
        var episodes = (movie && movie.episodes) || response.episodes || [];

        var streamUrl = "";
        var headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://ophim1.com" };

        if (episodes.length > 0) {
            var firstServer = episodes[0];
            if (firstServer.server_data && firstServer.server_data.length > 0) {
                var firstEp = firstServer.server_data[0];
                streamUrl = firstEp.link_embed || firstEp.link_m3u8 || "";
            }
        }

        return JSON.stringify({
            url: streamUrl,
            headers: headers,
            subtitles: []
        });
    } catch (error) { return "{}"; }
}

function parsePlayerUrl(apiResponseJson) {
    return parseDetailResponse(apiResponseJson);
}

function parsePlayerResponse(apiResponseJson) {
    return parseDetailResponse(apiResponseJson);
}

function parseEpisodePlayer(apiResponseJson) {
    return parseDetailResponse(apiResponseJson);
}

function parseCategoriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data && response.data.items ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: i.name, slug: i.slug }; }));
    } catch (e) { return "[]"; }
}

function parseCountriesResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data && response.data.items ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: i.name, value: i.slug }; }));
    } catch (e) { return "[]"; }
}

function parseYearsResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var items = response.data && response.data.items ? response.data.items : [];
        return JSON.stringify(items.map(function (i) { return { name: String(i.year), slug: String(i.year) }; }));
    } catch (e) { return "[]"; }
}

// =============================================================================
// HELPERS
// =============================================================================

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://img.ophim.live/uploads/movies/" + path;
}
