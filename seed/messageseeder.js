let Message = require('../models/m_messages'),
    Conversation = require('../models/m_conversation'),
    mongoose = require('mongoose');

let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

function createNewMessage(conversation, message) {
    // let msg = new Message({
    //     conversation: conversation,
    //     message: message,
    //     sender: conversation.conversation_between[0],
    //     date: getTimeNow()
    // });

    // msg.save(() => {
    //     console.log("Everything finished");
    //     exit();
    // });
    console.log(conversation);
    exit();
}

function createNewMessageForConversation(conv_partner1, conv_partner2, message) {
    Conversation.find({ "conversation_between": [conv_partner1, conv_partner2] })
        .then((r) => {
            console.log(r);
            createNewMessage(r, message);
        }).catch((e) => {
            console.log('Error');
            console.log(e);
        });
}

function createMessageForPartnerInConversation(conv_partner, message) {
    Conversation.find({ "conversation_between": conv_partner })
        .then((r) => {
            console.log(r);
        });
}


if (mongoose.connection.readyState !== 1) {
    mongoose.connect('mongodb://localhost:27017/yousell', {
        useMongoClient: true
    }, (err, result) => {
        if (err) {
            console.log('Error');
            console.log(err);
        } else if (!result) {
            console.log('No result returned');
        } else {
            console.log('Connected!');
            // createNewMessageForConversation("partner1", "partner2", "more simple testing");
            createMessageForPartnerInConversation("partner2", "asl", () => {
                exit();
            });
        }
    });
}

function exit() {
    mongoose.disconnect();
}