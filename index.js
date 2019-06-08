const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const r = require('rethinkdb');
let conn = null;

const Schema = require('./models/index');

global.Model = null;

r.connect({
    host: '151.248.124.40',
    user: 'admin',
    password: 'dac9fdac-b925-4c50-b860-0c9d778afcb8',
    db: 'logistic'
}, (err, connect) => {
    if(err){
        console.log('DB Connect Fail!');
        return;
    }

    Model = Schema(r, connect);

    app.listen(3000, () => {
        console.log('Server listener port 3000');
    });
});

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const ApiV1 = require('./api/v1/index');

app.use('/api/v1', ApiV1.Car);
app.use('/api/v1', ApiV1.Driver);
app.use('/api/v1', ApiV1.Company);
app.use('/api/v1', ApiV1.Order);
app.use('/api/v1', ApiV1.Tsd);




