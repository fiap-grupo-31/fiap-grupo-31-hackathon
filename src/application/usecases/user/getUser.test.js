const { getUserUseCase } = require('./getUser');

describe('getUserUseCase', () => {
  it('deve retornar 200 com dados do usuário para e-mail válido', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
        find: (email) => {
        return {
          status: 'success',
          email,
          userId: 1,
          emailVerified: 1,
        };
      },
    };
    const users = {"statusCode":200,"data":{"user":{"status":"success","email":{"IndexName":"EmailIndex","KeyConditionExpression":"email = :email","ExpressionAttributeValues":{":email":"test@example.com"}},"userId":1,"emailVerified":1}}};
    ;
    const result = await getUserUseCase(email, dynamodbRepository);
    expect(result.statusCode).toBe(200);
  });
  it('deve retornar 200 com mensagem de usuário não encontrado para e-mail inexistente', async () => {
    const email = 'nonexistent@example.com';
    const dynamodbRepository = {
        find: (email) => {
        return false;
      },
    };
    const result = await getUserUseCase(email, dynamodbRepository);
    expect(result.statusCode).toBe(200);
  });
  it('deve lidar com erros ao obter um usuário', async () => {
    const mockDynamodbRepository = {
      find: jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      }),
    };

    const response = await getUserUseCase('test@example.com', mockDynamodbRepository);

    expect(response).toEqual({
      statusCode: 500,
      data: {
        message: 'Test error',
      },
    });
  });
  it('deve retornar um objeto vazio quando nenhum usuário é encontrado', async () => {
    const mockDynamodbRepository = {
      find: jest.fn().mockImplementation(() => []),
    };
  
    const response = await getUserUseCase('nonexistent@example.com', mockDynamodbRepository);
  
    expect(response).toEqual({
      statusCode: 200,
      data: {
        user: [],
      },
    });
  });
  it('deve retornar status 500 com mensagem de erro quando ocorrer um erro desconhecido', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: () => { throw new Error('Erro desconhecido'); },
    };
    const result = await getUserUseCase(email, dynamodbRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data.message).toBe('Erro desconhecido');
  });
  it('deve retornar um objeto com statusCode e data', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: () => ({ /* retorno simulado */ }),
    };
    const result = await getUserUseCase(email, dynamodbRepository);
    expect(result).toHaveProperty('statusCode');
    expect(result).toHaveProperty('data');
  });
  it('deve chamar a função find com o parâmetro correto', async () => {
    const email = 'test@example.com';
    const dynamodbRepository = {
      find: jest.fn(),
    };
    await getUserUseCase(email, dynamodbRepository);
    expect(dynamodbRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      TableName: process.env.table_user,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }));
  });
});
