const AWS = require('aws-sdk')

const cognito = new AWS.CognitoIdentityServiceProvider()

const cognitoFunction = {
    signup: async (email, password) => {
        try {
            const { user_pool_id } = process.env
            const params = {
                UserPoolId: user_pool_id,
                Username: email,
                UserAttributes: [
                    {
                        Name: 'email',
                        Value: email
                    },
                    {
                        Name: 'email_verified',
                        Value: 'true'
                    }],
                MessageAction: 'SUPPRESS'
            }
            const response = await cognito.adminCreateUser(params).promise();
            if (response.User) {
                const paramsForSetPass = {
                    Password: password,
                    UserPoolId: user_pool_id,
                    Username: email,
                    Permanent: true
                };
                await cognito.adminSetUserPassword(paramsForSetPass).promise()
            }
    
            return true;
        }
        catch (error) {
            return error.message ? error.message : 'Internal server error'
        }
    },

    login: async (email, password) => {
        try {
            const { user_pool_id, client_id } = process.env
            const params = {
                AuthFlow: "ADMIN_NO_SRP_AUTH",
                UserPoolId: user_pool_id,
                ClientId: client_id,
                AuthParameters: {
                    USERNAME: email,
                    PASSWORD: password
                }
            }
            const response = await cognito.adminInitiateAuth(params).promise();
    
            console.log(response.AuthenticationResult)
            return { status: 'success', token: response.AuthenticationResult.IdToken, refresh_token: response?.AuthenticationResult?.RefreshToken };
        }
        catch (error) {
            return {status: 'error', message: error.message ? error.message : 'Internal server error'}
        }
    },

    getUser: async (email) => {
        try {
            const { user_pool_id } = process.env;
            const params = {
                UserPoolId: user_pool_id,
                Username: email
            };
            const response = await cognito.adminGetUser(params).promise();

            const userId = response.UserAttributes.find(attr => attr.Name === 'sub').Value;
            const emailVerified = response.UserAttributes.find(attr => attr.Name === 'email_verified').Value;

            return {
                status: 'success',
                email,
                userId: userId,
                emailVerified: emailVerified
            };
        } catch (error) {
            return { status: 'error', message: error.message ? error.message : 'Internal server error' };
        }
    }

}

module.exports = cognitoFunction;