import { LoggingWinston } from '@google-cloud/logging-winston';
import * as winston from 'winston';

const loggingWinston = new LoggingWinston({
  projectId: process.env.PROJECT_ID,
  logName: `projects/${process.env.PROJECT_ID}/logs/dev-web-server`,
  defaultCallback: (err) => {
    if (err) {
      console.log('Error occured: ' + err);
    }
  },
});

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    env: 'dev',
    appName: 'web-server',
  },
  transports: [new winston.transports.Console(), loggingWinston],
});

export { logger };
