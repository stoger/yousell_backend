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
            // console.log('Checking conversation results: ');
            // console.log(err, '\t', doc);
            if (err || !doc) {
                reject({ 'location': 'checkConversation', 'reason': 'error', 'err': err, 'data': doc });
            }

            if (doc.length === 0) {
                // console.log('Definitely not resolving');
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

let storeNewConversation = (convPartners) => {
    return new Promise((resolve, reject) => {
        let curConv = new conversationModel({
            partners: convPartners,
            newestMessage: getTimeNow()
        });


        curConv.save((err, doc) => {
            if (err || !doc) {
                // console.log('failing because of err || !doc');
                reject({ 'location': 'storeNewConversation', 'reason': 'error', 'err': err, 'data': doc });
            }

            if (doc.length === 0) {
                // console.log('failing because of doc.length === 0');
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
            // doc.newestMessage = getTimeNow();

            // doc.save((err, result) => {
            //     if (result.length === 0 || !result || err) {
            //         reject({ location: 'saveMessageStamp', data: { error: err, document: result } });
            //     }

            //     resolve(result);
            // })
        });
    });
};

module.exports.searchConversationsFunc = checkForConversation;
module.exports.storeConversationFunc = storeNewConversation;
module.exports.updateTimestamp = updateLastMessageTime;
module.exports.searchConvById = findConversationById;