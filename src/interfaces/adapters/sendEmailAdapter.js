const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const ses = new SESClient({ region: 'us-east-1' });
const { Logger } = require('../../interfaces/adapters/logguer');

const sesFunction = {
  sendEmail: async (email, subject, body) => {
    const envelop = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: { Data: body },
        },

        Subject: { Data: subject },
      },
      Source: 'anderson@andersonalves.com.br',
    };

    Logger( 'info', {
      'service': 'adapter-sendEmailAdapter',
      'data': envelop
    } )

    const command = new SendEmailCommand(envelop);


    try {
      let response = await ses.send(command);

      Logger( 'info', {
        'service': 'adapter-sendEmailAdapter',
        'data': response
      } )
      return response?.message ?? response;
    } catch (error) {
      Logger( 'error', {
        'service': 'adapter-sendEmailAdapter',
        'data': error
      } )
      return error?.message ?? 'error'
    }
  },
};

module.exports = sesFunction;
