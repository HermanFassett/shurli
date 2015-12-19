// Require models
var Url = require("../models/urls.js");
var Current = require("../models/current.js");
var http = require('http');

function UrlHandler () {
	this.getUrl = function(req, res) {
    // Set up url
    var full_url = input = req.url.slice(1);
		if (!input.substr(0,8).match(/http(s?):\/\//)) full_url = "http://" + input;
    // Try to find document by original url
    Url.findOne({original_url: full_url}, function(err, origres) {
      // If it doesn't exist, try to find by short url
      if (!origres) {
        Url.findOne({short_id: input}, function(err, shortres) {
          // If nothing found display null for result
          if (!shortres) res.json({error: "No short url found for given input"});
          else res.redirect(shortres.original_url); // Otherwise redirect to url
        });
      }
      // Else display info
      else {
        var url = process.env.APP_URL + origres.short_id;
        res.json({original_url: full_url, short_url: url});
      }
    });
	};
  this.addUrl = function(req, res) {
		// Set up url
    var full_url = input = req.url.slice(5);
		// Check if url exists
		// First basic check
		if (input.indexOf(".") === -1) return res.json({error: "URL invalid"});
		// Second more advanced check;
		var options = {method: 'HEAD', host: input, port: 80, path: '/'},
    request = http.request(options, function(r) { });
		request.on('error', function (e) {
		  return res.json({error: "URL not found"}); // Most likely ENOTFOUND in this case
		});
		request.end();
		// Add http if it doesn't exist
		if (!input.substr(0,8).match(/http(s?):\/\//)) full_url = "http://" + input;
		// Try to find url in existing urls
    Url.findOne({original_url: full_url}, function(err, result) {
			// If it doesn't exist, add it
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
          // Update current
          Current.findOneAndUpdate({}, {current:short}, function(err) {if (err) console.log(err)});
          // New url
          var url = new Url({
            original_url: full_url,
            short_id: short
          });
          // Save url
          url.save();
          // Send json result
          var shorturl = process.env.APP_URL + short;
          res.json({original_url: full_url, short_url: shorturl})
        });
      }
			// If url is in database, show info
      else {
        var shorturl = process.env.APP_URL + result.short_id;
        res.json({original_url: full_url, short_url: shorturl})
      }
    });
  }
}
module.exports = UrlHandler;
