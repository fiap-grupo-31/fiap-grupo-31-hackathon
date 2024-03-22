const moment = require('moment-timezone');
const { Logger } = require('../../../interfaces/adapters/logguer');

module.exports.registerUseCase = async (email, dynamodbRepository) => {
  try {
    const paramsUser = {
      TableName: process.env.table_user,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };

    Logger('info', {
      service: 'usecase-register',
      pointsGet: paramsUser,
    });
    const users = await dynamodbRepository.find(paramsUser);

    Logger('info', {
      service: 'usecase-register',
      users: users,
    });
    const user = users?.length ? users[0] : users;
    const currentDate = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD');
    const currentDateTime = moment()
      .tz('America/Sao_Paulo')
      .format('YYYY-MM-DD HH:mm:ss');

    const paramsPoint = {
      TableName: process.env.table_points,
      Key: {
        userId: user?.id,
        date: currentDate,
      },
      UpdateExpression:
        'SET points = list_append(if_not_exists(points, :empty_list), :points)',
      ExpressionAttributeValues: {
        ':points': [{ dateHour: currentDateTime }],
        ':empty_list': [],
      },
      ReturnValues: 'ALL_NEW',
    };

    Logger('info', {
      service: 'usecase-register',
      paramsPoint: paramsPoint,
    });
    const point = await dynamodbRepository.insertOrUpdate(paramsPoint);

    Logger('info', {
      service: 'usecase-register',
      point: point,
    });

    return {
      statusCode: 200,
      data: {
        point: point,
      },
    };
  } catch (error) {
    Logger('error', {
      service: 'usecase-register',
      error: error,
    });
    return {
      statusCode: 500,
      data: {
        message: error.message ? error.message : 'Internal server error',
      },
    };
  }
};
