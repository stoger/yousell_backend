let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let productSchema = new Schema({
    art_name: { type: String, required: true, limit: 50 },
    art_desc: { type: String, required: true, limit: 400 },
    art_price: { type: Number, required: true },
    art_creator: { type: String, required: true, limit: 50 },
    art_category: { type: String, required: true },
    date: { type: String, required: true }
});

let productModel = mongoose.model('Product', productSchema, 'products');

// Searches the Database for elemts which will be mainly used for the site's main page
// Takes the amount of elemts to skip as parameter
// Returns a promise which will be handled @ spot of use itself
let listElements_SortByDate = function (skipping) {
    return new Promise((resolve, reject) => {
        productModel.find({}, (err, prod_doc) => {
            if (err) {
                reject(err);
            }

            if (!prod_doc) {
                reject(new Error({
                    'Error-Message': 'Trying to fetch products resulted in an empty result, better check the error object',
                    'Error-Object': prod_doc
                }));
            }

            resolve(prod_doc);
        }).sort({ date: -1 }).limit(skipping);
    });
};

// Saves a new Product to the database
// Takes a JSON-Object including all parameters for the model
// Returns Promise on finishing
let saveNewProductOffer = function (model_params) {
    let productInsertion = new productModel({
        art_name: model_params.name,
        art_desc: model_params.desc,
        art_price: model_params.price,
        art_creator: model_params.user,
        art_category: model_params.category,
        date: model_params.date
    });

    return new Promise((resolve, reject) => {
        productInsertion.save((err, result) => {
            return new Promise((resolve, reject) => {
                if (err) {
                    reject(err);
                }

                if (!result) {
                    reject(new Error({
                        'Error-Message': 'Seems like trying to save a document ended up in a failure!\nSee the object attached @ .Error-Object to find out which object crashed to find in your DB!',
                        'Error-Object': result
                    }));
                }

                resolve(result);
            });
        })
            .then((savePositive) => resolve(savePositive))
            .catch((saveFailed) => reject(saveFailed));
    });
};

module.exports = productModel;
module.exports.findProductsSortByDate = listElements_SortByDate;
module.exports.saveProduct = saveNewProductOffer;