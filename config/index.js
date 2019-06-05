let config = require('./prod');

if(process.env.NODE_ENV !== "production"){
    let dev = require('./dev');
    for(let i in dev){
        config[i] = dev[i];
    }
}

module.exports = config;
