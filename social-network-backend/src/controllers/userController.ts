// backend/src/controllers/userController.ts

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/User';

// Получение профиля текущего пользователя
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Получение профиля пользователя по ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Обновление профиля пользователя с загрузкой аватара
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { name, email, password, bio } = req.body;

    try {
        const user = await User.findById(req.user?.userId);
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }

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

        await user.save();
        res.status(200).json({ message: 'Профиль обновлен успешно', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
};
