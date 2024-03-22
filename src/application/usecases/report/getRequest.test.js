const { getRequestUseCase } = require('./getRequest');

describe('getRequestUseCase', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar relatório para um determinado e-mail e id', async () => {
    const email = 'example@example.com';
    const id = 'yourId';
    const userId = 'userId';
    const reports = [
    ];
    const dynamodbRepositoryMock = {
      find: jest.fn().mockResolvedValueOnce(reports),
    };

    const result = await getRequestUseCase(email, id, dynamodbRepositoryMock);

  
    expect(result.statusCode).toBe(200);
    expect(result.data.report).toEqual(undefined);
  });

});
