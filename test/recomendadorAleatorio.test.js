const expect = require('chai').expect;
const nock = require('nock');

const peliculasSet1 = require("./peliculasSet1");
const seriesSet1 = require("./seriesSet1");
const obtenerPeliculasAleatoriasTmdb = require('../src/recomendador').obtenerPeliculasAleatoriasTmdb;
const obtenerSeriesAleatoriasTmdb = require('../src/recomendador').obtenerSeriesAleatoriasTmdb;

const API_KEY = '?api_key=18268e82edbd92497a6d18853ddf8c57';
const LANGUAGE = "&language=es-ES";
const PAGE = "&page=1"
const EXT_SOURCE = "&external_source=imdb_id";
const AUTHENTIFICATION_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwiaWF0IjoxNTc3OTg5MzgwLCJleHAiOjE1Nzc5OTI5ODB9.8HQaMFCpyvdpd4csrvnwv5PkMkrmPu_zg5rSq119xbY";

function mockPeliculasSet1() {
    nock('https://api.themoviedb.org/3/movie')
            .get('/popular' + API_KEY + LANGUAGE + PAGE)
            .reply(200, peliculasSet1);
}

function mockSeriesSet1() {
    nock('https://api.themoviedb.org/3/tv')
            .get('/popular' + API_KEY + LANGUAGE + PAGE)
            .reply(200, seriesSet1);
}

//jest.setTimeout(30000);

describe("Recomendador Aleatorio Test API", () => {

    it('should return films with the right structure', async () => {
        mockPeliculasSet1();
        return obtenerPeliculasAleatoriasTmdb([], 1, 1, 'admin')
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
            expect(response.length).to.equal(1);
            expect(response[0].id).to.equal(181812);
            expect(response[0].popularity).to.equal(454.192);
            expect(response[0].original_title ).to.include.any.string("Star","Wars", "Skywalker");
          });
    });

    it('should return TV shows with the right structure', async () => {
        mockSeriesSet1();
        return obtenerSeriesAleatoriasTmdb([], 1, 1, 'admin')
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
            expect(response.length).to.equal(1);
            expect(response[0].id).to.equal(57243);
            expect(response[0].popularity).to.equal(413.45);
            expect(response[0].original_name).to.include.any.string("Doctor");
          });
    });

});