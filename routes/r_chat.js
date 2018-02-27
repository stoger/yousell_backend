let express = require('express'),
    router = express(),
    path = require('path');

let findConversation = require('../models/m_conversation').searchConvById,
    fetchMessageHistory = require('../models/m_messages').fetchMessageHistory;
fetchConversationsByUser = require('../models/m_conversation').findAllByUser;

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../test/io1.html'));
});

router.get('/secChat', (req, res) => {
    res.sendFile(path.join(__dirname, '../test/io2.html'));
});

router.get('/show/:id', (req, res) => {
    console.log('I\'m in here at least…');
    findConversation(req.params.id)
        .then((result) => {
            return new Promise((resolve, reject) => {
                fetchMessageHistory(result._id)
                    .then((result) => resolve(result),
                        (err) => reject(err));
            });
        }, (err) => {
            console.log('Error happened...');
            console.log(err);
            res.render('error', { error: err });
        })
        .then((history) => {
            res.render('chat', { history: history });
        }, (err) => {
            console.log('Error happened in second error handler …');
            console.log(err);
        })
        .catch(unhandledError => {
            console.log('Seems like theres an unhandled error somewhere....');
            console.log(unhandledError);
        });
});

router.post('/all', (req, res) => {
    if (!req.body.user) {
        res.status(500).send({ msg: "No username given!" }).end();
    }

    fetchConversationsByUser(req.body.user)
        .then((result) => {
            console.log('Looks good, found the conversations, seemingly!');
            console.log(result);
            res.status(200).send(result).end();
        }, (err) => {
            console.log('Some sort of error happened, better check that!');
            console.log(err);
            res.status(500).send(err).end();
        });
});

module.exports = router;