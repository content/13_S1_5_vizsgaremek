import { ConnectionOptions } from 'mysql2';

export const config: ConnectionOptions = {
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    host: process.env.MYSQL_HOST!,
    user: process.env.MYSQL_USER!,
    password: process.env.MYSQL_PASSWORD!,
    database: process.env.MYSQL_DATABASE!,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
};

const password = process.env.MYSQL_PASSWORD;
const authPart = password 
    ? `${config.user}:${password}` 
    : config.user;

export const connectionString = `mysql://${authPart}@${config.host}:${config.port}/${config.database}`;