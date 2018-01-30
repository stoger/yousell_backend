/*
    Senden/Anzeigen der Produkte nach Aufruf von /main
    evt Routen spezifizieren auf /offers/all oder ähnliches

    Funktionalitäten sollten soweit erfasst sein.
 */
// NPM Modules
let express = require('express'),
    mongoose = require('mongoose'),
    router = express.Router(),
    path = require('path'),
    cloudinary = require('cloudinary').v2,
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
    Images = require('../models/m_images');

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

// add .skip() to skip the first n elements (for pages, skipping first 9 for page 2, etc)
router.get('/', (req, res) => {
    let amountToSkip = ((req.body.seitenzahl) * PRODUCTS_PER_PAGE) || PRODUCTS_PER_PAGE;

    Products.find({}, (err, result) => {
        if (err) {
            console.error(`Error happened @ r_items.js:30 (get / route), Products.find()`);
            console.error(err.message);
            console.error(err.stack);
            throw err;
        }
    }).sort({ date: -1 }).limit(amountToSkip).then((queryResult) => {
        let counter = 0;
        let offers = [];
        let objectIdNotMatching = [];


        queryResult.forEach((item) => {
            Images.find({ product: new ObjectId(item._id) }, (err, images) => {
                if (err) {
                    console.error(`Error happened @ r_items.js:30 (get / route), Images find()`);
                    console.error(err.message);
                    console.error(err.stack);
                    throw err;
                }

                if (item._id.equals(images[0].product)) {
                    offers[counter] = {
                        _id: item._id,
                        art_name: item.art_name,
                        art_desc: item.art_desc,
                        art_price: item.art_price,
                        art_creator: item.art_creator,
                        art_category: item.art_category,
                        date: item.date,
                        img: images[0].url
                    };
                    ++counter;
                } else {
                    objectIdNotMatching = {
                        img_objectId: images[0].product
                    };
                }

                if (counter === queryResult.length) {
                    if (objectIdNotMatching.length > 0) {
                        let counter = -1;
                        let test = offers.find((item) => {
                            ++counter;
                            if (item._id.toString() === objectIdNotMatching[counter].img_objectId.toString()) {
                                item.img = objectIdNotMatching.url;
                                return true;
                            } else {
                                return false;
                            }
                        });
                    }

                    // console.log(jsonArraySort(offers, 'date', 'des'));
                    res.json(jsonArraySort(offers, 'date', 'des'));
                }
            });
        });
    });
});

router.post('/add', multer({ storage: storage }).array('images[]', FILE_LIMIT), (req, res, next) => {
    if (!req.files) {
        res.send({ "Error": "File upload failed" });
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
        };

        let imgArray = [];
        let fileCount = req.files.length;
        let storedInArrayCounter = 0;

        let storeImagesFinal = function (p_id, imgs) {
            let productImage = new Images({
                product: p_id,
                url: imgs
            });

            productImage.save((err, imageResult) => {
                if (err) {
                    console.error(`Error happened when trying to store new image in mongodb @r_items.js in /add post route!`);
                    console.error(err.message);
                    console.error(err.stack);
                    return next(err);
                }

                if (imageResult) {
                    res.send({ success: true });
                }
            });
        };

        current.save((err, productResult) => {
            if (err) {
                console.error(`Error happened when trying to store new product @r_items.js in /add post route!`);
                console.error(err.message);
                console.error(err.stack);
                return next(err);
            }

            for (let image of req.files) {
                cloudinary.uploader.upload(image.path, (err, cloudinaryResult) => {
                    if (err) {
                        console.error("Error trying to store image using cloudinary!");
                        return next(err);
                    }

                    if (!cloudinaryResult) {
                        console.error("Result from uploading to cloudinary is empty!");
                        return next(new Error("Cloudinary Result is empty"));
                    }

                    ++storedInArrayCounter;
                    imgArray.push(cloudinaryResult.url);


                    if (storedInArrayCounter === fileCount)
                        storeImagesFinal(productResult._id, imgArray);
                });
            }
        });
    }
});

module.exports = router;