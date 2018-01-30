let Product = require('../models/m_product'),
    Image = require('../models/m_images'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    jimp = require('jimp'),
    path = require('path'),
    cloudinary = require('cloudinary');

let binaryArray = [];
// mongoose.Promise = global.Promise;
if (mongoose.connection.readyState !== 1) {
    mongoose.connect("mongodb://localhost:27017/yousell", {
        useMongoClient: true
    });
} else {
    console.log('Mongo already connected!');
}

cloudinary.config({
    cloud_name: 'yousell',
    api_key: '832867621413362',
    api_secret: 'SMAGDEE8mlxq43bSs4CAlHDpkAA'
});

let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

let productArr = [
    new Product({
        art_name: "WW2",
        art_desc: "Computer Spiel",
        art_price: 59.99,
        art_creator: "stoeger.ste",
        art_category: "EDV",
        date: getTimeNow()
    }),
    new Product({
        art_name: "Playstation4",
        art_desc: "Spielkonsole mit welcher man spielen kann, lolz",
        art_price: 286.42,
        art_creator: "kozica.dam",
        art_category: "Freizeit",
        date: getTimeNow()
    }),
    new Product({
        art_name: "Schulunterlagen",
        art_desc: "Verkaufe Schulbücher (ausgefüllt) und außerdem noch Utensilien wie TR, Federschactel, etc.",
        art_price: 75.00,
        art_creator: "mustermann.max",
        art_category: "Schulunterlagen",
        date: getTimeNow()
    }),
    new Product({
        art_name: "Laptop",
        art_desc: "Verkaufe meinen alten Laptop, alle Schulunterlagen etc sind noch drauf!",
        art_price: 650.93,
        art_creator: "laptop.vke",
        art_category: "EDV",
        date: getTimeNow()
    })
];

console.log(path.resolve(path.join(__dirname, '..(public/images/product_laptop/ww2.jpg')));
let imgPaths = [
    path.resolve(path.join(__dirname, '../public/images/product_ww2/ww2.jpg')),
    path.resolve(path.join(__dirname, '../public/images/product_playstation4/playstation4.png')),
    path.resolve(path.join(__dirname, '../public/images/product_schulunterlagen/schulunterlagen.png')),
    path.resolve(path.join(__dirname, '../public/images/product_laptop/laptop.png'))
];

console.log(imgPaths);

const initialProductArrayLength = productArr.length;
let countWritten = 0;
let imgPath = '../public/images/product_';

for (let i = 0; i < productArr.length; i++) {
    storeUsingCloudinary(i);
}
// fs.readFile(path.join(__dirname, (imgPath + productArr[0].art_name.toLowerCase() + '/' + productArr[0].art_name.toLowerCase() + '.jpg')), (err, data) => {
//     if (err) {
//         console.log(err.stack);
//         throw err;
//     }
//
//     productArr[0].image.contentType = 'image/jpg';
//     productArr[0].image.data = data;
//     console.log(productArr[0]);
// });

// readJPEGImageUsingJimp(productArr[0]);
// productArr.splice(0, 1);
//
// productArr.forEach((item) => {
//     readPNGImageUsingJimp((item));
// });

// let toLastIndex = 1;
// for ( let i = 1; i < productArr.length; i++ ) {
//     console.log(`Path: ${path.join(__dirname, (imgPath + productArr[i].art_name.toLowerCase() + '/' + productArr[i].art_name.toLowerCase() + '.png'))}`);
//     fs.readFile(path.join(__dirname, (imgPath + productArr[i].art_name.toLowerCase() + '/' + productArr[i].art_name.toLowerCase() + '.png')), 'base64', (err, data) => {
//         if (err) {
//             console.log(err.stack);
//             throw err;
//         }
//         if (!data) {
//             console.log('No data was given');
//             throw new Error('Error, no data was given.');
//         }
//
//         productArr[i].image.contentType = 'image/png';
//         productArr[i].image.data = data;
//
//         ++toLastIndex;
//         if ( toLastIndex === productArr.length) {
//             console.log('Gonna store');
//             console.log(`Products: ${productArr}`);
//             storeInDB();
//         }
//     });
// }

function exit() {
    mongoose.disconnect();
    console.log('DB Connection closed.');
}

function storeInDB() {
    console.log('Inside of storeInDB()');
    let counter = 0;
    for (let i = 0; i < binaryArray.length; i++) {
        binaryArray[i].save((err, result) => {
            if (err) {
                console.log(err.stack);
                throw err;
            }

            console.log(`Current product: ${binaryArray[i]}`);
            counter++;

            if (counter === initialProductArrayLength) {
                console.log('Everything written');
                exit();
            }
        });
    }
}

// Trying the same operations as above, yet without using fs, rather using jimp package
function readJPEGImageUsingJimp(currentIndex) {
    console.log('Working on JPG');
    jimp.read(path.join(__dirname, (imgPath + currentIndex.art_name.toLowerCase() + '/' + currentIndex.art_name.toLowerCase() + '.jpg')))
        .then(function (image) {
            image.getBuffer(jimp.MIME_JPEG, (err, result) => {
                if (err) {
                    console.log(`Error @PNGJimp: ${err.stack}`);
                    throw err;
                }

                currentIndex.image.contentType = 'image/jpg';
                currentIndex.image.data = result.toString('base64');
                ++countWritten;
                pushItemBinary(currentIndex);
            });
        }).catch((function (e) {
            console.log(`Error happened: ${e.stack}`);
            throw e;
        })
        );
}

function readPNGImageUsingJimp(currentIndex) {
    console.log('Working on PNG');
    jimp.read(path.join(__dirname, (imgPath + currentIndex.art_name.toLowerCase() + '/' + currentIndex.art_name.toLowerCase() + '.png')))
        .then(function (image) {
            image.getBuffer(jimp.MIME_PNG, (err, result) => {
                if (err) {
                    console.log(`Error @PNGJimp: ${err.stack}`);
                    throw err;
                }

                currentIndex.image.contentType = 'image/png';
                currentIndex.image.data = result.toString('base64');
                ++countWritten;
                pushItemBinary(currentIndex);
            });
        }).catch((function (e) {
            console.log(`Error happened: ${e.stack}`);
            throw e;
        })
        );
}

function pushItemBinary(product_binary) {
    binaryArray.push(product_binary);
    checkIndex();
}

function checkIndex() {
    console.log(`INSIDE CHECKINDEX():\tWritten: ${countWritten}\t\t\tArray: ${binaryArray.length}`);
    if (countWritten === initialProductArrayLength) {
        console.log('.then of .push() works and tells me its equal');
        storeInDB();
    }
}

//
// function compareIndexes() {
//     for (let item in binaryArray) {
//         console.log(`Typeof Item: ${typeof item}`);
//         for ( let i = 0; i < binaryArray.length; i++ ) {
//             console.log(`Compare result: ${Buffer.compare(new Buffer(item), new Buffer(binaryArray[i]))}`);
//             // console.log(`Typeof BinaryArray @Index ${i}: ${typeof binaryArray[i]}`);
//         }
//     }
// }

// Creating those models using cloudinary as image storage
function storeUsingCloudinary(item) {
    productArr[item].save((err, saveResult) => {
        if (err) {
            console.log(`Message: ${err.message}`);
            console.log(`Stack: ${err.stack}`);
            throw err;
        }

        cloudinary.uploader.upload(imgPaths[item], (cloudResult) => {
            if (cloudResult.error) {
                console.log('Error happened @productseeder:223');
                console.error(cloudResult.error.message);
                throw cloudResult.error;
            } else {
                let img = new Image({
                    product: saveResult._id,
                    url: cloudResult.url
                });

                img.save((err, result) => {
                    if (err) {
                        console.log('Error happened trying to save images');
                        throw err;
                    }
                    console.log(result);
                });
            }
        });
    });
}