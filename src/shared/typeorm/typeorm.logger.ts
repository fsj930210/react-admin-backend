import { WinstonLogger } from 'nest-winston';
import { Logger } from 'typeorm';

export class CustomTypeOrmLogger implements Logger {
  constructor(private winstonLogger: WinstonLogger) {}

  log(level: 'log' | 'info' | 'warn', message: any) {
    this.winstonLogger.log(message);
  }

  logQuery(query: string, parameters?: any[]) {
    this.winstonLogger.log({
      sql: query,
      parameters,
    });
  }

  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    this.winstonLogger.error({
      sql: query,
      parameters,
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    this.winstonLogger.log({
      sql: query,
      parameters,
      time,
    });
  }

  logSchemaBuild(message: string) {
    this.winstonLogger.log(message);
  }

  logMigration(message: string) {
    this.winstonLogger.log(message);
  }
}
