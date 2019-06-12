const express = require('express');
const router = express.Router();

const Endpoint = '/auth';

const jwt = require('jsonwebtoken');

router.post(Endpoint + '/login', async (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    try {
        let companies = await Model.Company.auth(login, password);
        if(companies.length){
            let token = jwt.sign({company_id: companies[0].id}, 'component-team');
            res.status(200).json({token})
        }else{
            res.status(401).json({err: "Неверный логин или пароль"});
        }
    }catch (err) {
        res.status(500).json(err);
    }
});

router.get(Endpoint + '/me', async (req, res) => {
    try{
        let company = await Model.Company.getById(req.company_id);
        if(company){
            res.status(200).json({name: company.name});
        }else{
            res.status(401).json({err: 'Ошибка авторизации'})
        }
    }catch (err) {
        res.status(500).json({err})
    }
});

module.exports = router;