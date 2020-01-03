/* server.js 
* 
* Recomendador API Microservice
* Server configuration
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
const bodyParser = require('body-parser');
const path = require('path');
const cors= require('cors');

var port = (process.env.PORT || 3000);

const BASE_URL_API = "/recomendador";

var app = express();
app.use(bodyParser.json());
app.use(cors());

// Our own routes requirement
var recomendador = require("./recomendador.js").router;

app.use(BASE_URL_API, recomendador);

// metodo root - define las rutas que contiene el microservico recomendador completo
app.get("/",(req, res) => {
    console.log(" - ROOT - API rutas recomendador");
    
    //res.send("<html><body><h1>My server is running... JD</h1></body></html>");
    //console.log(__dirname); //C:\Users\jdsj6\Documents\Master\FIS\Proyecto FIS\BakcEnd\Recomendador\src

    //var ruta = require('../views/api_rutas.html');
    var ruta = path.join(__dirname, '../views/apiRutas.html');
    //console.log(ruta);
    
    res.sendFile(ruta);

});

module.exports = app;