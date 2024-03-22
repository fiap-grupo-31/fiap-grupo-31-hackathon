module.exports.getUserUseCase = async (email, dynamodbRepository) => {
    try {
        const params = {
            TableName: process.env.table_user,
            IndexName: "EmailIndex",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email
            }

        };
        const users = await dynamodbRepository.find(params)
  
        return {
            statusCode: 200, 
            data: { 
                user: users?.length ? users[0] : users
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