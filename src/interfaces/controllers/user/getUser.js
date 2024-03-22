const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const { getUserUseCase } = require('../../../application/usecases/user/getUser');
const { sendResponse } = require('../../../functions');

module.exports.handler = async (event) => {
    const email = 'anderson@andersonalves.com.br';
    const response = await getUserUseCase( email, dynamodbRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}