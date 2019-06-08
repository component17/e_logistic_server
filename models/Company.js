const TableName = 'companies';

module.exports = (r, conn) => {
    return {
        getAll(){
            return new Promise((resolve, reject) => {
                r.table(TableName).filter({delete_at: null}).coerceTo('array').run(conn, (err, data) => {
                    if(err) return reject(err);

                    resolve(data);
                })
            })
        },
        getById(id){
            return new Promise((resolve, reject) => {
                r.table(TableName).get(id).run(conn, (err, data) => {
                    if(err) return reject(err);
                    resolve(data);
                });
            })
        },
        create(model){
            return new Promise((resolve, reject) => {

                let req = Object.assign(model, {
                    created_at: r.now(),
                    update_at: r.now(),
                    delete_at: null
                });

                r.table(TableName).insert(req).run(conn, (err, data) => {
                    if(err) return reject(err);

                    req.id = data.generated_keys[0];

                    resolve(req);
                })
            })
        },
        update(id, model){
            return new Promise((resolve, reject) => {

                let req = Object.assign(model, {
                    update_at: r.now()
                });

                r.table(TableName).get(id).update(req).run(conn, async (err) => {
                    if(err) return reject(err);

                    try{
                        let res = this.getById(id);
                        resolve(res);
                    }catch(e) {
                        reject(e)
                    }
                })
            })
        },
        delete(id){
            return new Promise((resolve, reject) => {
                r.table(TableName).get(id).update({delete_at: r.now()}).run(conn, (err) => {
                    if(err) return reject(err);
                    resolve('ok');
                })
            })
        }
    }
};