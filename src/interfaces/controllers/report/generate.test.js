const { handler } = require('./generate');
const {
  generateUseCase,
} = require('../../../application/usecases/report/generate');
const dynamodbRepository = require('../../../domain/repositories/dynamodb');

jest.mock('../../../application/usecases/report/generate');

describe('handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve chamar generateUseCase para cada registro do evento e retornar "ok"', async () => {
    const event = {
      Records: [
        { body: JSON.stringify({ id: '1', email: 'test1@example.com' }) },
        { body: JSON.stringify({ id: '2', email: 'test2@example.com' }) },
      ],
    };

    const mockResponse = { statusCode: 200, data: { message: 'Your message' } };

    generateUseCase.mockResolvedValueOnce(mockResponse);

    const result = await handler(event);

    expect(generateUseCase).toHaveBeenCalledTimes(event.Records.length);
    for (const record of event.Records) {
      const { body } = record;
      const data = JSON.parse(body);
      expect(generateUseCase).toHaveBeenCalledWith(data, dynamodbRepository);
    }

    expect(result).toEqual('ok');
  });

  it('deve registrar e continuar se ocorrer um erro durante o processamento de um registro', async () => {
    try {
      const event = {
        Records: [{ body: '{ invalidJson }' }],
      };

      generateUseCase.mockRejectedValueOnce('Error message');

      const result = await handler(event);

      expect(generateUseCase).toHaveBeenCalledTimes(1);

      expect(result).toEqual('ok');
    } catch (error) {}
  });
});
