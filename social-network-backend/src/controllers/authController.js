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
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
// Регистрация пользователя
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Валидация входных данных
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { name, email, password, bio } = req.body;
    try {
        // Проверка, существует ли пользователь с таким email
        let user = yield User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'Пользователь с таким email уже существует' }] });
            return;
        }
        // Создание нового пользователя
        user = new User_1.default({
            name,
            email,
            password,
            bio,
        });
        // Хеширование пароля
        const salt = yield bcrypt_1.default.genSalt(10);
        user.password = yield bcrypt_1.default.hash(password, salt);
        // Сохранение пользователя в базе данных
        yield user.save();
        // Создание JWT
        const payload = {
            userId: user.id,
        };
        jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.status(201).json({ token });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.register = register;
// Логин пользователя
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Валидация входных данных
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    try {
        // Проверка, существует ли пользователь с таким email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        // Проверка пароля
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ errors: [{ msg: 'Неправильные учетные данные' }] });
            return;
        }
        // Создание JWT
        const payload = {
            userId: user.id,
        };
        jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.login = login;
