"use strict";
// backend/src/index.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const Message_1 = __importDefault(require("./models/Message"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const upload_1 = __importDefault(require("./middlewares/upload"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const User_1 = __importDefault(require("./models/User"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Подключение к MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/web_social_db';
mongoose_1.default.connect(mongoURI)
    .then(() => console.log('MongoDB подключен'))
    .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
});
// Обслуживание статических файлов
app.use('/uploads/avatars', express_1.default.static(path_1.default.join(__dirname, '../uploads/avatars')));
// Подключение маршрутов
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', authMiddleware_1.authenticateToken, userRoutes_1.default);
app.use('/api/messages', authMiddleware_1.authenticateToken, messageRoutes_1.default);
// Маршрут для обновления профиля пользователя с аватаром
app.post('/api/users/profile', authMiddleware_1.authenticateToken, upload_1.default.single('avatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ error: 'Не указан пользователь' });
            return; // Завершаем выполнение функции
        }
        // Здесь вы можете обновить профиль пользователя в базе данных
        // Например, если вы используете Mongoose:
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { avatar: (_b = req.file) === null || _b === void 0 ? void 0 : _b.path }, // Убедитесь, что req.file?.path существует
        { new: true });
        res.status(200).json({ message: 'Аватар обновлен', avatarPath: (_c = req.file) === null || _c === void 0 ? void 0 : _c.path });
    }
    catch (error) {
        console.error('Ошибка обновления аватара:', error);
        res.status(500).json({ error: 'Ошибка обновления аватара' });
    }
}));
// Создание HTTP сервера и Socket.io сервера
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        socket.userId = decoded.userId;
        next();
    }
    catch (err) {
        next(new Error('Токен недействителен'));
    }
});
// Обработка Socket.io соединений
io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`Пользователь ${userId} подключился`);
    // Присоединение пользователя к своей комнате
    socket.join(userId);
    // Обработка отправки сообщений
    socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, content } = data;
        try {
            // Сохранение сообщения в базе данных
            const message = new Message_1.default({
                content,
                from: userId,
                to,
            });
            yield message.save();
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
        }
        catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            socket.emit('error', 'Не удалось отправить сообщение');
        }
    }));
    // Обработка отключения
    socket.on('disconnect', () => {
        console.log(`Пользователь ${userId} отключился`);
    });
});
// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
