var mongoose = require('mongoose');
var Current = new mongoose.Schema({
  current: String
});
module.exports = mongoose.model('Current', Current);
