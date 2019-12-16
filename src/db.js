const mongoose = require('mongoose');

/*
Instalarlo en local y lanzarlo (ver https://www.mongodb.com) 
	- tienes que crear un carpeta en disco local c -> crea la siguiente ruta sino mongo no funciona en tu local
		- C:\data\db
	- acceder a la ruta donde se instala mongo en local
		- C:\Program Files\MongoDB\Server\4.2\bin
	- ejecutar el servicio de mongo por si no lo tienes instalada como servicio ejecutado en segundo plano
		- mongod.exe
		- cuando lo ejecutes no lo cierres, debe estar abierto siempre sino se perdera la conexion con la bbdd
	- ejecutar consola de mongo y probar comando help y luego show dbs para ver las bbdd existentes
		- mongo.exe
-- COMANDOS BASICOS NODE en consola mongo.exe
> show dbs
	admin   0.000GB
	config  0.000GB
	local   0.000GB
	test    0.000GB
> use test
	switched to db test
> show collections
	contacts
> db.contacts.find()
	{ "_id" : ObjectId("5df36ae1113fbf19e851eb5f"), "name" : "jd", "phone" : 789562314, "__v" : 0 }
	{ "_id" : ObjectId("5df36b19113fbf19e851eb60"), "name" : "manue", "phone" : 586669652, "__v" : 0 }	
*/

// si configuramos variable de entorno o por defecto
//const DB_URL = (process.env.MONGO_URL || 'mongodb://mongo/test')
const DB_URL = (process.env.MONGO_URL || 'mongodb://localhost/recomendador') // me crea una bbdd llamada test

const dbConnect = function(){
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, {useNewUrlParser: true});
}

module.exports = dbConnect;