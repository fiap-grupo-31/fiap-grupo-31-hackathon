const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesFunction = require('./sendEmailAdapter');

jest.mock('@aws-sdk/client-ses');

describe('sendEmailAdapter', () => {
    test('deve retornar sucesso ao enviar email', async () => {
        const sendMock = jest.fn().mockRejectedValue({status: 'success'});
        SESClient.prototype.send.mockImplementation(sendMock);

        const email = 'destinatario@example.com';
        const subject = 'Assunto do e-mail';
        const body = '<p>Corpo do e-mail</p>';

        const response = await sesFunction.sendEmail(email, subject, body);

        expect(sendMock).toHaveBeenCalled();
        expect(sendMock.mock.calls[0][0]).toBeInstanceOf(SendEmailCommand);
    });
    test('deve lidar corretamente com erros', async () => {
        const sendMock = jest.fn().mockResolvedValue(new Error('Erro ao enviar e-mail'));
        SESClient.prototype.send.mockImplementation(sendMock);

        const email = 'destinatario@example.com';
        const subject = 'Assunto do e-mail';
        const body = '<p>Corpo do e-mail</p>';

        const response = await sesFunction.sendEmail(email, subject, body);

        expect(sendMock).toHaveBeenCalled();
        expect(sendMock.mock.calls[0][0]).toBeInstanceOf(SendEmailCommand);
    });
});
