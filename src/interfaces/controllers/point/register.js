const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const { registerUseCase } = require('../../../application/usecases/point/register');
const { sendResponse } = require('../../../functions');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.handler = async (event) => {
    const email = event.requestContext.authorizer.claims.email;
    Logger( 'info', {
        'service': 'controller-register',
        'email': email
    } )
    const response = await registerUseCase( email, dynamodbRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}