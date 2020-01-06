const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

var CommandsFactory = require('hystrixjs').commandFactory;
var serviceCommand = CommandsFactory.getOrCreate("Reviews").run(request).build();

class ReviewsRessource {

    static getRequest(url, options= {}, callback = () => {return;}) {
        var promise = serviceCommand.execute(url, options, callback);
        return promise;
    }

    static reviewsApiRessources(url){
        const urlAPI = "https://fis-api-gateway.herokuapp.com/api/v1";
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
        const url = ReviewsRessource.reviewsApiRessources("/reviews");
        //console.log(url);
        const options = {
            headers: ReviewsRessource.requestHeaders(),
            qs:      ReviewsRessource.requestParams(),
        }
        //console.log(options);
        return ReviewsRessource.getRequest(url, options);
    }

}

module.exports = ReviewsRessource;