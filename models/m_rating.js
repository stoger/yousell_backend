let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let ratingSchema = new Schema({
    username: { type: String, required: true },
    _1: { type: Number, required: true },
    _2: { type: Number, required: true },
    _3: { type: Number, required: true },
    _4: { type: Number, required: true },
    _5: { type: Number, required: true },
    count: { type: Number, required: true }
});

let ratingModel = mongoose.model('Rating', ratingSchema, 'rating');

let findUserByName = function (user) {
    return new Promise((resolve, reject) => {
        return ratingModel.find({ username: user }, (err, result) => {
            if (err) {
                reject({ location: 'findUserRating', reason: 'error', data: err });
            }

            if (!result) {
                reject({ location: 'findUserRating', reason: '!result', data: result });
            }

            resolve(result);
        });
    });

    return ratingModel.find({ username: user });
};

let saveNewUserToDb = function (user, rating) {
    return new Promise((resolve, reject) => {
        // Try to make that somehow easier, so much duplicate.......

        
        let itemToInsert = new ratingModel({
            username: user,
            _1: rating === "1" ? "1" : "0",
            _2: rating === "2" ? "1" : "0",
            _3: rating === "3" ? "1" : "0",
            _4: rating === "4" ? "1" : "0",
            _5: rating === "5" ? "1" : "0",
            count: 1
        });
        return itemToInsert.save();


        itemToInsert.save((err, doc) => {
            if (err) {
                reject(err);
            }

            if (!doc) {
                reject(doc);
            }

            resolve(doc);
        });
    });
};

let updateRatingForUser = (user, rating) => {
    return new Promise((resolve, reject) => {
        let query = { 'username': user };
        let updatingColumn = Number(rating) === 1
            ? '_1'
            : Number(rating) === 2
                ? '_2'
                : Number(rating) === 3
                    ? '_3'
                    : Number(rating) === 4
                        ? '_4'
                        : Number(rating) === 5
                            ? '_5'
                            : undefined,
            updateBy = 1;

        if (typeof updatingColumn !== 'undefined') {
            return new Promise((resolve, reject) => {
                return ratingModel.findOneAndUpdate(query, { $inc: { [updatingColumn]: updateBy, 'count': updateBy } }, { new: true }, (err, rowsAffected) => {
                    if (err || rowsAffected === 0) {
                        reject({ location: 'updateRating' });
                    }

                    resolve(rowsAffected);
                });
            })
                .then((result) => resolve(result))
                .catch((e) => reject(e));
        } else {
            reject({ location: 'updateRating' });
        }
    });
};

module.exports = ratingModel;
module.exports.seachUserByName = findUserByName;
module.exports.saveNewUserInRatings = saveNewUserToDb;
module.exports.updateRatingForUser = updateRatingForUser;