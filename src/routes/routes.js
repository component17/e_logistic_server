module.exports = {

    //Корень
    "GET /": "RootController.root",

    //Автомобили
    "GET /auto": "AutoController.find",
    "GET /auto/:id": "AutoController.getter",
    "POST /auto": "AutoController.create",
    "PATCH /auto/:id": "AutoController.update",
    "DELETE /auto/:id": "AutoController.delete",

    //Автомобили
    "GET /driver": "DriverController.find",
    "GET /driver/:id": "DriverController.getter",
    "POST /driver": "DriverController.create",
    "PATCH /driver/:id": "DriverController.update",
    "DELETE /driver/:id": "DriverController.delete",
}