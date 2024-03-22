const uuid = require('uuid');

module.exports.signupUseCase = async (email, password, name, matricula, cognitoRepository, dynamodbRepository) => {
    try {
        if (!email || !password || password.length < 6 || name.length < 2)
            throw new Error('Parâmetros inválidos');

        const signup = await cognitoRepository.signup(email, password)

        const paramsUser = {
            TableName: process.env.table_user,
            Item: {
                id: uuid.v4(),
                email: email,
                name: name,
                matricula: matricula,
                profile: 'user'
            },
        };
    
        await dynamodbRepository.insert(paramsUser);
        
        return {
            statusCode: 200, 
            data: { 
                message: (signup === true ? 'Usuário criado com sucesso' : signup)
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