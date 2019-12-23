const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

class PeliculasTMDBResource {
    
    static peliculasAleatorioTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/movie/popular";
        const peliculasServer = (process.env.PELICULAS_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    static requestHeaders(){
        
    }

    // parametros de la consulta a la api -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
    static requestParams(){
        const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');

        return {
            api_key : tmdbKey // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        }
    }

    static getAllPeliculasAleatorias(){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("");
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