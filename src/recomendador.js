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

const ListaNegra = require('./listaNegra');
const peliculasTMDBResource = require('./peliculasTMDBResource');

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


// devuelve una lista de hasta NUMBER películas (5 por defecto), de similar categorías que otros usuarios han puntuado 
// sobre una película puntuada. La eleccion de estas peliculas se hace frente a las similaritudes 
// de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes​/pelicula​/:filmId/:number?",(req, res) => {

    console.log("");
    console.log("-------------");
    console.log(" - GET por similitudes peliculas")
    console.log("-------------");
    console.log("");

    res.send("<html><body><h1>Similitudes with film Id and user Id with " + (req.params.number || 5) + " peliculas...</h1></body></html>");
});

// devuelve una lista de hasta NUMBER series  (5 por defecto), de similar categorías que otros usuarios han 
// puntuado sobre una película puntuada. La eleccion de estas peliculas, o series, se hace frente a 
// las similaritudes de notacion del usuario con las notas de los otos usuarios.
router.get("/porSimilitudes/serie/:serieId/:number?",(req, res) => {

    console.log("");
    console.log("-------------");
    console.log(" - GET por simmilitudes series")
    console.log("-------------");
    console.log("");

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
router.post("/listaNegra/pelicula/:peliculaId", (req, res) => {

    console.log("");
    console.log("-------------");
    console.log(Date() + " - POST /peliculaId lista negra");
    console.log("-------------");
    console.log("");
    
    var peliculaId = req.params.peliculaId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => pelicula: " + peliculaId);

    const pelicula = { "idTmdb" : peliculaId }

    //if (!estaEnListaNegra(peliculaId)) {
        ListaNegra.create(pelicula, function(err, record) {
            if (err) {
                console.log(Date() + " - " + err);
                res.sendStatus(500);
            } else {
                console.log("pelicula añadida: ", record._id, pelicula.idTmdb);
                res.sendStatus(201);
            }
        }); 
    //}
     
    //res.send("<html><body><h1>Lista negra</h1></body></html>")
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

module.exports = router;