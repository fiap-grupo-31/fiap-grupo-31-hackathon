const pinoCloudWatch = require('pino-cloudwatch');

  
module.exports = {
    Logger: (level, data) => {
        console.log(
            JSON.stringify({
                "level": level,
                "data": data
              })
        );
    }
}