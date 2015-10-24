'use strict';

var express = require('express');
var controller = require('./notification.controller');

var router = express.Router();

router.get('/foruser/:username', controller.indexUser);

router.post('/', controller.create);
router.delete('/:id', controller.destroy);

module.exports = router;