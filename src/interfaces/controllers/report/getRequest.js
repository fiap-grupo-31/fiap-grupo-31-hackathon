const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const { getRequestUseCase } = require('../../../application/usecases/report/getRequest');
const { sendResponse } = require('../../../functions');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.handler = async (event) => {
    const email = event.requestContext.authorizer.claims.email;

    const { id } = event?.pathParameters ?? {}

    Logger( 'info', {
        'service': 'controller-getRequest',
        'body': {
            id
        }
    } )
    const response = await getRequestUseCase( email, id, dynamodbRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}

