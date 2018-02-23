let cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'yousell',
    api_key: '832867621413362',
    api_secret: 'SMAGDEE8mlxq43bSs4CAlHDpkAA'
});

// Used to store image using cloudinary
// takes the image path as first parameter
// returns a promise
let saveImageToCDN = function (iPath) {
    return new Promise((resolve, reject) => {
        return cloudinary.uploader.upload(iPath, (err, cdnResult) => {
            if (err) {
                // console.log('Should be rejecting!');
                reject(err);
            }

            if (!cdnResult) {
                // console.log('Should be rejecting!');
                reject(new Error({
                    'Error-Message': 'Cloudinary result seems to be empty, check out the error message @ Error-Object',
                    'Error-Object': result
                }));
            }

            // console.log('Should be resolving');
            resolve(cdnResult);
        })
        // console.log('didnt resolve....');
    });

};

module.exports.saveImageToYouSellCloudinary = saveImageToCDN;