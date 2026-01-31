import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Message } from '../entities/Message';
import { User } from '../entities/User';
import { In } from 'typeorm';
import { formatMessages, formatMessage } from '../utils/responseFormatter';

// Получение всех сообщений текущего пользователя
export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
    const messageRepository = AppDataSource.getRepository(Message);
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
        res.json(formatMessages(messages));
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Получение сообщений с конкретным пользователем
export const getMessagesWithUser = async (req: Request, res: Response): Promise<void> => {
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
    const { id } = req.params;

    const targetUserId = Number(id);
    if (isNaN(targetUserId)) {
        res.status(400).json({ message: 'Некорректный ID пользователя' });
        return;
    }

    try {
        const otherUser = await userRepository.findOneBy({id: targetUserId});
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

        res.json(formatMessages(messages));
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Отправка нового сообщения
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
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
        res.status(201).json(formatMessage(populatedMessage!));
        
    } catch (error) {
        console.error('Ошибка при отправке сообщения', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};

// Получение списка всех пользователей, с которыми была переписка
export const getConversations = async (req: Request, res: Response): Promise<void> => {
    const messageRepository = AppDataSource.getRepository(Message);
    const userRepository = AppDataSource.getRepository(User);
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

        const userIds = new Set<number>();
        messages.forEach(message => {
            if (message.fromUser.id !== currentUserId) {
                userIds.add(message.fromUser.id);
            }
            if (message.toUser.id !== currentUserId) {
                userIds.add(message.toUser.id);
            }
        });

        const users = await userRepository.find({
            where: { id: In(Array.from(userIds)) },
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
    } catch (error) {
        console.error('Ошибка при получении разговоров', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};
