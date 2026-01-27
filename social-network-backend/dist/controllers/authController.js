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
exports.login = exports.register = void 0;
const index_1 = require("../index"); // Импортируйте ваш DataSource из index.ts
const User_1 = require("../entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// Регистрация пользователя
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const { name, email, password, bio } = req.body;
    try {
        let user = yield userRepository.findOne({ where: { email } });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Пользователь с таким email уже существует' }] });
            return;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        user = userRepository.create({
            name,
            email,
            password: hashedPassword,
            bio,
        });
        yield userRepository.save(user);
        const payload = { userId: user.id };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.register = register;
// Логин пользователя
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userRepository = index_1.AppDataSource.getRepository(User_1.User);
    const { email, password } = req.body;
    try {
        const user = yield userRepository.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        const payload = { userId: user.id };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.login = login;
