const TableName = 'orders';

module.exports = (r, conn) => {
    return {
        getAllCompany(company_id){
            return new Promise((resolve, reject) => {
                r.table(TableName).filter({delete_at: null, company_id}).orderBy(r.desc('created_at')).coerceTo('array').run(conn, (err, data) => {
                    if(err) return reject(err);

                    resolve(data);
                })
            })
        },
        getAll(){
            return new Promise((resolve, reject) => {
                r.table(TableName).filter({delete_at: null}).orderBy(r.desc('created_at')).coerceTo('array').run(conn, (err, data) => {
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

                if(!model.car_id) model.car_id = null;
                if(model.delivery_at){
                    model.delivery_at = r.ISO8601(model.delivery_at)
                }else{
                    model.delivery_at = r.now()
                }

                let req = Object.assign(model, {
                    created_at: r.now(),
                    update_at: r.now(),
                    delete_at: null,
                    status: 'processing',
                    positions_tsd: [],
                });



                r.table(TableName).insert(req).run(conn, (err, data) => {
                    if(err) return reject(err);

                    req.id = data.generated_keys[0];
                    req.created_at = new Date().toISOString();

                    resolve(req);
                })
            })
        },
        update(id, model){
            return new Promise((resolve, reject) => {

                let req = Object.assign(model, {
                    update_at: r.now()
                });

                if(model.delivery_at){
                    req.delivery_at = r.ISO8601(model.delivery_at)
                }

                if(!model.status){
                    if(model.car_id && model.car_id.length){
                        req.status = 'work'
                    }else{
                        req.status = 'processing'
                    }
                }

                r.table(TableName).get(id).update(req).run(conn, async (err) => {
                    if(err) return reject(err);

                    try{
                        let res = await this.getById(id);
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
        },
        getNoSync(){
            return new Promise((resolve, reject) => {
                r.table(TableName).filter({car_id: null, delete_at: null}).coerceTo('array').run(conn, (err, data) => {
                    if(err) return reject(err);

                    console.log(data);

                    resolve(data);
                })
            })
        },
        getSync(date){
            return new Promise((resolve, reject) => {
                let start = new Date(+date);
                start.setHours(0,0,0,0);

                let end = new Date(+date);
                end.setHours(23,59,59,999);

                r.table(TableName).filter((item) => {
                    return item('delivery_at').during(r.ISO8601(start.toISOString()), r.ISO8601(end.toISOString())).and(item('delete_at').eq(null)).and(item('car_id').ne(null))
                }).coerceTo('array').run(conn, (err, data) => {
                    if(err) return reject(err);

                    resolve(data);
                })
            })
        },
        getTsd(car_id){
            return new Promise((resolve, reject) => {
                let start = new Date();
                start.setHours(0,0,0,0);

                let end = new Date();
                end.setHours(23,59,59,999);

                r.table(TableName).filter((item) => {
                    return item('delivery_at').during(r.ISO8601(start.toISOString()), r.ISO8601(end.toISOString())).and(item('delete_at').eq(null)).and(item('car_id').eq(car_id).and(item('status').ne('success')))
                }).merge((order) => {
                    return {
                        company: r.table('companies').get(order('company_id'))
                    }
                }).coerceTo('array').run(conn, (err, data) => {
                    if(err) return reject(err);

                    resolve(data);
                })
            })
        }
    }
};