import "reflect-metadata";
import { DataSource } from "typeorm";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import { Message } from './entities/Message';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import upload from './middlewares/upload';
import { authenticateToken } from './middlewares/authMiddleware';
import { Request, Response } from 'express';
import { User } from './entities/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Message],
    synchronize: true,
    logging: true,
});

AppDataSource.initialize()
    .then(() => {
        console.log('PostgreSQL подключен');

        app.use('/uploads/avatars', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
            res.header('Access-Control-Allow-Methods', 'GET');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        }, express.static(path.join(__dirname, '../uploads/avatars')));

        app.use('/api/auth', authRoutes);
        app.use('/api/users', authenticateToken, userRoutes);
        app.use('/api/messages', authenticateToken, messageRoutes);


        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Нет токена'));
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as { userId: number | string };
                const userId = typeof decoded.userId === 'number' ? decoded.userId : Number(decoded.userId);
                (socket as any).userId = userId.toString();
                next();
            } catch (err) {
                next(new Error('Токен недействителен'));
            }
        });

        io.on('connection', (socket) => {
            const userId = (socket as any).userId;
            console.log(`Пользователь ${userId} подключился`);

            socket.join(userId);

            socket.on('sendMessage', async (data: { to: string; content: string }) => {
                const { to, content } = data;
                try {
                    const messageRepository = AppDataSource.getRepository(Message);
                    const userRepository = AppDataSource.getRepository(User);

                    const recipientId = parseInt(to, 10);
                    const senderId = parseInt(userId, 10);

                    // Находим отправителя и получателя
                    const fromUser = await userRepository.findOne({ where: { id: senderId } });
                    const toUser = await userRepository.findOne({ where: { id: recipientId } });

                    if (!fromUser || !toUser) {
                        socket.emit('error', 'Отправитель или получатель не найдены');
                        return;
                    }

                    // Создаем и сохраняем сообщение
                    const message = messageRepository.create({
                        content,
                        fromUser,
                        toUser,
                    });

                    await messageRepository.save(message);

                    // Получение полного сообщения с данными пользователей
                    const populatedMessage = await messageRepository.findOne({
                        where: { id: message.id },
                        relations: ['fromUser', 'toUser'],
                    });

                    // Форматируем сообщение для фронтенда
                    const formattedMessage = {
                        _id: populatedMessage?.id.toString(),
                        content: populatedMessage?.content,
                        from: {
                            _id: populatedMessage?.fromUser.id.toString(),
                            name: populatedMessage?.fromUser.name,
                            email: populatedMessage?.fromUser.email,
                            avatar: populatedMessage?.fromUser.avatar,
                            bio: populatedMessage?.fromUser.bio,
                            createdAt: populatedMessage?.fromUser.createdAt?.toISOString(),
                            updatedAt: populatedMessage?.fromUser.updatedAt?.toISOString(),
                        },
                        to: {
                            _id: populatedMessage?.toUser.id.toString(),
                            name: populatedMessage?.toUser.name,
                            email: populatedMessage?.toUser.email,
                            avatar: populatedMessage?.toUser.avatar,
                            bio: populatedMessage?.toUser.bio,
                            createdAt: populatedMessage?.toUser.createdAt?.toISOString(),
                            updatedAt: populatedMessage?.toUser.updatedAt?.toISOString(),
                        },
                        timestamp: populatedMessage?.timestamp,
                    };

                    io.to(to).emit('receiveMessage', formattedMessage);

                    socket.emit('messageSent', formattedMessage);
                } catch (error) {
                    console.error('Ошибка при отправке сообщения:', error);
                    socket.emit('error', 'Не удалось отправить сообщение');
                }
            });

            // Обработка отключения
            socket.on('disconnect', () => {
                console.log(`Пользователь ${userId} отключился`);
            });
        });

        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Ошибка подключения к PostgreSQL:', error);
        process.exit(1);
    });
