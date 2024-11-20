export type MysqlConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  timezone: string;
  synchronize: boolean;
  logging: boolean;
};
export type RedisConfig = {
  host: string;
  port: number;
  password: string;
  db: number;
};
export type LoggerConfig = {
  enabled: boolean;
  level: string;
  timestamp: boolean;
};
export type JwtConfig = {
  secret: string;
  expires: string;
};
export type MailerConfig = {};
export type SwaggerConfig = {
  enable: boolean;
  path: string;
  title: string;
  description: string;
};
export type AppConfig = {
  port: number;
};
export type BaseConfig = {
  swagger: SwaggerConfig;
};
export type EnvConfig = {
  app: AppConfig;
  mysql: MysqlConfig;
  logger: LoggerConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  mailer: MailerConfig;
};
