var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');
var Url = require(path.dirname() + "/models/urls.js");

var app = express();
var uristring = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI;

// Connect to db
mongoose.connect(uristring, function (err, res) {
  if (err) console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  else console.log ('Succeeded connected to: ' + uristring);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.send("HELLO WORLD");
});
app.get("/:url", function(req, res) {
  var input = req.params.url;
  var url = new Url({
    original_url: "www.google.com",
    short_id: "abcd"
  });
  url.save();
  res.json({url:input});
});

// Listen on default port or 5000
app.listen(process.env.PORT || 8080);
