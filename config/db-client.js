// import { MongoClient } from "mongodb";
// import { env } from "./env.js";

// export const dbClient = new MongoClient(env.MONGODB_URL);

// import mysql from "mysql2/promise";
// import { env } from "./env.js"

// export const db = mysql.createPool({
//     host: process.env.DATABASE_HOST,       
//     user: process.env.DATABASE_USER,       
//     database: process.env.DATABASE_NAME,   
//     password: process.env.DATABASE_PASSWORD,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });
import 'dotenv/config';
import { drizzle } from "drizzle-orm/mysql2";

export const db = drizzle(process.env.DATABASE_URL);

