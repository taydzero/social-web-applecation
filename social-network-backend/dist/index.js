"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const Message_1 = require("./entities/Message");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const User_1 = require("./entities/User");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User_1.User, Message_1.Message],
    synchronize: true,
    logging: true,
});
exports.AppDataSource.initialize()
    .then(() => {
    console.log('PostgreSQL подключен');
    app.use('/uploads/avatars', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    }, express_1.default.static(path_1.default.join(__dirname, '../uploads/avatars')));
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/users', authMiddleware_1.authenticateToken, userRoutes_1.default);
    app.use('/api/messages', authMiddleware_1.authenticateToken, messageRoutes_1.default);
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
            const userId = typeof decoded.userId === 'number' ? decoded.userId : Number(decoded.userId);
            socket.userId = userId.toString();
            next();
        }
        catch (err) {
            next(new Error('Токен недействителен'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        console.log(`Пользователь ${userId} подключился`);
        socket.join(userId);
        socket.on('sendMessage', async (data) => {
            const { to, content } = data;
            try {
                const messageRepository = exports.AppDataSource.getRepository(Message_1.Message);
                const userRepository = exports.AppDataSource.getRepository(User_1.User);
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
            }
            catch (error) {
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
