'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  text: String,
  forUserName: String,
  created:  Date
});

module.exports = mongoose.model('Notification', NotificationSchema);