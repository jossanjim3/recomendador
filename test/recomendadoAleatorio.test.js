
const app = require('../src/server.js');
const request = require('supertest');

jest.mock('../__mocks__/recomendadorAleatorioPeliculas');

describe("Recomendador Aleatorio Test API", () => {
    
    // parte arrange 
    beforeAll(() => {
        
    });

    /* it ("Should return all contacts", () => {
        const result =  request(app).get("/recomendador/aleatorio/peliculas");
            console.log(result);
            expect(result).toEqual(expect.any(Array));
            //expect(response.body).toBeArrayOfSize(2);
    });
 */
    it ('GET should return a status of 200 OK', async() => {
        const data = await request(app).get("/recomendador/aleatorio/peliculas");
        expect(data).toEqual(expect.any(Array));
    });
    
});