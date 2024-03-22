const { getPointUseCase } = require('./getPoint');
const { prepareDateGenerate } = require('../../../functions');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');

jest.mock('../../../functions');

describe('getPointUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve chamar o DynamoDB com os parâmetros corretos e retornar a resposta HTTP 200', async () => {
        const email = 'test@example.com';
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';
        const dynamodbResponse = {
            Items: [],
        };
        const mockPrepareDateGenerateResponse = {};
        const expectedResponse = {
            statusCode: 200,
            data: { point: mockPrepareDateGenerateResponse },
        };

        const mockDynamodbRepositoryFind = jest.fn().mockResolvedValueOnce(dynamodbResponse);
        dynamodbRepository.find = mockDynamodbRepositoryFind;

        prepareDateGenerate.mockReturnValueOnce(mockPrepareDateGenerateResponse);

        const result = await getPointUseCase(email, startDate, endDate, dynamodbRepository);

        expect(mockDynamodbRepositoryFind).toHaveBeenCalledWith(expect.objectContaining({
            TableName: process.env.table_user,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
        }));

        expect(result).toEqual(expectedResponse);
    });

    it('deve retornar a resposta HTTP 500 em caso de erro', async () => {
        const error = new Error('Erro ao acessar o DynamoDB');
        const mockDynamodbRepositoryFind = jest.fn().mockRejectedValueOnce(error);
        dynamodbRepository.find = mockDynamodbRepositoryFind;

        const expectedResponse = {
            statusCode: 500,
            data: { message: error.message },
        };

        const result = await getPointUseCase('test@example.com', '2024-01-01', '2024-01-31', dynamodbRepository);

        expect(mockDynamodbRepositoryFind).toHaveBeenCalled();
        expect(prepareDateGenerate).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResponse);
    });
});
