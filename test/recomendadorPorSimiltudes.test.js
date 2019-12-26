const expect = require('chai').expect;
const nock = require('nock');

const getAndFormatRatings = require('../src/recomendador').getAndFormatRatings;

describe('Recomendador', () => {
    let dbFind;
    let reviewsSet1;

    beforeAll(() => {
        reviewsSet1 = [
            {
                "id":"5dee8ccdae4ea4001b48e136",
                "imdbId":"tt0903747",
                "rating":4,
                "user":"agusnez",
                "created":"2019-12-09T18:05:01.938Z",
                "impressions": {
                    "likes":1,
                    "dislike":0,
                    "spam":0
                },
                "index":1,
                "total":1
            }
        ];
    });

    beforeEach(() => {
        nock('http://reviews-api.herokuapp.com/v1')
            .get('/reviews')
            .reply(200, reviewsSet1);
    });

    it('get ratings', () => {
        return getAndFormatRatings("tt0903747")
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
    
            //Test result of name, company and location for the response
            expect(response[0].user).to.equal('agusnez')
            expect(response[0].reviews[0].imdbId).to.equal('tt0903747')
            expect(response[0].reviews[0].rating).to.equal(4)
          });
      });
})