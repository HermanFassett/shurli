var mongoose = require('mongoose');
var Url = new mongoose.Schema({
  original_url: String,
  short_id: String
});
module.exports = mongoose.model('Url', Url);
