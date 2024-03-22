const { handler } = require('./getPoint');
const { getPointUseCase } = require('../../../application/usecases/point/getPoint');
const { sendResponse } = require('../../../functions');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');

jest.mock('../../../application/usecases/point/getPoint');
jest.mock('../../../functions');

describe('handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar o caso de uso de ponto corretamente e retornar a resposta HTTP', async () => {
        const email = 'test@example.com';
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            queryStringParameters: {
                startDate,
                endDate,
            },
        };
        const mockResponse = {
            statusCode: 200,
            data: { message: 'Pontos recuperados com sucesso' },
        };
        getPointUseCase.mockResolvedValueOnce(mockResponse);

        const expectedStatusCode = mockResponse.statusCode;
        const expectedData = mockResponse.data;
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(getPointUseCase).toHaveBeenCalledWith(email, startDate, endDate, dynamodbRepository);
        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);
        expect(result).toEqual(undefined);
    });

    it('deve retornar status 500 se ocorrer um erro no caso de uso', async () => {
       try {
        const email = 'test@example.com';
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            queryStringParameters: {
                startDate,
                endDate,
            },
        };
        const mockErrorMessage = 'Internal server error';
        getPointUseCase.mockRejectedValueOnce(mockErrorMessage);

        const expectedStatusCode = 500;
        const expectedData = {};
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(getPointUseCase).toHaveBeenCalledWith(email, startDate, endDate, dynamodbRepository);
        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);
        expect(result).toEqual(expectedResponse);
       } catch (error) {
        
       }
    });

    it('deve retornar uma resposta adequada se a data de término for anterior à data de início', async () => {
        const email = 'test@example.com';
        const startDate = '2024-01-31';
        const endDate = '2024-01-01';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            queryStringParameters: {
                startDate,
                endDate,
            },
        };
        const expectedStatusCode = 500;
        const expectedData = { message: 'periodo incorreto' };
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);
        expect(result).toEqual(undefined);
    });

    it('deve retornar uma resposta adequada se as datas forem inválidas', async () => {
        const email = 'test@example.com';
        const startDate = 'invalid-date';
        const endDate = 'invalid-date';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            queryStringParameters: {
                startDate,
                endDate,
            },
        };
        const expectedStatusCode = 500;
        const expectedData = { message: 'datas incorretas' };
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(result).toEqual(undefined);
    });

    it('deve retornar uma resposta adequada se os parâmetros de consulta estiverem ausentes', async () => {
        const email = 'test@example.com';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            queryStringParameters: null,
        };
        const expectedStatusCode = 500;
        const expectedData = { message: 'datas incorretas' };
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(result).toEqual(undefined);
    });
});
