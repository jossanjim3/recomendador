
const app = require('../src/server.js');
const request = require('supertest');

describe ("Stupid test", () => {
    
    it("Should do an stupid test", () => {
        const a  = 5;
        const b = 3;
        const sum = a+b;

        expect(sum).toBe(8);
    });
});

describe("Server API", () => {
    
    describe("GET /", () => {
        it ("Should return an HTML document", () => {
            return request(app).get("/").then((response) => {
                expect(response.status).toBe(200);
                expect(response.type).toEqual(expect.stringContaining("html"));
                expect(response.text).toEqual(expect.stringContaining("h2"));
            });
        });
    });
    
});