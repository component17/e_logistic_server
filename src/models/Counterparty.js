const Model = require('./Model')

module.exports = class Counterparty extends Model {

    constructor(conn, table, io) {
        try {
            super(conn, table, io)
        } catch (err) {
            console.log(err)
        }
    }

}
