import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const dataSourceOptions: DataSourceOptions = {
   type: 'mysql',
   host: process.env.DB_HOST,
   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 0,
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   entities: ['dist/**/*.entity{.ts,.js}'],
   synchronize: false,
   migrations: ['dist/database/migrations/*{.ts,.js}'],
   ssl: false,
};

let dataSource: DataSource | null = null;

try {
   dataSource = new DataSource(dataSourceOptions);
} catch (error) {
   console.error(`Failed to make a connection to the database: ${error}`);
}

export default dataSource;
