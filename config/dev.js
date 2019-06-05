/**
 * Этот конфиг заменяет насйтроки продакшн конфига и выдается как основной при process.env.NODE_ENV !== 'production'
 */
module.exports = {
    database: {
        host: '151.248.124.40',
        user: 'admin',
        password: 'dac9fdac-b925-4c50-b860-0c9d778afcb8',
        name: 'logistic'
    }
};