const config = require('../config')
const ReQL = require('./models/ReQL')

const port = process.env.NODE_ENV === "production" ? config.app.production.port : config.app.development.port

module.exports = async (app, http) => {
    try {

        let conn = await ReQL.recursionConnect(config.database)

        conn.on('close', () => {
            console.log('Соединение закрыто')
            throw new Error('Соединение потерено "close"')
        });
        conn.on('timeout', () => {
            console.log('Таймаут соединения')
            throw new Error('Соединение потерено "timeout"')
        });
        conn.on('error', (err) => {
            console.log('Ошибка.. ',err)
            throw new Error('Соединение потерено "error"')
        });

        let dbList = await ReQL.dbList(conn)

        if (dbList.indexOf(config.database.name) === -1) {
            await ReQL.dbCreate(conn, config.database.name)
        }

        let tableList = await ReQL.tableList(conn, config.database.name)

        for (let tableName in config.tables) {
            if (tableList.indexOf(tableName) === -1) {
                await ReQL.tableCreate(conn, config.database.name, tableName, {}, config.tables[tableName].indexes || [])
            }
        }

        let notUsed = []
        for (let tableName of tableList) {
            let bool = false
            for (let table in config.tables) {
                if (tableName === table) {
                    bool = true
                    break
                }
            }
            if (!bool) {
                notUsed.push(tableName)
            }
        }
        if (notUsed.length) {
            console.warn("Имеются не описанные в файле [config/prod.js][tables] таблицы в БД ", notUsed)
        }

        const io = config.socket.init ? require('./socket')(http, conn) : null;
        require('./routes')(app, conn, io)

        http.listen(port, () => {
            // console.log('Example app listening on port: ' + port)
        })


        process.on('uncaughtException', (err) => {

            console.error(`${(new Date).toUTCString()} uncaught exception: ${err.message}`)
            console.error(err.stack)
            process.exit(1)
        })

    }catch (err) {
        console.log(err)
    }
}
