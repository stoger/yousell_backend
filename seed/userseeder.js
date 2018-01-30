let User = require('../models/m_conversation'),
    mongoose = require('mongoose');

mongoose.connect('localhost:27017/yousell', {
    useMongoClient: true
});

let newUser = [
    new User({
        username: 'stephan.stoeger@gmail.com',
        password: '1234'
    }),
    new User({
        username: 'rajicgg@gmail.com',
        password: 'cisco'
    }),
    new User({
        username: 'game@htl-wels.at',
        password: 'alien'
    })
];


let done = 0;
for(let i = 0; i < newUser.length; i++) {
    console.log(`Current user: ${newUser[i].username}`);
    newUser[i].save(function(err, result) {
        done++;

        if (done === newUser.length) {
            console.log('Done is equal to length');
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}


