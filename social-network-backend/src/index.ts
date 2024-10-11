// src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import path from 'path';
import Message from './models/Message';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import upload from './middlewares/upload';
import { authenticateToken } from './middlewares/authMiddleware';
import { Request, Response } from 'express';
import User from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/web_social_db';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB подключен'))
    .catch(err => {
        console.error('Ошибка подключения к MongoDB:', err);
        process.exit(1);
    });

// Обслуживание статических файлов
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Маршрут для обновления профиля пользователя с аватаром
app.post('/api/users/profile', authenticateToken, upload.single('avatar'), async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(400).json({ error: 'Не указан пользователь' });
            return; // Завершаем выполнение функции
        }

        // Обновление профиля пользователя в базе данных
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: req.file?.path }, // Убедитесь, что req.file?.path существует
            { new: true }
        );

        res.status(200).json({ message: 'Аватар обновлен', avatarPath: req.file?.path });
    } catch (error) {
        console.error('Ошибка обновления аватара:', error);
        res.status(500).json({ error: 'Ошибка обновления аватара' });
    }
});

// Создание HTTP сервера и Socket.io сервера
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // URL вашего фронтенда
        methods: ['GET', 'POST'],
    },
});

// Middleware для аутентификации Socket.io соединений
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Нет токена'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key') as { userId: string };
        (socket as any).userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Токен недействителен'));
    }
});

// Обработка Socket.io соединений
io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`Пользователь ${userId} подключился`);

    // Присоединение пользователя к своей комнате
    socket.join(userId);

    // Обработка отправки сообщений
    socket.on('sendMessage', async (data: { to: string; content: string }) => {
        const { to, content } = data;
        try {
            // Сохранение сообщения в базе данных
            const message = new Message({
                content,
                from: userId,
                to,
            });
            await message.save();

            // Отправка сообщения получателю в реальном времени
            io.to(to).emit('receiveMessage', {
                _id: message._id,
                content: message.content,
                from: message.from,
                to: message.to,
                timestamp: message.timestamp,
            });

            // Также можно отправить сообщение отправителю
            socket.emit('messageSent', {
                _id: message._id,
                content: message.content,
                from: message.from,
                to: message.to,
                timestamp: message.timestamp,
            });
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

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

