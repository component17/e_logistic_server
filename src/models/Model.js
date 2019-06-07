const r = require('rethinkdb')
const ReQL = require('./ReQL')
const config = require('../../config')

module.exports = class Model {
    /**
     * Конструктор
     * @constructor
     * @param conn {Object} - Соединение с БД
     * @param table {String} - Название таблицы
     * @param io {Object} - Соединение Socket
     */
    constructor(conn, table, io = null) {
        if(!conn) {
            throw new Error('Для создание модели укажите [conn]')
        }
        if(conn.isConnected) {
            throw new Error('Для создание модели должно быть актуально соединение с RethinkDB')
        }
        if(!table){
            throw new Error('Укажите параметр [table]')
        }
        this.conn = conn
        this.io = io
        this.db = config.database.name
        this.table = table
    }

    /**
     * Проверяем пренадлежность категории к этому пользователю
     * @param id {String} - id проверяемой категории
     * @return Promise
     */
    isset(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!id) {
                    return resolve(false)
                }

                let count = await ReQL.count(this.conn, this.db, this.table, {id})
                return resolve(count !== 0)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Возвращает значение элемента
     * @param id {String} - id элемента
     * @return Promise
     */
    getter(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!id) {
                    return reject({err: 'Укажите параметр [id]'})
                }

                let handler = (err, data) => {
                    if (err) {
                        return reject(err)
                    }
                    return resolve(data)
                }

                r.db(this.db).table(this.table).get(id).run(this.conn, handler)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }


    /**
     * Возвращает список элементов в зависимости от параметров query
     * @param query {Object} - Параметры выборки из БД
     * TODO: Прикрутить сюда сортировку
     * @return Promise
     */
    find(query) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await ReQL.select(this.conn, this.db, this.table, {...query, deleteAt: null})
                return resolve(data)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Добавляем категорию в БД
     * @param data {Object} - Данные которые будут добавлены
     * @return Promise
     */
    create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!data) {
                    return reject({err: "Укажите параметр [data]"})
                }

                let inserted = await ReQL.insert(this.conn, this.db, this.table, {
                    ...data,
                    createAt: r.now(),
                    updateAt: r.now(),
                    deleteAt: null,
                })

                if (inserted.length === 0) {
                    return reject({err: "Неудалось создать запись в БД"})
                }

                let res = await this.getter(inserted[0])
                return resolve(res)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Метод изменения категории
     * @param id {String} - id елемента
     * @param data {Object} - Данные которые собираемся изменять
     * @return Promise
     */
    update(id, data) {
        return new Promise(async (resolve, reject) => {
            try {

                if (!data) {
                    return reject({err: "Укажите параметр [data]"})
                }

                let check = await this.isset(id)
                if (!check) {
                    return reject({err: "Отказано в доступе"})
                }

                //Изменяем запись в БД
                await ReQL.update(this.conn, this.db, this.table, {id}, {...data, updateAt: r.now()})

                let res = await this.getter(id)

                return resolve(res)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Метод изменения категории
     * @param id {String} - id категории которую собираемся изменять
     * @return Promise
     */
    delete(id) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!id) {
                    return reject({err: "Укажите обязательное поле [id]"})
                }
                //Проверяем пренадлежность этой категори
                let check = await this.isset(id)

                if (!check) {
                    return reject({err: "Отказано в доступе"})
                }

                //Изменяем запись в БД
                await ReQL.delete(this.conn, this.db, this.table, {id})

                let data = await this.getter(id)

                return resolve(data)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }
}