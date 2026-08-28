// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "kkphim",
        "name": "KKPhim",
        "version": "1.0.0",
        "description": "Nguồn phim KKPhim tổng hợp Full HD/4K, cập nhật liên tục, xem mượt.",
        "info": "Nguồn phim KKPhim tổng hợp Full HD/4K, cập nhật liên tục, xem mượt.",
        "baseUrl": "https://phimapi.com",
        "iconUrl": "https://raw.githubusercontent.com/hieu-TQS/movie-SuperOK/refs/heads/main/icons/kkphim.png",
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
        { slug: 'subteam', title: 'Subteam', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-thuyet-minh', title: 'Phim Thuyết Minh', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-long-tieng', title: 'Phim Lồng Tiếng', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'danh-sach' }
    ]);
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim mới', slug: 'phim-moi' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'TV shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' },
        { name: 'Phim vietsub', slug: 'phim-vietsub' },
        { name: 'Phim thuyết minh', slug: 'phim-thuyet-minh' },
        { name: 'Phim lồng tiếng', slug: 'phim-long-tieng' },
        { name: 'Subteam', slug: 'subteam' },
        { name: 'Phim chiếu rạp', slug: 'phim-chieu-rap' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Thời gian cập nhật', value: 'modified.time' },
            { name: 'Năm phát hành', value: 'year' },
            { name: 'Theo ID', value: '_id' }
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
    return "https://phimapi.com/v1/api/home";
}

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var limit = filters.limit || 24;

        var listSlugs = ['phim-vietsub', 'subteam', 'phim-thuyet-minh', 'phim-long-tieng', 'phim-bo', 'phim-le', 'hoat-hinh', 'tv-shows', 'phim-chieu-rap', 'phim-moi', 'phim-bo-dang-chieu', 'phim-bo-hoan-thanh', 'phim-sap-chieu'];

        var url = "";

        // Special handling: old API endpoint for "phim moi cap nhat"
        if (slug === 'phim-moi-cap-nhat') {
            url = "https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=" + page;
        } else if (listSlugs.indexOf(slug) >= 0) {
            url = "https://phimapi.com/v1/api/danh-sach/" + slug + "?page=" + page + "&limit=" + limit;
        } else if (/^\d{4}$/.test(slug)) {
            url = "https://phimapi.com/v1/api/nam/" + slug + "?page=" + page + "&limit=" + limit;
        } else if (filters.year) {
            url = "https://phimapi.com/v1/api/nam/" + filters.year + "?page=" + page + "&limit=" + limit;
        } else if (filters.category) {
            if (filters.category.indexOf(',') > -1) {
                url = "https://phimapi.com/v1/api/danh-sach/" + filters.category + "?page=" + page + "&limit=" + limit;
            } else {
                url = "https://phimapi.com/v1/api/the-loai/" + filters.category + "?page=" + page + "&limit=" + limit;
            }
        } else if (filters.country) {
            url = "https://phimapi.com/v1/api/quoc-gia/" + filters.country + "?page=" + page + "&limit=" + limit;
        } else {
            url = "https://phimapi.com/v1/api/the-loai/" + slug + "?page=" + page + "&limit=" + limit;
        }

        if (filters.category && url.indexOf(filters.category) === -1) {
            url += "&category=" + filters.category;
        }
        if (filters.country && url.indexOf(filters.country) === -1) {
            url += "&country=" + filters.country;
        }
        if (filters.year && url.indexOf(filters.year) === -1) {
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
        return "https://phimapi.com/v1/api/danh-sach/" + slug;
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;
    var limit = filters.limit || 24;
    return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=" + limit;
}

function getSearchUrl(keyword, pageOrFilters) {
    if (typeof pageOrFilters === 'object') {
        return getUrlSearch(keyword, JSON.stringify(pageOrFilters));
    }
    var page = pageOrFilters || 1;
    return "https://phimapi.com/v1/api/tim-kiem?keyword=" + encodeURIComponent(keyword) + "&page=" + page + "&limit=24";
}

function getUrlDetail(slug) {
    return "https://phimapi.com/phim/" + slug;
}

function getDetailUrl(slug) {
    return getUrlDetail(slug);
}

function getUrlCategories() { return "https://phimapi.com/v1/api/the-loai"; }
function getUrlCountries() { return "https://phimapi.com/v1/api/quoc-gia"; }
function getUrlYears() { return ""; }

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);
        var data = response.data || {};
        var items = data.items || response.items || [];
        var params = data.params || {};
        var pagination = params.pagination || response.pagination || {};

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.poster_url || item.thumb_url),
                backdropUrl: getImageUrl(item.thumb_url),
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
                totalPages: Math.ceil((pagination.totalItems || 0) / (pagination.totalItemsPerPage || 24)),
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
        var items = data.items || response.items || [];

        var movies = items.map(function (item) {
            return {
                id: item.slug,
                title: item.name,
                posterUrl: getImageUrl(item.poster_url || item.thumb_url),
                backdropUrl: getImageUrl(item.thumb_url),
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
        var movie = response.movie || {};
        var rawEpisodes = response.episodes || [];

        var servers = [];
        for (var s = 0; s < rawEpisodes.length; s++) {
            var server = rawEpisodes[s];
            var episodes = [];
            if (server.server_data) {
                for (var e = 0; e < server.server_data.length; e++) {
                    var ep = server.server_data[e];
                    episodes.push({
                        id: ep.link_m3u8 || ep.link_embed || "",
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
            posterUrl: getImageUrl(movie.poster_url),
            backdropUrl: getImageUrl(movie.thumb_url),
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
        var episodes = response.episodes || [];

        var streamUrl = "";
        var headers = { "User-Agent": "Mozilla/5.0", "Referer": "https://phimapi.com" };

        if (episodes.length > 0) {
            var firstServer = episodes[0];
            if (firstServer.server_data && firstServer.server_data.length > 0) {
                var firstEp = firstServer.server_data[0];
                streamUrl = firstEp.link_m3u8 || firstEp.link_embed || "";
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
    return "[]";
}

// =============================================================================
// HELPERS
// =============================================================================

function getImageUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return "https://phimimg.com/" + path;
}
