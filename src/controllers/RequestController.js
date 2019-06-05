module.exports = (conn, io) => {
    //Расширяемся от базового контроллера
    const Controller = require('./Controller')(conn, "request", io);

    //Используем модель
    let Model = new (require('../models/Request'))(conn, "request", io);

    //Описываем контроллер
    class RequestController extends Controller {

        constructor(){
            super()
        }
    }



    //Создаем Контроллер
    return new RequestController()
}

