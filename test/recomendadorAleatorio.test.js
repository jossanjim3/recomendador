
jest.mock('../__mocks__/recomendadorAleatorioPeliculas');

const app = require('../src/server.js');
const request = require('supertest');

//jest.setTimeout(30000);

describe("Recomendador Aleatorio Test API", () => {
    
    // parte arrange 
    beforeAll(() => {
        
    });

    it ('GET should return a status of 200 OK', async () => {
        const response = await request(app).get("/recomendador/aleatorio/peliculas");
        expect(response.statusCode).toBe(200);

    }); 

    /* it ("Should return all contacts", async () => {
        const result =  await request(app).get("/recomendador/aleatorio/peliculas");

        expect(result).toEqual(expect.any(Array));
        //expect(response.body).toBeArrayOfSize(2);
    }); */
    
});