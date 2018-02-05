let saveProduct = require('../models/m_product').saveProduct;
let contentArray = require('./content.json');
var i = 0;

Promise.all(
contentArray.forEach(element => {
    //console.log(element);
    //console.log('i: ' + i++);
    saveProduct(element)
    .then((res) => {
        console.log("Item should be inserterd")
        console.log(res);
    })
    .catch((e) => {
        console.log('Error happened trying to insert');
        console.log(e);
    });
})
);
