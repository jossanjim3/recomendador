/* index.js 
* 
* Recomendador API Microservice
* Index recomendador
* 
* Authors: 
* José D. Sánchez
* Piérre
* 
* Universidad de Sevilla 
* 2019-20
* 
*/

const app = require('./server.js');

const dbConnect = require('./db');

// var port = 3000; // esto para trabajar en localhost esta bien pero para desplegar en heroku no
var port = (process.env.PORT || 3000); // leemos de la variable de entorno port, y si no hay valor elegimos 3000 por defecto.

dbConnect().then(
    () => {
        app.listen(port);
        console.log("Starting Recomendador API server..." + port);
    },
    err => {
        console.log("Connection error: " + err);
    }
)

