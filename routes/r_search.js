let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    jsonArraySort = require('sort-json-array');

let searchProduct = require('../models/m_product').searchProduct,
    listByCategory = require('../models/m_product').searchCategory,
    listByUser = require('../models/m_product').searchUser,
    listByCatAndQuery = require('../models/m_product').listByCatAndQuery;

let findImagesForProduct = require('../models/m_images').findImagesForProduct;

// Home page route.
// Catch all search requests, check if both category and parameter was given first
router.post('/', (req, res, next) => {
    console.log('Im in here, so it should work, i guess');
    let catParamExists = typeof req.body.category,
        searchParamExists = typeof req.body.q;

    console.log(req.body.category);
    console.log(req.body.q);

    console.log(req.body.category !== '' && req.body.q !== '');
    req.body.category !== '' && req.body.q !== ''
        ? listByCatAndQuery(req.body.category, req.body.q)
            .then((categoryQueryResult) => {
                console.log('Looks like it worked!');
                // console.log(categoryQueryResult);

                findImagesForProduct(categoryQueryResult)
                    .then((finalResult) => {
                        console.log(finalResult.length);
                        res.status(200).send({ items: finalResult }).end();
                    }, (err) => {
                        res.status(500).end();
                    });
            }, (catQueryErr) => {
                console.log('error happened, somewhere');
                console.log(catQueryErr);
                if (catQueryErr.document.length === 0)
                    res.status(200).send({ items: catQueryErr.document }).end();
                else if (catQueryErr.err !== null)
                    res.status(500).send({ error: catQueryErr.err }).end();
            })
        : next();
});

// Handle search just by category
router.post('/', (req, res, next) => {
    console.log('in the next one');
    console.log("Category: ", req.body.category);
    if (req.body.category !== '') {
        listByCategory(req.body.category)
            .then((result) => {
                findImagesForProduct(result)
                    .then((finalResult) => {
                        res.status(200).send({ items: final }).end();
                    }, (err) => {
                        res.status(500).end();
                    });
            }, (err) => res.status(500).send({ msg: 'Something went wrong, see appended error...', data: err, items: [] }).end());
    } else {
        next();
    }
});

// Search just for input text, if this also fails, reject fully
router.post('/', (req, res) => {
    console.log("Query: ", req.body.q);
    if (req.body.q !== '') {
        console.log('Performing simple search query');
        searchProduct(req.body.q).then((result) => {
            findImagesForProduct(result)
                .then((finalResult) => {
                    findImagesForProduct(result)
                        .then((finalResult) => {
                            res.status(200).send({ items: finalResult }).end();
                        }, (err) => {
                            res.status(500).end();
                        });
                }, (err) => {
                    res.status(500).end();
                });
        }, (err) => res.status(500).send(err)).end();
    } else {
        res.status(404).end('Query was not given, no actions performed.');
    }
});

// Handle search just by user
router.post('/user', (req, res) => {
    console.log('and in the last one');
    if (req.body.user !== '') {
        console.log('fetching products by user');
        listByUser(req.body.user)
            .then((queryResult) => {
                findImagesForProduct(queryResult)
                    .then((finalResult) => {
                        res.status(200).send({ items: finalResult }).end();
                    }, (err) => {
                        res.status(500).end();
                    });
            }, (err) => {
                console.log(err);
                res.status(500).send({ msg: 'Something went wrong trying to fetch items by user...', data: err, items: [] })
            });
    } else
        res.status(404).end('Query was not given, no actions performed.');
});

module.exports = router;