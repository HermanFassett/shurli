var Url = require("../models/urls.js");
var Current = require("../models/current.js");

function UrlHandler () {
	this.getUrl = function(req, res) {
		console.log(req.url);
    // Set up parameters
    var full_url = input = req.url.slice(1);
		if (!input.substr(0,8).match(/http(s?):\/\//)) input = "http://" + input;
    // Try to find document by original url
		console.log(full_url);
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
    // Set up parameters
    var input = req.params.url;
		// Make sure it's at least not a short id
		if (input.indexOf(".") === -1) {
			return res.json({error: "No valid url given"});
		}
		// Get all parameters
    if (req.params["0"]) input += (req.params["0"].charAt(0) == "/" ? "" : "/") + req.params["0"];
		// Get all queries
		var i = 0;
		for (var key in req.query) {
			input += ((i === 0) ? "?" : "&") + key + "=" + req.query[key];
			i++
		}
    var head = req.params.head || "http:";
    var full_url = head + "//" + input;
    Url.findOne({original_url: full_url}, function(err, result) {
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
      else {
        var shorturl = process.env.APP_URL + result.short_id;
        res.json({original_url: full_url, short_url: shorturl})
      }
    });
  }
}
module.exports = UrlHandler;
