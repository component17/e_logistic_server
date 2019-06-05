module.exports = {
    app: {
        controller: 'controllers',
        production: {
            api: 'https://api.example.com',
            host: 'https://example.com',
            port: 8080
        },
        postman: {
            apiKey: "6ae93406f06e47a7bf563334ac848be7",
            collectionID: "202196ec-1804-42fe-9b8b-3ecb6825c951",
            host: "https://api.example.com",
        },
        development: {
            port: 3000
        }
    },
    routes: {
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
        ]
    },
    database: {
        host: '10.50.3.86',
        user: 'admin',
        password: 'dac9fdac-b925-4c50-b860-0c9d778afcb8',
        name: 'logistic'
    },
    tables: {
        auto: {
            indexes: []
        },
        driver: {
            indexes: []
        },
        request: {
            indexes: [
                'parent'
            ]
        },
        counterparty: {
            indexes: []
        }
    }
}