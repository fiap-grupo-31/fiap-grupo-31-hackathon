const AWS = require('aws-sdk');

const client = new AWS.DynamoDB.DocumentClient();

module.exports = client;