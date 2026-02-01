"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserById = exports.getUserProfile = exports.getAllUsers = void 0;
const index_1 = require("../index");
const User_1 = require("../entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const responseFormatter_1 = require("../utils/responseFormatter");
// Получение списка всех пользователей
const getAllUsers = async (req, res) => {
    try {
        const currentUserId = Number(req.user?.userId);
        if (isNaN(currentUserId)) {
            res.status(400).json({ msg: 'Некорректный идентификатор пользователя' });
            return;
        }
        const userRepository = index_1.AppDataSource.getRepository(User_1.User);
        const users = await userRepository.find({
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt'],
            order: { name: 'ASC' }
        });
        const filteredUsers = users.filter(user => user.id !== currentUserId);
        const formattedUsers = filteredUsers.map(user => (0, responseFormatter_1.formatUser)(user));
        res.json(formattedUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.getAllUsers = getAllUsers;
// Получение профиля текущего пользователя
const getUserProfile = async (req, res) => {
    try {
        const userId = Number(req.user?.userId);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный идентификатор пользователя' });
            return;
        }
        const userRepository = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({
            where: { id: userId },
            select: ['id', 'name', 'email', 'bio', 'avatar', 'createdAt', 'updatedAt']
        });
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json((0, responseFormatter_1.formatUser)(user));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.getUserProfile = getUserProfile;
// Получение профиля пользователя по ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = Number(id);
        if (isNaN(userId)) {
            res.status(400).json({ msg: 'Некорректный ID пользователя' });
            return;
        }
        const userRepository = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            res.status(404).json({ msg: 'Пользователь не найден' });
            return;
        }
        res.json((0, responseFormatter_1.formatUser)(user));
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Серверная ошибка');
    }
};
exports.getUserById = getUserById;
// Обновление профиля пользователя с загрузкой аватара
const updateUserProfile = async (req, res) => {
    try {
        const userId = Number(req.user?.userId);
        if (isNaN(userId)) {
            res.status(400).json({ error: 'Некорректный идентификатор пользователя' });
            return;
        }
        const userRepository = index_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({
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
            const salt = await bcrypt_1.default.genSalt(10);
            user.password = await bcrypt_1.default.hash(password, salt);
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
        res.status(200).json({ message: 'Профиль обновлен успешно', user: (0, responseFormatter_1.formatUser)(updatedUser) });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
};
exports.updateUserProfile = updateUserProfile;
