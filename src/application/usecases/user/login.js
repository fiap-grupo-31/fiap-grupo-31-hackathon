module.exports.loginUseCase = async (email, password, cognitoRepository) => {
    try {
        if (!email || !password || password.length < 6)
            throw new Error('Parâmetros inválidos');

        const login = await cognitoRepository.login(email, password)

        if(login?.status == 'success'){
            return {
                statusCode: 200, 
                data: { 
                    access_token: login?.token,
                    refresh_token: login?.refresh_token
                }
            }
        }

        return {
            statusCode: 500, 
            data: { 
                message: login?.message
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