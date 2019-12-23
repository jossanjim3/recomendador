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

var db = require('./db.js');

const peliculasTMDBResource = require('./peliculasTMDBResource');

// --------------------------
// ALEATORIOS
// --------------------------
const request = require('request-promise-native').defaults({json: true});
const urljoin = require('url-join');

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) peliculas
// (las que tienes buena puntuacion)
router.get("/aleatorio/peliculas/:number?", (req, res) => {

    console.log(" - GET aleatorio peliculas tmdb")
    
    const urlAPI = "https://api.themoviedb.org/3/movie/popular";
    const apiKey = "?api_key=18268e82edbd92497a6d18853ddf8c57";
    var url = urljoin(urlAPI, "");

    const options = {
        qs: {
            api_key : "18268e82edbd92497a6d18853ddf8c57" // -> uri + '?api_key=18268e82edbd92497a6d18853ddf8c57'
        },
    }
    const requestJD = request.get(url, options);

    requestJD
    .then((body) => {
        res.send(body);
    })

    .catch((error) => {
        console.log("error: " + error);
        res.sendStatus(500);
    })

    /* peliculasTMDBResource.getAllPeliculasAleatorias()
        .then((body) => {
            res.send(body);
        })

        .catch((error) => {
            console.log("error: " + error);
            res.sendStatus(500);
        }) */

    //res.send("<html><body><h1>Aleatorio with film Id hasta " + (req.params.number || 5) + " films...</h1></body></html>");

});

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) series
// (las que tienes buena puntuacion)
router.get("/aleatorio/series/:number?",(req, res) => {
    res.send("<html><body><h1>Aleatorio with serie Id hasta " + (req.params.number || 5) + " series...</h1></body></html>");
});

// --------------------------
// FIN ALEATORIOS
// --------------------------

// --------------------------
// SIMILITUDES
// --------------------------


// devuelve una lista de hasta NUMBER películas (5 por defecto), de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes​/pelicula​/:filmId/:number?",(req, res) => {
    res.send("<html><body><h1>Similitudes with film Id and user Id with " + (req.params.number || 5) + " peliculas...</h1></body></html>");
});

// devuelve una lista de hasta NUMBER series  (5 por defecto), de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/serie/:serieId/:number?",(req, res) => {
    res.send("<html><body><h1>Similitudes with serie Id and user Id with max " + (req.params.number || 5) + " series ...</h1></body></html>");
});

// --------------------------
// FIN SIMILITUDES
// --------------------------

// --------------------------
// LISTA NEGRA
// --------------------------

//Devuelve la lista de peliculas que no se debe recomandar al usuario
router.get("/listaNegra/peliculas", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Devuelve la lista de series que no se debe recomandar al usuario
router.get("/listaNegra/series", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Añade la pelicula a la lista de peliculas que no se debe recomandar al usuario
router.post("/listaNegra/pelicula/:peliculaId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Añade la serie a la lista de series que no se debe recomandar al usuario
router.post("/listaNegra/serie/:serieId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Retira la pelicula de la lista de peliculas que no se debe recomandar al usuario
router.delete("/listaNegra/pelicula/:peliculaId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Retira la serie de la lista de series que no se debe recomandar al usuario
router.delete("/listaNegra/serie/:serieId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

// --------------------------
// LISTA NEGRA
// --------------------------

module.exports = router;