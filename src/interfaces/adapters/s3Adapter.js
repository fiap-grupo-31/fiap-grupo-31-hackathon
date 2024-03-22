const AWS = require('aws-sdk');
const { Logger } = require('../../interfaces/adapters/logguer');

const s3 = new AWS.S3();

const s3Function = {
	putObject: async (
		key,
		body,
        contentType
	) => {
		try {
            const params = {
                Bucket: process.env.s3_bucket,
                Key: key,
                Body: body.toString(),
                ContentType: contentType
            };
    
            Logger( 'info', {
                'service': 'adapter-s3Adapter',
                'params': params
            } )
            const data = await s3.upload(params).promise();

            Logger( 'info', {
                'service': 'adapter-s3Adapter',
                'data': data
            } )
            return {
                status: 'success',
                data: data
            };
        } catch (error) {
            Logger( 'error', {
                'service': 'adapter-s3Adapter',
                'data': error
            } )
            return {
                status: 'error',
                message: 'error'
            };
        }
	},
}

module.exports = s3Function