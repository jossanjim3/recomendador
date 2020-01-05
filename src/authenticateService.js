const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

var CommandsFactory = require('hystrixjs').commandFactory;
var serviceCommand = CommandsFactory.getOrCreate("TMDB").run(request).build();

class AuthenticateService {

    static getRequest(url, options= {}, callback = () => {return;}) {
        var promise = serviceCommand.execute(url, options, callback);
        return promise;
    }

    static authenticateApi(url){
        const urlAPI = "https://fis-backend-login.herokuapp.com/api/v1";
        return urljoin(urlAPI, url);
    }

    static requestHeaders(token) {
        return {
            "Authorization": token
        };
    }

    static checkToken(token) {
        const url = AuthenticateService.authenticateApi("/checkToken");
        //console.log(url);
        const options = {
            headers: AuthenticateService.requestHeaders(token),
        }
        //console.log(options);
        return AuthenticateService.getRequest(url, options);
    }

}

module.exports = AuthenticateService;