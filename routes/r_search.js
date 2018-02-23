let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    jsonArraySort = require('sort-json-array');

let searchProduct = require('../models/m_product').searchProduct,
    listByCategory = require('../models/m_product').searchCategory,
    listByUser = require('../models/m_product').searchUser,
    listByCatAndQuery = require('../models/m_product').listByCatAndQuery;

// Home page route.
router.post('/', (req, res, next) => {
    let catParamExists = typeof req.query.category,
        searchParamExists = typeof req.query.q;

    catParamExists !== 'undefined' && searchParamExists !== 'undefined'
        ? listByCatAndQuery(req.query.category, req.query.q)
            .then((categoryQueryResult) => {
                console.log('Looks like it worked!');
                console.log(categoryQueryResult);
                res.status(200).send({ items: categoryQueryResult }).end();
            }, (catQueryErr) => {
                if (catQueryErr.data.length === 0)
                    res.status(200).send({ items: catQueryErr.data }).end();
                else if (catQueryErr.err !== null)
                    res.status(500).send({ error: catQueryErr.err }).end();
            })
        : next();
});

router.get('/', (req, res, next) => {
    if (typeof req.query.category !== 'undefined') {
        listByCategory(req.query.category, req.query.page)
            .then((result) => res.status(200).send({ items: result }).end(),
                (err) => res.status(500).send({ msg: 'Something went wrong, see appended error...', data: err, items: [] }).end());
    } else {
        next();
    }
});

router.get('/', (req, res, next) => {
    if (typeof req.query.user !== 'undefined') {
        console.log('fetching products by user');
        console.log(req.query.user);
        listByCategory(req.query.user)
            .then((queryResult) => {
                res.status(200).send({ items: queryResult }).end();
            }, (err) => {
                res.status(500).send({ msg: 'Something went wrong trying to fetch items by user...', data: err, items: [] })
            });
    } else
        next();
});

router.get('/', (req, res) => {
    if (typeof req.query.q !== 'undefined') {
        console.log('Performing simple search query');
        searchProduct(req.query.q, req.query.page).then(function (result) {
            res.status(200).send(result);
        }, (err) => res.status(500).send(err));
    } else {
        res.status(500).end('Query was not given, no actions performed.');
    }
});

module.exports = router;
