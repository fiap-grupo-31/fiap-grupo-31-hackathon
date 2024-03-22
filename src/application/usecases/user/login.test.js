const { loginUseCase } = require('./login');

describe('loginUseCase', () => {
  it('deve retornar 200 com tokens válidos para credenciais válidas', async () => {
    const email = 'test@example.com';
    const password = 'validpassword123';
    const cognitoRepository = {
      login: (email, password) => {
        return { status: 'success', token: '' };
      },
    };
    const result = await loginUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('access_token');
    expect(result.data).toHaveProperty('refresh_token');
  });

  it('deve retornar 500 com mensagem de erro para credenciais inválidas', async () => {
    const email = 'test@example.com';
    const password = 'invalid';
    const cognitoRepository = {
      login: (email, password) => {
        return { status: 'error', token: '' };
      },
    };
    const result = await loginUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data).toHaveProperty('message');
  });

  it('deve retornar 500 com mensagem de erro para parâmetros inválidos', async () => {
    const email = '';
    const password = '';
    const cognitoRepository = {
      login: (email, password) => {
        return { status: 'error', token: '' };
      },
    };
    const result = await loginUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data).toHaveProperty('message');
  });

  it('deve retornar 500 com mensagem de erro para exceção lançada', async () => {
    const email = 'test@example.com';
    const password = 'validpassword123';
    const cognitoRepository = {
      login: jest.fn().mockRejectedValue(new Error('Erro no servidor')), // Simulando uma exceção
    };
    const result = await loginUseCase(email, password, cognitoRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data).toHaveProperty('message');
  });
});
