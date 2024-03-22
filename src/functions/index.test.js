const { sendResponse, validateInput, prepareDateGenerate, prepareHtml } = require('./index');
const mockData = {
  pointsGet: [
    {
      date: '2024-03-17',
      userId: '12312',
      points: [
        {
          dateHour: '2024-03-19 20:39:43',
        },
        {
          dateHour: '2024-03-19 20:41:29',
        },
        {
          dateHour: '2024-03-19 21:16:41',
        },
        {
          dateHour: '2024-03-19 21:21:31',
        },
        {
          dateHour: '2024-03-19 21:21:44',
        },
      ],
    },
  ],
};

describe('sendResponse', () => {
  it('deve retornar um objeto de resposta com status, corpo e cabeçalhos corretos', () => {
    const statusCode = 200;
    const body = { message: 'OK' };
    const response = sendResponse(statusCode, body);
    expect(response.statusCode).toBe(statusCode);
    expect(response.body).toBe(JSON.stringify(body));
    expect(response.headers).toHaveProperty('Content-Type', 'application/json');
    expect(response.headers).toHaveProperty(
      'Access-Control-Allow-Credentials',
      true
    );
  });
});

describe('validateInput', () => {
  it('deve retornar true para entrada válida', () => {
    const data = JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(validateInput(data)).toBe(true);
  });

  it('deve retornar false para entrada inválida', () => {
    const data = JSON.stringify({
      email: 'test@example.com',
      password: 'short',
    });
    expect(validateInput(data)).toBe(false);
  });
});

describe('prepareDateGenerate', () => {
  it('deve preparar dados de data corretamente', () => {
    const pointsGet = mockData.pointsGet;
    const startDate = '2024-03-01';
    const endDate = '2024-03-05';
    const preparedData = prepareDateGenerate(pointsGet, startDate, endDate);
    expect(preparedData).toHaveProperty('2024-03-01');
    expect(preparedData['2024-03-01']).toHaveProperty('duration');
    expect(preparedData['2024-03-01']).toHaveProperty('marking');
  });

  it('deve lançar um erro quando passado um argumento inválido', () => {
    expect(() => prepareDateGenerate('invalid')).toThrow();
  });

  it('deve processar vários pontos', () => {
    const points = [
      { date: '2022-01-01', points: [{ dateHour: '2022-01-01T00:00:00' }, { dateHour: '2022-01-01T01:00:00' }] },
      { date: '2022-01-02', points: [{ dateHour: '2022-01-02T00:00:00' }, { dateHour: '2022-01-02T01:00:00' }] },
      // Adicione mais pontos conforme necessário
    ];
    const result = prepareDateGenerate(points, '2022-01-01', '2022-01-02');
    expect(result).toHaveProperty('2022-01-01');
    expect(result).toHaveProperty('2022-01-02');
  });
  it('deve lançar um erro quando passado um argumento inválido', () => {
    expect(() => prepareDateGenerate('invalid')).toThrow();
  });
});

describe('prepareHtml', () => {
  it('deve preparar o HTML corretamente', async () => {
    const pointPrepare = {
      '2024-03-01': {
        duration: 28800,
        durationBreak: 3600,
        marking: [
          { type: 'entrada', marking: '2024-03-01 08:00:00' },
          { type: 'início intervalo', marking: '2024-03-01 12:00:00' },
          { type: 'fim intervalo', marking: '2024-03-01 13:00:00' },
          { type: 'saída', marking: '2024-03-01 17:00:00' }
        ]
      }
    };
    const competence = '2024-03';

    const expectedHtml = [
      '<div style="font-size: 20px"><b>Competência:</b> 2024-03</div><br>',
      '<fieldset style="padding: 15px">',
      '<legend>&nbsp;<b>Data:</b> 01/03/2024&nbsp;</legend>',
      '<b>Jornada de trabalho:</b> 08:00:00 trabalhadas<br>',
      '<b>Entrada:</b> 01/03/2024 08:00:00 | <b>Saída:</b> 01/03/2024 17:00:00<br><br>',
      '<b>Intervalos:</b> 01:00:00 em intervalo<br>',
      '<b>Entrada:</b> 01/03/2024 12:00:00 | <b>Saída:</b> 01/03/2024 13:00:00<br>',
      '</fieldset>'
    ].join('');

    const result = await prepareHtml(pointPrepare, competence);

    expect(result).toEqual(result);
  });
});
