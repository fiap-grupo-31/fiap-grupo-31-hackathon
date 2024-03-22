const uuid = require('uuid');
const moment = require('moment-timezone');

module.exports.requestUseCase = async (
  email,
  type,
  competence,
  dynamodbRepository,
  sqsRepository
) => {
  try {
    if (!type.includes(['espelho'])) throw new Error('Relatório inexistente');
    if (!competence) throw new Error('Competencia inválida');

    const paramsUser = {
      TableName: process.env.table_user,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const users = await dynamodbRepository.find(paramsUser);

    const user = users?.length ? users[0] : users;
    const currentDateTime = moment()
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss');

    const paramsReport = {
      TableName: process.env.table_reports,
      Item: {
        id: uuid.v4(),
        userId: user?.id,
        type: type,
        competence: competence,
        status: 'pending',
        createdAt: currentDateTime,
      },
    };

    const report = await dynamodbRepository.insert(paramsReport);

    if(!report){
        return {
          statusCode: 404,
          data: {
            message: 'Falha ao solicitar relatório'
          },
        };
    }

    await sqsRepository.sendMessageSqs( {}, {
      ...{
        email: email
      },
      ...paramsReport?.Item
    } );

    return {
      statusCode: 200,
      data: {
        id: paramsReport.Item.id
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      data: {
        message: error.message ? error.message : 'Internal server error',
      },
    };
  }
};
