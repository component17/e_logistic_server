module.exports = (r, conn) => {
    return {
        Car: require('./Car.js')(r, conn),
        Driver: require('./Driver.js')(r, conn),
        Company: require('./Company.js')(r, conn),
        Order: require('./Order.js')(r, conn),
    }
}