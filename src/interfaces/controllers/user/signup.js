const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const cognitoRepository = require('../../../infrastructure/cognito')
const { signupUseCase } = require('../../../application/usecases/user/signup');
const { sendResponse } = require('../../../functions');

module.exports.handler = async (event) => {
    const { email, password, name, matricula } = JSON.parse(event.body)
    const response = await signupUseCase( email, password, name, matricula, event?.cognitoRepository ?? cognitoRepository, event?.cognitoRepository ?? dynamodbRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}