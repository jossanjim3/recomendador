const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

class PeliculasTMDBResource {
    
    static peliculasAleatorioTmdbResource(url){
        const urlAPI = "https://api.themoviedb.org/3/movie/popular";
        const peliculasServer = (process.env.PELICULAS_URL || urlAPI);

        return urljoin(peliculasServer, url);
    }

    static requestHeaders(){
        const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');

        return {
            api_key : tmdbKey
        }
    }

    static getAllPeliculasAleatorias(){
        const url = PeliculasTMDBResource.peliculasAleatorioTmdbResource("");
        //console.log(url);
        const options = {
            headers: PeliculasTMDBResource.requestHeaders(),
        }
        //console.log(options);
        return request.get(url, options);
    }
}

module.exports = PeliculasTMDBResource;