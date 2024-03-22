const { prepareDateGenerate } = require('../../../functions')
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.getPointUseCase = async (email, startDate, endDate, dynamodbRepository) => {
    try {
        const paramsUser = {
            TableName: process.env.table_user,
            IndexName: "EmailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
  
        };

        Logger( 'info', {
            'service': 'usecase-getPoint',
            'paramsUser': paramsUser
        } )
        const users = await dynamodbRepository.find(paramsUser)

        Logger( 'info', {
            'service': 'usecase-getPoint',
            'users': users
        } )
        const user = users?.length ? users[0] : users

        const paramsPoint = {
            TableName: process.env.table_points,
            KeyConditionExpression: 'userId = :userId AND #date BETWEEN :startDate AND :endDate',
            ExpressionAttributeNames: {
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':userId': user?.id,
                ':startDate': startDate,
                ':endDate': endDate
            }
        };

        Logger( 'info', {
            'service': 'usecase-getPoint',
            'paramsPoint': paramsPoint
        } )
        const pointsGet = await dynamodbRepository.find(paramsPoint)

        Logger( 'info', {
            'service': 'usecase-getPoint',
            'pointsGet': pointsGet
        } )
        let pointPrepare = prepareDateGenerate(pointsGet, startDate, endDate )

        return {
            statusCode: 200, 
            data: { 
                point: pointPrepare
            }
        }
    }
    catch (error) {
        return {
            statusCode: 500, 
            data: { 
                message: error.message ? error.message : 'Internal server error'
            }
        }
    }
  }