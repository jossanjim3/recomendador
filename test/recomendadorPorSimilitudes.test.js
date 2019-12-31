const expect = require('chai').expect;
const nock = require('nock');

const reviewsSet1 = require("./reviewsSet1");
const reviewsSet2 = require("./reviewsSet2");
const reviewsSet3 = require("./reviewsSet3");
const narcosData = require("./tmdbResponses/narcos");
const laCasaDePapelData = require("./tmdbResponses/laCasaDePapel");
const theWalkingDeadData = require("./tmdbResponses/theWalkingDead");
const breakingBadData = require("./tmdbResponses/breakingBad");
const blackMirrorData = require("./tmdbResponses/blackMirror");
const chernobylData = require("./tmdbResponses/chernobyl");
const interstellarData = require("./tmdbResponses/interstellar");
const gravityData = require("./tmdbResponses/gravity");
const gravityPelisSimilares = require("./tmdbResponses/gravityPelisSimilares");

const N_ID = "tt2707408";
const LCADP_ID = "tt6468322";
const TWD_ID = "tt1520211";
const BB_ID = "tt0903747";
const BM_ID = "tt2085059";
const C_ID = "tt7366338";
const I_ID = "tt0816692";
const G_ID = "tt1454468";
const TMDB_G_ID = "49047";

const namesToReviewsNumber = new Map([
    ["piegir" , 2],
    ["agusnez" , 5],
    ["mandia" , 4],
    ["flacoc" , 4],
    ["quenenj" , 2]
])

const getAndFormatRatings = require('../src/recomendador').getAndFormatRatings;
const substractCommonRates = require('../src/recomendador').substractCommonRates;
const sortProcessedUser = require('../src/recomendador').sortProcessedUser;
const getMoviesAndSeriesSet = require('../src/recomendador').getMoviesAndSeriesSet;
const checkMovies = require('../src/recomendador').checkMovies;
const checkSeries = require('../src/recomendador').checkSeries;

const API_KEY = '?api_key=18268e82edbd92497a6d18853ddf8c57';
const EXT_SOURCE = "&external_source=imdb_id";

function mockReviewsSet1() {
    nock('http://reviews-api.herokuapp.com/v1')
            .get('/reviews')
            .reply(200, reviewsSet1);
}
function mockReviewsSet2() {
    nock('http://reviews-api.herokuapp.com/v1')
            .get('/reviews')
            .reply(200, reviewsSet2);
}

function mockReviewsSet3() {
    nock('http://reviews-api.herokuapp.com/v1')
            .get('/reviews')
            .reply(200, reviewsSet3);
}

function mockReviewsRessources() {
    nock('https://api.themoviedb.org/3/find')
            .get('/' + N_ID + API_KEY + EXT_SOURCE)
            .reply(200, narcosData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + LCADP_ID + API_KEY + EXT_SOURCE)
            .reply(200, laCasaDePapelData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + TWD_ID + API_KEY + EXT_SOURCE)
            .reply(200, theWalkingDeadData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + BB_ID + API_KEY + EXT_SOURCE)
            .reply(200, breakingBadData);
     nock('https://api.themoviedb.org/3/find')
            .get('/' + BM_ID + API_KEY + EXT_SOURCE)
            .reply(200, blackMirrorData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + C_ID + API_KEY + EXT_SOURCE)
            .reply(200, chernobylData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + I_ID + API_KEY + EXT_SOURCE)
            .reply(200, interstellarData);
    nock('https://api.themoviedb.org/3/find')
            .get('/' + G_ID + API_KEY + EXT_SOURCE)
            .reply(200, gravityData);
    nock('https://api.themoviedb.org/3/movie')
            .get('/' + TMDB_G_ID + "/similar" + API_KEY + "&page=1")
            .reply(200, gravityPelisSimilares);    
}

describe('Recomendador', () => {

    it('should return ratings with the right structure', () => {
        mockReviewsSet1();
        return getAndFormatRatings(reviewsSet1[0].imdbId)
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
    
            expect(response[0].id).to.equal('agusnez')
            expect(response[0].reviews[0].imdbId).to.equal('tt0903747')
            expect(response[0].reviews[0].rating).to.equal(4)
          });
    });

    it('should get ratings and format them properly', () => {
        mockReviewsSet2();
        return getAndFormatRatings(reviewsSet2[0].imdbId)
          .then(response => {
            //expect an object back
            expect(typeof response).to.equal('object');
            expect(response.length).to.equal(namesToReviewsNumber.size - 1);
            namesToReviewsNumber.forEach((number, name) => {
                if(name == "quenenj")
                    expect(response.find(review => review.id == name)).to.equal(undefined);
                else
                    expect(response.find(review => review.id == name).reviews.length).to.equal(number);
            });
          });
    });

    it('should calculate sum of distances of reviews to the of the main user properly', async () => {
        mockReviewsSet2();
        const expectedDistances = new Map([
            ["agusnez" , 1],
            ["mandia" , 4],
            ["flacoc" , 3],
        ])
        return getAndFormatRatings(reviewsSet2[0].imdbId)
          .then(
            ratings => {
                ratings = substractCommonRates(ratings, ratings.find(user => user.id == "piegir"));
                expect(ratings.length).to.equal(expectedDistances.size);
                expectedDistances.forEach((distancesSum, name) => {
                    expect(ratings.find(review => review.id == name).CommonRatingsSum).to.equal(distancesSum);
                });
          });
    });

    it('should sort user decreasingly according to their similarity to the main user', async () => {
        mockReviewsSet2();
        const expectedOrder = new Map([
            ["agusnez" , 0],
            ["mandia" , 2],
            ["flacoc" , 1],
        ])
        return getAndFormatRatings(reviewsSet2[0].imdbId)
          .then(
            ratings => {
                ratings = substractCommonRates(ratings, ratings.find(user => user.id == "piegir"));
                ratings = sortProcessedUser(ratings);
                expect(ratings.length).to.equal(expectedOrder.size);
                expectedOrder.forEach((index, name) => {
                    expect(ratings[index].id).to.equal(name);
                });
          });
    });

    it('should sort users reviews decreasingly according to the user similarity to the main user, then, according to the rate', async () => {
        mockReviewsSet2();
        const expectedOrder = ["tt0816692", "tt0903747", "tt2085059", "tt0903747", "tt1520211"];
        return getAndFormatRatings(reviewsSet2[0].imdbId)
          .then(
            ratings => {
                const mainUserRatings = ratings.find(user => user.id == "piegir");
                ratings = substractCommonRates(ratings, mainUserRatings);
                ratings = sortProcessedUser(ratings);
                const set = getMoviesAndSeriesSet(ratings, mainUserRatings);
                expect(set.length).to.equal(expectedOrder.length);
                expectedOrder.forEach((id, index) => {
                    expect(set[index].imdbId).to.equal(id);
                });
          });
    });

    it('should remove unwanted series to recommand (such as duplicates, movies, or genre-unrelated series) and then only keep top 2', async () => {
        mockReviewsSet2();
        mockReviewsRessources();
        const expectedOrder = [1396, 42009];
        return getAndFormatRatings(reviewsSet2[0].imdbId)
          .then(
            async (ratings) => {
                const mainUserRatings = ratings.find(user => user.id == "piegir");
                ratings = substractCommonRates(ratings, mainUserRatings);
                ratings = sortProcessedUser(ratings);
                const set = getMoviesAndSeriesSet(ratings, mainUserRatings);
                await checkSeries(set, reviewsSet2[0].imdbId, 2).then(
                    series => {
                        expect(series.length).to.equal(expectedOrder.length);
                        expectedOrder.forEach((id, index) => {
                            expect(series[index].id).to.equal(id);
                        });
                    }
                );
                
          });
    });

    it('should remove unwanted movies to recommand (such as duplicates, movies, or genre-unrelated series) and then only keep top 3, recommanding external similar movies to fill the lack of 2', async () => {
        mockReviewsSet3();
        mockReviewsRessources();
        const expectedOrder = [157336, 286217, 369972];
        return getAndFormatRatings(reviewsSet3[0].imdbId)
          .then(
            async (ratings) => {
                const mainUserRatings = ratings.find(user => user.id == "piegir");
                ratings = substractCommonRates(ratings, mainUserRatings);
                ratings = sortProcessedUser(ratings);
                const set = getMoviesAndSeriesSet(ratings, mainUserRatings);
                await checkMovies(set, reviewsSet3[0].imdbId, 3).then(
                    movies => {
                        expect(movies.length).to.equal(expectedOrder.length);
                        expectedOrder.forEach((id, index) => {
                            expect(movies[index].id).to.equal(id);
                        });
                    }
                );
                
          });
    });
    
})