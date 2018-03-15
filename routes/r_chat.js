let express = require('express'),
    router = express(),
    path = require('path'),
    jsonArraySort = require('sort-json-array');

let fetchConversationsByUser = require('../models/m_conversation').findAllByUser,
    fetchMessageHistory = require('../models/m_messages').fetchMessageHistory;

/**
 * @api {post} /all Abfrage der Konversationen/Chats eines Benutzers
 * @apiName Send all chats for user
 * @apiGroup Chat
 * 
 * @apiSuccess conv {Array} Enthält alle Konversationspartner
 * @apiSuccess history {Array} Befüllt mit allen Nachrichten, welche in den Konversationen ausgetauscht wurde, Konversations-ID als Schlüssel in diesem Array.
 * 
 * @apiParamExample {json} Request payload example
 * { 
 *  "conv": [{
 *      "_id": "5a99287078d5490270994492",
 *      "partner": "Ben Brode",
 *      "sort": "2018-03-09 11:58:11",
 *      "Date": {
 *          "year": "2018",
 *          "month": "03",
 *          "day": "09",
 *          "hours": "11",
 *          "minutes": "58",
 *          "seconds": "11"
 *      }
 *  }, ... ],
 *  "history": [{
 *      "5a99287078d5490270994492": [
 *          {
 *              "_id": "5a99287078d5490270994493",
 *              "conversation": "5a99287078d5490270994492",
 *              "message": "test",
 *              "receiver": "Ben Brode",
 *              "sentAt": "2018-03-02 10:33:20",
 *              "__v": 0
 *          },
 *          {
 *              "_id": "5a992ab078d5490270994498",
 *              "conversation": "5a99287078d5490270994492",
 *              "message": "d",
 *              "receiver": "Ben Brode",
 *              "sentAt": "2018-03-02 10:42:56",
 *              "__v": 0
 *          }, ...
 *      }, {...}
 *   ]
 * }
 * @apiError msg {String} Benachrichtigt den Client, dass ein Fehler in der Anfrage enthalten ist
*/
router.post('/all', async (req, res) => {
    if (!req.body.user) {
        res.status(500).send({
            msg: "No username given!"
        }).end();
        return;
    }
    let arr = [];

    try {
        arr = await fetchConversationsByUser(req.body.user),
            convWithMessages = {},
            clarifiedMessages = [];

        for (item of arr) {
            let history = await fetchMessageHistory(item._id);
            convWithMessages[item._id] = history;

            let partner = item.partners.filter(x => {
                return x !== req.body.user
            }),
                sliced = item.newestMessage.split(' '),
                date = sliced[0],
                time = sliced[1];

            let splitDate = date.split('-'),
                splitTime = time.split(':');

            let year = splitDate[0],
                month = splitDate[1],
                day = splitDate[2],
                hours = splitTime[0],
                minutes = splitTime[1],
                seconds = splitTime[2];
            clarifiedMessages.push({
                _id: item._id,
                partner: partner.toString(),
                sort: item.newestMessage,
                Date: {
                    year: year,
                    month: month,
                    day: day,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds
                }
            });
        }

        let conversationListSorted = clarifiedMessages.sort((a, b) => {
            if (parseInt(a.Date.year) === parseInt(b.Date.year)) {
                if (parseInt(a.Date.month) === parseInt(b.Date.month)) {
                    if (parseInt(a.Date.day) === parseInt(b.Date.day)) {
                        if (parseInt(a.Date.hours) === parseInt(b.Date.hours)) {
                            if (parseInt(a.Date.minutes) === parseInt(b.Date.minutes)) {
                                return (parseInt(b.Date.seconds) - parseInt(a.Date.seconds));
                            } else {
                                return (parseInt(b.Date.minutes) - parseInt(a.Date.minutes));
                            }
                        } else {
                            return (parseInt(b.Date.hours) - parseInt(a.Date.hours));
                        }
                    } else {
                        return (parseInt(b.Date.day) - parseInt(a.Date.day));
                    }
                } else {
                    return (parseInt(b.Date.month) - parseInt(a.Date.month));
                }
            } else {
                return (parseInt(b.Date.year) - parseInt(a.Date.year));
            }
        });

        res.status(200).send({
            conv: conversationListSorted,
            history: convWithMessages
        }).end();
    } catch (e) {
        console.log(e);
        res.status(500).send({
            msg: 'Error trying to find history for given conversation!',
            conversations: arr
        }).end();
    }
});

module.exports = router; 