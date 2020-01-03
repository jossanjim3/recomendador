const mongoose = require('mongoose');

const listaNegraSchema = new mongoose.Schema({
    idTmdb : Number,
    idUsuario : String
});

// creo un metodo cleanup en mi schema de lista negra de peliculas y series  para que me aparezca solo 
// los atributos que yo quiera, si no lo tuviera e hiciera un get sobre el schema contacts me devolveria 
// tambien el id junto con el idTmdb
listaNegraSchema.methods.cleanup = function(){
    return {
            idTmdb: this.idTmdb,
            idUsuario: this.idUsuario
        };
}

const ListaNegraPelis = mongoose.model('ListaNegraPelis', listaNegraSchema);
const ListaNegraSeries = mongoose.model('ListaNegraSeries', listaNegraSchema);

module.exports = { ListaNegraPelis, ListaNegraSeries };