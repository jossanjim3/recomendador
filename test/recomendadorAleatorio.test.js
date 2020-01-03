const expect = require('chai').expect;
const nock = require('nock');

const peliculasSet1 = require("./peliculasSet1");
const obtenerPeliculasAleatoriasTmdb = require('../src/recomendador').obtenerPeliculasAleatoriasTmdb;

function mockPeliculasSet1() {
    nock('http://localhost:3000/recomendador/v1')
            .get('/aleatorio/peliculas')
            .reply(200, peliculasSet1);
}

jest.setTimeout(30000);

describe("Recomendador Aleatorio Test API", () => {

    it('should return films with the right structure', async () => {
        mockPeliculasSet1();
        return obtenerPeliculasAleatoriasTmdb(1)
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
    
            expect(response[0].id).to.equal(419704);
            expect(response[0].popularity).to.equal(588.365);
            //expect(response[0].textContent).toEqual(expect.stringContaining("Star Wars"));
          });
    });

});