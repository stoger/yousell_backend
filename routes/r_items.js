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


cloudinary.config({
    cloud_name: 'yousell',
    api_key: '832867621413362',
    api_secret: 'SMAGDEE8mlxq43bSs4CAlHDpkAA'
});

if (mongoose.connection.readyState !== 1) {
    mongoose.connect('mongodb://localhost:27017/yousell', {
        useMongoClient: true
    });
}

// Trying to rewrite this into supporting promises, and spreading those across all models
router.post('/', (req, res) => {
    // let RALF know about pagenum parameter!!!!!!
    let amountToSkip = ((req.body.pagenum) * PRODUCTS_PER_PAGE) || PRODUCTS_PER_PAGE;

    findAllItemsAsProducts(amountToSkip)
        .then((itemQueryResult) => {
            return new Promise((resolve, reject) => {
                findAllImagesForItems(itemQueryResult)
                    .then((itemsWithImages) => resolve(itemsWithImages))
                    .catch((failedItems) => reject(failedItems));
            });
        })
        .then((finishedOffers) => {
            let test = jsonArraySort(finishedOffers, 'date')

            res.setHeader('Content-Type', 'application/json');
            res.json({
                Items: test
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

router.post('/add', multer({ storage: storage }).array('images[]', FILE_LIMIT), (req, res, next) => {
    if (!req.files) {
        res.writeHead(500, { 'Content-Type': 'application-json' });
        res.end(JSON.stringify({
            'Error': 'File upload failed'
        }));
    } else {
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
                                imagesStoredCDN.push(storedImage);

                                return new Promise((resolve, reject) => {
                                    if (imagesStoredCDN.length === req.files.length) {
                                        resolve(imagesStoredCDN);
                                    }
                                });
                            })
                            .then((finishedWithImages) => {
                                let testArr = [];

                                for (let element of finishedWithImages) {
                                    testArr.push(element.url);
                                }

                                saveImagesWithProduct(data._id, testArr)
                                    .then((workedOut) => {
                                        console.log('Images resolved you');
                                        resolve(workedOut);
                                    })
                                    .catch((e) => {
                                        console.log('Images rejected you');
                                        reject(e);
                                    });
                            })
                            .catch((loc_err) => {
                                reject(loc_err);
                            });
                    }
                });
            })
            .then((endResult) => {
                let productStored = JSON.parse(currentProduct);
                console.log(productStored);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    saved: productStored
                }));
            })
            .catch((e) => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    Error: 'Unfortunately, it seems that saving the product and images connected to it failed!',
                    msg: e
                }));
            });
    }
});

module.exports = router;