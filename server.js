var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');
// Require handler
var UrlHandler = require(path.dirname() + '/controllers/urlHandler.js');
// Init urlHandler
var urlHandler = new UrlHandler();
// Init app
var app = express();
// Get db uri
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI;

// Connect to db
mongoose.connect(uristring, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  else console.log ('Succeeded connected to: ' + uristring);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default route
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/client/index.html"));
});

// New short url route
app.get("/new/:url*", urlHandler.addUrl);
// Get url route
app.get("/:url*", urlHandler.getUrl);

// Listen on default port or 5000
app.listen(process.env.PORT || 8080);
