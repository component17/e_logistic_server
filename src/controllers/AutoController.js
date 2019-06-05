module.exports = (conn, io) => {
    //Расширяемся от базового контроллера
    const Controller = require('./Controller')(conn, "auto", io);

    //Используем модель
    let Model = new (require('../models/Auto'))(conn, "auto", io);

    //Описываем контроллер
    class AutoController extends Controller {

        constructor(){
            super()
        }
    }



    //Создаем Контроллер
    return new AutoController()
}

