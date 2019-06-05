const r = require('rethinkdb')
const ReQL = require('./ReQL')
const crypto = require('crypto')
const validator = require('validator')
const SandGrid = require('./SandGrid')
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')
const _ = require('lodash')

module.exports = class Auth {

    constructor(conn, dbName, table = "users") {
        if (!conn.open) {
            throw new Error("Не удалось получить соединение с ReQL")
        }
        this.conn = conn
        this.table = table
        this.dbName = dbName
        this.minPasswordLenght = 6
        this.jwtSecret = 'barCodeSecretData'
        this.hideData = ['password', 'id']
        this.jwt = jwt
    }

    /**
     * Генерирует JWT token
     */
    jwtCreate(payload) {
        return jwt.sign(
            payload,
            this.jwtSecret, // Token Secret that we sign it with
            {
                expiresIn: 180 * 60 * 60 // Token Expire time
            }
        )
    }

    /**
     * Проверка существования пользоаветеля
     * @param id {String}
     */
    findUsers(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await ReQL.select(this.conn, this.dbName, this.table, {id})
                return resolve(users)
            } catch (err) {
                console.log(err)
                return reject(err)
            }
        })
    }


    /**
     * Проверяем наличие пользоавтеля в БД
     */
    jwtVerify() {
        return async (req, payload, done) => {
            try {
                let users = await this.findUsers(payload.id)

                if (users.length === 0) {
                    return done(null, true)
                }
                req.auth = users[0]

                return done(false)
            }catch (e) {
                console.log(e)
                return done(null, true) 
            }
        }
    }

    /**
     * Промежутноая функция express запросов проверяем наличие авторизации
     */
    middleware() {
        return exjwt({
            secret: this.jwtSecret,
            isRevoked: this.jwtVerify()
        })
    }

    /**
     * MD5
     * @param str {String}
     */
    md5(str) {
        return crypto.createHash('md5').update(str).digest("hex")
    }

    /**
     * Шифрует пароль пользователя в одну сторону
     * @param password {String}
     */
    cryptPassword(password) {
        return this.md5(this.md5(password))
    }

    /**
     * Проверка пользователя на наличие его в БД
     */
    checkUser(email) {
        return new Promise(async (resolve, reject) => {
            try {
                let count = await ReQL.count(this.conn, this.dbName, this.table, {email})
                // console.log({count})
                return resolve(count === 0)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }


    /**
     * Регистрация пользователя
     * @param email {String} - E-mail пользователя
     * @param password {String} - пароль пользователя
     * @param username {String} - Имя пользователя
     */
    register(email = '', password = '', username = '') {
        return new Promise(async (resolve, reject) => {
            try {
                if (!validator.isEmail(email)) {
                    return reject({field: "email", err: "Не корректно указан адрес электронной почты"})
                }
                if (!validator.isByteLength(password, {min: this.minPasswordLenght})) {
                    return reject({field: "password", err: "Пароль должен быть минимум 6 символов"})
                }

                let check = await this.checkUser(email)
                if (!check) {
                    return reject({err: "Пользователь с таким E-mail уже существует в БД"})
                }

                let data = await ReQL.insert(this.conn, this.dbName, this.table, {
                    email,
                    password: this.cryptPassword(password),
                    username,
                    createAt: r.now(),
                    updateAt: r.now(),
                    deleteAt: null,
                })

                if (data.length === 0) {
                    return reject({err: "Произошла ошибка при добавлении пользователя в БД"})
                }

                SandGrid.registerUser(email, password, username)

                return resolve(true)
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }

    /**
     * Авторизация пользователя
     * @param email {String}
     * @param password {String}
     */
    login(email = '', password = '') {
        return new Promise(async (resolve, reject) => {
            try {
                if (!validator.isEmail(email)) {
                    return reject({field: "email", err: "Не корректно указан адрес электронной почты"})
                }
                if (!validator.isByteLength(password, {min: this.minPasswordLenght})) {
                    return reject({field: "password", err: "Не корректный пароль"})
                }

                //Получаем пользователя
                let user = await ReQL.select(this.conn, this.dbName, this.table, {
                    email
                })

                if (!user.length) {
                    return reject({err: 'Пользователь с таким E-mail еще не зарегистрирован'})
                }

                user = user[0]

                if (user.password !== this.cryptPassword(password)) {
                    return reject({err: "Не верный пароль"})
                }

                let id = user.id
                user = _.omit(user, this.hideData)

                resolve({
                    user,
                    jwt: this.jwtCreate({id})
                })
            } catch (err) {
                console.log(err)
                reject(err)
            }
        })
    }
}