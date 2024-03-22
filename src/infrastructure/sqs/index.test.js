const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const sqsFunction = require('./index');

jest.mock('@aws-sdk/client-sqs', () => ({
    SQSClient: jest.fn(),
    SendMessageCommand: jest.fn(),
}));

describe('sendMessageSqs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('deve enviar mensagem para SQS e retornar status de sucesso', async () => {
        const attributes = { AttributeName: 'AttributeValue' };
        const message = { key: 'value' };
        const mockSendMessageResponse = { MessageId: 'mock-message-id' };
        const mockSQSClient = { send: jest.fn().mockResolvedValue(mockSendMessageResponse) };
        SQSClient.mockImplementation(() => mockSQSClient);

        const result = await sqsFunction.sendMessageSqs(attributes, message);
        expect(result).toEqual({
            status: 'success',
            messageId: mockSendMessageResponse.MessageId,
        });
        expect(SQSClient).toHaveBeenCalledTimes(1);
        expect(SQSClient).toHaveBeenCalledWith({ region: 'us-east-1' });
        expect(SendMessageCommand).toHaveBeenCalledTimes(1);
        expect(mockSQSClient.send).toHaveBeenCalledTimes(1);
        expect(mockSQSClient.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });

    it('deve retornar status de erro se houver uma exceção', async () => {
        const attributes = { AttributeName: 'AttributeValue' };
        const message = { key: 'value' };
        const mockErrorMessage = '[Error: Erro ao enviar mensagem para SQS]';
        const mockSQSClient = { send: jest.fn().mockRejectedValue(new Error(mockErrorMessage)) };
        SQSClient.mockImplementation(() => mockSQSClient);

        const result = await sqsFunction.sendMessageSqs(attributes, message);
        expect(result?.status).toEqual('error');
        expect(SQSClient).toHaveBeenCalledTimes(1);
        expect(mockSQSClient.send).toHaveBeenCalledTimes(1);
        expect(mockSQSClient.send).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    });
});
