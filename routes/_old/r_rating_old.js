/*
    Reacts to routes that start with /rate for now

    Definitely gotta fix responses, particularly for /:user/:rating route!
*/

let express = require('express'),
    router = express(),
    math = require('mathjs'),
    bluebird = require('bluebird');

let Rating = require('../models/m_rating');

bluebird.promisifyAll(Rating);


// Add cb value to callback, replace all return with cb()
let checkIfExistsInDB = function (user, cb) {
    Rating.find({ "username": user }, (err, result) => {
        if (err) {
            // console.log('Should return err, null from checkIfExistsInDB()');
            return cb(err, null);
        }

        if (!result || result.length === 0) {
            // console.log('Should return "empty result", null from checkIfExistsInDB()');
            return cb("empty result", null);
        }

        // console.log('Should return null, result from checkIfExistsInDB()');
        return cb(null, result);
    });
};

let createNewInDB = (user, rating, cb) => {
    let rateUser = new Rating({
        username: user,
        _1: rating === "1" ? rating : 0,
        _2: rating === "2" ? rating : 0,
        _3: rating === "3" ? rating : 0,
        _4: rating === "4" ? rating : 0,
        _5: rating === "5" ? rating : 0,
        count: 1
    });

    rateUser.save((err, result) => {
        if (err) {
            // console.log('Error happened when trying to save new document in createNewInDB');
            // console.error(err);
            cb(err, null);
        }

        if (!result) {
            // console.log('Something is wrong with the result of the query in createNewInDB, please excuse…');
            // console.log(result);
            cb(new Error('Result is broken :/'), null);
        }

        // console.log('Looks good to me, nothing should have gone wrong in createNewInDB, m8!');
        // console.log(result);
        cb(null, result);
    });
};

let updateRatingInDB = (user, rating, cb) => {
    Rating.findOneAndUpdate({ 'username': user }, (err, doc) => {
        if (err) {
            // console.log('Error happened when trying to update document in updateRatingInDB');
            // console.error(err);
            return cb(err, null);
        }

        if (!doc) {
            // console.log('Something is wrong with the result of the query inupdateRatingInDB, please excuse…');
            // console.log(result);
            return cb(new Error('Result is broken :/'), null);
        }

        switch (rating) {
            case 1:
                console.log('Rating was 1, Boooooi!');
                doc._1 += 1;
                doc.count += 1;
                break;
            case 2:
                console.log('Rating was 2, Boooooi!');
                doc._2 += 1;
                doc.count += 1;
                break;
            case 3:
                console.log('Rating was 3, Boooooi!');
                doc._3 += 1;
                doc.count += 1;
                break;
            case 4:
                console.log('Rating was 4, Boooooi!');
                doc._4 += 1;
                doc.count += 1;
                break;
            case 5:
                console.log('Rating was 5, Boooooi!');
                doc._5 += 1;
                doc.count += 1;
                break;
            default:
                break;
        }

        doc.save((err, savedDocument, affectedRows) => {
            if (err) {
                return cb(err, null);
            }

            if (affectedRows === 0) {
                return cb(new Error('No entry was updated..'), null);
            }

            return cb(null, savedDocument);
        }).then(() => { return cb(null, doc); });
    });
};

router.get('/:user/:rating', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    checkIfExistsInDB(req.params.user, (err, result) => {
        console.log(result === null ? "Result is null…" : "Result is not null!");
        console.log(err === null ? "Error is null!" : "Error is not null…");

        console.log((result === null || err !== null) ? "Should enter IF!" : "Should not enter IF!");
        console.log((result !== null && err === null) ? "Should enter ELSE!" : "Should not enter ELSE!");

        if (result === null || err !== null) {
            console.log('Entered IF!');

            createNewInDB(req.params.user, req.params.rating, (err, inserted) => {
                console.log('Inside of createNewInDB Callback now!');
                console.log(err);
                console.log(inserted);

                if (err) {
                    console.log('Last handler in route itself, failed…');
                    return next(err);
                }

                if (!inserted) {
                    console.log('Didnt get inserted, as it seems… Route over and out');
                    return next(new Error('Seems like your database is broken, for whatever reason!'));
                }

                console.log('Thanks request, youre sent back!');
                res.status(200).send(JSON.stringify({
                    success: true,
                    Location: "If",
                    Error: err,
                    Result: result
                }));
            });
        } else if (result !== null && err === null) {
            console.log('Entered ELSE!');

            updateRatingInDB(req.params.user, req.params.rating, (err, result) => {
                if (err) {
                    return next(err);
                }

                if (!result) {
                    return next(new Error('Fick dei leben du spasd'));
                }

                console.log('Thanks request, youre sent home!');

                res.status(200).send(JSON.stringify({
                    Location: "Else",
                    Error: err,
                    Result: result
                }));
            });
        } else {
            res.status(500).send(JSON.stringify({ Result: "Nothing was found" }));
        }
    });
});
// let createNewInDB = function (user, rating, cb) {
//     let rateUser = new Rating({
//         username: user,
//         _1: rating === 1 ? rating : 0,
//         _2: rating === 2 ? rating : 0,
//         _3: rating === 3 ? rating : 0,
//         _4: rating === 4 ? rating : 0,
//         _5: rating === 5 ? rating : 0,
//         count: 1
//     });

//     console.log(rateUser);
//     rateUser.save((err, result) => {
//         if (err) {
//             console.log('Error happened trying to save new item..');
//             console.error(err);
//             return new Promise((reject) => {
//                 reject(err);
//             });
//         }

//         if (!result) {
//             console.log('Error trying see a result of the saving operation...');
//             console.log(result);
//             return new Promise((reject) => {
//                 reject(new Error('NO result was given'));
//             });
//         }

//         // cb();
//         return new Promise((resolve) => {
//             resolve(result);
//         });
//     });
// };

// let updateInDB = function (user, rating, cb) {
//     console.log(user);

//     Rating.findOne({ "username": user }, (err, doc) => {
//         if (err) {
//             console.error('FindOneAndUpdate results in error!');
//             console.error(err);
//             return new Promise((reject) => {
//                 reject(err);
//             });
//         }

//         if (!doc) {
//             console.log('doc seems to be empty...');
//             console.log(doc);

//             // cb("Nothing found", null);
//             return new Promise((reject) => {
//                 reject(new Error('Nothing found'));
//             });
//         }

// switch (rating) {
//     case 1:
//         console.log('Rating was 1, Boooooi!');
//         doc._1 += 1;
//         doc.count += 1;
//         break;
//     case 2:
//         console.log('Rating was 2, Boooooi!');
//         doc._2 += 1;
//         doc.count += 1;
//         break;
//     case 3:
//         console.log('Rating was 3, Boooooi!');
//         doc._3 += 1;
//         doc.count += 1;
//         break;
//     case 4:
//         console.log('Rating was 4, Boooooi!');
//         doc._4 += 1;
//         doc.count += 1;
//         break;
//     case 5:
//         console.log('Rating was 5, Boooooi!');
//         doc._5 += 1;
//         doc.count += 1;
//         break;
//     default:
//         break;
// }

// doc.save((err, result) => {
//     // cb(err, result);
//     if (err) return Promise.reject(new Error('Error occured'));
//     return new Promise((resolve) => {
//         resolve(result);
//     });
// });
//     });
// };

module.exports = router;