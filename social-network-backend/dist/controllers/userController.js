"use strict";
// backend/src/controllers/userController.ts
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
exports.updateUserProfile = exports.getUserById = exports.getUserProfile = void 0;
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
// Получение профиля текущего пользователя
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId).select('-password');
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.getUserProfile = getUserProfile;
// Получение профиля пользователя по ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield User_1.default.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
});
exports.getUserById = getUserById;
// Обновление профиля пользователя с загрузкой аватара
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { name, email, password, bio } = req.body;
    try {
        const user = yield User_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (bio)
            user.bio = bio;
        if (password) {
            const salt = yield bcrypt_1.default.genSalt(10);
            user.password = yield bcrypt_1.default.hash(password, salt);
        }
        if (req.file) {
            user.avatar = `/uploads/avatars/${req.file.filename}`;
        }
        yield user.save();
        res.status(200).json({ message: 'Профиль обновлен успешно', user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
});
exports.updateUserProfile = updateUserProfile;
