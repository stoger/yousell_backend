let bluebird = require('bluebird');

let writeHello = function () {
    console.log("Hello");

    return new Promise((resolve) => {
        resolve();
    });
};

let writeWorld = () => {
    console.log('World!');
    throw new Error("Finally an error…");
    // return new Promise((resolve, reject) => {
    //     reject(new Error('Just testing this!'));
    // });
};


bluebird.promisify(writeHello);
// try {
    writeHello()
        .then(() => writeWorld())
        .then(() => console.log('This shiet is finished!'))
        .catch((e) => { console.log('Error happened!'); console.log(e); });
// } catch (e) {
//     console.log('But now dat matafucking error is caught?!');
//     console.log(e);
// }
