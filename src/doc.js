const postman2apiary = require('postman2apiary')
const config = require('../config')
try {
    postman2apiary(config.app.postman.apiKey, config.app.postman.collectionID, config.app.postman.host, './apiary.apib')
} catch (err) {
    console.log({err, message: "Ошибка при попытке создать кокументацию"})
}