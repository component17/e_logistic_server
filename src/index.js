const app = require('express')();
const http = require('http').Server(app);

const bodyParser = require('body-parser')
const cors = require('cors');
const fileUpload = require('express-fileupload');


app.use(cors({credentials: true, origin: true}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(fileUpload({
    limits: { fileSize: 1024 * 1024 * 1024 },
}));

app.use(bodyParser.json({
    limit: '100mb'
}));

//Запускаем
require('./app-init')(app, http)

