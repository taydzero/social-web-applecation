"use strict";
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
exports.getConversations = exports.sendMessage = exports.getMessagesWithUser = exports.getAllMessages = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
// Получение всех сообщений текущего пользователя
const getAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }
    try {
        const messages = yield Message_1.default.find({
            $or: [{ from: req.user.userId }, { to: req.user.userId }],
        })
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar')
            .sort({ timestamp: -1 });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.getAllMessages = getAllMessages;
// Получение сообщений с конкретным пользователем
const getMessagesWithUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params; // ID другого пользователя
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }
    try {
        const messages = yield Message_1.default.find({
            $or: [
                { from: req.user.userId, to: id },
                { from: id, to: req.user.userId },
            ],
        })
            .populate('from', 'name email avatar') // Populate fields here
            .populate('to', 'name email avatar') // Populate fields here
            .sort({ timestamp: 1 });
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.getMessagesWithUser = getMessagesWithUser;
// Отправка нового сообщения
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { to, content } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }
    if (req.user.userId === to) {
        res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
        return;
    }
    try {
        // Проверка, существует ли получатель
        const recipient = yield User_1.default.findById(to);
        if (!recipient) {
            res.status(404).json({ message: 'Получатель не найден' });
            return;
        }
        // Создание нового сообщения
        const message = new Message_1.default({
            content,
            from: req.user.userId,
            to,
            timestamp: new Date(),
        });
        yield message.save();
        // Не нужно вызывать populate здесь, так как это не будет работать на сохраненном сообщении
        const populatedMessage = yield Message_1.default.findById(message._id)
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar');
        res.status(201).json(populatedMessage);
    }
    catch (error) {
        console.error('Ошибка при отправке сообщения', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});
exports.sendMessage = sendMessage;
// Получение списка всех пользователей, с которыми была переписка
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }
    try {
        const conversations = yield Message_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { from: req.user.userId },
                        { to: req.user.userId }
                    ]
                }
            },
            {
                $project: {
                    user: { $cond: [{ $eq: ['$from', req.user.userId] }, '$to', '$from'] }
                }
            },
            {
                $group: {
                    _id: '$user'
                }
            }
        ]);
        const userIds = conversations.map(conv => conv._id);
        const users = yield User_1.default.find({ _id: { $in: userIds } }).select('name _id avatar');
        res.json(users);
    }
    catch (error) {
        console.error('Ошибка при получении разговоров', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});
exports.getConversations = getConversations;
