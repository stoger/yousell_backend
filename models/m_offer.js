let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Product = require('./m_product');

let offerSchema = new Schema({
    productID: { type: String, required: true },
    active: { type: Boolean, required: true }
});

models.exports = mongoose.model('Offer', offerSchema);