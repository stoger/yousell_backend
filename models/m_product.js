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
let listElements_SortByDate = (skipping, displayLimit) => {
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
        }).sort({ date: -1 }).skip(skipping).limit(displayLimit);
    });
};

let listElementsByDate = () => {
    return new Promise((resolve, reject) => {
        return productModel.find({}, (err, doc) => {
            if (err) {
                reject(err);
            }

            if (!doc) {
                reject(doc);
            }

            resolve(doc);
        }).sort({ date: -1 });
    });
};

// Saves a new Product to the database
// Takes a JSON-Object including all parameters for the model
// Returns Promise on finishing
let saveNewProductOffer = (model_params) => {
    let productInsertion = new productModel({
        art_name: model_params.name,
        art_desc: model_params.desc,
        art_price: model_params.price,
        art_creator: model_params.user,
        art_category: model_params.category,
        date: model_params.date
    });

    return new Promise((resolve, reject) => {
        return productInsertion.save((err, result) => {
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
    });
};

let searchProduct = (queryString) => {
    let art_name_query = { "art_name": { $regex: queryString, $options: "i" } },
        art_desc_query = { "art_desc": { $regex: queryString, $options: "i" } };

    return new Promise((resolve, reject) => {
        return productModel.find({ $or: [art_name_query, art_desc_query] }, (err, prod_doc) => {
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
        }).sort({ date: -1 });
    });

    let name_query = { "art_name": { $regex: inputString, $options: "i" } },
        description_query = { "art_desc": { $regex: inputString, $options: "i" } };
    return productModel.find({ $or: [name_query, description_query] });
}

let fetchByCategory = (category) => {
    let cat_query = { 'category': { $regex: category, $options: 'i' } };

    return new Promise((resolve, reject) => {
        return productModel.find({ category: cat_query }, (err, doc) => {
            if (doc.length === 0 || !doc || err) {
                reject({ location: 'fetchByCategory', err: err, data: doc });
            }

            resolve(doc);
        });
    });
};

let fetchByCategoryAndQuery = (category, query) => {
    let catQuery = { 'art_category': { $regex: category, $options: 'i' } },
        art_name_query = { 'art_name': { $regex: query, $options: 'i' } },
        art_desc_query = { 'art_desc': { $regex: query, $options: 'i' } };

    return new Promise((resolve, reject) => {
        return productModel.find().and(
            [
                catQuery, {
                    $or: [
                        art_desc_query, art_name_query
                    ]
                }
            ]
        ).sort({ date: -1 }).exec((err, doc) => {
            if (doc.length === 0 || !doc || err) {
                reject({ location: 'fetchByCategoryAndQuery', err: err, document: doc });
            }

            resolve(doc);
        });
    });
};

let fetchByUser = (username) => {
    return new Promise((resolve, reject) => {
        return productModel.find({ art_creator: { $regex: username, $options: 'i' } },  (err, doc) => {
            if (doc.length === 0 || !doc || err) {
                reject({ location: 'fetchByUser', err: err, data: doc });
            }

            resolve(doc);
        });
    });
};

let countAllProducts = () => {
    return new Promise((resolve, reject) => {
        return productModel.count({}, (err, count) => {
            if (err) {
                reject({ location: 'countAllProducts', err: err });
            }

            resolve(count);
        });
    });
}

module.exports = productModel;
module.exports.searchProduct = searchProduct;
// module.exports.findProductsSortByDate = listElements_SortByDate;
module.exports.findProductsSortByDate = listElementsByDate;
module.exports.saveProduct = saveNewProductOffer;
module.exports.searchCategory = fetchByCategory;
module.exports.searchUser = fetchByUser;
module.exports.listByCatAndQuery = fetchByCategoryAndQuery;
module.exports.countAllProducts = countAllProducts;