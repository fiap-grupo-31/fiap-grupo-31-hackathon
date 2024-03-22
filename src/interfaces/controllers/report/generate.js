const dynamodbRepository = require('../../../domain/repositories/dynamodb')
const { generateUseCase } = require('../../../application/usecases/report/generate');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.handler = async (event) => {
    for (const record of event.Records) {
        try {
            const { body } = record;
            const data = JSON.parse(body);
            Logger( 'info', {
                'service': 'controller-generate',
                'data': data
            } )
            await generateUseCase( data, dynamodbRepository );
        } catch (error) {
        }
    }
    return 'ok';
}
