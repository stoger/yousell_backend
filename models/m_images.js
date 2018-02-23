let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId;


// Schema Definition: Shows how our Image object is built and saved inside the MongoDB
let imageSchema = new Schema({
    product: { type: Schema.Types.ObjectId, required: true },
    url: [{ type: String, required: true }],
});

// Model definition
let imageModel = mongoose.model('Image', imageSchema, 'images');


// Some helper functions
let checkForMatches = function (doc) {
    return this[0].product.equals(doc._id);
};

function remove(array, element) {
    return array.filter(e => e !== element);
}


// Exported functions to query anything against Images

// Searches for Images, takes query result of Searching Products as input
// Eventually returns given Products together with their images
let findImagesForProduct = function (productQueryResult) {
    let counter = 0,
        finishedOffers = [],
        objectIdNotMatching = [];

    return new Promise((resolve, reject) => {
        productQueryResult.forEach((item) => {
            imageModel.find({ product: new ObjectId(item._id) }, (err, doc) => {
                if (err) {
                    reject(err);
                }

                if (!doc) {
                    reject({
                        'Error-Message': 'Document returned empty!',
                        'Error-Object': doc
                    });
                }

                if (item._id.equals(doc[0].product)) {
                    finishedOffers.push({
                        _id: item._id,
                        art_name: item.art_name,
                        art_desc: item.art_desc,
                        art_price: item.art_price,
                        art_creator: item.art_creator,
                        art_category: item.art_category,
                        date: item.date,
                        img: doc[0].url
                    });
                } else {
                    objectIdNotMatching.push(doc);
                }


                ++counter;

                if (counter === productQueryResult.length) {
                    if (objectIdNotMatching.length > 0) {
                        objectIdNotMatching.forEach((itemUnmatched) => {
                            let matching = productQueryResult.find(checkForMatches, itemUnmatched);

                            if (matching) {
                                if (typeof matching != "undefined") {
                                    finishedOffers.push({
                                        _id: matching._id,
                                        art_name: matching.art_name,
                                        art_desc: matching.art_desc,
                                        art_price: matching.art_price,
                                        art_creator: matching.art_creator,
                                        art_category: matching.art_category,
                                        date: matching.date,
                                        img: itemUnmatched[0].url
                                    });
                                    objectIdNotMatching = remove(objectIdNotMatching, itemUnmatched);
                                }
                            }
                        });
                    }

                    if (objectIdNotMatching.length === 0) {
                        resolve(finishedOffers);
                    } else {
                        reject({
                            msg: 'Looking for matching images in your database resulted in an error!',
                            matchedData: finishedOffers,
                            unmatchedData: objectIdNotMatching
                        });
                    }
                }
            });
        });

    });
};

// Saves an Image to the MongoDB
// takes the product's id as well as all images for this certain product as arugments
// returns the finished images as promise
let saveImageWithProduct = function (prodID, images) {
    let counter = 0;
    let dataArr = [];

    let storeImages = new imageModel({
        product: prodID,
        url: images
    });

    return new Promise((resolve, reject) => {
        return storeImages.save((err, result) => {
            if (err) {
                ;
                reject(err);
            }

            if (!result) {
                reject({
                    'Error-Message': 'Trying to store an image in the database resulted in an error, see more @ Error-Object',
                    'Error-Object': result
                });
            }

            resolve(dataArr);
        })
    });
};

module.exports = imageModel;
module.exports.findImagesForProduct = findImagesForProduct;
module.exports.saveImageToProduct = saveImageWithProduct;