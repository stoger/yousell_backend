let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    jsonArraySort = require('sort-json-array');

let searchProduct = require('../models/m_product').searchProduct;

// Home page route.
router.get('/', function (req, res) {
    searchProduct(req.query.q).then(function (result) {
        res.status(200).send(result);
    });
});

module.exports = router;
