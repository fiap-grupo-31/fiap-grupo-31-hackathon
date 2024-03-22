const { handler } = require('./register');
const { registerUseCase } = require('../../../application/usecases/point/register');
const { sendResponse } = require('../../../functions');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');

jest.mock('../../../application/usecases/point/register');
jest.mock('../../../functions');

describe('handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar o caso de uso de registro corretamente e retornar a resposta HTTP', async () => {
        const email = 'test@example.com';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
        };
        const mockResponse = {
            statusCode: 200,
            data: { message: 'Point registered successfully' },
        };
        registerUseCase.mockResolvedValueOnce(mockResponse);

        const expectedStatusCode = mockResponse.statusCode;
        const expectedData = mockResponse.data;
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(registerUseCase).toHaveBeenCalledWith(email, dynamodbRepository);
        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);
        expect(result).toEqual(undefined);
    });

    it('deve retornar status 500 se ocorrer um erro no caso de uso', async () => {
       try {
        const email = 'test@example.com';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
        };
        const mockErrorMessage = 'Internal server error';
        registerUseCase.mockRejectedValueOnce(mockErrorMessage);

        const expectedStatusCode = 500;
        const expectedData = {};
        const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

        const result = await handler(event);

        expect(registerUseCase).toHaveBeenCalledWith(email, dynamodbRepository);
        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);
        expect(result).toEqual(expectedResponse);
       } catch (error) {
        
       }
    });
});
