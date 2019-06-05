const cluster = require('cluster')
module.exports = (conn, dbName, io) => {

    return {

        async root(req, res) {
            process.send({cmd: 'notifyRequest'});
            return res.status(200).json({message: "Hello World! ", worker: cluster.worker.id});
        }
    }

}