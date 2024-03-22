const AWS = require('aws-sdk');
const dynamoClient = require('./dynamodbClient');

describe('DynamoDB Client', () => {
    it('deve criar uma instância do DynamoDB.DocumentClient', () => {
        expect(dynamoClient).toBeInstanceOf(AWS.DynamoDB.DocumentClient);
    });

    it('deve ter configurações adequadas', () => {
        expect(dynamoClient.service.config.region).toBe(undefined);
    });
});
