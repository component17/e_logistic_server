module.exports = (conn, io) => {
    //Расширяемся от базового контроллера
    const Controller = require('./Controller')(conn, "counterparty", io);

    //Используем модель
    let Model = new (require('../models/Counterparty'))(conn, "counterparty", io);

    //Описываем контроллер
    class CounterpartyController extends Controller {

        constructor(){
            super()
        }
    }



    //Создаем Контроллер
    return new CounterpartyController()
}

