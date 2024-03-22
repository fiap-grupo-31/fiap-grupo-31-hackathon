const crypto = require('crypto');
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { Logger } = require('../../interfaces/adapters/logguer');

const sqsFunction = {
	sendMessageSqs: async (
		attributes,
		message,
		region = 'us-east-1',
		apiVersion = '2012-11-05'
	) => {
		try {
			const sqsClient = new SQSClient({ 
				region,
            });

			const queueUrl = process.env.sqs_queue_url;

			const deduplication = {
				MessageGroupId: `general${new Date().getTime()}`,
				MessageDeduplicationId: `${new Date().getTime()}${crypto.randomInt(1000, 9999) + 1000}`,
			};

			const params = {
				...attributes,
				...{
					MessageBody:
						typeof message == 'object'
							? JSON.stringify(message)
							: message,
					QueueUrl: `${queueUrl}`,
				},
				...deduplication,
			};


			Logger( 'info', {
				'service': 'sqs',
				'params': params
			} )

			const sendMsgCommand = new SendMessageCommand(params);
		  
			const resume = await new Promise((resolve, reject) => {
				sqsClient
				.send(sendMsgCommand)
				.then((data) => {
					resolve(data);
				})
				.catch((error) => {
					Logger( 'error', {
						'service': 'sqs',
						'error': error
					} )
					resolve(error);
				});
			});

			Logger( 'info', {
				'service': 'sqs',
				'resume': resume
			} )

			if (resume.MessageId)
				return {
					status: 'success',
					messageId: resume.MessageId,
				};

			return {
				status: 'error',
				message: resume,
				code: resume?.code || '301'
			};
		} catch (error) {
			Logger( 'error', {
				'service': 'sqs',
				'resume': error
			} )
			return {
				status: 'error',
				message: 'sqs',
				code: '301'
			};
		}
	},
}

module.exports = sqsFunction