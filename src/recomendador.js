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
router.get("/aleatorio/peliculas/:number?", (req, res) => {

    console.log(" - GET aleatorio peliculas TMDB")
    
    // TODO recorrer el json devuelto por mdb, comprobar que la lista de peliculas no este incluida en la lista negra
    // TODO limitar por parametro el numero de peliculas devueltas, 5 por defecto como minimo si no se indica, o con una paginacion...

    // numero de peliculas a devolver pasado por parametro
    var number = req.query.number;
    console.log("number: " + number);

    if (number <= 0 || number == undefined){
        number = 5;
    }
    
    // array de peliculas que sera devuelta al usuario
    peliculasRet = [];

    // devuelve la lista de peliculas aleatoria con buena puntuacion de la api de tmdb
    peliculasTMDBResource.getAllPopularPeliculasAleatorias()
    //peliculasTMDBResource.getAllTopRatedPeliculasAleatorias()

        .then((body) => {
            // recorro la lista de peliculas de Tmdb y .si el id esta añadido en la lista negra no lo añado en la
            // lista de peliculas a devolver
            const peliculas = body.results;
            
            for (var pelicula of peliculas) {
                console.log("Pelicula Id: " + pelicula.id);
                
                peliculasRet.push(pelicula);

                // hago el break cuando lleve number peliculas
                if (peliculasRet.length == number){
                    break;
                }

            }

            res.send(peliculasRet);
        })

        .catch((error) => {
            console.log("error: " + error);
            res.sendStatus(500);
        })        
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
    console.log(Date() + " - GET /listaNegra");

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
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Añade la pelicula a la lista de peliculas que no se debe recomandar al usuario
// ruta postman: http://localhost:3000/recomendador/listaNegra/pelicula/419704
router.post("/listaNegra/pelicula/:peliculaId", (req, res) => {
    console.log(Date() + " - POST /peliculaId");
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
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

//Retira la pelicula de la lista de peliculas que no se debe recomandar al usuario
router.delete("/listaNegra/pelicula/:peliculaId", (req, res) => {

    console.log(Date() + " - DELETE /contacts");
    var peliculaId = req.params.peliculaId; //para que funcione esto tienes que añadir body-parser
    console.log(" - req.body => pelicula: " + peliculaId);

    // es necesario el id de la pelicula creado por mongoose
    ListaNegra.findByIdAndRemove(peliculaId, (err) => {
        if (err){
            console.log(Date() + " - " + err);
            res.sendStatus(500);
        } else
            res.json({ message: 'Pelicula Deleted!', peliculaId});
    });
});

//Retira la serie de la lista de series que no se debe recomandar al usuario
router.delete("/listaNegra/serie/:serieId", (req, res) => {
    res.send("<html><body><h1>Lista negra</h1></body></html>")
});

// --------------------------
// LISTA NEGRA
// --------------------------

// --------------------------
// FUNCIONES AUXILIARES
// --------------------------

// es una funcion sincrona, tiene que ejecutarse por completo
function estaEnListaNegra(idTmdb){
    console.log("¿esta en lista negra el idTmdb? : " + idTmdb);

    return ListaNegra.find({"idTmdb": idTmdb})
        .then((storedDataArray) => {
            console.log("storedDataArray: " + storedDataArray);
            return true;
        })

        .catch(function(err){
            if (err) {
                console.log("error: " + err);
                return false;
            }
        
    });
}

// es una funcion sincrona, tiene que ejecutarse por completo
async function getTodaListaNegra(){

    try {
        const storedDataArray = await ListaNegra.find({});
        console.log("ALL storedDataArray: " + storedDataArray);
        return storedDataArray;
    }
    catch (err) {
        if (err) {
            console.log("error: " + err);
            throw new Error(err.message);
        }
    }
}

module.exports = router;