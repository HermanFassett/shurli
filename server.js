var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');
// Require mongoos models
var Url = require(path.dirname() + "/models/urls.js");
var Current = require(path.dirname() + "/models/current.js");
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
  res.send("HELLO WORLD");
});

// New short url route
app.get(new RegExp('\/new\/.*'), function(req, res) {
  var input = req.params.url;
  console.log(input);
  Url.findOne({original_url: input}, function(err, result) {
    if (!result) {
      Current.findOne({}, function(err, result) {
        if (err) throw err;
        // Update short id
        var short = result.current;
        var options = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        // Find current index
        var index = options.indexOf(short.charAt(0));
        // Update short id
        if (index === options.length - 1) short = "0" + short;
        else short = options.charAt(++index) + short.substr(1);
        // New url
        var url = new Url({
          original_url: input,
          short_id: short
        });
        // Save url
        url.save();
        // Send json result
        var shorturl = process.env.APP_URL + short;
        res.json({original_url:input, short_url: short})
      });
    }
    else {
      var shorturl = process.env.APP_URL + result.short_id;
      res.json({original_url:input, short_url: shorturl})
    }
  })
});
app.get("/:url", function(req, res) {
  var input = req.params.url;
  Url.findOne({original_url: input}, function(err, origres) {
    if (!origres) {
      Url.findOne({short_id: input}, function(err, shortres) {
        if (!shortres) {
          res.json({original_url:null, short_url:null});
        }
        else {
          res.redirect(shortres.original_url);
        }
      });
    }
    else {
      var url = process.env.APP_URL + origres.short_id;
      res.json({original_url: input, short_url: url});
    }
  });
});

// Listen on default port or 5000
app.listen(process.env.PORT || 8080);
