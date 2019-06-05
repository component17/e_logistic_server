
module.exports = (conn, dbName) => {

    let Auth = new (require('../src/models/Auth'))(conn, dbName);

    let jwt = Auth.middleware()
    
    return {

        //Настройка polices
        AutoController: {
            all: false
        },
    }
}