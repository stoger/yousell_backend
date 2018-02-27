let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let conversationSchema = new Schema({
    partners: [{ type: String, required: true, limit: 2 }],
    newestMessage: { type: String, required: true }
});

let conversationModel = mongoose.model('Conversation', conversationSchema);

let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

let checkForConversation = (partners) => {
    return new Promise((resolve, reject) => {
        conversationModel.find({
            partners: { $all: partners },
        }, (err, doc) => {
            if (err || !doc) {
                reject({ 'location': 'checkConversation', 'reason': 'error', 'err': err, 'data': doc });
            }

            if (doc.length === 0) {
                reject({ 'location': 'checkConversation', 'reason': 'empty doc' });
            }

            resolve(doc);
        })
    })
};

let findConversationById = function (id) {
    return new Promise((resolve, reject) => {
        conversationModel.findById(id, (err, doc) => {
            if (doc.length === 0 || !doc || err) {
                reject({
                    location: 'findConversationById', data: {
                        error: err,
                        document: doc
                    }
                });
            }

            resolve(doc);
        });
    });
};

let checkConversationsByUser = (name) => {
    return new Promise((resolve, reject) => {
        conversationModel.find({ partners: { $in: [name] } }, (err, doc) => {
            console.log(err);
            console.log(doc);
            if (err) {
                console.log('Rejecting inside of if');
                reject(err);
            }

            if (doc.length === 0 || !doc) {
                console.log('Recting inside second if');
                reject(new Error({ msg: "Either length is 0 or no document given as result!" }), err: err, doc: doc);
            }

            console.log('Gonna resolve, eventually');
            resolve(doc);
        })
    });
}

let storeNewConversation = (convPartners) => {
    return new Promise((resolve, reject) => {
        let curConv = new conversationModel({
            partners: convPartners,
            newestMessage: getTimeNow()
        });

        console.log('Partners: ', convPartners);

        curConv.save((err, doc) => {
            if (err || !doc) {
                reject({ 'location': 'storeNewConversation', 'reason': 'error', 'err': err, 'data': doc });
            }

            if (doc.length === 0) {
                reject({ 'location': 'storeNewConversation', 'reason': 'empty doc' });
            }

            resolve(doc);
        });
    });
};

let updateLastMessageTime = function (id) {
    return new Promise((resolve, reject) => {
        conversationModel.findByIdAndUpdate(id, { $set: { newestMessage: getTimeNow() } }, { new: true }, (err, doc) => {
            if (doc.length === 0 || !doc || err) {
                reject({ location: 'updateMessageStamp', data: { error: err, document: doc } });
            }

            resolve({ msg: 'seems like its working', doc: doc });
        });
    });
};

module.exports.searchConversationsFunc = checkForConversation;
module.exports.storeConversationFunc = storeNewConversation;
module.exports.updateTimestamp = updateLastMessageTime;
module.exports.searchConvById = findConversationById;
module.exports.findAllByUser = checkConversationsByUser;