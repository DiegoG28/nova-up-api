import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const dataSourceOptions: DataSourceOptions = {
   type: 'mysql',
   host: process.env.DB_HOST,
   port: parseInt(process.env.DB_PORT, 10),
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   entities: ['dist/modules/**/*.entity{.ts,.js}'],
   synchronize: false,
   migrations: ['dist/database/migrations/*{.ts,.js}'],
   ssl: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
