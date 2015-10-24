'use strict';

var express = require('express');
var controller = require('./book.controller');

var router = express.Router();

router.get('/free', controller.indexFree);
router.get('/owner/:id', controller.indexOwner);
router.get('/requestedin/:id', controller.indexRequestedIn);
router.get('/requestedout/:id', controller.indexRequestedOut);
router.get('/lendedIn/:id', controller.indexLendedIn);
router.get('/lendedOut/:id', controller.indexLendedOut);

router.get('/book/:id', controller.show);
router.get('/search/:keyword', controller.search);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;