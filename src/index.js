var express = require('express');
//var port = 3000;
var port = (process.env.PORT || 3000);
console.log("Starting API server...");
var app = express();

// --------------------------
// ALEATORIOS
// --------------------------

// Recomendador que devuelva aleatoriamente una lista de 5 peliculas y series 
// (las que tienes buena puntuacion)
app.get("recomendador/aleatorio/:userId",(req, res) => {
    res.send("<html><body><h1>Aleatorio with film Id...</h1></body></html>");
});

// Recomendador que devuelva aleatoriamente una lista de hasta NUMBER peliculas y series
// (las que tienes buena puntuacion)
app.get("recomendador/aleatorio/:userId/:number",(req, res) => {
    res.send("<html><body><h1>Aleatorio with film Id hasta number os films...</h1></body></html>");
});

// --------------------------
// FIN ALEATORIOS
// --------------------------

// --------------------------
// SIMILITUDES
// --------------------------

// devuelve una lista de 5 películas de similar categorías que otros usuarios han puntuado
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes
// de notacion del usuario con las notas de los otos usuarios.
app.get("recomendador/porSimilitudes/pelicula/:filmId/:userId",(req, res) => {
    res.send("<html><body><h1>Similitudes with film Id and user Id...</h1></body></html>");
});

// devuelve una lista de hasta películas, de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
app.get("recomendador​/porSimilitudes​/pelicula​/:filmId}/:userId/:number",(req, res) => {
    res.send("<html><body><h1>Similitudes with film Id and user Id with max number...</h1></body></html>");
});

// devuelve una lista de 5 películas, o series, de similar categorías que otros usuarios 
// han puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace 
// frente a las similaritudes de notacion del usuario con las notas de los otos usuarios.
app.get("recomendador/porSimilitudes/serie/:serieId/:userId",(req, res) => {
    res.send("<html><body><h1>Similitudes with serie Id and user Id...</h1></body></html>");
});

// devuelve una lista de hasta películas, o series, de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
app.get("recomendador/porSimilitudes/serie/:serieId/:userId/:number",(req, res) => {
    res.send("<html><body><h1>Similitudes with serie Id and user Id with max number......</h1></body></html>");
});

// --------------------------
// FIN SIMILITUDES
// --------------------------

app.listen(port);

console.log("Server ready");