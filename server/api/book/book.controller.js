/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /books              ->  index
 * POST    /books              ->  create
 * GET     /books/:id          ->  show
 * PUT     /books/:id          ->  update
 * DELETE  /books/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var https = require('https');
var Book = require('./book.model');

var GoogleAPIkey2 = '&key=AIzaSyDspbc6079PHDz2fWQUbwtt_V6tan3uXVA';
var GoogleAPIkey1 = '&key=AIzaSyCqY-SZmtd-L_0ARZm4Ur7DHIpgzfyHoZY';
var GoogleURL="https://www.googleapis.com/books/v1/volumes?q=intitle:";

// https://www.googleapis.com/books/v1/volumes?q=intitle:harr%book20potter&key=AIzaSyDspbc6079PHDz2fWQUbwtt_V6tan3uXVA



// Get list of books
exports.index = function(criteria, req, res) {
  Book.find(criteria)
    .populate('owner')
    .populate('requestedBy')
    .populate('lendedTo')
    .exec( function (err, books) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(books);
  });
};

exports.indexFree = function(req, res) {
  var criteria = {
    lended: false,
    requestedBy: {$exists: false}
  };
  exports.index(criteria, req, res);
};

exports.indexOwner = function(req, res) {
  var criteria = {
    owner: req.params.id,
    lended: false
  };
  exports.index(criteria, req, res);
};

exports.indexRequestedIn = function(req, res) {
  var criteria = {
    lended: false,
    requestedBy: {$exists: true},
    owner: req.params.id
  };
  exports.index(criteria, req, res);
};

exports.indexRequestedOut = function(req, res) {
  var criteria = {
    lended: false,
    requestedBy: req.params.id
  };
  exports.index(criteria, req, res);
};

exports.indexLendedIn = function(req, res) {
  var criteria = {
    lended: true,
    lendedTo: req.params.id
  };
  exports.index(criteria, req, res);
};

exports.indexLendedOut = function(req, res) {
  var criteria = {
    lended: true,
    owner: req.params.id
  };
  exports.index(criteria, req, res);
};

exports.search = function(req, res) {

  var keyword = req.params.keyword;
  https.get(GoogleURL + keyword + GoogleAPIkey2, 
      function(data){
        var bookResponse='';
        data.on("data", function(chunk) {
          bookResponse += chunk;
        });
        data.on("end", function() {
          res.writeHead(200, {"Content-Type": "application/json"});
          return res.end(bookResponse);
        });
     }).on('error', function(e) {
         console.log("Got error: " + e.message);
     });
};

// Get a single book
exports.show = function(req, res) {
  Book.findById(req.params.id, function (err, book) {
    if(err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    return res.json(book);
  });
};

// Creates a new book in the DB.
exports.create = function(req, res) {
  Book.create(req.body, function(err, book) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(book);
  });
};

// Updates an existing book in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Book.findById(req.params.id, function (err, book) {
    if (err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    var updated = _.merge(book, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(book);
    });
  });
};

// Deletes a book from the DB.
exports.destroy = function(req, res) {
  Book.findById(req.params.id, function (err, book) {
    if(err) { return handleError(res, err); }
    if(!book) { return res.status(404).send('Not Found'); }
    book.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}