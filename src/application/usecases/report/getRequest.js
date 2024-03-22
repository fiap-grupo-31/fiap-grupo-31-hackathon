module.exports.getRequestUseCase = async (email, id, dynamodbRepository) => {
    try {
        const paramsUser = {
            TableName: process.env.table_user,
            IndexName: "EmailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }
  
        };
        const users = await dynamodbRepository.find(paramsUser)
        
        const user = users?.length ? users[0] : users

        const paramsPoint = {
            TableName: process.env.table_reports,
            KeyConditionExpression: 'id = :id AND userId = :userId',
            ExpressionAttributeValues: {
                ':id': id,
                ':userId': user?.id
            }
        };

        const requestGet = await dynamodbRepository.find(paramsPoint)
 
        return {
            statusCode: 200, 
            data: { 
                report: requestGet
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