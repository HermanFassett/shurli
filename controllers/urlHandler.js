var Url = require("../models/urls.js");
var Current = require("../models/current.js");

function UrlHandler () {
	this.getUrl = function(req, res) {
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
	};
  this.addUrl = function(req, res) {
    var input = req.params.url;
    var head = req.params.head || "http:";
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
          // Update current
          Current.findOneAndUpdate({}, {current:short}, function(err) {if (err) console.log(err)});
          // New url
          var orig = head + "//" + input;
          var url = new Url({
            original_url: orig,
            short_id: short
          });
          // Save url
          url.save();
          // Send json result
          var shorturl = process.env.APP_URL + short;
          res.json({original_url:orig, short_url: shorturl})
        });
      }
      else {
        var shorturl = process.env.APP_URL + result.short_id;
        res.json({original_url:input, short_url: shorturl})
      }
    });
  }
}
module.exports = UrlHandler;
