const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

class PeliculasTMDBResource {
    
    // Get a list of movies on TMDB.
    static peliculasAleatorioTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/movie";
        const peliculasServer = (process.env.PELICULAS_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    static requestHeaders(){
        
    }

    // parametros de la consulta a la api -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
    static requestParams(){
        const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');
        const language = 'es-ES';

        return {
            api_key : tmdbKey, // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
            language : language
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
}

module.exports = PeliculasTMDBResource;