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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserById = exports.getUserProfile = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Получение профиля текущего пользователя
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный идентификатор пользователя' });
            return;
        }
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const user = yield userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt']
        });
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
    try {
        const { id } = req.params;
        const userId = Number(id);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный ID пользователя' });
            return;
        }
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const user = yield userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        // Исключаем пароль из ответа
        const { password } = user, userData = __rest(user, ["password"]);
        res.json(userData);
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
    try {
        const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Некорректный идентификатор пользователя' });
            return;
        }
        const userRepository = (0, typeorm_1.getRepository)(User_1.User);
        const user = yield userRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        const { name, email, password, bio } = req.body;
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
        yield userRepository.save(user);
        res.status(200).json({ message: 'Профиль обновлен успешно', user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
});
exports.updateUserProfile = updateUserProfile;
