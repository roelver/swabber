'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BookSchema = new Schema({
  title: String,
  coverImg: String,
  owner:  {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  lended:  Boolean,
  lendedTo: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  requestedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
  },
  address: String,
  postalCode: String,
  city: String
});

module.exports = mongoose.model('Book', BookSchema);