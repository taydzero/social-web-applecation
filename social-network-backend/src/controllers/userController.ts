import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { In } from 'typeorm';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { formatUser } from '../utils/responseFormatter';

// Получение списка всех пользователей
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUserId = Number(req.user?.userId);
        if (isNaN(currentUserId)) {
            res.status(400).json({ msg: 'Некорректный идентификатор пользователя' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find({
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt'],
            order: { name: 'ASC' }
        });

        const filteredUsers = users.filter(user => user.id !== currentUserId);
        
        const formattedUsers = filteredUsers.map(user => formatUser(user));
        
        res.json(formattedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Получение профиля текущего пользователя
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.user?.userId);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный идентификатор пользователя' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt']
        });

        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json(formatUser(user));
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Получение профиля пользователя по ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = Number(id);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный ID пользователя' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }

        res.json(formatUser(user));
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Обновление профиля пользователя с загрузкой аватара
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = Number(req.user?.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Некорректный идентификатор пользователя' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }

        const { name, email, password, bio } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        if (bio) user.bio = bio;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        if (req.file) {
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        await userRepository.save(user);
        
        // Получаем обновленного пользователя с полными данными
        const updatedUser = await userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt']
        });
        
        if (!updatedUser) {
            res.status(404).json({ error: 'Пользователь не найден после обновления' });
            return;
        }
        
        res.status(200).json({ message: 'Профиль обновлен успешно', user: formatUser(updatedUser) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
};
