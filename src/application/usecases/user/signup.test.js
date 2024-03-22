const { signupUseCase } = require('./signup');

describe('signupUseCase', () => {
it('deve retornar 200 com mensagem de sucesso para cadastro bem-sucedido', async () => {
    const email = 'test@example.com';
    const password = 'validpassword123';
    const name = 'Test User';
    const cognitoRepository = {
      signup: (email, password) => {
        return true;
      },
    };
    const dynamodbRepository = {
      insert: (paramsUser) => {
        return paramsUser.Item;
      },
    };
    const result = await signupUseCase(email, password, name, 'xx', cognitoRepository, dynamodbRepository);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('message', 'Usuário criado com sucesso');
});

  it('deve retornar 500 com mensagem de erro para parâmetros inválidos', async () => {
    const email = '';
    const password = '';
    const cognitoRepository = {
      signup: (email, password) => {
        return false;
      },
    };
    const result = await signupUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data).toHaveProperty('message');
  });

  it('deve retornar 500 com mensagem de erro para exceção lançada', async () => {
    const email = 'test@example.com';
    const password = 'validpassword123';
    const cognitoRepository = {
      signup: jest.fn().mockRejectedValue(new Error('Erro no servidor')),
    };
    const result = await signupUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data).toHaveProperty('message');
  });
});
