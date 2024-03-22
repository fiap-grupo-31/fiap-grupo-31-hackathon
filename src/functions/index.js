const moment = require('moment-timezone');

const sendResponse = (statusCode, body) => {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Credentials': true,
    },
  };
  return response;
};

const validateInput = (data) => {
  const body = JSON.parse(data);
  const { email, password } = body;
  return !(!email || !password || password.length < 6);
};

const fnPreparePoint = ( startDate, endDate ) => {
  let startDateTime = new Date(startDate);
  const endDateTime = new Date(endDate);

  let pointPrepare = {};

  while (startDateTime <= endDateTime) {
    const formattedDate = startDateTime.toISOString().split('T')[0];

    pointPrepare[formattedDate] = {
      duration: 0,
      marking: [],
    };
    const nextDay = new Date(startDateTime);
    nextDay.setDate(nextDay.getDate() + 1);
    startDateTime = nextDay;
  }

  return pointPrepare;
}

const fnPreparePointFinal = (pointPrepare) => {
  try {
    for (const index in pointPrepare) {
      const rows = pointPrepare[index];
      let totalDuration = 0;
      let totalDurationBreak = 0;
      let lastDate = null;
      let lastDateBreak = null;
      for (const row of rows.marking) {
        if (row.action == 'start') {
          lastDate = parseInt(new Date(row.marking).getTime() / 1000);
        } else {
          if (row.marking)
            totalDuration +=
              parseInt(new Date(row.marking).getTime() / 1000) - lastDate;
        }

        if (row.action == 'end' && row.type == 'início intervalo') {
          lastDateBreak = parseInt(new Date(row.marking).getTime() / 1000);
        } else if (row.action == 'start' && row.type == 'fim intervalo') {
          if (row.marking)
            totalDurationBreak +=
              parseInt(new Date(row.marking).getTime() / 1000) - lastDateBreak;
        }
      }
      pointPrepare[index].duration = totalDuration;
      pointPrepare[index].durationBreak = totalDurationBreak;
    }
  } catch (error) {}

  return pointPrepare;
}


const prepareDateGenerate = (pointsGet, startDate, endDate) => {
  let pointPrepare = fnPreparePoint( startDate, endDate );

  for (const point of pointsGet) {
    const { date, points } = point;
    if (typeof pointPrepare[date] == 'undefined') {
      pointPrepare[date] = {
        duration: 0,
        marking: [],
      };
    }

    const isPar = points.length % 2 === 0;
    const isOne = points.length == 1;

    let iCount = 0;
    for (const iterator of points) {
      iCount++;
      if (iCount == 1) {
        pointPrepare[date].marking.push({
          type: 'entrada',
          marking: iterator?.dateHour,
          action: 'start',
        });

        if (isOne) {
          pointPrepare[date].marking.push({
            type: 'saída',
            marking: null,
            action: 'end',
          });
        }
        continue;
      }

      if (iCount == points.length && (points.length == 2 || isPar)) {
        pointPrepare[date].marking.push({
          type: 'saída',
          marking: iterator?.dateHour,
          action: 'end',
        });
        continue;
      }

      const isParMarked = iCount % 2 === 0;
      if (isParMarked) {
        pointPrepare[date].marking.push({
          type: 'início intervalo',
          marking: iterator?.dateHour,
          action: 'end',
        });
        continue;
      } else {
        pointPrepare[date].marking.push({
          type: 'fim intervalo',
          marking: iterator?.dateHour,
          action: 'start',
        });

        if (iCount == points.length && !isPar) {
          pointPrepare[date].marking.push({
            type: 'saída',
            marking: null,
            action: 'end',
          });
        }

        continue;
      }
    }
  }

  pointPrepare = fnPreparePointFinal(pointPrepare);

  return pointPrepare;
};

const prepareHtml = async (pointPrepare, competence) => {
  let html = [];

  html.push(
    `<div style="font-size: 20px"><b>Competência:</b> ${competence}</div><br>`
  );
  for (const date in pointPrepare) {
    const row = pointPrepare[date];
    let defaultColumns = {
      start: 'sem marcação',
      end: 'sem marcação',
      duration: moment.utc((row?.duration ?? 0) * 1000).format('HH:mm:ss'),
      durationBreak: moment
        .utc((row?.durationBreak ?? 0) * 1000)
        .format('HH:mm:ss'),
    };

    let defaultColumnsIntervals = [];

    let tmpInterval = {
      start: 'sem marcação',
      end: 'sem marcação',
    };
    for (const element of row.marking) {
      if (element.type == 'entrada') {
        defaultColumns['start'] = element?.marking ?? 'sem marcação';
      }
      if (element.type == 'saída') {
        defaultColumns['end'] = element?.marking ?? 'sem marcação';
      }

      if (element.type == 'início intervalo') {
        tmpInterval['start'] = element?.marking ?? 'sem marcação';
      }
      if (element.type == 'fim intervalo') {
        tmpInterval['end'] = element?.marking ?? 'sem marcação';
        defaultColumnsIntervals.push(tmpInterval);
        tmpInterval = {
          start: 'sem marcação',
          end: 'sem marcação',
        };
      }
    }

    if (defaultColumns['start'] != 'sem marcação') {
      defaultColumns['start'] = moment(
        defaultColumns['start'],
        'YYYY-MM-DD HH:mm:ss'
      ).format('DD/MM/YYYY HH:mm:ss');
    }

    if (defaultColumns['end'] != 'sem marcação') {
      defaultColumns['end'] = moment(
        defaultColumns['end'],
        'YYYY-MM-DD HH:mm:ss'
      ).format('DD/MM/YYYY HH:mm:ss');
    }

    html.push(`<fieldset style="padding: 15px">
      <legend>&nbsp;<b>Data:</b> ${moment(date, 'YYYY-MM-DD').format(
        'DD/MM/YYYY'
      )}&nbsp;</legend>
       <b>Jornada de trabalho:</b> ${defaultColumns?.duration} trabalhadas<br>
       <b>Entrada:</b> ${defaultColumns['start']} | <b>Saída:</b> ${defaultColumns['end']}<br><br>
       <b>Intervalos:</b> ${defaultColumns?.durationBreak} em intervalo<br>`
    );

    for (const iterator of defaultColumnsIntervals) {
      if (iterator?.start != 'sem marcação') {
        iterator.start = moment(
          iterator?.start,
          'YYYY-MM-DD HH:mm:ss'
        ).format('DD/MM/YYYY HH:mm:ss');
      }

      if (iterator?.end != 'sem marcação') {
        iterator.end = moment(iterator?.end, 'YYYY-MM-DD HH:mm:ss').format(
          'DD/MM/YYYY HH:mm:ss'
        );
      }

      html.push(
        `<b>Entrada:</b> ${iterator?.start} | <b>Saída:</b> ${iterator?.end}<br>
      `);
    }

    html.push(`</fieldset>`);
  }

  return html;
}

const sanitizeObject = (obj) => {
  if(typeof obj != 'object'){
    return obj;
  }
  try {
    let sanitizedObj = {};
    for (const key in obj) {
        const value = obj[key];
        console.log(value)
        if (typeof value === 'string') {
            const sanitizedValue = value.replace(/['"]/g, '');
            sanitizedObj[key] = sanitizedValue;
        } else {
            sanitizedObj[key] = value;
        }
    }
  } catch (error) {
    return obj;
  }
  return sanitizedObj;
}


module.exports = {
  sendResponse,
  validateInput,
  prepareDateGenerate,
  prepareHtml,
  sanitizeObject
};
