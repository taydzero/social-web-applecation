// src/controllers/authController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Регистрация пользователя
export const register = async (req: Request, res: Response): Promise<void> => {
    // Валидация входных данных
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { name, email, password, bio } = req.body;

    try {
        // Проверка, существует ли пользователь с таким email
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Пользователь с таким email уже существует' }] });
            return;
        }

        // Создание нового пользователя
        user = new User({
            name,
            email,
            password,
            bio,
        });

        // Хеширование пароля
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Сохранение пользователя в базе данных
        await user.save();

        // Создание JWT
        const payload = {
            userId: user.id,
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Логин пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
    // Валидация входных данных
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { email, password } = req.body;

    try {
        // Проверка, существует ли пользователь с таким email
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }

        // Создание JWT
        const payload = {
            userId: user.id,
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
