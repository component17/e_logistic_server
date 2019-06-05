const _ = require('lodash');
/**
 * Контроллер отвечающий за авторизацию пользоватей
 * @param conn {Object} - Объект соединения в базой данных
 * @param dbName {String} - Название базы данных
 */
module.exports = (conn, dbName) => {

    const auth = new (require('../models/Auth'))(conn, dbName)
    const abf = new (require('../models/AntiBruteForce'))()
    //TODO: Сделать анти брут форс

    return {

        async me(req, res) {
            try {
                let userData = _.omit(req.auth, ['password', 'createAt', 'deleteAt', 'updateAt']);

                return res.status(200).json(userData)
            } catch (err) {
                return res.status(500).json(err)
            }
        },

        async register(req, res) {
            try {
                await auth.register(req.body.email, req.body.password, req.body.username)
                return res.status(200).json({message: "Пользователь успешно зарегистрирован"})
            } catch (err) {
                return res.status(500).json(err)
            }
        },
        /**
         * Авторизация пользователя
         * @param req {Object}
         * @param res {Object}
         * @return {Promise}
         */
        async login(req, res) {
            try {
                let data = await auth.login(req.body.email, req.body.password)
                console.log({data})
                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }

            return res.status(200).json({err: "eyfoiawdhfo"});
        }
    }

}