// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { User } from './entities/User';
import { Message } from './entities/Message';

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Message],
    synchronize: true, // Только для разработки. В продакшене используйте миграции
    logging: true,
});

export default AppDataSource;
