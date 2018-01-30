let express = require('express'),
    router = express(),
    bodyParser = require('body-parser');

let Message = require('../models/m_messages'),
    Conversation = require('../models/m_conversation');

let bodyParserArray = [bodyParser.urlencoded({ extended: true }), bodyParser.json()];


let getTimeNow = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

router.get('/show/:conversation_id/', (req, res, next) => {
    Message.find({ "conversation": req.params.conversation_id }, (err, result) => {
        if (err) {
            console.error('Error happened, fetching all messages for conversation');
            console.error(err);
        }

        if (!result) {
            console.error('No results were returned, possibly no messages exist?');
        }

        res.json(result);
    });
});

router.post('/send/:conversation_id/', (req, res, next) => {
    // req.params.conversation_id = "5a5280f60e8a9b0b5efbd259";
    // console.log(req.params.conversation_id);

    Conversation.find({ "_id": req.params.conversation_id })
        .then((result) => {
            console.log(`Conversation.find() ${result}`);
            res.json(result);
        });
});

router.post('/new/send', (req, res, next) => {
    let message = req.body.message;
    let sender = req.body.partner_from,
        receiver = req.body.partner_to;

    Conversation.find({ "conversation_between": [sender, receiver] })
        .then((result) => {
            if (result.length === 0) {
                console.log(`No result was found, creating new conversation … ${sender} \t ${receiver}`);
                let test = createNewConversationForPartners(sender, receiver)
                    .then((res) => {
                        createNewMessageForConversation(res[0]._id, sender, message, res);
                    });
            } else {
                console.log('In else!');
                console.log(result);
                createNewMessageForConversation(result[0]._id, sender, message, res);
            }
        })
        .catch((error) => {
            console.error('Error happened');
            console.error(error);
        });
});

let createNewConversationForPartners = function (partner1, partner2) {
    let conv = new Conversation({
        conversation_between: [partner1, partner2]
    });

    let saveRes = conv.save((err, result) => {
        if (err) {
            console.error('Error happened in saving conversation!');
            console.error(err);
        }
    });

    return saveRes;
};

let createNewMessageForConversation = function (conversation, from, message, response) {
    let msg = new Message({
        conversation: conversation,
        message: message,
        sender: from,
        date: getTimeNow()
    });

    msg.save((err, res) => {
        console.log(res);

        response.json(res);
    });
};

module.exports = router;