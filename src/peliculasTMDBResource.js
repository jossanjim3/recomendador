const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

const NodeCache = require( "node-cache" );
const tmdbCache = new NodeCache( { stdTTL: 300, checkperiod: 60, useClones: false } );
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

    static requestHeaders(){
        
    }

    // parametros de la consulta a la api -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
    static requestParams(page){
        const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');
        return {
            api_key : tmdbKey, // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
    }

    // Get a list of the current popular movies on TMDb. This list updates daily.
    static getAllPopularPeliculasAleatorias(){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/popular");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    // Get the top rated movies on TMDb.
    static getAllTopRatedPeliculasAleatorias(){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/top_rated");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
            qs:      PeliculasTMDBResource.requestParams(), // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
        //console.log(options);
        return request.get(url, options);
    }

    static getTmdbRessourceFromImdb(imdbId){
        let cachedResponse = tmdbCache.get(imdbResourcePrefix + imdbId);
        const url = PeliculasTMDBResource.imdbResource("/" + imdbId);
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&external_source=imdb_id";
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(imdbResourcePrefix + imdbId, body)});
    }

    static getSimilaresPeliculas(filmId, page){
        let cachedResponse = tmdbCache.get(similaresPelisPrefix + filmId + "_" + page);
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("/" + filmId + "/similar");
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&page=" + page;
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(similaresPelisPrefix + filmId + "_" + page, body)});
    }

    static getSimilaresSeries(serieId, page){
        let cachedResponse = tmdbCache.get(similaresSeriesPrefix + serieId + "_" + page);
        const url = PeliculasTMDBResource.seriesTmdbResource("/" + serieId + "/similar");
        const options = "?api_key=" + PeliculasTMDBResource.requestParams().api_key + "&page=" + page;
        return cachedResponse != undefined ? cachedResponse : request.get(url + options, (_, resp, body) => { if(resp) tmdbCache.set(similaresSeriesPrefix + serieId + "_" + page, body)});
    }

}

module.exports = PeliculasTMDBResource;