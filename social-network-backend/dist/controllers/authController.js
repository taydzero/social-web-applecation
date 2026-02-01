"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const index_1 = require("../index");
const User_1 = require("../entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// Регистрация пользователя
const register = async (req, res) => {
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const { name, email, password, bio } = req.body;
    try {
        let user = await userRepository.findOne({ where: { email } });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Пользователь с таким email уже существует' }] });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            bio,
        });
        await userRepository.save(user);
        const payload = { userId: user.id };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.register = register;
// Логин пользователя
const login = async (req, res) => {
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    console.log('Полученные данные:', req.body);
    const { email, password } = req.body;
    try {
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден:', email);
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log('Пароль не совпадает для пользователя:', email);
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        const payload = { userId: user.id };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error('Ошибка на сервере при попытке логина:', error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.login = login;
