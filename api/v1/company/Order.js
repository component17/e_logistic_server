const express = require('express');
const router = express.Router();

const Endpoint = '/order';
const ModelName = 'Order';

const moment = require('moment');

router.get(Endpoint, async (req, res) => {
    try{
        let data = await Model[ModelName].getAllCompany(req.company_id);
        let orders = data.map((i) => {
            i.created_at = moment(i.created_at).format('DD.MM.YYYY HH:mm');
            i.delivery_at = moment(i.delivery_at).format('DD.MM.YYYY');
            return i;
        });
        res.status(200).json(orders);
    }catch (err) {
        res.status(500).json({err})
    }
});

router.post(Endpoint, async (req, res) => {
    try{
        let data = Object.assign(req.body, {company_id: req.company_id});
        let newOrder = await Model[ModelName].create(data);

        let order = await Model[ModelName].getById(newOrder.id);

        order.created_at = moment(order.created_at).format('DD.MM.YYYY HH:mm');
        order.delivery_at = moment(order.delivery_at).format('DD.MM.YYYY');

        res.status(200).json(order);
    }catch (err) {
        res.status(500).json({err})
    }
});

router.post(Endpoint + '/:id', async (req, res) => {
    try{
        let order = await Model[ModelName].getById(req.params.id);

        if(!order && order.company_id !== req.company_id && order.status === 'success'){
            return  res.status(403).json({message: 'Доступ запрещен', order, id: req.params.id, new_state: req.body});

        }

        delete req.body.id;
        delete req.body.created_at;
        delete req.body.company_id;
        delete req.body.car_id;
        delete req.body.itemRaw;

        let result = await Model[ModelName].update(req.params.id, req.body);

        res.status(200).json(result);
    }catch (err) {
        res.status(500).json({err})
    }
});

module.exports = router;