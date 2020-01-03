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
const EMPTY_RVWS_MSG = "Unpossible: No reviews for this user";

// --------------------------
// ALEATORIOS
// --------------------------

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) peliculas populares de TMDB
// ruta postman: http://localhost:3000/recomendador/aleatorio/peliculas
router.get("/aleatorio/peliculas/:number?", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET aleatorio peliculas TMDB")
    console.log("-------------");
    console.log("");

    // numero de peliculas a devolver pasado por parametro
    var number = req.query.number;
    // olvidamos el parametro number y devuelve 20 recomendaciones. En la parte front con el selector se pone 5,10,15 o 20
    number = 20;
    console.log("number limit a devolver: " + number);

    if (number <= 0 || number == undefined){
        number = 5;
    }
    
    // array de peliculas que sera devuelta al usuario
    peliculasRet = [];

    // devuelve la lista de peliculas aleatoria con buena puntuacion de la api de tmdb
    const peliculasTmdb = await peliculasTMDBResource.getAllPopularPeliculasAleatorias();
    console.log("total peliculasTmdb: " + peliculasTmdb.results.length);

    console.log("");
    console.log("Recorremos array...");
    console.log("");

    for (var pelicula of peliculasTmdb.results) {
        console.log("Pelicula Id: " + pelicula.id);
        
        try {
            // compruebo si esta en la lista negra
            const storedDataArray = await ListaNegraPelis.findOne({ 'idTmdb' : pelicula.id });
            console.log("esta en lista negra: " + storedDataArray);
            if (!storedDataArray){
                // si no esta en la lista negra lo añado al array a devolver
                peliculasRet.push(pelicula);
                console.log("añado pelicula: " + pelicula.id);
            } else{
                console.log("no añado pelicula: " + pelicula.id);
            }

            console.log("-------------");

            // hago el break cuando lleve number peliculas
            if (peliculasRet.length == number){
                console.log("devuelvo array con " + peliculasRet.length + " peliculas!");
                break;
            }
            
        }
        catch (err) {
            if (err) {
                console.log("error: " + err);
                throw new Error(err.message);
            }
        }                

    }

    console.log("devuelvo array con " + peliculasRet.length + " peliculas!");

    //res.send(peliculasRet);
    /* res.json({page: 1,
            total_results: 10000,
            total_pages: 500,
            results : peliculasRet
        }); */
        res.json({
                results : peliculasRet
        });
 
});

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) series
// (las que tienes buena puntuacion)
router.get("/aleatorio/series/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET aleatorio series TMDB")
    console.log("-------------");
    console.log("");

    // numero de series a devolver pasado por parametro
    var number = req.query.number;
    // olvidamos el parametro number y devuelve 20 recomendaciones. En la parte front con el selector se pone 5,10,15 o 20
    number = 20;
    console.log("number limit a devolver: " + number);

    if (number <= 0 || number == undefined){
        number = 5;
    }
    
    // array de series que sera devuelta al usuario
    seriesRet = [];

    // devuelve la lista de series aleatoria con buena puntuacion de la api de tmdb
    const seriesTmdb = await peliculasTMDBResource.getAllPopularSeriesAleatorias();
    console.log("total seriesTmdb: " + seriesTmdb.results.length);

    console.log("");
    console.log("Recorremos array...");
    console.log("");

    for (var serie of seriesTmdb.results) {
        console.log("Serie Id: " + serie.id);
        
        try {
            // compruebo si esta en la lista negra
            const storedDataArray = await ListaNegraSeries.findOne({ 'idTmdb' : serie.id });
            console.log("esta en lista negra: " + storedDataArray);
            if (!storedDataArray){
                // si no esta en la lista negra lo añado al array a devolver
                seriesRet.push(serie);
                console.log("añado serie: " + serie.id);
            } else{
                console.log("no añado serie: " + serie.id);
            }

            console.log("-------------");

            // hago el break cuando lleve number series
            if (seriesRet.length == number){
                console.log("devuelvo array con " + seriesRet.length + " series!");
                break;
            }
            
        }
        catch (err) {
            if (err) {
                console.log("error: " + err);
                throw new Error(err.message);
            }
        }                

    }

    console.log("devuelvo array con " + seriesRet.length + " series!");
    
    //res.send(seriesRet);
    res.json({results : seriesRet});
});

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


// devuelve una lista de hasta NUMBER películas (5 por defecto), de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/pelicula/:filmId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET por similitudes peliculas")
    console.log("-------------");
    console.log("");
    //const userId ="agusnez"
    var userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    var number = req.params.number || 5;
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

// devuelve una lista de hasta NUMBER series  (5 por defecto), de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/serie/:serieId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET por similitudes series")
    console.log("-------------");
    console.log("");
    //const userId ="agusnez"
    let userId;
    try {
        userId = await retrieveUserLogin(req.headers['authorization'])
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    // /userId = "agusnez";
    var number = req.params.number || 5;
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
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }

    // como el filtro el vacio {} devuelve todos los elementos
    ListaNegraPelis.find({"idUsuario": userId}, (err, elementos) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else {

            // elimina el elemento _id de la lista de los contactos que no queremos que aparezca
            res.send(elementos.map((elemento) => {
                return elemento.cleanup();
            }));
        }
    });
});

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
    } catch(err) {
        res.status(401);
        res.send(UNAUTHORIZED_MSG);
        return;
    }
    
    // como el filtro el vacio {} devuelve todos los elementos
    ListaNegraSeries.find({"idUsuario": userId}, (err, elementos) => {
        if (err) {
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else {
            // elimina el elemento _id de la lista de los contactos que no queremos que aparezca
            res.send(elementos.map((elemento) => {
                return elemento.cleanup();
            }));
        }
    });
});

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
    } catch(err) {
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
                    res.sendStatus(201);
                }
            }); 
        } else{
            console.log("ya existe pelicula en la lista negra: " + peliculaId);
            res.json({ message: 'Pelicula ya existente en la lista negra!', peliculaId});
        }
        
    }
    catch (err) {
        if (err) {
            console.log("error: " + err);
            throw new Error(err.message);
        }
    }
});

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
    } catch(err) {
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
                    res.sendStatus(201);
                }
            }); 
        } else{
            console.log("ya existe serie en la lista negra: " + serieId);
            res.json({ message: 'Serie ya existente en la lista negra!', serieId});
        }
        
    }
    catch (err) {
        if (err) {
            console.log("error: " + err);
            throw new Error(err.message);
        }
    }
});

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

module.exports = { router, retrieveUserLogin, getAndFormatRatings, substractCommonRates, sortProcessedUser, getMoviesAndSeriesSet, checkMovies, checkSeries };