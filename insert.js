let saveProduct = require('./models/m_product').saveProduct;
let contentArray = require('./content.json');

contentArray.forEach(element => {
    saveProduct(element);
});

