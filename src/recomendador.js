/* recomendador.js 
* 
* Recomendador API Microservice
* Recomendador routes
* 
* Authors: 
* José D. Sánchez
* Piérre
* 
* Universidad de Sevilla 
* 2019-20
* 
*/

const express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const ListaNegraPelis = require('./listaNegra').ListaNegraPelis;
const ListaNegraSeries = require('./listaNegra').ListaNegraSeries;
const peliculasTMDBResource = require('./peliculasTMDBResource');
const reviewsRessource = require('./reviewsRessource');
const authenticateService = require('./authenticateService')

const UNAUTHORIZED_MSG = "Unauthorized: No correct token provided";
const NOT_RESPONDING_MSG = "Time-out: An external server is not responding";

/**
 * @swagger
 *  components:
 *    schemas:
 *      pelicula:
 *        allOf:
 *        - type: object
 *          properties:
 *            original_title:
 *              type: string
 *            id:
 *              type: integer
 *            video:
 *              type: boolean
 *            title:
 *              type: string
 *            vote_count:
 *              type: integer
 *            vote_average:
 *              type: number
 *            release_date:
 *              type: string
 *            poster_path:
 *              type: string
 *            genre_ids:
 *              type: array
 *              items:
 *                type: integer
 *            original_language:
 *              type: string
 *            backdrop_path:
 *              type: string
 *            adult:
 *              type: boolean
 *            overview:
 *              type: string
 *            origin_country:
 *              type: array
 *              items:
 *                type: string
 *            popularity:
 *                type: number
 *      serie:
 *        allOf:
 *        - type: object
 *          properties:
 *            original_name:
 *              type: string
 *            id:
 *              type: integer
 *            name:
 *              type: string
 *            vote_count:
 *              type: integer
 *            vote_average:
 *              type: number
 *            first_air_date:
 *              type: string
 *            poster_path:
 *              type: string
 *            genre_ids:
 *              type: array
 *              items:
 *                type: integer
 *            original_language:
 *              type: string
 *            backdrop_path:
 *              type: string
 *            overview:
 *              type: string
 *            origin_country:
 *              type: array
 *              items:
 *                type: string
 *            popularity:
 *                type: number
 *      listaNegra:
 *        allOf:
 *        - type: object
 *          properties:
 *            idTmdb:
 *              type: integer
 *            idUsuario:
 *              type: string
 */

// --------------------------
// ALEATORIOS
// --------------------------

/**
 * @swagger
 * path:
 *  '/aleatorio/peliculas/{number}':
 *    get:
 *      tags:
 *        - aleatorio
 *      description: >-
 *        Recomendador que devuelva aleatoriamente una lista de <number> peliculas (las que tienen buena puntuacion)
 *      operationId: getAleatorioPeliculas
 *      parameters:
 *        - name: number
 *          in: path
 *          description: 'nombre de peliculas que recomendar (optional, 5 por defecto). Si se recommando menos de 1, se devuelve una lista vacía'
 *          required: true
 *          schema:
 *            minimum: 1
 *            type: integer
 *            format: int64
 *      responses:
 *        '200':
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                allOf:
 *                - type: object
 *                  properties:
 *                    results:
 *                      type: array
 *                      items:
 *                        $ref: '#/components/schemas/pelicula'
 *        '401':
 *           description: Unauthorized
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 format: base64
 *                 default: 'Unauthorized: No correct token provided'
 *        '500':
 *           description: Internal server error
 *           content: {}
 *      security:
 *        - bearerAuth:
 *          - read
 */
// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) peliculas populares de TMDB
// ruta postman: http://localhost:3000/recomendador/aleatorio/peliculas
router.get("/aleatorio/peliculas/:number?", async (req, res) => {

    // inicializo la variable cada vez que se llama a la api
    let peliculasRet = [];

    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET aleatorio peliculas TMDB")
    console.log("-------------");
    console.log("");
    
    // numero de peliculas a devolver pasado por parametro
    //var number = req.param('number'); // deprecated
    //var number = req.params.number; // undefined
    var number = req.query.number; // ?blablabla
    console.log("number param url: " + number);
    if (number == undefined){
        number = 20;
    } else {
        number = 20; // por defecto en aleatorio va a devolver como minimo 20
    }
    
    var page = 1; // por defecto trae la pagina numero 1

    // array de peliculas que sera devuelta al usuario

    var userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado: " + userId);
    } catch(err) {
        console.log("Error recuperar userID /aleatorio/peliculas/: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    while(peliculasRet.length < number){

        let peliculas = [];
        peliculas = await obtenerPeliculasAleatoriasTmdb(page, number, userId);
        page = page + 1;

        peliculasRet = peliculasRet.concat(peliculas);

    }

    console.log("************* devuelvo array con " + peliculasRet.length + " peliculas!");

    res.status(200); // 200 ok
    res.json({
        results : peliculasRet
    });
 
});

async function obtenerPeliculasAleatoriasTmdb(page, number, userId){
    //if(mongoose.connection.readyState != 1) return false;
    let peliculasRet = [];

    // devuelve la lista de peliculas aleatoria con buena puntuacion de la api de tmdb
    let peliculasTmdb
    try {
        peliculasTmdb = await peliculasTMDBResource.getAllPopularPeliculasAleatorias(page);
    } catch(err) {;
        throw err;
    }
    //console.log("total peliculasTmdb: " + peliculasTmdb.results.length);

    /* console.log("");
    console.log("Recorremos array...");
    console.log(""); */

    for (var pelicula of peliculasTmdb.results) {
        //console.log("Pelicula Id: " + pelicula.id);
      
        if(peliculasRet.length < number) {
            try {
                // compruebo si esta en la lista negra
                if(mongoose.connection.readyState != 1) {
                    peliculasRet.push(pelicula);
                    //console.log("añado pelicula: " + pelicula.id);

                } else {
                    const storedDataArray = await ListaNegraPelis.findOne({ 'idTmdb' : pelicula.id, 'idUsuario': userId });
                    //console.log("esta en lista negra: " + storedDataArray);
                    if (!storedDataArray){
                        // si no esta en la lista negra lo añado al array a devolver
                        peliculasRet.push(pelicula);
                        //console.log("añado pelicula: " + pelicula.id);
                    } else{
                        //console.log("no añado pelicula: " + pelicula.id);
                    }
                }
                
                //console.log("-------------");                
            }
            catch (err) {
                if (err) {
                    console.log("error: " + err);
                    throw new Error(err.message);
                }
            }
        }

    }

    return peliculasRet;
}

/**
 * @swagger
 * path:
 *   '/aleatorio/series/{number}':
 *      get:
 *        tags:
 *          - aleatorio
 *        description: >-
 *          Recomendador que devuelva aleatoriamente una lista de <number> series (las que tienen buena puntuacion)
 *        operationId: getAleatorioSeries
 *        parameters:
 *          - name: number
 *            in: path
 *            description: 'nombre de series que recomendar (optional, 5 por defecto). Si se recommando menos de 1, se devuelve una lista vacía'
 *            required: true
 *            schema:
 *              type: integer
 *              format: int64
 *        responses:
 *          '200':
 *            description: OK
 *            content:
 *              application/json:
 *                schema:
 *                  allOf:
 *                  - type: object
 *                    properties:
 *                      results:
 *                        type: array
 *                        items:
 *                          $ref: '#/components/schemas/serie'
 *          '401':
 *             description: Unauthorized
 *             content:
 *               text/html:
 *                 schema:
 *                   type: string
 *                   format: base64
 *                   default: 'Unauthorized: No correct token provided'
 *          '500':
 *             description: Internal server error
 *             content: {}
 *      security:
 *        - bearerAuth:
 *          - read
 */
// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) series
// (las que tienes buena puntuacion)
router.get("/aleatorio/series/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET aleatorio series TMDB")
    console.log("-------------");
    console.log("");

    let seriesRet = []; // necesario para que siempre haya como minimo 20

    // numero de series a devolver pasado por parametro
    //var number = req.param('number'); // deprecated
    //var number = req.params.number; // undefined
    var number = req.query.number; // ?blablabla
    console.log("number param url: " + number);

    if (number == undefined){
        number = 20;
    } else {
        number = 20; // por defecto en aleatorio devuelve como minimo 20...
    }

    var page = 1; // por defecto trae la pagina numero 1

    var userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado /aleatorio/series: " + userId);
    } catch(err) {
        console.log("Error recuperar userID: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }

    while(seriesRet.length < number){
        let series = [];
        series = await obtenerSeriesAleatoriasTmdb(page, number, userId);
        page = page + 1;

        seriesRet = seriesRet.concat(series);
    }

    console.log("************* devuelvo array con " + seriesRet.length + " series!");
    
    //res.send(seriesRet);
    res.status(200); // 200 ok
    res.json({results : seriesRet});
});

async function obtenerSeriesAleatoriasTmdb(page, number, userId){

    let seriesRet = [];

    // devuelve la lista de series aleatoria con buena puntuacion de la api de tmdb
    let seriesTmdb
    try {
        seriesTmdb = await peliculasTMDBResource.getAllPopularSeriesAleatorias(page);
    } catch(err) {
        throw err;
    }
    //console.log("total seriesTmdb: " + seriesTmdb.results.length);

    /* console.log("");
    console.log("Recorremos array...");
    console.log(""); */

    for (var serie of seriesTmdb.results) {
        //console.log("Serie Id: " + serie.id);
        
        if(seriesRet.length < number) {
            try {
                // compruebo si esta en la lista negra
                if(mongoose.connection.readyState != 1) {
                    seriesRet.push(serie);
                    //console.log("añado serie: " + serie.id);

                } else {
                    const storedDataArray = await ListaNegraSeries.findOne({ 'idTmdb' : serie.id, 'idUsuario': userId });
                    //console.log("esta en lista negra: " + storedDataArray);
                    if (!storedDataArray){
                        // si no esta en la lista negra lo añado al array a devolver
                        seriesRet.push(serie);
                        //console.log("añado serie: " + serie.id);
                    } else{
                        //console.log("no añado serie: " + serie.id);
                    }
                }
                

                //console.log("-------------");

                // hago el break cuando lleve number series
                // añado mas por si añade a la lista negra desde el front
                /* if (seriesRet.length == number){
                    console.log("devuelvo array con " + seriesRet.length + " series!");
                    break;
                } */
                
            }
            catch (err) {
                throw err;
            }
        }
    }

    return seriesRet;
}

// --------------------------
// FIN ALEATORIOS
// --------------------------

// --------------------------
// SIMILITUDES
// --------------------------

const POSITIVE_RATE_MIN = 3;

function absQuadraticMean(sum, elementsNumber) {
    return Math.abs(sum / Math.pow(elementsNumber, 2));
}

async function retrieveUserLogin(token) {
    if(token == null || (await authenticateService.checkToken(token)).trim() != "OK")
        throw new Error("No authorization");
    token = token.replace('Bearer ', '');
    return jwt.decode(token).login;
}

async function getAndFormatRatings(mainFilmId) {
    const ratings = await reviewsRessource.getAllReviewsByUser();
    //Formatar Ratings
    const userLists = Array.from(new Set(ratings.map(review => review.user)));
    const ratingsByUser = userLists.map(user => { return {
        "id": user,
        "reviews": ratings.filter(review => review.user == user).map(review => { return { rating: review.rating, imdbId: review.imdbId } })
    }});
    return ratingsByUser.filter(user => user.reviews.find(review => review.imdbId == mainFilmId) != null);
}

function substractCommonRates(ratings, mainUserRatings) {
    ratings = ratings.filter(user => user.id != mainUserRatings.id);
    ratings.forEach(user =>  {
        user.CommonRatingsNumber = 0;
        user.CommonRatingsSum = 0;
        user.reviews.forEach(userRating => {
            let mainUserRating;
            if((mainUserRating = mainUserRatings.reviews.find(review => userRating.imdbId == review.imdbId)) != null) {
                userRating.rating -= mainUserRating.rating;
                user.CommonRatingsSum += Math.abs(userRating.rating);
                user.CommonRatingsNumber++;
            }
        })
    });
    return ratings;
}

function sortProcessedUser(ratings) {
    return ratings.sort(
        (user1, user2) => absQuadraticMean(user1.CommonRatingsSum, user1.CommonRatingsNumber) - absQuadraticMean(user2.CommonRatingsSum, user2.CommonRatingsNumber)
    );
}

function getMoviesAndSeriesSet(sortedRatings, mainUserRatings) {
    try {
        const moviesAndSeriesGlobalSetIds = [];
        while(sortedRatings.length > 0) {
            const user = sortedRatings.shift();
            moviesAndSeriesGlobalSetIds.push(user.reviews.filter(review => 
                review.rating >= POSITIVE_RATE_MIN // Que esta puntuada positivamente
                && !mainUserRatings.reviews.find(reviewMainUser => reviewMainUser.imdbId == review.imdbId) // Que no ha visto ya el usuario
            ).sort((review1, review2) => review2.rating - review1.rating));
        }
        return moviesAndSeriesGlobalSetIds.flat();
    } catch(err) {
        if (err) {
            console.log("error: " + err);
        }
        return [];
    }
    
}

async function checkMovies(moviesGlobalSetIds, mainFilmId, userId, number) {
    const moviesFilteredSet = [];
    try {
        const mainMovieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(mainFilmId)).movie_results[0];
        if(mainMovieData == null) {
            return [];
        }
        while(moviesFilteredSet.length < number && moviesGlobalSetIds.length > 0) {
            const movie = moviesGlobalSetIds.shift();
            try {
                // Verifica que ya no esta añadido
                if(!moviesFilteredSet.find(movieSet => movie.imdbId == movieSet.imdbId)) {
                    const movieData =  (await peliculasTMDBResource.getTmdbRessourceFromImdb(movie.imdbId)).movie_results[0];
                    if(movieData !== null
                        && movieData.genre_ids.find(genre1 => mainMovieData.genre_ids.find(genre2 => genre1 === genre2)) // Tienen una categoria en comun
                        && !(await estaEnListaNegraPelis(movieData, userId))) {
                        movieData.imdbId = movie.imdbId;
                        moviesFilteredSet.push(movieData);
                    }
                }
            } catch(err) {}
        }
        if(moviesFilteredSet.length < number) {
            let page = 1;
            let similarMovies = {};
            do {
                similarMovies = await peliculasTMDBResource.getSimilaresPeliculas(mainMovieData.id, page);
                similarMoviesSet = similarMovies.results.slice(0); // se hace una copia profunda
                while(moviesFilteredSet.length < number && similarMoviesSet.length > 0) {
                    const movieData = similarMoviesSet.shift();
                    if(!moviesFilteredSet.find(movieSet => movieData.id == movieSet.id) && !(await estaEnListaNegraPelis(movieData, userId))) {
                        moviesFilteredSet.push(movieData);
                    }
                }
                page++;
            } while(moviesFilteredSet.length < number && page < similarMovies.total_pages)
        }
    } catch (err) {
        if (err) {
            console.log("error: " + err);
        }
    }
    return moviesFilteredSet;
}

async function checkSeries(seriesGlobalSetIds, mainSerieId, userId, number) {
    const seriesFilteredSet = [];
    try {
        const mainSerieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(mainSerieId)).tv_results[0];
        if(mainSerieData == null) {
            return [];
        }
        while(seriesFilteredSet.length < number && seriesGlobalSetIds.length > 0) {
            const serie = seriesGlobalSetIds.shift();
            try {
                // Verifica que ya no esta añadido
                if(!seriesFilteredSet.find(serieSet => serie.imdbId == serieSet.imdbId)) {
                    const serieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(serie.imdbId)).tv_results[0];
                    if(serieData !== null
                        && serieData.genre_ids.find(genre1 => mainSerieData.genre_ids.find(genre2 => genre1 === genre2))  // Tienen una categoria en comun
                        && !(await estaEnListaNegraSeries(serieData, userId))) {
                        serieData.imdbId = serie.imdbId;
                        seriesFilteredSet.push(serieData);
                    }
                }
            } catch(err) {}
        }
        if(seriesFilteredSet.length < number) {
            let page = 1;
            let similarSeries = {};
            do {
                similarSeries = await peliculasTMDBResource.getSimilaresSeries(mainSerieData.id, page);
                similarSeriesSet = similarSeries.results.slice(0); // se hace una copia profunda
                while(seriesFilteredSet.length < number && similarSeriesSet.length > 0) {
                    const serieData = similarSeriesSet.shift();
                    if(!seriesFilteredSet.find(serieSet => serieData.id == serieSet.id) && !(await estaEnListaNegraSeries(serieData, userId))) {
                        seriesFilteredSet.push(serieData);
                    }
                }
                page++;
            } while(seriesFilteredSet.length < number && page < similarSeries.total_pages)
        }
    } catch (err) {
        if (err) {
            console.log("error: " + err);
        }
    }
    return seriesFilteredSet;
}

async function estaEnListaNegraPelis(ressource, userId) {
    if(mongoose.connection.readyState != 1) return false;
    try {
        return (await ListaNegraPelis.findOne({ 'idTmdb' : ressource.id, 'idUsuario': userId }));
    } catch (err) {
        if (err) {
            console.log("error: " + err);
        }
        return false;
    }
}

async function estaEnListaNegraSeries(ressource, userId) {
    if(mongoose.connection.readyState != 1) return false;
    try {
        return (await ListaNegraSeries.findOne({ 'idTmdb' : ressource.id, 'idUsuario': userId })) != null;
    } catch (err) {
        if (err) {
            console.log("error: " + err);
        }
        return false;
    }
}

/**
 * @swagger
 * path:
 *  '/porSimilitudes/pelicula/{filmId}/{number}':
 *     get:
 *       tags:
 *         - similitudes
 *       description: >-
 *         Recomendador que devuelve una lista de hasta <number> películas de similares
 *         categorías que otros usuarios han puntuado sobre la película puntuada.
 *         La eleccion de estas peliculas se hace comparando las puntuaciones del
 *         usuario autentificado con las de los otos usuarios.
 *       operationId: getPeliculasPorSimilitudes
 *       parameters:
 *         - name: filmId
 *           in: path
 *           description: id de la pelicula puntuada
 *           required: true
 *           schema:
 *             type: string
 *         - name: number
 *           in: path
 *           description: 'nombre de peliculas que recomendar (optional, 5 por defecto). Si se recommando menos de 1, se devuelve una lista vacía'
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                 - type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/pelicula'
 *         '401':
 *           description: Unauthorized
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 format: base64
 *                 default: 'Unauthorized: No correct token provided'
 *         '412':
 *           description: 'Precondition Failed (El id de la pelicula es incorrecta)'
 *           content: {}
 *         '417':
 *           description: 'Expectation Failed (El usuario no ha puntado la pelicula. Devuelve unicamente peliculas similares segun tmdb sin tener cuenta del usuario y sin hacer ningun proceso particular)'
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                 - type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/pelicula'
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
// devuelve una lista de hasta NUMBER películas (5 por defecto), de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/pelicula/:filmId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET por similitudes peliculas")
    console.log("-------------");
    console.log("");
    var userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }

    //var number = req.param('number'); // deprecated
    //var number = req.params.number; // undefined
    var number = req.query.number || 5; // ?blablabla
    const ratings = await getAndFormatRatings(req.params.filmId);
    if(ratings != undefined) {
        const mainUserRatings = ratings.find(user => user.id == userId)
        let moviesFilteredSet;
        if(mainUserRatings == null || mainUserRatings.length == 0) {
            res.status(417);
            moviesFilteredSet = await checkMovies([], req.params.filmId, userId, number);
        } else {
            const ratingsProcessed = substractCommonRates(ratings, mainUserRatings);
            const sortedRatings = sortProcessedUser(ratingsProcessed);
            const moviesGlobalSetIds = getMoviesAndSeriesSet(sortedRatings, mainUserRatings);
            moviesFilteredSet = await checkMovies(moviesGlobalSetIds, req.params.filmId, userId, number);
        }
        if(moviesFilteredSet == null || (moviesFilteredSet.length == 0 && number > 0)) {
            res.status(412);
            res.send([]);
            return;
        }
        else {
            res.json({ results : moviesFilteredSet });
        }
    } else {
        res.status(500);
        res.send([]);
    }
});

/**
 * @swagger
 * path:
 *  '/porSimilitudes/serie/{serieId}/{number}':
 *     get:
 *       tags:
 *         - similitudes
 *       description: >-
 *         Recomendador que devuelve una lista de hasta <number> series de similares categorías
 *         que otros usuarios han puntuado sobre la película puntuada. La eleccion
 *         de estas series se hace comparando las puntuaciones del usuario
 *         autentificado con las de los otos usuarios.
 *       operationId: getSeriesPorSimilitudes
 *       parameters:
 *         - name: serieId
 *           in: path
 *           description: id de la serie puntuada
 *           required: true
 *           schema:
 *             type: string
 *         - name: number
 *           in: path
 *           description: 'nombre de series que recomendar (optional, 5 por defecto). Si se recommando menos de 1, se devuelve una lista vacía'
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                 - type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/serie'
 *         '401':
 *           description: Unauthorized
 *           content:
 *             text/html:
 *               schema:
 *                 type: string
 *                 format: base64
 *                 default: 'Unauthorized: No correct token provided'
 *         '412':
 *           description: 'Precondition Failed (El id de la serie es incorrecta)'
 *           content: {}
 *         '417':
 *           description: 'Expectation Failed (El usuario no ha puntado la serie. Devuelve unicamente series similares segun tmdb sin tener cuenta del usuario y sin hacer ningun proceso particular)'
 *           content:
 *             application/json:
 *               schema:
 *                 allOf:
 *                 - type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/serie'
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
// devuelve una lista de hasta NUMBER series  (5 por defecto), de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/serie/:serieId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET por similitudes series")
    console.log("-------------");
    console.log("");
    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    // /userId = "agusnez";
    //var number = req.param('number'); // deprecated
    //var number = req.params.number; // undefined
    var number = req.query.number || 5; // ?blablabla
    const ratings =  await getAndFormatRatings(req.params.serieId);
    if(ratings != undefined) {
        const mainUserRatings = ratings.find(user => user.id == userId)
        let seriesFilteredSet;
        if(mainUserRatings == null || mainUserRatings.length == 0) {
            res.status(417);
            seriesFilteredSet = await checkSeries([], req.params.serieId, userId, number);
        } else {
            const ratingsProcessed = substractCommonRates(ratings, mainUserRatings);
            const sortedRatings = sortProcessedUser(ratingsProcessed);
            const seriesGlobalSetIds = getMoviesAndSeriesSet(sortedRatings, mainUserRatings);
            seriesFilteredSet = await checkSeries(seriesGlobalSetIds, req.params.serieId, userId, number);
        }
        if(seriesFilteredSet == null || (seriesFilteredSet.length == 0 && number > 0)) {
            res.status(412);
            res.send([]);
            return;
        }
        else
            res.json({ results : seriesFilteredSet });
    } else {
        res.status(500);
        res.send([]);
        return;
    }
    
});

// --------------------------
// FIN SIMILITUDES
// --------------------------

// --------------------------
// LISTA NEGRA
// --------------------------

async function getResourceFromTmdbPelicula(idTmdb){
    //console.log("id tmdb: " + idTmdb);
    try {
        const movieData =  (await peliculasTMDBResource.getTmdbRessourceFromTmdbPelicula(idTmdb));
        if(movieData !== null) {
            //console.log("metodo recupera recurso de tmdb con id: " + movieData.id + ", " + movieData.original_title );
            return movieData;
        }
    } catch (err) {
        if (err) {
            console.log("Error: " + err);
            return null;
        }
    }
    return null;
}

/**
 * @swagger
 * path:
 *  '/listaNegra/peliculas':
 *     get:
 *       tags:
 *         - listaNegra
 *       description: Recupera la lista de peliculas que no se deben recomendar al usuario autentificado.
 *       operationId: getListaNegraPeliculas
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/listaNegra'
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
//Devuelve la lista de peliculas que no se debe recomandar al usuario
router.get("/listaNegra/peliculas", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET /listaNegra/peliculas");
    console.log("-------------");
    console.log("");

    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado: " + userId);
    } catch(err) {
        console.log("Error recuperar userID /listaNegra/peliculas: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    let listaNegraPelis = [];

    // como el filtro el vacio {} devuelve todos los elementos
    ListaNegraPelis.find({"idUsuario": userId}, async (err, elementos) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else {

            for (var elemento of elementos) {
                //console.log("Elemento id a recuperar from tmdb: " + elemento.idTmdb);
                try {
                    var movieData = await getResourceFromTmdbPelicula(elemento.idTmdb);
                    if(movieData !== null){
                        var idTmdbResource = elemento.idTmdb;
                        var nameTmdbResource = movieData.original_title;
                        //console.log("name movie data: " + nameTmdbResource);
                        var userName = userId;
                        //listaNegraPelis.push(movieData);
                        listaNegraPelis.push({
                            idTmdb : idTmdbResource,
                            name : nameTmdbResource,
                            idUsuario : userName
                        });
                        //console.log("Peli recuperada de la lista negra con id: " + movieData.id)
                    } else {
                        /* elemento = elemento.cleanup();
                        listaNegraPelis.push(elemento); */
                        var idTmdbResource = elemento.idTmdb;
                        var nameTmdbResource = "Unknown";
                        var userName = userId;
                        //listaNegraPelis.push(movieData);
                        listaNegraPelis.push({
                            idTmdb : idTmdbResource,
                            name : nameTmdbResource,
                            idUsuario : userName
                        });
                    }
                } catch(err) {
                    console.log("Error recuperar elementos de TMDB /listaNegra/peliculas: " + err);
                    res.sendStatus(500);
                    return;
                }
                
            }       
            
            /* // elimina el elemento _id de la lista de los contactos que no queremos que aparezca
            elementos.map((elemento) => {
                elemento = elemento.cleanup();
                listaNegraPelis.push(elemento);
            }); */

            console.log("Lista negra numero peliculas: " + listaNegraPelis.length);
            res.status(200); // 200 ok
            res.json({results : listaNegraPelis});
        }
    });
});


async function getResourceFromTmdbSerie(idTmdb){
    //console.log("id tmdb: " + idTmdb);
    try {
        const movieData =  (await peliculasTMDBResource.getTmdbRessourceFromTmdbSerie(idTmdb));
        if(movieData !== null) {
            //console.log("metodo recupera recurso de tmdb con id: " + movieData.id + ", " + movieData.original_title );
            return movieData;
        }
    } catch (err) {
        if (err) {
            console.log("Error: " + err);
            return null;
        }
    }
    return null;
}

/**
 * @swagger
 * path:
 *  '/listaNegra/series':
 *     get:
 *       tags:
 *         - listaNegra
 *       description: Recupera la lista de series que no se deben recomendar al usuario autentificado.
 *       operationId: getListaNegraSeries
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/listaNegra'
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read 
 */
//Devuelve la lista de series que no se debe recomandar al usuario
router.get("/listaNegra/series", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET /listaNegra/series");
    console.log("-------------");
    console.log("");

    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado: " + userId);
    } catch(err) {
        console.log("Error recuperar userID /listaNegra/series: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    
    let listaNegraSeries = [];

    // como el filtro el vacio {} devuelve todos los elementos
    ListaNegraSeries.find({"idUsuario": userId}, async (err, elementos) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
            
        } else {

            for (var elemento of elementos) {
                //console.log("Elemento id a recuperar from tmdb: " + elemento.idTmdb);
                try {
                    var movieData = await getResourceFromTmdbSerie(elemento.idTmdb);
                    if(movieData !== null){
                        var idTmdbResource = elemento.idTmdb;
                        var nameTmdbResource = movieData.name;
                        //console.log("name movie data: " + nameTmdbResource);
                        var userName = userId;
                        //listaNegraSeries.push(movieData);
                        listaNegraSeries.push({
                            idTmdb : idTmdbResource,
                            name : nameTmdbResource,
                            idUsuario : userName
                        });
                        //console.log("Peli recuperada de la lista negra con id: " + movieData.id)
                    } else {
                        /* elemento = elemento.cleanup();
                        listaNegraSeries.push(elemento); */
                        var idTmdbResource = elemento.idTmdb;
                        var nameTmdbResource = "Unknown";
                        var userName = userId;
                        //listaNegraPelis.push(movieData);
                        listaNegraSeries.push({
                            idTmdb : idTmdbResource,
                            name : nameTmdbResource,
                            idUsuario : userName
                        });
                    }
                } catch(err) {
                    console.log("Error recuperar elementos de TMDB /listaNegra/peliculas: " + err);
                    res.sendStatus(500);
                    return;
                }
                
            }

            /* // elimina el elemento _id de la lista de los contactos que no queremos que aparezca
            elementos.map((elemento) => {
                elemento = elemento.cleanup();
                listaNegraSeries.push(elemento);
            }); */

            console.log("Lista negra numero series: " + listaNegraSeries.length);
            res.status(200); // 200 ok
            res.json({results : listaNegraSeries});
        }
    });
});

/**
 * @swagger
 * path:
 *  '/listaNegra/pelicula/{peliculaId}':
 *     post:
 *       tags:
 *         - listaNegra
 *       description: Guarda en BB.DD. la pelicula que no se debe recomendar al usuario autentificado.
 *       operationId: addListaNegraPelicula
 *       parameters:
 *         - name: peliculaId
 *           in: path
 *           description: id de la pelicula para no recomendar
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: Already exist
 *           content: {}
 *         '201':
 *           description: Created
 *           content: {}
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
//Añade la pelicula a la lista de peliculas que no se debe recomandar al usuario
// ruta postman: http://localhost:3000/recomendador/listaNegra/pelicula/419704
router.post("/listaNegra/pelicula/:peliculaId", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - POST /peliculaId lista negra");
    console.log("-------------");
    console.log("");
    
    var peliculaId = req.params.peliculaId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => pelicula: " + peliculaId);

    // creo el objeto schema de lista negra
    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado: " + userId);
    } catch(err) {
        console.log("Error recuperar userID: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    const pelicula = { "idTmdb": peliculaId, "idUsuario": userId }
    try {
        // compruebo si esta en la lista negra
        const storedDataArray = await ListaNegraPelis.findOne(pelicula);
        console.log("esta en lista negra: " + storedDataArray);
        if (!storedDataArray){
            // si no esta en la lista negra lo añado
            ListaNegraPelis.create(pelicula, (error, record) => {
                if (error) {
                    console.log(Date() + " - " + err);
                    res.sendStatus(500);
                } else {
                    console.log("pelicula añadida a la lista negra: ", record._id, pelicula.idTmdb);
                    res.status(201); // 201 Created
                    res.json({ anadido: 'SI', message: 'Pelicula añadida a la lista negra!', peliculaId});
                }
            }); 
        } else{
            console.log("ya existe pelicula en la lista negra: " + peliculaId);
            res.status(412); // 412 Precondition Failed
            res.json({ anadido: 'NO', message: 'Pelicula ya existente en la lista negra!', peliculaId});
        }
        
    }
    catch (err) {
        if (err) {
            console.log("error: " + err);
            throw new Error(err.message);
        }
    }
});

/**
 * @swagger
 * path:
 *  '/listaNegra/serie/{serieId}':
 *     post:
 *       tags:
 *         - listaNegra
 *       description: Guarda en BB.DD. la serie que no se debe recomendar al usuario autentificado.
 *       operationId: addListaNegraSerie
 *       parameters:
 *         - name: serieId
 *           in: path
 *           description: id de la serie para no recomendar
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: Already exist
 *           content: {}
 *         '201':
 *           description: Created
 *           content: {}
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
//Añade la serie a la lista de series que no se debe recomandar al usuario
router.post("/listaNegra/serie/:serieId", async (req, res) => {
    
    console.log("");
    console.log("-------------");
    console.log(Date() + " - POST /serieId lista negra");
    console.log("-------------");
    console.log("");

    var serieId = req.params.serieId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => serie: " + serieId);

    // creo el objeto schema de lista negra
    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
        console.log("userID recuperado: " + userId);
    } catch(err) {
        console.log("Error recuperar userID: " + err);
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    const serie = { "idTmdb": serieId, "idUsuario": userId }
    try {
        // compruebo si esta en la lista negra
        const storedDataArray = await ListaNegraSeries.findOne(serie);
        console.log("esta en lista negra: " + storedDataArray);
        if (!storedDataArray){
            // si no esta en la lista negra lo añado
            ListaNegraSeries.create(serie, (error, record) => {
                if (error) {
                    console.log(Date() + " - " + err);
                    res.sendStatus(500);
                } else {
                    console.log("serie añadida a la lista negra: ", record._id, serie.idTmdb);
                    res.status(201); // 201 Created
                    res.json({ anadido : 'SI', message: 'Serie añadida a la lista negra!', serieId});
                }
            }); 
        } else{
            console.log("ya existe serie en la lista negra: " + serieId);
            res.status(412); // 412 Precondition Failed
            res.json({ anadido : 'NO', message: 'Serie ya existente en la lista negra!', serieId});
        }
        
    }
    catch (err) {
        if (err) {
            console.log("error: " + err);
            throw new Error(err.message);
        }
    }
});

/**
 * @swagger
 * path:
 *  '/listaNegra/pelicula/{peliculaId}':
 *     delete:
 *       tags:
 *         - listaNegra
 *       description: Elimina de la BB.DD. la pelicula que no se debe recomendar al usuario autentificado.
 *       operationId: deleteListaNegraPelicula
 *       parameters:
 *         - name: peliculaId
 *           in: path
 *           description: id de la pelicula para no recomendar
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: OK
 *           content: {}
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *             - read
 */
//Retira la pelicula de la lista de peliculas que no se debe recomandar al usuario
router.delete("/listaNegra/pelicula/:peliculaId", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - DELETE /peliculaId lista negra");
    console.log("-------------");
    console.log("");

    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    var peliculaId = req.params.peliculaId;
    console.log(" - req.body => pelicula: " + peliculaId);
    
    // es necesario el id de la pelicula creado por mongoose
    ListaNegraPelis.deleteOne({ "idTmdb": peliculaId, "idUsuario": userId })
        .then((response) => {
            console.log("Pelicula Deleted!: " + peliculaId);
            res.status(202); // 202 Accepted
            res.json({ message: 'Pelicula Deleted!', peliculaId});
        })
        .catch((err) =>{
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        })
        ;

    /* // es necesario el id de la pelicula creado por mongoose
    ListaNegra.findByIdAndRemove(peliculaId, (err) => {
        if (err){
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else
            res.json({ message: 'Pelicula Deleted!', peliculaId});
    }); */
});

/**
 * @swagger
 * path:
 *  '/listaNegra/serie/{serieId}':
 *     delete:
 *       tags:
 *         - listaNegra
 *       description: Elimina de la BB.DD. la serie que no se debe recomendar al usuario autentificado.
 *       operationId: deleteListaNegraSerie
 *       parameters:
 *         - name: serieId
 *           in: path
 *           description: id de la serie para no recomendar
 *           required: true
 *           schema:
 *             minimum: 1
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: OK
 *           content: {}
 *         '401':
 *           description: Unauthorized
 *           content: {}
 *         '500':
 *           description: Internal Server Error
 *           content: {}
 *       security:
 *         - bearerAuth:
 *           - read
*/
//Retira la serie de la lista de series que no se debe recomandar al usuario
router.delete("/listaNegra/serie/:serieId", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - DELETE /serieId lista negra");
    console.log("-------------");
    console.log("");

    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    var serieId = req.params.serieId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => serie: " + serieId);
    
    // es necesario el id de la pelicula creado por mongoose
    ListaNegraSeries.deleteOne({ "idTmdb": serieId, "idUsuario": userId })
        .then((response) => {
            console.log("Serie Deleted!: " + serieId);
            res.status(202); // 202 Accepted
            res.json({ message: 'Serie Deleted!', serieId});
        })
        .catch((err) =>{
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        })
        ;
});

// --------------------------
// LISTA NEGRA
// --------------------------

module.exports = { router, retrieveUserLogin, getAndFormatRatings, substractCommonRates, sortProcessedUser, getMoviesAndSeriesSet, checkMovies, checkSeries, obtenerPeliculasAleatoriasTmdb, obtenerSeriesAleatoriasTmdb };