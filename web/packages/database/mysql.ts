import { connectionString } from './config';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

let client: any = null;
let dbInstance: any = null;

try {
    client = await mysql.createConnection({
        uri: connectionString,
    });
    
    await client.connect();
    dbInstance = drizzle({ client: client });
} catch (error) {
    console.error('Database connection failed:', (error as Error).message);
    console.error('The websocket server will start, but database operations will not be available.');
    console.error('Please ensure MySQL is running and check your connection settings in .env');
    
    // Create a proxy that throws helpful errors when database is accessed
    dbInstance = new Proxy({} as ReturnType<typeof drizzle>, {
        get() {
            throw new Error('Database connection not available. Please check that MySQL is running and configured correctly.');
        }
    });
}

export const db = dbInstance;