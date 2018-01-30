let Conversation = require('../models/m_conversation'),
    mongoose = require('mongoose');

let partners = ["test1", "test2"];

let tryHard = new Conversation({
    conversation_between: partners
});

if (mongoose.connection.readyState !== 1) {
    console.log('Connecting');
    mongoose.connect('mongodb://localhost:27017/yousell', {
        useMongoClient: true
    }, () => {
        console.log('Connected!');
    });
}

let saverino = function () {
    tryHard.save();
};

let exit = function () {
    mongoose.disconnect();
};

let fetchAll = function () {
    Conversation.find({}, (err, result) => {
        if (err) {
            console.log('Error happened');
            console.log(err);
        } else {
            console.log(result);
        }
        console.log('Inside of find({})');
    });
};

let fetchOne = function (name) {
    Conversation.find({ "conversation_between": name }, (err, result) => {
        if (err) {
            console.error('Error happened');
            console.error(err);
        }
        console.log(result);
        console.log(`Done fetching ${name}`);
    });
};

let fetchSpecificConversation = function (partner1, partner2) {
    Conversation.find({ "conversation_between": [partner1, partner2] }, (err, result) => {
        if (err) {
            console.error('Error happened');
            console.error(err);
        }
        console.log(result);
        console.log(`Done fetching Conversation between ${partner1} & ${partner2}`);
    });
};

// Save Array and fetch all that already exist
// tryHard.save((err, res) => {
//     if (err) {
//         console.log(err);
//     }
//     fetchAll(() => {
//         exit();
//     });
// });

// fetchOne('partner1');
fetchSpecificConversation('test1', 'test2');