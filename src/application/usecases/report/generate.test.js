const { generateUseCase } = require('./generate');
const moment = require('moment-timezone');
const { prepareDateGenerate } = require('../../../functions');
const { sendEmail } = require('../../../interfaces/adapters/sendEmailAdapter');
const { putObject } = require('../../../interfaces/adapters/s3Adapter');

jest.mock('moment-timezone', () => {
    return jest.fn(() => ({
        startOf: jest.fn(() => ({
            format: jest.fn(() => '2024-03-01')
        })),
        endOf: jest.fn(() => ({
            format: jest.fn(() => '2024-03-31')
        }))
    }));
});

jest.mock('../../../functions', () => ({
    prepareDateGenerate: jest.fn(() => ({
        '2024-03-01': {
            duration: 8 * 3600, // 8 hours in seconds
            durationBreak: 1 * 3600, // 1 hour in seconds
            marking: [
                { type: 'entrada', marking: '2024-03-01 08:00:00' },
                { type: 'início intervalo', marking: '2024-03-01 12:00:00' },
                { type: 'fim intervalo', marking: '2024-03-01 13:00:00' },
                { type: 'saída', marking: '2024-03-01 17:00:00' }
            ]
        }
    }))
}));

jest.mock('../../../interfaces/adapters/sendEmailAdapter', () => ({
    sendEmail: jest.fn()
}));

jest.mock('../../../interfaces/adapters/s3Adapter', () => ({
    putObject: jest.fn()
}));

describe('generateUseCase', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should generate and send report successfully', async () => {
        const data = {
            id: 'report-id',
            email: 'test@example.com',
            userId: 'user-id',
            type: 'espelho',
            competence: '2024-03'
        };
        const expectedStartDate = '2024-03-01';
        const expectedEndDate = '2024-03-31';
        const expectedHtml = '<fieldset style="padding: 15px"><legend>&nbsp;<b>Data:</b> 01/03/2024&nbsp;</legend><b>Jornada de trabalho:</b> 08:00:00 trabalhadas<br><b>Entrada:</b> 01/03/2024 08:00:00 | <b>Saída:</b> 01/03/2024 17:00:00<br><br><b>Intervalos:</b> 01:00:00 em intervalo<br></fieldset>';
        const expectedReport = { status: 'success' };

        const dynamodbRepository = {
            find: jest.fn().mockResolvedValueOnce({}),
            update: jest.fn().mockResolvedValue(true),
          };
        const result = await generateUseCase(data, dynamodbRepository);
        expect(result).toEqual({"data": {"report": true}, "statusCode": 200,});
    });

    it('deve tratar o erro e retornar o código de status 500', async () => {
        const data = {
            id: 'report-id',
            email: 'test@example.com',
            userId: 'user-id',
            type: 'espelho',
            competence: false
        };
        const errorMessage = 'Internal server error';
        const expectedError = new Error(errorMessage);

        const dynamodbRepository = {
            find: jest.fn().mockResolvedValueOnce( expectedError),
            update: jest.fn().mockResolvedValue(true),
          };

        const result = await generateUseCase(data, dynamodbRepository);

        expect(result).toEqual({"data": {"message": "Competencia inválida"}, "statusCode": 500});
    });

    it('deve tratar o erro e retornar o código de status 500 para type diff espelho', async () => {
        const data = {
            id: 'report-id',
            email: 'test@example.com',
            userId: 'user-id',
            type: 'xxx',
            competence: '2024-03'
        };
        const errorMessage = 'Internal server error';
        const expectedError = new Error(errorMessage);

        const dynamodbRepository = {
            find: jest.fn().mockResolvedValueOnce( expectedError),
            update: jest.fn().mockResolvedValue(true),
          };

        const result = await generateUseCase(data, dynamodbRepository);

        expect(result).toEqual({"data": {"message": "Relatório inexistente"}, "statusCode": 500});
    });

    it('deve tratar o erro e retornar o código de status 500', async () => {
        const data = {
            id: 'report-id',
            email: 'test@example.com',
            userId: 'user-id',
            type: 'espelho',
            competence: '2024-03'
        };
        const errorMessage = 'Internal server error';
        const expectedError = new Error(errorMessage);

        const dynamodbRepository = {
            find: jest.fn().mockResolvedValueOnce( expectedError),
            update: jest.fn().mockResolvedValue(true),
          };

        const result = await generateUseCase(data, dynamodbRepository);

        expect(result).toEqual({"data": {"report": true}, "statusCode": 200,});
    });
});
