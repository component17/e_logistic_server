module.exports = (conn, table, io) => {

    const Model = new (require('../models/Model'))(conn, table, io)

    class Controller {

        async find(req, res) {
            try {
                let data = await Model.find(req.query)

                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }
        }

        async getter(req, res) {
            try {
                let data = await Model.getter(req.params.id)
                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }
        }

        async create(req, res) {
            try {
                let data = await Model.create(req.body)
                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }
        }

        async update(req, res) {
            try {
                let data = await Model.update(req.params.id, req.body.name)

                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }
        }

        async delete(req, res) {
            try {
                let data = await Model.delete(req.params.id)

                return res.status(200).json(data)
            } catch (err) {
                console.log(err)
                return res.status(500).json(err)
            }
        }
    }

    return  Controller
}
