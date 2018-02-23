let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    cloudinary = require('cloudinary'),
    jsonArraySort = require('sort-json-array'),
    multer = require('multer'),
    autoreap = require('multer-autoreap'),
    crypto = require('crypto'),
    ObjectId = mongoose.Types.ObjectId;

// Autoreap automatically deletes files which were temporarily stored by multer (in multer's destination)
autoreap.options = {
    reapOnError: true
};

router.use(autoreap);

// Own files and variables
let Products = require('../models/m_product'),
    Images = require('../models/m_images'),
    SaveCDN = require('../models/saveCloudinary').saveImageToYouSellCloudinary;

// Methods for querying in Products or Images models
// Implementing all methods connected to the Product model
let findAllItemsAsProducts = require('../models/m_product').findProductsSortByDate,
    saveProductToDb = require('../models/m_product').saveProduct;

// Implementing all methods connected to the Images model
let findAllImagesForItems = require('../models/m_images').findImagesForProduct,
    saveImagesWithProduct = require('../models/m_images').saveImageToProduct;

const FILE_LIMIT = 10,
    PRODUCTS_PER_PAGE = 12;

// Define storage for multer, will be reaped automatically upon finishing processing request
let storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return callback(err);

            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

// Trying to rewrite this into supporting promises, and spreading those across all models
router.post('/', (req, res) => {
    // let RALF know about pagenum parameter!!!!!!
    let amountToSkip = ((req.body.pagenum) * PRODUCTS_PER_PAGE) || 0;

    findAllItemsAsProducts(amountToSkip, PRODUCTS_PER_PAGE)
        .then((itemQueryResult) => {
            return new Promise((resolve, reject) => {
                findAllImagesForItems(itemQueryResult)
                    .then((itemsWithImages) => resolve(itemsWithImages))
                    .catch((failedItems) => reject(failedItems));
            });
        })
        .then((finishedOffers) => {
            let itemsObj = jsonArraySort(finishedOffers, 'date')

            res.setHeader('Content-Type', 'application/json');
            res.json({
                Items: itemsObj
            });
        })
        .catch((e) => {
            console.log(e);
            res.setHeader('Content-Type', 'application/json');
            res.status(500).end(JSON.stringify({
                Error: 'Seems like not all images were matched!',
                Items: e
            }));
        });
});

// Add a new product to the database
router.post('/add', multer({ storage: storage }).array('images', FILE_LIMIT), (req, res, next) => {
    if (!req.files) {
        console.log('Inside of files');
        if (req.body.images) {
            console.log('inside another if');
            req.files = req.body.images;
            console.log(req.files);
        } else {
            console.log('Rejecting because of no images');
            console.log(req.body.images);
            res.writeHead(500, { 'Content-Type': 'application-json' });
            res.end(JSON.stringify({
                'Error': 'File upload failed'
            }));
        }
    }

    console.log(req.files);

    if (req.body.price.includes(',')) {
        req.body.price = req.body.price.replace(",", ".");
    }

    let currentProduct = {
        name: req.body.product,
        desc: req.body.description,
        price: req.body.price,
        user: req.body.user,
        category: req.body.category,
        date: getTimeNow()
    },
        imagesStoredCDN = [];

    saveProductToDb(currentProduct)
        .then((data) => {
            return new Promise((resolve, reject) => {
                for (let item of req.files) {
                    SaveCDN(item.path, item.url)
                        .then((storedImage) => {
                            storedItems = [];
                            // imagesStoredCDN.push(storedImage);
                            storedItems.push(storedImage);
                            // console.log('Image was stored');

                            // if (imagesStoredCDN.length === req.files.length) {
                            if (storedItems.length === req.files.length) {
                                // console.log('All images were stored');
                                // return Promise.resolve(imagesStoredCDN);
                                return Promise.resolve(storedItems);
                            }
                        }, (err) => {
                            console.log('Error trying to store images...');
                            return Promise.reject();
                        })
                        .then((finishedWithImages) => {
                            console.log('Should have all uploaded images now!');
                            console.log(finishedWithImages);
                            let mappedUrls = finishedWithImages.map(x => {
                                console.log(x);
                                return x.url;
                            });

                            return saveImagesWithProduct(data._id, mappedUrls)
                                .then((workedOut) => {
                                    console.log('Seems like storing the finished product worked out');
                                    return Promise.resolve(workedOut);
                                })
                                .catch((e) => {
                                    console.log('Seems like storing the finished product did not work out');
                                    return Promise.reject(e);
                                });
                        }, (loc_err) => {
                            console.log('Error haooened in items.js route file, ~line 140-150');
                            return Promise.reject(loc_err);
                        });
                }
            });
        }, (err) => {
            console.log('Error happened when trying to save product..');
        })
        .then((endResult) => {
            console.log('Entered the very last then, underneath is the final result!');
            console.log(endResult);
            let productStored = JSON.parse(currentProduct);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                saved: productStored
            }));
        }, (e) => {
            console.log('Entered the very last catch, underneath the final error!');
            console.log(e);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                Error: 'Unfortunately, it seems that saving the product and images connected to it failed!',
                msg: e
            }));
        });
});

module.exports = router;