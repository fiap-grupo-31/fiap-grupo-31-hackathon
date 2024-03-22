const { Logger } = require('./logguer');

describe('Logger function', () => {
  it('should log the provided level and data', () => {
    console.log = jest.fn();

    Logger('info', 'Test message');

    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        data: 'Test message',
      })
    );
  });
});
