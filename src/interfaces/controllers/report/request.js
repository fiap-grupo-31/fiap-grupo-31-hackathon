const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const sqsRepository = require('../../../infrastructure/sqs')
const { requestUseCase } = require('../../../application/usecases/report/request');
const { sendResponse } = require('../../../functions');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.handler = async (event) => {
    const email = event.requestContext.authorizer.claims.email;

    let body = {}
    try {
        body = JSON.parse(event?.body ?? '{}');
    } catch (error) {
    }

    Logger( 'info', {
        'service': 'controller-request',
        'body': body
    } )

    const { type, competence } = body ?? {}
    const response = await requestUseCase( email, type ?? '', competence ?? '', dynamodbRepository, sqsRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}