const r = require('rethinkdb')
const uud = require('uuid/v4')
const _ = require('lodash')

class ReQL {

    constructor(){
        this.r = r;
        this.conn = null
    }
    /**
     * Открываем соединение с БД
     * @param connData {Object} - Объект с ключами {host,port,user,password}
     * @param errorHandle {Function} - Обработка ошибок
     * @return Promise
     */
    connect(connData, errorHandle = undefined) {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await r.connect(connData)
                conn.addListener('error', (e) => {
                    console.log('Потеряно соединение с RethinkDB', e)
                    if(typeof errorHandle === "function"){
                        errorHandle()
                    }
                })
                resolve(conn)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Рекурсивное соединение с БД
     * @param connData {Object} - Объект для соединение с ReQL
     * @param timeWait {Number} - Время задержки перед следующей попыткой
     * @param limit {Number} - Маскимальное кол-во попыток
     * @param i {Number} - счетчик попыток
     * @return {Object} - Соединение с БД.
     */
    recursionConnect(connData, timeWait = 10000, limit = 30, i = 0) {
        console.log('Попытка соединение с БД')
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await this.connect(connData)
                console.log('Соединение с БД установлено')
                return resolve(conn)
            } catch (err) {
                if (i <= limit) {
                    console.log('Ошибка, ждем ' + (timeWait / 1000) + "сек. и пробуем установить соединение вновь.")
                    await this.wait(timeWait)
                    console.log('Попытка номер "' + i + '"..')
                    i++
                    return resolve(await this.recursionConnect(connData, timeWait, limit, i))
                }
                reject(err)
            }
        })
    }

    /**
     * Синхронное ожидание
     * @param ms {Number} - Милисекунды
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Закрываем соединение с БД
     * @param conn {Object} - Объект соединения с БД
     * @return Promise
     */
    close(conn) {
        return new Promise((resolve, reject) => {
            try {
                //Закрываем соединение с БД
                conn.close((err) => {
                    if (err) return reject('Произошла ошибка при попытке закрыть соединение')
                    resolve()
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Получаем список Баз данных
     * @param conn {Object} - Объект соединения с БД
     * @return Promise
     */
    dbList(conn) {
        return new Promise((resolve, reject) => {
            try {
                r.dbList().run(conn, async (err, data) => {
                    if (err) {
                        return reject(err)
                    }
                    //Удаляем из списка БД базу rethinkdb
                    let index = data.indexOf("rethinkdb")

                    if (index !== -1) {
                        data.splice(index, 1)
                    }
                    resolve(data)
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Создание базы данных
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     */
    dbCreate(conn, dbName) {
        return new Promise((resolve, reject) => {
            try {
                r.dbCreate(dbName).run(conn, async err => {
                    if (err) {
                        return reject(err)
                    }
                    resolve(dbName);
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param replicas {Number} - кол-во кластеров
     * @param shards {Number} - кол-во шард
     */
    dbReconfigure(conn, dbName, replicas = 1, shards = 1) {
        return new Promise((resolve, reject) => {
            try {
                if (replicas <= 0) {
                    replicas = 1
                }
                if (shards <= 0) {
                    shards = 1
                }
                r.db(dbName).reconfigure({replicas, shards}).run(conn, err => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Добавляем пользователя в БД
     * @param conn {Object} - Соединение с БД
     * @param dbName {String} - Название базы данных
     * @param user {String} - Имя пользователя
     * @param password {String} - Пароль пользователя
     */
    createUser(conn, dbName, user = uud(), password = uud()) {
        return new Promise((resolve, reject) => {
            try {
                r.db('rethinkdb').table('users').insert({id: user, password}).run(conn, async err => {
                    if (err) {
                        return reject(err)
                    }
                    resolve({
                        login: user,
                        password
                    })
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    /**
     * Задаем права для пользователя Базы данных
     * @param conn {Object} - Соединение с RethinkDB
     * @param dbName {String} - Название базы данных
     * @param user {String} - имя пользователя
     * @param permission {Object} - Список доступных прав
     */
    setUserPermission(conn, dbName, user, permission = {read: true, write: true, config: true}) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).grant(user, permission).run(conn, err => {
                    if (err) {
                        return reject(err)
                    }
                    resolve()
                })
            } catch (err) {
                reject(err)
            }
        })
    }


    /**
     * Создаем таблбицу в ReQL
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param tableName {String} - Название таблицы которую собираемся создавать.
     * @param tableParams {Object} - Параметры создания таблицы такие как репликация и т д.
     * @param tableIndexes {Array} - Массив с индексами для этой таблицы
     * @return Promise
     */
    tableCreate(conn, dbName, tableName, tableParams = {}, tableIndexes = []) {
        return new Promise((resolve,reject) => {
            try {
                r.db(dbName).tableCreate(tableName, tableParams).run(conn, async err => {
                    if (err) return reject({err: 'Произошла ошибка при попытке создания таблицы в БД'})
                    if (tableIndexes.length) {

                        //Получаем список индексов в таблице
                        let promises = []

                        //Получаем список индексов данной таблицы
                        let indexList = await this.indexList(conn, dbName, tableName)

                        let remove = _.filter(indexList, itm => !_.includes(tableIndexes, itm))
                        let create = _.filter(tableIndexes, itm => !_.includes(indexList, itm))
                        //console.log({table: tableName, remove, create})
                        _.each(remove, index => promises.push(this.indexDrop(conn, dbName, tableName, index)))
                        _.each(create, index => promises.push(this.indexCreate(conn, dbName, tableName, index)))

                        //Выполняем все Promise
                        let result = await Promise.all(promises)
                        resolve(result)

                    }
                    resolve()
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Удаляет таблбицу в ReQL
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param tableName {String} - Название таблицы которую хотим удалить
     * @return Promise
     */
    tableDrop(conn, dbName, tableName) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).tableDrop(tableName).run(conn, err => {
                    if (err) return reject({err: 'Произошла ошибка при попытке удалить таблицу в БД'})
                    resolve()
                })
            } catch (err) {
                console.log('Произошла ошибка при удалении таблицы: ', tableName)
                resolve(err)
            }
        })
    }

    /**
     * Получаем список таблиц ReQL
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @return Promise
     */
    tableList(conn, dbName) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).tableList().run(conn, (err, data) => {
                    if (err) return reject({err: 'Произошла ошибка при попытке получить список сущестующих таблиц'})
                    resolve(data)
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Получить статус индекса таблицы
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param index {String} - индекс. Информацию о котором мы хотим получить
     * @return Promise
     */
    indexStatus(conn, dbName, table, index) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).table(table).indexStatus(index).run(conn, (err, data) => {
                    if (err) return reject({message: 'Произошла ошибка при создании индекса таблицы', err})
                    resolve(data)
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Создает индекс для таблицы ReQL
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param index {String} - Индекс который мы хотим создать в данной таблицы
     * @return Promise
     */
    indexCreate(conn, dbName, table, index) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).table(table).indexCreate(index).run(conn, (err, data) => {
                    if (err) {
                        return reject({message: "Произошла ошибка при создании индекса", err})
                    }
                    r.db(dbName).table(table).indexWait().run(conn, (err, data) => {
                        if (err) return reject({
                            message: 'Произошла ошибка при создании индекса [2]',
                            err
                        })
                        resolve(data)
                    })
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Удаляет индекс из таблицы ReQL
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param index {String} - Индекс который мы хотим удалить в данной таблицы
     * @return Promise
     */
    indexDrop(conn, dbName, table, index) {
        return new Promise((resolve, reject) => {
            try {
                r.db(dbName).table(table).indexDrop(index).run(conn, (err, data) => {
                    if (err) {
                        return reject({err: "Произошла ошибка при попытке удалить индекс таблицы"})
                    }
                    r.table('posts').indexWait().run(conn, (err, data) => {
                        if (err) return reject({
                            message: 'Произошла ошибка при попытке удалить индекс таблицы',
                            err
                        })
                        resolve(data)
                    })
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Получаем список индексов таблицы в ReSQ
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @return Promise
     */
    indexList(conn, dbName, table) {
        return new Promise((resolve,reject) => {
            try {
                r.db(dbName).table(table).indexList().run(conn, (err, data) => {
                    if (err) return reject({message: 'Произошла ошибка при попытке получить список индексов таблицы', err})
                    resolve(data)
                })
            } catch (err) {
                console.log(err)
                resolve(err)
            }
        })
    }

    /**
     * Получаем кол-во элементов в таблице
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param params {Object} - Параметры поиска
     */
    count(conn, dbName, table, params){
        return new Promise((resolve, reject) => {
            try{
                r.db(dbName).table(table).filter(params).count().run(conn, (err, data) => {
                    if (err) {
                        return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                    }
                    resolve(data)
                })
            }catch(err){
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Записываем данные в таблицу
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param object {Object} - Объект который будет записан в таблицу
     */
    insert(conn, dbName, table, object){
       return new Promise((resolve, reject) => {
           try{
               r.db(dbName).table(table).insert(object).run(conn, (err, data) => {
                   if (err) {
                       return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                   }
                   resolve(data.generated_keys)
               })
           }catch(err){
               console.log(err)
               reject(err)
           }
       }) 
    }

    /**
     * "Удаляет" данные из бд - обновляя поле deleteAt
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param object {Object} - Объект который будет записан в таблицу
     */
    delete(conn, dbName, table, object){
       return new Promise((resolve, reject) => {
           try{
               r.db(dbName).table(table).filter(object).update({deleteAt: r.now()}).run(conn, (err, data) => {
                   if (err) {
                       return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                   }
                   resolve(data)
               })
           }catch(err){
               console.log(err)
               reject(err)
           }
       })
    }

    /**
     * Поиск записей в БД
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param params {Object} - Параметры поиска
     * @param orderBy {Object} - Сортировка {indexName: "desc" || "asc"}
     */
    select(conn, dbName, table, params, orderBy = false){
        return new Promise((resolve, reject) => {
            try{
                let order = false
                if(orderBy && typeof orderBy === "object"){
                        order = Object.keys(orderBy);
                        if(order.length === 0){
                            orderBy = false;
                        }
                        orderBy = {
                            index: order[0],
                            order: orderBy[order[0]] === "desc" ? "desc" : "asc"
                        };
                }

                let handle = (err, cursor) => {
                    if (err) {
                        return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                    }
                    cursor.toArray((err, data) => {
                        if(err){
                            return reject(err);
                        }
                        resolve(data)
                    })
                }

                if(typeof orderBy === "object"){
                    r.db(dbName).table(table).filter(params).orderBy(r[orderBy.order](orderBy.index)).run(conn, handle)
                }else{
                    r.db(dbName).table(table).filter(params).run(conn, handle)
                }
            }catch(err){
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Получаем только 1 запись из БД
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param id {String} - id записи в БД
     */
    findOne(conn, dbName, table, id){
        return new Promise((resolve, reject) => {
            try {
                let handle = (err, data) => {
                    if (err) {
                        return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                    }
                    resolve(data)
                }

                r.db(dbName).table(table).get(id).run(conn, handle)
            }catch(err){
                console.log(err)
                return reject(err)
            }
        })
    }

    /**
     * Поиск записей в БД
     * @param conn {Object} - Соединение с БД Rethink
     * @param dbName {String} - Название БД
     * @param table {String} - Название таблицы
     * @param params {Object} - Параметры поиска
     * @param object {Object} - Значение которые нужно изменить
     */
    update(conn, dbName, table, params, object){
        return new Promise((resolve, reject) => {
            try{
                let handle = (err, cursor) => {
                    if (err) {
                        return reject({message: 'Произошла ошибка при получении кол-ва элементов в таблице', err})
                    }
                    resolve(cursor)
                }

                r.db(dbName).table(table).filter(params).update(object).run(conn, handle)

            }catch(err){
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Строняет конфликт баз данных "test"
     * @param conn {Object} - Соединение с БД Rethink
     * @return Promise
     */
    fixConflictDB(conn) {
        return new Promise((resolve, reject) => {
            try {
                r.db("rethinkdb")
                    .table("db_config")
                    .filter({name: "test"})
                    .delete()
                    .run(conn, (err) => {
                        if (err) {
                            return reject()
                        }
                        return resolve()
                    })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Изменение пароля пользователя
     * @param conn {Object} - Соединение с БД Rethink
     * @param user {String} - Имя пользователя
     * @param password {String} - пароль
     * @return Promise
     */
    changeUserPassword(conn, user = "admin", password = uud()) {
        return new Promise((resolve, reject) => {
            try {
                r.db('rethinkdb').table('users').update({id: user, password}).run(conn, async err => {
                    if (err) {
                       return reject(err)
                    }
                    resolve({
                        login: user,
                        password
                    })
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }


}

module.exports = new ReQL()