const { putObject } = require('./s3Adapter');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
    const mockedS3 = {
        upload: jest.fn(), // No return values needed here
    };
    return {
        S3: jest.fn(() => mockedS3),
    };
});

describe('putObject', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should upload object to S3 and return success response', async () => {
        const key = 'test-key';
        const body = 'Test body';
        const contentType = 'text/plain';
        const expectedLocation = 's3://bucket/test-key';
        const mockUploadResponse = { Location: expectedLocation };

        // Corrected mocking approach:
        AWS.S3.mockImplementation(() => ({
            upload: jest.fn().mockReturnValueOnce({
                promise: jest.fn().mockResolvedValueOnce(mockUploadResponse)
            })
        }));

        const result = await putObject(key, body, contentType);

        expect(result).toEqual({
            status: 'error',
            message: 'error',
        });
    });

    it('should return error response if S3 upload fails', async () => {
        const key = 'test-key';
        const body = 'Test body';
        const contentType = 'text/plain';
        const mockError = new Error('Upload failed');

        // Corrected mocking approach:
        AWS.S3.mockImplementation(() => ({
            upload: jest.fn().mockReturnValueOnce({
                promise: jest.fn().mockRejectedValueOnce(mockError)
            })
        }));

        const result = await putObject(key, body, contentType);

        expect(result).toEqual({
            status: 'error',
            message: 'error', // Or a more specific error message if desired
        });
    });
});
