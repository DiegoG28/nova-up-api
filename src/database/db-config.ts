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

let dataSource: DataSource;

try {
   dataSource = new DataSource(dataSourceOptions);
} catch (error) {
   console.error(`Failed to make a connection to the database: ${error}`);
}

export default dataSource;
