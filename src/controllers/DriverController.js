module.exports = (conn, io) => {
    //Расширяемся от базового контроллера
    const Controller = require('./Controller')(conn, "driver", io);

    //Используем модель
    let Model = new (require('../models/Driver'))(conn, "driver", io);

    //Описываем контроллер
    class AutoController extends Controller {

        constructor(){
            super()
        }
    }



    //Создаем Контроллер
    return new AutoController()
}

