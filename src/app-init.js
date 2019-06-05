const cluster = require('cluster')
const worker = require('./worker')

module.exports = async (app, http) => {
    try {

        if (cluster.isMaster) {

            cluster.settings.windowsHide = true

            let cpuCount = require('os').cpus().length

            // Fork workers.
            if(process.env.NODE_ENV !== "production") {
                cpuCount = 3
            }
            for (let i = 0; i < cpuCount - 2; i++) {
                // schedulingPolicy: SCHED_RR or SCHED_NONE
                cluster.schedulingPolicy = cluster.SCHED_NONE
                //console.log(`schedulingPolicy ${cluster.schedulingPolicy}`)
                cluster.fork()
            }

            // worker's lifecycle
            cluster.on('fork', (worker) => {
                console.log(`Worker #${worker.id} is online =)`)
            })

            cluster.on('listening', (worker, address) => {
                console.log(`The worker #${worker.id} listen ${address.address === null ? 'localhost': address.address}:${address.port}`)
            })

            cluster.on('disconnect', (worker) => {
                console.log(`The worker #${worker.id} has disconnected`)
            })

            cluster.on('exit', (worker) => {
                console.log(`Worker ${worker.id} is dead =(`)
                cluster.fork()
            })

            // Count requests
            let numRequests = 0

            let messageHandler = (msg) => {
                if (msg.cmd && msg.cmd === 'notifyRequest') {
                    numRequests += 1
                    console.log(`Requests received: ${numRequests}`)
                }
            }

            // Workers are waiting for Master's message
            for (const id in cluster.workers) {
                cluster.workers[id].on('message', messageHandler);
            }
        } else {
            await worker(app, http);
        }
    } catch (err) {
        console.log(err)
    }

}