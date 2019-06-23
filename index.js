const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const jwt = require('jsonwebtoken');

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
        console.log('Server listener port 80');
    });
});

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const ApiV1Admin = require('./api/v1/admin/index');

app.use('/api/v1/admin', ApiV1Admin.Car);
app.use('/api/v1/admin', ApiV1Admin.Driver);
app.use('/api/v1/admin', ApiV1Admin.Company);
app.use('/api/v1/admin', ApiV1Admin.Order);
app.use('/api/v1/admin', ApiV1Admin.Tsd);

app.use('/api/v1/company', (req, res, next) => {
    if(req.path === '/auth/login'){
        next()
    }else{
        let token = req.get('Authorization');
        if(token){
            try {
                let decoded = jwt.verify(token, 'component-team');
                req.company_id = decoded.company_id;
                next();
            } catch(err) {
                res.status(401).json({err: "Ошибка авторизации!"})
            }
        }else{
            res.status(401).json({err: "Ошибка авторизации!"})
        }
    }

});

const ApiV1Company = require('./api/v1/company/index');

app.use('/api/v1/company', ApiV1Company.Auth);
app.use('/api/v1/company', ApiV1Company.Order);




