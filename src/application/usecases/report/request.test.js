const { requestUseCase } = require('./request');
const uuid = require('uuid');
jest.mock('uuid');

describe('requestUseCase', () => {
  it('deve retornar 500 quando o tipo de relatório não é "espelho"', async () => {
    const email = 'test@example.com';
    const type = 'invalido';
    const competence = '2022-01';
    const dynamodbRepository = {};
    const sqsRepository = {};

    const result = await requestUseCase(email, type, competence, dynamodbRepository, sqsRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data.message).toBe('Relatório inexistente');
  });

  it('deve retornar 500 quando a competência é inválida', async () => {
    const email = 'test@example.com';
    const type = 'espelho';
    const competence = '';
    const dynamodbRepository = {};
    const sqsRepository = {};

    const result = await requestUseCase(email, type, competence, dynamodbRepository, sqsRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data.message).toBe('Competencia inválida');
  });

  it('deve retornar 200 quando a solicitação de relatório é bem-sucedida', async () => {
    const email = 'test@example.com';
    const type = 'espelho';
    const competence = '2022-01';
    const dynamodbRepository = {
      find: jest.fn().mockResolvedValue([{ id: '1' }]),
      insert: jest.fn().mockResolvedValue(true),
    };
    const sqsRepository = {
      sendMessageSqs: jest.fn().mockResolvedValue(true),
    };
    uuid.v4.mockReturnValue('test-uuid');

    const result = await requestUseCase(email, type, competence, dynamodbRepository, sqsRepository);
    expect(result.statusCode).toBe(200);
    expect(result.data.id).toBe('test-uuid');
  });

  it('deve retornar 500 quando ocorre um erro desconhecido', async () => {
    const email = 'test@example.com';
    const type = 'espelho';
    const competence = '2022-01';
    const dynamodbRepository = {
      find: jest.fn().mockImplementation(() => { throw new Error('Erro desconhecido'); }),
    };
    const sqsRepository = {};

    const result = await requestUseCase(email, type, competence, dynamodbRepository, sqsRepository);
    expect(result.statusCode).toBe(500);
    expect(result.data.message).toBe('Erro desconhecido');
  });
});