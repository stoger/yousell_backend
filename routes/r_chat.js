let express = require('express'),
    router = express(),
    path = require('path');

let findConversation = require('../models/m_conversation').searchConvById,
    fetchMessageHistory = require('../models/m_messages').fetchMessageHistory;

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

router.post('/chat', (req, res) => {

});

module.exports = router;