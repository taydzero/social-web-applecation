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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = exports.sendMessage = exports.getMessagesWithUser = exports.getAllMessages = void 0;
const typeorm_1 = require("typeorm");
const Message_1 = require("../entities/Message");
const User_1 = require("../entities/User");
const typeorm_2 = require("typeorm");
// Получение всех сообщений текущего пользователя
const getAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const messageRepository = (0, typeorm_1.getRepository)(Message_1.Message);
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); // Преобразуем в число
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
            return;
        }
        const messages = yield messageRepository.find({
            where: [
                { fromUser: { id: userId } },
                { toUser: { id: userId } }
            ],
            relations: ['fromUser', 'toUser'],
            order: { timestamp: 'DESC' }
        });
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
    const messageRepository = (0, typeorm_1.getRepository)(Message_1.Message);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const { id } = req.params;
    const targetUserId = Number(id);
    if (isNaN(targetUserId)) {
        res.status(400).json({ message: 'Некорректный ID пользователя' });
        return;
    }
    try {
        const otherUser = yield userRepository.findOneBy({ id: targetUserId });
        if (!otherUser) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        const currentUserId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (isNaN(currentUserId)) {
            res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
            return;
        }
        const messages = yield messageRepository.find({
            where: [
                { fromUser: { id: currentUserId }, toUser: { id: targetUserId } },
                { fromUser: { id: targetUserId }, toUser: { id: currentUserId } }
            ],
            relations: ['fromUser', 'toUser'],
            order: { timestamp: 'ASC' }
        });
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
    const messageRepository = (0, typeorm_1.getRepository)(Message_1.Message);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const { to, content } = req.body;
    if (!to || !content) {
        res.status(400).json({ message: 'Необходимы поля "to" и "content"' });
        return;
    }
    const recipientId = Number(to);
    const senderId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    if (isNaN(recipientId) || isNaN(senderId)) {
        res.status(400).json({ message: 'Некорректные идентификаторы пользователя' });
        return;
    }
    try {
        if (senderId === recipientId) {
            res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
            return;
        }
        const recipient = yield userRepository.findOne({
            where: { id: recipientId },
            relations: ['someRelation'], // если необходимо
        });
        if (!recipient) {
            res.status(404).json({ message: 'Получатель не найден' });
            return;
        }
        const sender = yield userRepository.findOne({
            where: { id: senderId },
            relations: ['someRelation'], // если необходимо
        });
        if (!sender) {
            res.status(404).json({ message: 'Отправитель не найден' });
            return;
        }
        const message = messageRepository.create({
            content,
            fromUser: sender,
            toUser: recipient
        });
        yield messageRepository.save(message);
        const populatedMessage = yield messageRepository.findOne({
            where: { id: message.id },
            relations: ['fromUser', 'toUser'],
        });
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
    const messageRepository = (0, typeorm_1.getRepository)(Message_1.Message);
    const userRepository = (0, typeorm_1.getRepository)(User_1.User);
    const currentUserId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
    if (isNaN(currentUserId)) {
        res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
        return;
    }
    try {
        const messages = yield messageRepository.createQueryBuilder("message")
            .leftJoinAndSelect("message.fromUser", "fromUser")
            .leftJoinAndSelect("message.toUser", "toUser")
            .where("message.fromUserId = :userId OR message.toUserId = :userId", { userId: currentUserId })
            .getMany();
        const userIds = new Set();
        messages.forEach(message => {
            if (message.fromUser.id !== currentUserId) {
                userIds.add(message.fromUser.id);
            }
            if (message.toUser.id !== currentUserId) {
                userIds.add(message.toUser.id);
            }
        });
        const users = yield userRepository.find({
            where: { id: (0, typeorm_2.In)(Array.from(userIds)) },
            select: ['id', 'name', 'avatar'],
        });
        res.json(users);
    }
    catch (error) {
        console.error('Ошибка при получении разговоров', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
});
exports.getConversations = getConversations;
