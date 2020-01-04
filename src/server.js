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
const enable_cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

var port = (process.env.PORT || 3000);

const BASE_URL_API = "/recomendador/v1";

var app = express();
app.use(bodyParser.json());
app.use(enable_cors());

// Our own routes requirement
var recomendador = require("./recomendador.js").router;
var documentacion = require("./swaggerDoc.js");

app.use(documentacion);
app.use(BASE_URL_API, recomendador);

// metodo root - define las rutas que contiene el microservico recomendador completo
app.get("/",(req, res) => {
    var ruta = path.join(__dirname, '../views/apiRutas.html');   
    res.sendFile(ruta);
});

module.exports = app;