const { handler } = require('./getRequest');
const {
  getRequestUseCase,
} = require('../../../application/usecases/report/getRequest');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');
const { sendResponse } = require('../../../functions');

jest.mock('../../../application/usecases/report/getRequest');
jest.mock('../../../functions');

describe('handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar getRequestUseCase corretamente e retornar a resposta HTTP', async () => {
    const email = 'test@example.com';
    const id = 'yourId';
    const event = {
      requestContext: {
        authorizer: {
          claims: {
            email,
          },
        },
      },
      pathParameters: { id },
    };

    const mockResponse = {
      statusCode: 200,
      data: { message: 'yourMessage' },
    };

    getRequestUseCase.mockResolvedValueOnce(mockResponse);

    const expectedStatusCode = mockResponse.statusCode;
    const expectedData = mockResponse.data;

    const result = await handler(event);

    expect(getRequestUseCase).toHaveBeenCalledWith(
      email,
      id,
      dynamodbRepository
    );

    expect(sendResponse).toHaveBeenCalledWith(expectedStatusCode, expectedData);

    expect(result).toEqual(undefined);
  });

  it('deve retornar o status 500 se ocorrer um erro no caso de uso', async () => {
    try {
      const email = 'test@example.com';
      const id = 'yourId';
      const event = {
        requestContext: {
          authorizer: {
            claims: {
              email,
            },
          },
        },
        pathParameters: { id },
      };

      const mockErrorMessage = 'Internal server error';

      getRequestUseCase.mockRejectedValueOnce(mockErrorMessage);

      const expectedStatusCode = 500;
      const expectedData = { message: mockErrorMessage };
      const expectedResponse = {
        statusCode: expectedStatusCode,
        data: expectedData,
      };

      const result = await handler(event);

      expect(getRequestUseCase).toHaveBeenCalledWith(
        email,
        id,
        dynamodbRepository
      );

      expect(sendResponse).toHaveBeenCalledWith(
        expectedStatusCode,
        expectedData
      );

      expect(result).toEqual(expectedResponse);
    } catch (error) {}
  });
});
