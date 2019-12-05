var express = require('express');

//var port = 3000;
var port = (process.env.PORT || 3000);

console.log("Starting API server...");

var app = express();

app.get("/",(req, res) => {
    res.send("<html><body><h1>Recomendador Server...</h1></body></html>");
});

app.listen(port);

console.log("Server ready");