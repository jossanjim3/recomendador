const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

const NodeCache = require( "node-cache" );
const tmdbCache = new NodeCache( { stdTTL: 60, checkperiod: 10, useClones: false } );
const imdbResourcePrefix = "imdb_";
const similaresPelisPrefix = "similares_pelis_";
const similaresSeriesPrefix = "similares_series_";

class PeliculasTMDBResource {

    static imdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/find";
        const peliculasServer = (process.env.FIND_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    static seriesTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/tv";
        const peliculasServer = (process.env.SERIES_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    // Get a list of movies on TMDB.
    static peliculasAleatorioTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/movie";
        const peliculasServer = (process.env.PELICULAS_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    // Get a list of series TV on TMDB.
    static seriesAleatorioTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/tv";
        const seriesServer = (process.env.SERIES_URL || urlAPI);

        return urljoin(seriesServer, url);
    }

    static requestHeaders(){
        
    }

    // parametros de la consulta a la api -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
    static requestParams(page){
        const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');
        const language = 'es-ES';

        return {
            api_key : tmdbKey, // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
            language : language,
            page : page
        }
    }

    // Get a list of the current popular movies on TMDb. This list updates daily.
    static getAllPopularPeliculasAleatorias(page){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/popular");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(page), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    // Get the top rated movies on TMDb.
    static getAllTopRatedPeliculasAleatorias(page){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/top_rated");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(page), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    // Get a list of the current popular movies on TMDb. This list updates daily.
    static getAllPopularSeriesAleatorias(page){
        const url = PeliculasTMDBResource.seriesAleatorioTmdbResource("/popular");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(page), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    // Get the top rated movies on TMDb.
    static getAllTopRatedSeriesAleatorias(page){
        const url = PeliculasTMDBResource.seriesAleatorioTmdbResource("/top_rated");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(page), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    /*
        Devuelve el promise de la peticion de un recurso de tmdb identificado por un id imdb (o el recurso si se llama la funcion con await).
        El recurso se recupera por la api de tmdb o por el cache si el recurso fue recuperado hace poco.
        Si se devuelve el recurso por el cache, se devuelve la referencia original y no una copia,
        asi deberias hacer una copia si quieres modificar los resultados
    */
    static getTmdbRessourceFromImdb(imdbId){
        let cachedResponse = tmdbCache.get(imdbResourcePrefix + imdbId);
        const url = PeliculasTMDBResource.imdbResource("/" + imdbId);
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&language=es-ES&external_source=imdb_id";
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(imdbResourcePrefix + imdbId, body)});
    }

    /*
        Devuelve el promise de la peticion de peliculas similares a una pelicula de tmdb identificada por su id tmdb (o el recurso si se llama la funcion con await).
        El recurso se recupera por la api de tmdb o por el cache si el recurso fue recuperado hace poco.
        Si se devuelve el recurso por el cache, se devuelve la referencia original y no una copia,
        asi deberias hacer una copia si quieres modificar los resultados
    */
    static getSimilaresPeliculas(filmId, page){
        let cachedResponse = tmdbCache.get(similaresPelisPrefix + filmId + "_" + page);
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/" + filmId + "/similar");
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&language=es-ES&page=" + page;
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(similaresPelisPrefix + filmId + "_" + page, body)});
    }

    /*
        Devuelve el promise de la peticion de series similares a una serie de tmdb identificada por su id tmdb (o el recurso si se llama la funcion con await).
        El recurso se recupera por la api de tmdb o por el cache si el recurso fue recuperado hace poco.
        Si se devuelve el recurso por el cache, se devuelve la referencia original y no una copia,
        asi deberias hacer una copia si quieres modificar los resultados
    */
    static getSimilaresSeries(serieId, page){
        let cachedResponse = tmdbCache.get(similaresSeriesPrefix + serieId + "_" + page);
        const url = PeliculasTMDBResource.seriesTmdbResource("/" + serieId + "/similar");
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&language=es-ES&page=" + page;
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(similaresSeriesPrefix + serieId + "_" + page, body)});
    }
}

module.exports = PeliculasTMDBResource;