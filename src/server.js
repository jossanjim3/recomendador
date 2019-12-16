var express = require('express');
var bodyParser = require('body-parser');
const path = require('path');

var port = (process.env.PORT || 3000);

const BASE_URL_API = "/recomendador";

var router = express.Router();
var app = express();
app.use(bodyParser.json());

// metodo root
router.get("/",(req, res) => {
    console.log(" - ROOT - API rutas recomendador");
    
    //res.send("<html><body><h1>My server is running... JD</h1></body></html>");
    //console.log(__dirname); //C:\Users\jdsj6\Documents\Master\FIS\Proyecto FIS\BakcEnd\Recomendador\src

    //var ruta = require('../views/api_rutas.html');
    var ruta = path.join(__dirname, '../views/apiRutas.html');
    //console.log(ruta);
    
    res.sendFile(ruta);

});

// --------------------------
// ALEATORIOS
// --------------------------

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER (5 por defecto) peliculas y series
// (las que tienes buena puntuacion)
router.get("/aleatorio/:number?",(req, res) => {
    res.send("<html><body><h1>Aleatorio with film Id hasta " + (req.params.number || 5) + " films...</h1></body></html>");
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

app.use(BASE_URL_API, router);

module.exports = app;