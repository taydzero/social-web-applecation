// src/controllers/MessageController.ts
import { Request, Response } from 'express';
import Message, { IMessage } from '../models/Message';
import User from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

// Получение всех сообщений текущего пользователя
export const getAllMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }

    try {
        const messages = await Message.find({
            $or: [{ from: req.user.userId }, { to: req.user.userId }],
        })
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar')
            .sort({ timestamp: -1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Получение сообщений с конкретным пользователем
export const getMessagesWithUser = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params; // ID другого пользователя

    if (!req.user?.userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }

    // Проверка, является ли id допустимым ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: 'Некорректный ID пользователя' });
        return;
    }

    try {
        const messages = await Message.find({
            $or: [
                { from: req.user.userId, to: id },
                { from: id, to: req.user.userId },
            ],
        })
            .populate('from', 'name email avatar') // Populate fields here
            .populate('to', 'name email avatar')   // Populate fields here
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Отправка нового сообщения
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { to, content } = req.body;

    if (!req.user?.userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }

    if (req.user.userId === to) {
        res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
        return;
    }

    // Проверка, является ли to допустимым ObjectId
    if (!mongoose.Types.ObjectId.isValid(to)) {
        res.status(400).json({ message: 'Некорректный ID получателя' });
        return;
    }

    try {
        // Проверка, существует ли получатель
        const recipient = await User.findById(to);
        if (!recipient) {
            res.status(404).json({ message: 'Получатель не найден' });
            return;
        }

        // Создание нового сообщения
        const message = new Message({
            content,
            from: new mongoose.Types.ObjectId(req.user.userId), // Использование new
            to: new mongoose.Types.ObjectId(to),                 // Использование new
            timestamp: new Date(),
        });

        await message.save();

        // Подгружаем отправителя и получателя
        const populatedMessage = await Message.findById(message._id)
            .populate('from', 'name email avatar')
            .populate('to', 'name email avatar');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Ошибка при отправке сообщения', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};

// Получение списка всех пользователей, с которыми была переписка
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
        res.status(401).json({ message: 'Пользователь не авторизован' });
        return;
    }

    try {
        const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from: userObjectId },
                        { to: userObjectId }
                    ]
                }
            },
            {
                $project: {
                    user: {
                        $cond: [
                            { $eq: ['$from', userObjectId] },
                            '$to',
                            '$from'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$user'
                }
            }
        ]);

        const userIds = conversations.map(conv => conv._id);

        // Проверка, что userIds не пустой
        if (userIds.length === 0) {
            res.json([]);
            return;
        }

        const users = await User.find({ _id: { $in: userIds } }).select('name _id avatar');

        res.json(users);
    } catch (error) {
        console.error('Ошибка при получении разговоров', error);
        res.status(500).json({ message: 'Серверная ошибка' });
    }
};
