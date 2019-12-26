const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

class ReviewsRessource {

    static reviewsApiRessources(url){
        const urlAPI = "http://reviews-api.herokuapp.com/v1/reviews";
        return urljoin(urlAPI, url);
    }

    static requestHeaders(){
        
    }

    static requestParams(){
        //const tmdbKey = (process.env.TMBD_KEY || '18268e82edbd92497a6d18853ddf8c57');

        return {
            //api_key : tmdbKey
        }
    }

    static getAllReviewsByUser() {
        const url = ReviewsRessource.reviewsApiRessources("");
        //console.log(url);
        const options = {
            headers: ReviewsRessource.requestHeaders(),
            qs:      ReviewsRessource.requestParams(),
        }
        //console.log(options);
        return request.get(url, options);
    }

}

module.exports = ReviewsRessource;