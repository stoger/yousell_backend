let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    cloudinary = require('cloudinary'),
    jsonArraySort = require('sort-json-array'),
    multer = require('multer'),
    autoreap = require('multer-autoreap'),
    crypto = require('crypto'),
    ObjectId = mongoose.Types.ObjectId,
    multiparty = require('multiparty');

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

/**
 * @api {post} /main Abfragen aller existierenden, aktiven Produkte
 * @apiName Show all products
 * @apiGroup Products
 * 
 * @apiSuccess Items {Object} Enthält alle aktiven Produkte, welche im Frontend angezeigt werden
 *
 * @apiError Error {String} Enthält einen Error-Code welcher angezeigt werden kann
 * 
 */
// Trying to rewrite this into supporting promises, and spreading those across all models
router.post('/', (req, res) => {
    findAllItemsAsProducts()
        .then((itemQueryResult) => {
            console.log('First was resolved!');
            return new Promise((resolve, reject) => {
                findAllImagesForItems(itemQueryResult)
                    .then((itemsWithImages) => {
                        console.log('Second was resolved');
                        resolve(itemsWithImages)
                    })
                    .catch((failedItems) => reject(failedItems));
            });
        })
        .then((finishedOffers) => {
            console.log('Returning within then');
            let itemsObj = jsonArraySort(finishedOffers, 'date')

            res.setHeader('Content-Type', 'application/json');
            res.json({
                Items: itemsObj
            });
        })
        .catch((e) => {
            console.log(e);
            console.log('Returning w/ error for searching products!');
            res.setHeader('Content-Type', 'application/json');
            res.status(500).end(JSON.stringify({
                Error: 'Seems like not all images were matched!',
                Items: e
            }));
        });
});

// Add a new product to the database
/** 
 * @api {post} /main/add Neues Produkt hinzufügen
 * @apiName Add Product
 * @apiGroup Product
 * 
 * @apiParam {String} product Enthält den Namen des neuen Produkts
 * @apiParam {String} desc Enthält eine genauere Beschreibung des neuen Produkts
 * @apiParam {Double} price Beschreibt den Preis des Produkts, welcher vom Verkäufer festgelegt wird
 * @apiParam {String} user Ersteller des neuen Produkts
 * @apiParam {String} category Kategorie welches für das neue Produkt eingestellt wurde
 * 
 * @apiSuccess success {Boolean} true
 * @apiError success {Boolean} false
 * 
 * @apiParamExample {json} Request payload example
 * {
 *  "product": "Testproduct",
 *  "desc": "API-Description",
 *  "price": "15.02",
 *  "user": "mustermann.max",
 *  "category": "Nachhilfe"
 *  "files": [Files]
 * }
 */
router.post('/add', multer({
    storage: storage
}).array('images', FILE_LIMIT), (req, res, next) => {
    if (!req.files) {
        if (req.body.images) {
            req.files = req.body.images;
        } else {
            res.writeHead(500, {
                'Content-Type': 'application-json'
            });
            res.end(JSON.stringify({
                'Error': 'File upload failed',
                success: false
            }));
        }
    }

    if (req.body.price.includes(',')) {
        req.body.price = req.body.price.replace(",", ".");
    }

    let currentProduct = {
        name: req.body.product,
        desc: req.body.desc,
        price: req.body.price,
        user: req.body.user,
        category: req.body.category,
        date: getTimeNow()
    },
        imagesStoredCDN = [];

    saveProductToDb(currentProduct)
        .then((data) => {
            // return new Promise((resolve, reject) => {
            //     for (let item of req.files) {
            //         SaveCDN(item.path)
            //             .then((storedImage) => {
            //                 storedItems = [];
            //                 // imagesStoredCDN.push(storedImage);
            //                 storedItems.push(storedImage);
            //                 // console.log('Image was stored');

            //                 // if (imagesStoredCDN.length === req.files.length) {
            //                 if (storedItems.length === req.files.length) {
            //                     console.log('Stored length: ', storedItems.length);
            //                     console.log('File length: ', req.files.length);
            //                     // console.log('All images were stored');
            //                     // return Promise.resolve(imagesStoredCDN);
            //                     return Promise.resolve(storedItems);
            //                 }
            //             }, (err) => {
            //                 console.log('Error trying to store images...');
            //                 return Promise.reject();
            //             })
            // .then((finishedWithImages) => {
            //     console.log('Entered second .then() block');
            //     console.log(finishedWithImages);
            //     let mappedUrls = finishedWithImages.map(x => {
            //         console.log('Mapping, cur Value: ', x);
            //         return x.url;
            //     });

            //     return saveImagesWithProduct(data._id, mappedUrls)
            //         .then((workedOut) => {
            //             console.log('Seems like storing the finished product worked out');
            //             return Promise.resolve(workedOut);
            //         })
            //         .catch((e) => {
            //             console.log('Seems like storing the finished product did not work out');
            //             return Promise.reject(e);
            //         });
            // }, (loc_err) => {
            //     console.log('Error haooened in items.js route file, ~line 140-150');
            //     return Promise.reject(loc_err);
            // });
            //     }
            // });
            return new Promise((resolve, reject) => {
                SaveCDN(req.files)
                    .then((finishedWithImages) => {
                        let mappedUrls = finishedWithImages.map(x => {
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
                    }).then(works => resolve(works), e => reject(e));
            });
        }, (err) => {
            reject(err);
        })
        .then((endResult) => {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                success: true
            }));
        }, (e) => {
            res.writeHead(500, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                Error: 'Unfortunately, it seems that saving the product and images connected to it failed!',
                msg: e,
                success: false
            }));
        });
});

module.exports = router;