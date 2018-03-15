let express = require('express'),
    router = express();

let Rating = require('../models/m_rating'),
    findUserByUsername = Rating.seachUserByName,
    saveNewUserInRatings = Rating.saveNewUserInRatings,
    updateRatingForUser = Rating.updateRatingForUser;


let calculateAverageForResult = (resultObject) => {
    let sum = (resultObject._1 * 1) + (resultObject._2 * 2) + (resultObject._3 * 3) + (resultObject._4 * 4) + (resultObject._5 * 5);
    let avg = sum / resultObject.count;
    return avg;
}

/**
 * @api {post} /rate/ Benutzer bewerten
 * @apiName Update Userrating
 * @apiGroup Rating
 * 
 * @apiParam {String} user Benutzer welcher bewertet werden soll
 * @apiParam {Int} rating Bewertung, welche der Benutzer erhalten hat
 * 
 * @apiParamExample {json} Request payload example
 * {
 *  "user": "mustermann.max",
 *  "rating": 4
 * }
 * 
 * @apiSuccess user {String} Enthält den Usernamen 
 * @apiSuccess avg {Double} Enthält die berechnete durchschnitts Bewertung
 * 
 * @apiError error {Object} Sendet das Fehler-Objekt zurück
 */
router.post('/', async (req, res) => {
    try {
        let userExists = await findUserByUsername(req.body.user);
        if (userExists.length === 0) {
            let createdUser = await saveNewUserInRatings(req.body.user, req.body.rating);
            console.log('User was created!!! Value: ', createdUser);
        } else {
            let updated = await updateRatingForUser(req.body.user, req.body.rating);
            var avg = calculateAverageForResult(updated);
        }

        res.status(200).send(JSON.stringify({
            user: req.body.user,
            avg: avg.toFixed(2)
        })).end();
    } catch (e) {
        console.log('Error happened, somewhere...');
        console.log('Err Value: ', e);
        res.status(500).send(JSON.stringify({
            error: e
        })).end();
    }
});


// router.get('/:user/:rating', (req, res) => {
//     findUserByUsername(req.params.user)
//         .then((userFound) => {
//             return new Promise((resolve, reject) => {
//                 updateRatingForUser(req.params.user, req.params.rating)
//                     .then((result) => resolve(result))
//                     .catch((e) => reject(e));
//             });
//         })
//         .then((result) => {
//             calcAvg = calculateAverageForResult(result);

//             res.writeHead(200, {
//                 'Content-Type': 'application/json'
//             });
//             res.end(JSON.stringify({
//                 avgRating: calcAvg.toFixed(2),
//                 object: result
//             }));
//         })
//         .catch((e) => {
//             console.log('Error happened in /:user/:rating route: ', e);
//             if (e.location === 'findUserRating' && e.reason === 'result === 0') {
//                 saveNewUserInRatings(req.params.user, req.params.rating)
//                     .then((response) => {
//                         let average = calculateAverageForResult(result);

//                         res.writeHead(200, {
//                             'Content-Type': 'application/json'
//                         });
//                         res.end(JSON.stringify({
//                             avgRating: average,
//                             object: response
//                         }));
//                     })
//                     .catch((e) => {
//                         msg = 'Unable to create new user "' + req.params.user + '"! See server logs for more info';
//                         console.log(e);

//                         res.writeHead(500, {
//                             'Content-Type': 'application/json'
//                         });
//                         res.end(JSON.stringify({
//                             success: false,
//                             message: msg
//                         }));
//                     })
//             } else {
//                 var msg;
//                 switch (e.location) {
//                     case 'findUserRating':
//                         msg = 'Fetching rating for specified user failed.';
//                         break;
//                     case 'updateRating' || 'saveUpdateRating':
//                         msg = 'Updating already existing rating failed. Please try again later.'
//                         break;
//                     default:
//                         msg = 'Serverside error, please contact an administrator.';
//                         break;
//                 }

//                 res.writeHead(500, {
//                     'Content-Type': 'application/json'
//                 });
//                 res.end(JSON.stringify({
//                     success: false,
//                     message: msg
//                 }));
//             }
//         });

// });

/**
 * @api {post} /rate/user Bewertung eines Benutzers abfragen
 * @apiName Userrating Abfrage
 * @apiGroup Rating
 * 
 * @apiParam {String} user Enthält den gewollten Benutzernamen
 * 
 * @apiParamExample {json} Request payload example
 * {
 *  "user": "mustermann.max"
 * }
 * 
 * @apiSuccess user {String} Enthält den gesuchten Benutzer
 * @apiSuccess avg {Double} Liefert die durchschnittliche Bewertung des gegebenen Benutzers
 * 
 * @apiError msg {String} Enthält eine Fehler-Benachrichtigung
 */
router.post('/user', async (req, res) => {
    try {
        let user = await findUserByUsername(req.body.user);

        if (user.length === 0) {
            res.status(500).send(JSON.stringify({
                msg: 'No user was found!',
            })).end();
        }

        let avg = calculateAverageForResult(user);

        res.status(200).send(JSON.stringify({
            user: req.body.user,
            avg: avg.toFixed(2)
        })).end();
    } catch (e) {
        res.status(500).send(JSON.stringify({
            msg: e,
        })).end();
    }
});

module.exports = router;