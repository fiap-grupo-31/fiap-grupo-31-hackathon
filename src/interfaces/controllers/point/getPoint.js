const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const { getPointUseCase } = require('../../../application/usecases/point/getPoint');
const { sendResponse } = require('../../../functions');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.handler = async (event) => {
    const email = event.requestContext.authorizer.claims.email;
    const { startDate, endDate } = event?.queryStringParameters ?? {}

    Logger( 'info', {
        'service': 'controller-getPoint',
        'data': {startDate, endDate}
    } )
    try {
        if( new Date(endDate).getTime() < new Date(startDate).getTime() ){
            return sendResponse(500, {
                message: 'periodo incorreto'
            })
        }
    } catch (error) {
        return sendResponse(500, {
            message: 'datas incorretas'
        })        
    }

    const response = await getPointUseCase( email, startDate, endDate, dynamodbRepository );
    return sendResponse(response?.statusCode ?? 500, response?.data ?? {})
}

