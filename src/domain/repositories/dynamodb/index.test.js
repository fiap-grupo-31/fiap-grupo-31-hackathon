const AWS = require('aws-sdk');
const dynamodbFuncion = require('./index');

jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        query: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        put: jest.fn()
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient)
        }
    };
});

describe('DynamoDB Functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('find', () => {
        it('deve chamar o método de consulta e resolver com resultado', async () => {
            const params = {};
            const expectedResult = {  };


            AWS.DynamoDB.DocumentClient().query.mockReturnValueOnce({
                promise: jest.fn().mockResolvedValueOnce(expectedResult)
            });
            const result = await dynamodbFuncion.find(params);

            expect(result).toEqual([]);
        });

        it('deve resolver com false em caso de erro na consulta', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            AWS.DynamoDB.DocumentClient().query.mockReturnValueOnce({
                promise: jest.fn().mockResolvedValue(new Error('Erro'))
            });

            const result = await dynamodbFuncion.find(params);

            expect(result.toString()).toBe("");
        });
        
        it('deve resolver com false em caso de erro', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            const result = await dynamodbFuncion.find(params);

            expect(result).toBe(false);
        });
    });

    describe('get', () => {
        it('deve chamar o método de consulta get e resolver com resultado', async () => {
            const params = {};
            const expectedResult = {  };

            AWS.DynamoDB.DocumentClient().get.mockReturnValueOnce({
                promise: jest.fn().mockResolvedValueOnce(expectedResult)
            });
            const result = await dynamodbFuncion.get(params);

            expect(result).toEqual([]);
        });

        it('deve resolver get com false em caso de erro', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            const result = await dynamodbFuncion.get(params);

            expect(result).toBe(false);
        });
    });

    describe('insertOrUpdate', () => {
        it('deve chamar o método insertOrUpdate e resolver com resultado', async () => {
            const params = {};
            const expectedResult = {  };

            AWS.DynamoDB.DocumentClient().update.mockReturnValueOnce({
                promise: jest.fn().mockResolvedValueOnce(expectedResult)
            });
            const result = await dynamodbFuncion.insertOrUpdate(params);

            expect(result).toEqual({});
        });

        it('deve resolver insertOrUpdate com false em caso de erro', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            const result = await dynamodbFuncion.insertOrUpdate(params);

            expect(result).toBe(false);
        });
    });

    describe('update', () => {
        it('deve chamar o método update e resolver com resultado', async () => {
            const params = {};
            const expectedResult = { status: true  };

            AWS.DynamoDB.DocumentClient().update.mockReturnValueOnce({
                promise: jest.fn().mockResolvedValueOnce(expectedResult)
            });
            
            const result = await dynamodbFuncion.update(params);

            expect(result).toEqual({"status": true});
        });

        it('deve resolver update com false em caso de erro', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            const result = await dynamodbFuncion.update(params);

            expect(result).toBe(false);
        });
    });

    describe('insert', () => {
        it('deve chamar o método insert e resolver com resultado', async () => {
            const params = {};
            const expectedResult = {  };

            const result = await dynamodbFuncion.insert(params);

            expect(result).toEqual(false);
        });

        it('deve resolver insert com false em caso de erro', async () => {
            const params = { };
            const error = new Error('Something went wrong');

            const result = await dynamodbFuncion.insert(params);

            expect(result).toBe(false);
        });
    });

});
