'use strict';

const app = require('./app');

const serverConfig = Object.freeze({
  port: 5001,
  host: '127.0.0.1',
});

app.listen(
  {
    port: serverConfig.port,
    host: serverConfig.host,
  },
  (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
  },
);
