let routes = require('./routes')
let config = require('../../config')

module.exports = (app, conn, io) => {

    let polices = require('../../config/polices')(conn, config.database.name)

    let includes = {}
    let methods = config.routes.methods

    for (let route in routes) {
        // let controller =
        let method = route.replace(/\s+/g, ' ').trim().split(' ')
        let controller = routes[route].replace(/\s+/g, ' ').trim().split('.')

        //Проверка типа запроса
        if (methods.indexOf(method[0].toUpperCase()) === -1) {
            console.warn({
                method: "ROUTES",
                message: "Получен не верный тип метода укажите один из типов: " + JSON.stringify(methods)
            })
            continue
        }
        //Проверяем существование Controller в includes
        if (!includes[controller[0]]) {

            let controllerPath = `../${config.app.controller}/${controller[0]}`
            try {
                includes[controller[0]] = (require(controllerPath))(conn, config.database.name, io)
            } catch (err) {
                console.log(err)
                console.error(`Не удалось загрузить Controller по пути [${controllerPath}]`)
                continue
            }
        }

        //Задаем роуты а так же полисы
        try {
            if (typeof includes[controller[0]][controller[1]] !== "function") {
                console.error({err: `Не удалось получить функцию [${controller[0]}.${controller[1]}()] проверьте ее существование`})
                continue
            }
            if (!polices[controller[0]]) {
                app[method[0].toLowerCase()](method[1], includes[controller[0]][controller[1]])
                continue
            }

            if (typeof polices[controller[0]][controller[1]] === "function") {
                // console.log(controller[0], controller[1], '2')
                app[method[0].toLowerCase()](method[1], polices[controller[0]][controller[1]], includes[controller[0]][controller[1]])
            } else if (polices[controller[0]][controller[1]] === false) {
                // console.log(controller[0], controller[1], '3')
                app[method[0].toLowerCase()](method[1], includes[controller[0]][controller[1]])
            } else if (typeof polices[controller[0]]['all'] === "function") {
                // console.log(controller[0], controller[1], '4')
                app[method[0].toLowerCase()](method[1], polices[controller[0]]['all'], includes[controller[0]][controller[1]])
            } else {
                // console.log(controller[0], controller[1], '5')
                app[method[0].toLowerCase()](method[1], includes[controller[0]][controller[1]])
            }


        } catch (err) {
            console.error(err)
            continue
        }

    }

    //Обработчик middleware ошибок
    app.use((err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            res.status(err.status).send({message: err.message})
            return
        }
        next()
    })

}