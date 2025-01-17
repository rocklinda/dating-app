import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
  type: 'mysql',
  host: `${process.env.DB_HOST}`,
  port: `${process.env.DB_PORT}`,
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_DATABASE}`,
  entities: [__dirname + '/../databases/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../databases/migrations/*{.ts,.js}'],
  autoLoadEntities: false,
  synchronize: false,
};

export const mysqlDataSource = new DataSource(config as DataSourceOptions);
