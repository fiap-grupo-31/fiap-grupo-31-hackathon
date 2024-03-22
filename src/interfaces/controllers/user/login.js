const cognitoRepository = require('../../../infrastructure/cognito')
const { loginUseCase } = require('../../../application/usecases/user/login');
const { sendResponse } = require('../../../functions');

module.exports.handler = async (event) => {
    const { email, password } = JSON.parse(event.body)
    const response = await loginUseCase( email, password, cognitoRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}