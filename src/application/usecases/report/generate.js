const uuid = require('uuid');
const moment = require('moment-timezone');
const { prepareDateGenerate, prepareHtml } = require('../../../functions');
const { sendEmail } = require('../../../interfaces/adapters/sendEmailAdapter');
const { putObject } = require('../../../interfaces/adapters/s3Adapter');

module.exports.generateUseCase = async (data, dynamodbRepository) => {
  try {
    const { id, email, userId, type, competence } = data;

    if (!type.includes(['espelho'])) throw new Error('Relatório inexistente');
    if (!competence) throw new Error('Competencia inválida');

    let startDate = moment(competence).startOf('month').format('YYYY-MM-DD');
    let endDate = moment(competence).endOf('month').format('YYYY-MM-DD');

    const paramsPoint = {
      TableName: process.env.table_points,
      KeyConditionExpression:
        'userId = :userId AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startDate': startDate,
        ':endDate': endDate,
      },
    };

    const pointsGet = await dynamodbRepository.find(paramsPoint);

    let pointPrepare = prepareDateGenerate(pointsGet, startDate, endDate);

    let html = [];
    try {
      html = await prepareHtml(pointPrepare, competence);
    } catch (error) {
    }

    await sendEmail(email, 'Espelho de ponto: ' + competence, html.join(''));
    await putObject(`${id}.html`, html.join(''), 'text/html');
    
    const paramsReport = {
      TableName: process.env.table_reports,
      Key: {
        id: id,
      },
      UpdateExpression: 'SET #status = :statusFinal',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':statusFinal': 'success',
      },
      ReturnValues: 'ALL_NEW',
    };

    const report = await dynamodbRepository.update(paramsReport);

    return {
      statusCode: 200,
      data: {
        report,
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
