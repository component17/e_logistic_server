const express = require('express');
const router = express.Router();

const Endpoint = '/tsd';
const ModelName = 'Order';

router.get(Endpoint + '/orders/:car_id', async (req, res) => {
    try{
        let data = await Model.Order.getTsd(req.params.car_id);
        console.log(data);
        res.status(200).json(data);
    }catch (error) {
        console.log(error)
        res.status(500).json({error});
    }
});

router.post(Endpoint + '/orders/:id', async (req, res) => {
    console.log(req.body.items);
    try{
        let item = {
            positions_tsd: req.body.items,
            status: 'success'
        }
        let data = await Model.Order.update(req.params.id, item);
        console.log(data);
        res.status(200).json(data);
    }catch (error) {
        console.log(error)
        res.status(500).json({error});
    }
});

// router.get(Endpoint + '/sync-car/:date', async (req, res) => {
//     try{
//         let data = await Model.Order.getSync(req.params.date);
//         res.status(200).json(data);
//     }catch (error) {
//         res.status(500).json({error});
//     }
// });

module.exports = router;