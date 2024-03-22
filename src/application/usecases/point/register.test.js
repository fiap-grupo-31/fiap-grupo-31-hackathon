const { registerUseCase } = require('./register');

describe('registerUseCase', () => {
  it('deve retornar 200 com dados do ponto para usuário válido', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: jest.fn().mockReturnValue([{ id: 1 }]),
      insertOrUpdate: jest.fn().mockReturnValue({ id: 1, dateHour: '2022-01-01 00:00:00' }),
    };
    const result = await registerUseCase(email, dynamodbRepository);
    expect(result.statusCode).toBe(200);
    expect(result.data.point).toBeDefined();
  });

  it('deve retornar 500 com mensagem de erro quando ocorrer um erro desconhecido', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: jest.fn().mockImplementation(() => { throw new Error('Erro desconhecido'); }),
    };
    const result = await registerUseCase(email, dynamodbRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data.message).toBe('Erro desconhecido');
  });

  it('deve chamar a função find com o parâmetro correto', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: jest.fn(),
      insertOrUpdate: jest.fn(),
    };
    await registerUseCase(email, dynamodbRepository);
    expect(dynamodbRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      TableName: process.env.table_user,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }));
  });

  it('deve chamar a função insertOrUpdate com o parâmetro correto', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: jest.fn().mockReturnValue([{ id: 1 }]),
      insertOrUpdate: jest.fn(),
    };
    await registerUseCase(email, dynamodbRepository);
    expect(dynamodbRepository.insertOrUpdate).toHaveBeenCalledWith(expect.objectContaining({
      TableName: process.env.table_points,
      Key: {
        'userId': 1,
        'date': expect.any(String)
      },
      UpdateExpression: 'SET points = list_append(if_not_exists(points, :empty_list), :points)',
      ExpressionAttributeValues: {
        ':points': [{ 'dateHour': expect.any(String) }],
        ':empty_list': []
      },
      ReturnValues: 'ALL_NEW'
    }));
  });
});