"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = exports.sendMessage = exports.getMessagesWithUser = exports.getAllMessages = void 0;
const index_1 = require("../index");
const Message_1 = require("../entities/Message");
const User_1 = require("../entities/User");
const typeorm_1 = require("typeorm");
const responseFormatter_1 = require("../utils/responseFormatter");
// Получение всех сообщений текущего пользователя
const getAllMessages = async (req, res) => {
    const messageRepository = index_1.AppDataSource.getRepository(Message_1.Message);
    try {
        const userId = Number(req.user?.userId);
        if (isNaN(userId)) {
            res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
            return;
        }
        const messages = await messageRepository.find({
            where: [
                { fromUser: { id: userId } },
                { toUser: { id: userId } }
            ],
            relations: ['fromUser', 'toUser'],
            order: { timestamp: 'DESC' }
        });
        res.json((0, responseFormatter_1.formatMessages)(messages));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.getAllMessages = getAllMessages;
// Получение сообщений с конкретным пользователем
const getMessagesWithUser = async (req, res) => {
    const messageRepository = index_1.AppDataSource.getRepository(Message_1.Message);
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const { id } = req.params;
    const targetUserId = Number(id);
    if (isNaN(targetUserId)) {
        res.status(400).json({ message: 'Некорректный ID пользователя' });
        return;
    }
    try {
        const otherUser = await userRepository.findOneBy({ id: targetUserId });
        if (!otherUser) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        const currentUserId = Number(req.user?.userId);
        if (isNaN(currentUserId)) {
            res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
            return;
        }
        const messages = await messageRepository.find({
            where: [
                { fromUser: { id: currentUserId }, toUser: { id: targetUserId } },
                { fromUser: { id: targetUserId }, toUser: { id: currentUserId } }
            ],
            relations: ['fromUser', 'toUser'],
            order: { timestamp: 'ASC' }
        });
        res.json((0, responseFormatter_1.formatMessages)(messages));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.getMessagesWithUser = getMessagesWithUser;
// Отправка нового сообщения
const sendMessage = async (req, res) => {
    const messageRepository = index_1.AppDataSource.getRepository(Message_1.Message);
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const { to, content } = req.body;
    if (!to || !content) {
        res.status(400).json({ message: 'Необходимы поля "to" и "content"' });
        return;
    }
    const recipientId = Number(to);
    const senderId = Number(req.user?.userId);
    if (isNaN(recipientId) || isNaN(senderId)) {
        res.status(400).json({ message: 'Некорректные идентификаторы пользователя' });
        return;
    }
    try {
        if (senderId === recipientId) {
            res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
            return;
        }
        const recipient = await userRepository.findOne({
            where: { id: recipientId },
        });
        if (!recipient) {
            res.status(404).json({ message: 'Получатель не найден' });
            return;
        }
        const sender = await userRepository.findOne({
            where: { id: senderId },
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
        await messageRepository.save(message);
        const populatedMessage = await messageRepository.findOne({
            where: { id: message.id },
            relations: ['fromUser', 'toUser'],
        });
        res.status(201).json((0, responseFormatter_1.formatMessage)(populatedMessage));
    }
    catch (error) {
        console.error('Ошибка при отправке сообщения', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};
exports.sendMessage = sendMessage;
// Получение списка всех пользователей, с которыми была переписка
const getConversations = async (req, res) => {
    const messageRepository = index_1.AppDataSource.getRepository(Message_1.Message);
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const currentUserId = Number(req.user?.userId);
    if (isNaN(currentUserId)) {
        res.status(400).json({ message: 'Некорректный идентификатор пользователя' });
        return;
    }
    try {
        const messages = await messageRepository.find({
            where: [
                { fromUser: { id: currentUserId } },
                { toUser: { id: currentUserId } }
            ],
            relations: ['fromUser', 'toUser'],
        });
        const userIds = new Set();
        messages.forEach(message => {
            if (message.fromUser.id !== currentUserId) {
                userIds.add(message.fromUser.id);
            }
            if (message.toUser.id !== currentUserId) {
                userIds.add(message.toUser.id);
            }
        });
        const users = await userRepository.find({
            where: { id: (0, typeorm_1.In)(Array.from(userIds)) },
            select: ['id', 'name', 'avatar', 'email', 'bio', 'createdAt', 'updatedAt'],
        });
        // Получаем последнее сообщение для каждого пользователя
        const formattedUsers = await Promise.all(users.map(async (user) => {
            const lastMessage = await messageRepository.findOne({
                where: [
                    { fromUser: { id: currentUserId }, toUser: { id: user.id } },
                    { fromUser: { id: user.id }, toUser: { id: currentUserId } }
                ],
                relations: ['fromUser', 'toUser'],
                order: { timestamp: 'DESC' },
            });
            return {
                _id: user.id.toString(),
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    timestamp: lastMessage.timestamp,
                    fromUserId: lastMessage.fromUser.id.toString(),
                } : null,
            };
        }));
        res.json(formattedUsers);
    }
    catch (error) {
        console.error('Ошибка при получении разговоров', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};
exports.getConversations = getConversations;
