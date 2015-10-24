'use strict';

var _ = require('lodash');
var Notification = require('./notification.model');

exports.indexUser = function(req, res) {
  var criteria = {
    forUserName: req.params.username
  };
  Notification.find(criteria)
    .populate('owner')
    .exec( function (err, notifications) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(notifications);
  });
};

// Creates a new notification in the DB.
exports.create = function(req, res) {
  Notification.create(req.body, function(err, notification) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(notification);
  });
};

// Deletes a notification from the DB.
exports.destroy = function(req, res) {
  Notification.findById(req.params.id, function (err, notification) {
    if(err) { return handleError(res, err); }
    if(!notification) { return res.status(404).send('Not Found'); }
    notification.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}