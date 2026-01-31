import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Регистрация пользователя
export const register = async (req: Request, res: Response): Promise<void> => {
    const userRepository = AppDataSource.getRepository(User);
    const { name, email, password, bio } = req.body;

    try {
        let user = await userRepository.findOne({ where: { email } });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Пользователь с таким email уже существует' }] });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            bio,
        });

        await userRepository.save(user);

        const payload = { userId: user.id };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};

// Логин пользователя
export const login = async (req: Request, res: Response): Promise<void> => {
    const userRepository = AppDataSource.getRepository(User);
    console.log('Полученные данные:', req.body);
    const { email, password } = req.body;

    try {
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден:', email);
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Пароль не совпадает для пользователя:', email);
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }

        const payload = { userId: user.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Ошибка на сервере при попытке логина:', error);
        res.status(500).send('Серверная ошибка');
    }
};

