const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const r = require('rethinkdb');
let conn = null;

r.connect({
    host: '151.248.124.40',
    port: 28015,
    db: 'main'
}, (err, connect) => {
    if(err){
        console.log('DB Connect Fail!');
        return;
    }

    conn = connect;
    console.log('DB Connect Success :)')
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.get('/orders', (req, res) => {
    console.log('GET ORDERS');
    r.table('orders').coerceTo('array').run(conn, (err, data) => {
        if(err){
            res.status(500).json("Server Error!")
        }

        res.status(200).json(data)
    })
});

app.post('/orders', (req, res) => {
    // console.log('POST ORDERS', req.body);
    // res.status(200).json('ok')
    let order = {
        name: req.body.name
    };
    r.table('orders').insert(order).run(conn, (err, data) => {
        if(err){
            res.status(500).json("Server Error!")
        }

        res.status(200).json({
            id: data.generated_keys[0]
        })
    })
});

app.listen(3000, () => {
    console.log('Server listener port 3000');
});