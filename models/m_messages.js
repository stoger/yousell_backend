let mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Types.ObjectId;

let messageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    receiver: { type: String, required: true },
    sentAt: { type: String, required: true }
});

let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

let messageModel = mongoose.model('Message', messageSchema);

let storeNewMessage = (id, msg, receivingPartner) => {
    return new Promise((resolve, reject) => {
        let message = new messageModel({
            conversation: id,
            message: msg,
            receiver: receivingPartner,
            sentAt: getTimeNow()
        });

        message.save((err, doc) => {
            if (err || !doc) {
                console.log('Gonna end up in catch, most likely!');
                reject({ location: 'storeMessage', reason: 'error or just no document', err: err, data: doc });
            }

            resolve(doc);
        })
    })
};

let fetchConversationHistory = function (id) {
    return new Promise((resolve, reject) => {
        messageModel.find({ 'conversation': new ObjectId(id) }, (err, doc) => {
            if (err || !doc)
                reject({ 'location': 'chatHistory', 'reason': 'err or no document', 'err': err, 'doc': doc });
            else if (doc.length === 0)
                reject({ 'location': 'chatHistory', 'reason': 'doc.length is 0', document: doc });

            resolve(doc);
        }).sort({ 'createdAt': -1 }).limit(25);
    });
};

module.exports.storeMethodFunc = storeNewMessage;
module.exports.fetchMessageHistory = fetchConversationHistory;