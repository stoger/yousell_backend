let cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'yousell',
    api_key: '832867621413362',
    api_secret: 'SMAGDEE8mlxq43bSs4CAlHDpkAA'
});

// Used to store image using cloudinary
// takes the image path as first parameter
// returns a promise
let saveArrayToCDN = function (array) {
    let itemCount = 0,
        successfulUploaded = [];

    return new Promise((resolve, reject) => {
        for (currentItem of array) {
            let iPath = currentItem.path;

            cloudinary.uploader.upload(iPath, (err, cdnResult) => {
                itemCount++;
                if (err) {
                    reject(err);
                }

                if (!cdnResult) {
                    reject(new Error({
                        'Error-Message': 'Cloudinary result seems to be empty, check out the error message @ Error-Object',
                        'Error-Object': result
                    }));
                }


                successfulUploaded.push(cdnResult);
                if (itemCount === array.length) {
                    console.log('Stored all!');
                    resolve(successfulUploaded);
                }
            })
        }
    });
}

module.exports.saveImageToYouSellCloudinary = saveArrayToCDN;