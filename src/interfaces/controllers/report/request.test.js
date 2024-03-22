const { handler } = require('./request');
const { requestUseCase } = require('../../../application/usecases/report/request');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');
const sqsRepository = require('../../../infrastructure/sqs');
const { sendResponse } = require('../../../functions');

jest.mock('../../../application/usecases/report/request');
jest.mock('../../../functions');

describe('handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call requestUseCase correctly and return the HTTP response', async () => {
        const email = 'test@example.com';
        const type = 'yourType';
        const competence = 'yourCompetence';
        const event = {
            requestContext: {
                authorizer: {
                    claims: {
                        email,
                    },
                },
            },
            body: JSON.stringify({ type, competence }),
        };

        const mockResponse = {
            statusCode: 200,
            data: { message: 'yourMessage' },
        };

        requestUseCase.mockResolvedValueOnce(mockResponse);

        const expectedStatusCode = mockResponse.statusCode;
        const expectedData = mockResponse.data;

        const result = await handler(event);


        expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);

        expect(result).toEqual(undefined);
    });

    it('should return status 500 if an error occurs in the use case', async () => {
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
                body: '{}', 
            };

            const mockErrorMessage = 'Internal server error';

            requestUseCase.mockRejectedValueOnce(mockErrorMessage);

            const expectedStatusCode = 500;
            const expectedData = { message: mockErrorMessage };
            const expectedResponse = { statusCode: expectedStatusCode, data: expectedData };

            const result = await handler(event);

            expect(requestUseCase).toHaveBeenCalledWith(email, '', '', dynamodbRepository, sqsRepository);

            expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);

            expect(result).toEqual(expectedResponse);
        } catch (error) {
            
        }
    });

});
