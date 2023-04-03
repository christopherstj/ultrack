import { LoggingWinston } from "@google-cloud/logging-winston";
import * as winston from "winston";

const createLogger = (projectId: string, env: string, appName: string) => {
    const loggingWinston = new LoggingWinston({
        projectId: projectId,
        logName: `projects/${projectId}/logs/${env}-${appName}`,
        defaultCallback: (err) => {
            if (err) {
                console.log(
                    `Error occured while initializing logger for ${appName}: ${err}`
                );
            }
        },
    });

    const logger = winston.createLogger({
        level: "info",
        defaultMeta: {
            env,
            appName,
        },
        transports: [new winston.transports.Console(), loggingWinston],
    });

    return logger;
};

export { createLogger };
