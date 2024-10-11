"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const express_validator_1 = require("express-validator");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
// Получение профиля текущего пользователя
router.get('/profile', authMiddleware_1.authenticateToken, userController_1.getUserProfile);
// Получение профиля пользователя по ID
router.get('/:id', authMiddleware_1.authenticateToken, userController_1.getUserById);
// Обновление профиля пользователя с загрузкой аватара
router.put('/profile', authMiddleware_1.authenticateToken, upload_1.default.single('avatar'), [
    (0, express_validator_1.check)('name', 'Имя обязательно').optional().not().isEmpty(),
    (0, express_validator_1.check)('email', 'Некорректный email').optional().isEmail(),
    (0, express_validator_1.check)('password', 'Пароль должен быть минимум 6 символов').optional().isLength({ min: 6 }),
], userController_1.updateUserProfile);
exports.default = router;
