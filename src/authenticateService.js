const urljoin = require('url-join');
const request = require('request-promise-native').defaults({json: true});

class AuthenticateService {

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
        return request.get(url, options);
    }

}

module.exports = AuthenticateService;