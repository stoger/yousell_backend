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

router.get('/:user', (req, res) => {
    findUserByUsername(req.params.user)
        .then((result) => {
            let calcAvg = calculateAverageForResult(result);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                avg: calcAvg
            }));
        })
        .catch((e) => {
            console.log('Error happened at /:user route: ', e);
            var msg = 'Some unknown error happened. Retry again later.';
            if (e.location === 'findUserRating') {
                if (e.reason === 'error') {
                    msg = 'Some error happened while trying to parse request. Try again at a later time!'
                } else if (e.reason === 'result === 0') {
                    msg = 'User "' + req.params.user + '" did not receive any ratings yet.';
                } else if (e.reason === '!result') {
                    msg = 'Interesting, investigate further dude!';
                    console.log('Data which caused to fail @ if !result: ', e.data);
                }
            }

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: msg
            }));
        });
});

router.get('/:user/:rating', (req, res) => {
    findUserByUsername(req.params.user)
        .then((userFound) => {
            return new Promise((resolve, reject) => {
                updateRatingForUser(req.params.user, req.params.rating)
                    .then((result) => resolve(result))
                    .catch((e) => reject(e));
            });
        })
        .then((result) => {
            calcAvg = calculateAverageForResult(result);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                avgRating: calcAvg.toFixed(2),
                object: result
            }));
        })
        .catch((e) => {
            console.log('Error happened in /:user/:rating route: ', e);
            if (e.location === 'findUserRating' && e.reason === 'result === 0') {
                saveNewUserInRatings(req.params.user, req.params.rating)
                    .then((response) => {
                        let average = calculateAverageForResult(result);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            avgRating: average,
                            object: response
                        }));
                    })
                    .catch((e) => {
                        msg = 'Unable to create new user "' + req.params.user + '"! See server logs for more info';
                        console.log(e);

                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: msg
                        }));
                    })
            } else {
                var msg;
                switch (e.location) {
                    case 'findUserRating':
                        msg = 'Fetching rating for specified user failed.';
                        break;
                    case 'updateRating' || 'saveUpdateRating':
                        msg = 'Updating already existing rating failed. Please try again later.'
                        break;
                    default:
                        msg = 'Serverside error, please contact an administrator.';
                        break;
                }

                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: msg
                }));
            }
        });

});

module.exports = router;