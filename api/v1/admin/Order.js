const express = require('express');
const router = express.Router();

const Endpoint = '/order';
const ModelName = 'Order';

router.get(Endpoint + '/report/:date', async (req, res) => {
    try{
        let data = await Model.Order.report(req.params.date);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error});
    }
});

router.get(Endpoint + '/no-sync-car', async (req, res) => {
    try{
        let data = await Model.Order.getNoSync();
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error});
    }
});

router.get(Endpoint + '/sync-car/:date', async (req, res) => {
    try{
        let data = await Model.Order.getSync(req.params.date);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error});
    }
});

router.get(Endpoint, async (req, res) => {
    try{
        let data = await Model[ModelName].getAll();
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error})
    }
});

router.get(Endpoint + '/:id', async (req, res) => {
    try{
        let data = await Model[ModelName].getById(req.params.id);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error})
    }
});

router.post(Endpoint, async (req, res) => {
    try{
        let data = await Model[ModelName].create(req.body);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error})
    }
});

router.post(Endpoint + '/:id', async (req, res) => {
    try{
        let data = await Model[ModelName].update(req.params.id, req.body);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error})
    }
});

router.delete(Endpoint + '/:id', async (req, res) => {
    try{
        let data = await Model[ModelName].delete(req.params.id);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({error});
    }
});

module.exports = router;