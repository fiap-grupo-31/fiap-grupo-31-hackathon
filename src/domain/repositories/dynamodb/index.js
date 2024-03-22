const AWS = require('aws-sdk');

try {
    AWS.config.setPromisesDependency(require('bluebird')); 
} catch (error) {
    
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const dynamodbFunction = {
    find: async (params) => {
        try {
            return await new Promise( (resolve, error) => {
                dynamoDb.query(params).promise()
                .then(result => {
                    return resolve(result?.Item ?? result?.Items ?? []);
                })
                .catch(error => {
                    return resolve(false);
                });
            } )
        }
        catch (error) {
            return (false);
        }
    },
    get: async (params) => {
        try {
            return await new Promise( (resolve, error) => {
                dynamoDb.get(params).promise()
                .then(result => {
                    return resolve(result?.Item ?? result?.Items ?? []);
                })
                .catch(error => {
                    return resolve(false);
                });
            } )
        }
        catch (error) {
            return (false);
        }
    },
    insertOrUpdate: async (params) => {
        try {
            return await new Promise( (resolve, error) => {
                dynamoDb.update(params).promise()
                .then(result => {
                    return resolve(result);
                })
                .catch(error => {
                    return resolve(false);
                });
            } )
        }
        catch (error) {
            return (false);
        }
    },
    update: async (params) => {
        try {
            return await new Promise( (resolve, error) => {
                dynamoDb.update(params).promise()
                .then(result => {
                    return resolve(result);
                })
                .catch(error => {
                    return resolve(false);
                });
            } )
        }
        catch (error) {
            return (false);
        }
    },
    insert: async (params) => {
        try {
            return await new Promise( (resolve, error) => {
                dynamoDb.put(params).promise()
                .then(result => {
                    return resolve(result);
                })
                .catch(error => {
                    return resolve(false);
                });
            } )
        }
        catch (error) {
            return (false);
        }
    }
}

module.exports = dynamodbFunction;