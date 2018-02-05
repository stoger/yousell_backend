let mongoose = require('mongoose');

let storeMessage = require('../models/m_messages').storeMethodFunc, // = function(partners, msg)
    checkExistingConversation = require('../models/m_conversation').searchConversationsFunc, // = function (partners)
    storeConversation = require('../models/m_conversation').storeConversationFunc, // = function (user[])
    updateNewestMessageTimestamp = require('../models/m_conversation').updateTimestamp;

var activeUsers = {},
    unhandledMessages = {};

const emitServerErrorMessage = 'Due to some technical problems, the message could not be sent.\nPlease try again at a later point in time.';

module.exports = (io) => {
    // Will be called whenever a new client will connect to this particular socket.io server
    io.on('connection', (socket) => {
        // New client connects to the server, will be registered and stored in the activeUsers Object
        socket.on('ack user', (user) => {
            if (!activeUsers[user.name]) {
                // console.log('User ', user.name, ' was added to the object of active Users!');
                console.log(user.name, ' just went online!');
                activeUsers[user.name] = socket;

                if (unhandledMessages[user.name]) {
                    // console.log('User that has a pending message came on!');
                    let pendingMsg = unhandledMessages[user.name];
                    activeUsers[user.name].emit('msg', { from: pendingMsg.from, data: pendingMsg.data });
                }
            }
        });

        socket.on('private msg', (msg) => {
            let partners = Array(msg.from, msg.to);

            // Check if these two conversation partners in particular already have a history together
            checkExistingConversation(partners)
                .then((works) => {
                    // console.log('Conversation was found, resolving to the next handler.');
                    // If that's the case, simply hand the result to the next success handler, nothing to do here
                    return Promise.resolve(works[0]);
                }, (err) => {
                    // console.log('Conversation was not found, located in errorHandler #1 right now.\tI\'ll try to create one, just a moment!');
                    // If that's not the case, create a new conversation and store it in the database
                    return new Promise((resolve, reject) => {
                        storeConversation(partners)
                            // Storing worked? Great! Continue in the next successHandler!
                            .then((stored) => {
                                // console.log('Creating the new conversation was finally successful, this is the return value: ', stored);
                                resolve(stored);
                                // Storing didn't work? Damn, that's bad. Guess you'll have to throw an error and try again later
                            }, (failure) => {
                                // console.log('Creating the new conversation was a failure also, this is the return value: ', failure);
                                reject(failure);
                            });
                    })
                })
                .then((info) => {
                    // console.log('Alright, we reached the point of no return. The conversation exists, proof:\n', info);
                    // No matter what happened before, i can assure that the conversation was created and exists in here
                    // console.log(info._id);
                    // console.log(msg.msg);
                    storeMessage(info._id, msg.msg, msg.to)
                        .then((storeSuccess) => {
                            // console.log('Finally, the message should be stored by now also! GREAT DUDE! YOU MADE IT!');

                            // console.log(activeUsers[msg.to]);
                            updateNewestMessageTimestamp(info._id)
                                .then((resultObj) => {
                                    // console.log('WE MADE IT, 1st try dude!');
                                    // console.log(resultObj);

                                    if (activeUsers[msg.to]) {
                                        activeUsers[msg.to].emit('msg', { from: msg.from, data: msg.msg });
                                    } else {
                                        // console.log('Added to the unhandled messages array');
                                        unhandledMessages[msg.to] = { from: msg.from, data: msg.msg };
                                        // console.log(unhandledMessages);
                                    }
                                })
                                .catch((e) => {
                                    // console.log('Your newest addition results in an error....');
                                    // console.log(e);
                                });
                        }, (storeFailure) => {
                            // console.log('Well well, we\'re in the last possible state. Now, it still didn\'t work, do something against it M8!');
                            // console.log(storeFailure);
                            return Promise.reject({ 'error': new Error('Total failure (TFM)'), 'data': storeFailure });
                        });
                }, (err) => {
                    // The conversation does not exist, most likely. Therefore you can't store a message to it 
                    // console.log('Conversation doesn\'exist as it seems... Value passed into this errorHandler:\n', err);
                    activeUsers[msg.from].emit('send error', { reason: emitServerErrorMessage })
                })
                .catch((unhandled) => {
                    // console.log('Unhandled error was found...');
                    // console.log(unhandled);
                    activeUsers[msg.from].emit('send error', { reason: emitServerErrorMessage });
                })
        })

        // If a client disconnects, he tells the server beforehand
        // Important for storing the currently opened and active sockets connected to the users behind them
        socket.on('leave', (deletingUser) => {
            if (activeUsers[deletingUser.name]) {
                // console.log('Deleting user from active list');
                delete activeUsers[deletingUser.name];
            }
        });
    });
}