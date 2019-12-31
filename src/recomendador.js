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

const ListaNegra = require('./listaNegra');
const peliculasTMDBResource = require('./peliculasTMDBResource');
const reviewsRessource = require('./reviewsRessource');

// --------------------------
// ALEATORIOS
// --------------------------

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) peliculas populares de TMDB
// ruta postman: http://localhost:3000/recomendador/aleatorio/peliculas
router.get("/aleatorio/peliculas/:number?", async (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(" - GET aleatorio peliculas TMDB")
    console.log("-------------");
    console.log("");

    // TODO recorrer el json devuelto por mdb, comprobar que la lista de peliculas no este incluida en la lista negra
    // TODO limitar por parametro el numero de peliculas devueltas, 5 por defecto como minimo si no se indica, o con una paginacion...

    // numero de peliculas a devolver pasado por parametro
    var number = req.query.number;
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
            const storedDataArray = await ListaNegra.findOne({ 'idTmdb' : pelicula.id });
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

    res.send(peliculasRet);
 
});

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) series
// (las que tienes buena puntuacion)
router.get("/aleatorio/series/:number?",(req, res) => {
    console.log("");
    console.log("-------------");
    console.log(" - GET aleatorio series TMDB")
    console.log("-------------");
    console.log("");

    res.send("<html><body><h1>Aleatorio with serie Id hasta " + (req.params.number || 5) + " series...</h1></body></html>");
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
    const moviesAndSeriesGlobalSetIds = [];
    while(sortedRatings.length > 0) {
        const user = sortedRatings.shift();
        moviesAndSeriesGlobalSetIds.push(user.reviews.filter(review => 
            //TODO:filter lista negra
            review.rating >= POSITIVE_RATE_MIN // Que esta puntuada positivamente
            && !mainUserRatings.reviews.find(reviewMainUser => reviewMainUser.imdbId == review.imdbId) // Que no ha visto ya el usuario
        ).sort((review1, review2) => review2.rating - review1.rating));
    }
    return moviesAndSeriesGlobalSetIds.flat();
}

async function checkMovies(moviesGlobalSetIds, mainFilmId, number) {
    const moviesFilteredSet = [];
    try {
        const mainMovieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(mainFilmId)).movie_results[0];
        while(moviesFilteredSet.length < number && moviesGlobalSetIds.length > 0) {
            const movie = moviesGlobalSetIds.shift();
            try {
                // Verifica que ya no esta añadido
                if(!moviesFilteredSet.find(movieSet => movie.imdbId == movieSet.imdbId)) {
                    const movieData =  (await peliculasTMDBResource.getTmdbRessourceFromImdb(movie.imdbId)).movie_results[0];
                    if(movieData !== null && movieData.genre_ids.find(genre1 => mainMovieData.genre_ids.find(genre2 => genre1 === genre2))) { // Tienen una categoria en comun
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
                while(moviesFilteredSet.length < number && similarMovies.results.length > 0) {
                    const movieData = similarMovies.results.shift();
                    if(!moviesFilteredSet.find(movieSet => movieData.id == movieSet.id)) {
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

async function checkSeries(seriesGlobalSetIds, mainSerieId, number) {
    const seriesFilteredSet = [];
    try {
        const mainSerieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(mainSerieId)).tv_results[0];
        while(seriesFilteredSet.length < number && seriesGlobalSetIds.length > 0) {
            const serie = seriesGlobalSetIds.shift();
            try {
                // Verifica que ya no esta añadido
                if(!seriesFilteredSet.find(serieSet => serie.imdbId == serieSet.imdbId)) {
                    const serieData = (await peliculasTMDBResource.getTmdbRessourceFromImdb(serie.imdbId)).tv_results[0];
                    if(serieData !== null && serieData.genre_ids.find(genre1 => mainSerieData.genre_ids.find(genre2 => genre1 === genre2))) { // Verifica que tienen una categoria en comun
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
                while(seriesFilteredSet.length < number && similarSeries.results.length > 0) {
                    const serieData = similarSeries.results.shift();
                    if(!seriesFilteredSet.find(serieSet => serieData.id == serieSet.id)) {
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

// devuelve una lista de hasta NUMBER películas (5 por defecto), de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/pelicula/:filmId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(" - GET por similitudes peliculas")
    console.log("-------------");
    console.log("");
    const userId ="agusnez" //TODO
    var number = req.params.number || 5;
    const ratings = await getAndFormatRatings(req.params.filmId);
    if(ratings) {
        const mainUserRatings = ratings.find(user => user.id == userId)
        const ratingsProcessed = substractCommonRates(ratings, mainUserRatings);
        const sortedRatings = sortProcessedUser(ratingsProcessed);
        const moviesGlobalSetIds = getMoviesAndSeriesSet(sortedRatings, mainUserRatings);
        const moviesFilteredSet = await checkMovies(moviesGlobalSetIds, req.params.filmId, number);
        res.send(moviesFilteredSet);
    } else {
        res.status(412);
        res.send([])
    }
});

// devuelve una lista de hasta NUMBER series  (5 por defecto), de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/serie/:serieId/:number?", async (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(" - GET por similitudes series")
    console.log("-------------");
    console.log("");
    const userId ="agusnez" //TODO
    var number = req.params.number || 5;
    const ratings =  await getAndFormatRatings(req.params.serieId);
    if(ratings) {
        const mainUserRatings = ratings.find(user => user.id == userId)
        console.log(mainUserRatings);
        const ratingsProcessed = substractCommonRates(ratings, mainUserRatings);
        const sortedRatings = sortProcessedUser(ratingsProcessed);
        const seriesGlobalSetIds = getMoviesAndSeriesSet(sortedRatings, mainUserRatings);
        const seriesFilteredSet = await checkSeries(seriesGlobalSetIds, req.params.serieId, number);
        res.send(seriesFilteredSet);
    } else {
        res.status(412);
        res.send([])
    }
});

// --------------------------
// FIN SIMILITUDES
// --------------------------

// --------------------------
// LISTA NEGRA
// --------------------------

//Devuelve la lista de peliculas que no se debe recomandar al usuario
router.get("/listaNegra/peliculas", (req, res) => {
    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET /listaNegra");
    console.log("-------------");
    console.log("");

    // como el filtro el vacio {} devuelve todos los elementos
    ListaNegra.find({}, (err, elementos) => {
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
router.get("/listaNegra/series", (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - GET /listaNegra");
    console.log("-------------");
    console.log("");

    res.send("<html><body><h1>Lista negra</h1></body></html>")
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
    const pelicula = { "idTmdb" : peliculaId }
    
    try {
        // compruebo si esta en la lista negra
        const storedDataArray = await ListaNegra.findOne({ 'idTmdb' : peliculaId });
        console.log("esta en lista negra: " + storedDataArray);
        if (!storedDataArray){
            // si no esta en la lista negra lo añado
            ListaNegra.create(pelicula, (error, record) => {
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
router.post("/listaNegra/serie/:serieId", (req, res) => {
    
    console.log("");
    console.log("-------------");
    console.log(Date() + " - POST /serieId lista negra");
    console.log("-------------");
    console.log("");

    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Retira la pelicula de la lista de peliculas que no se debe recomandar al usuario
router.delete("/listaNegra/pelicula/:peliculaId", (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - DELETE /peliculaId lista negra");
    console.log("-------------");
    console.log("");

    var peliculaId = req.params.peliculaId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => pelicula: " + peliculaId);
    
    // es necesario el id de la pelicula creado por mongoose
    ListaNegra.deleteOne({ 'idTmdb' : peliculaId})
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
router.delete("/listaNegra/serie/:serieId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

// --------------------------
// LISTA NEGRA
// --------------------------

module.exports = { router, getAndFormatRatings, substractCommonRates, sortProcessedUser, getMoviesAndSeriesSet, checkMovies, checkSeries };