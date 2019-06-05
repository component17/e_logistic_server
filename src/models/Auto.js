const Model = require('./Model')

module.exports = class Auto extends Model {

    constructor(conn, table, io) {
        try {
            super(conn, table, io)
        } catch (err) {
            console.log(err)
        }
    }

}
