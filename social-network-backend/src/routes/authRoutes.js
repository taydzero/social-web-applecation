"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Маршрут регистрации
router.post('/register', [
    (0, express_validator_1.check)('name', 'Имя обязательно').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Некорректный email').isEmail(),
    (0, express_validator_1.check)('password', 'Пароль должен быть минимум 6 символов').isLength({ min: 6 }),
], authController_1.register);
// Маршрут логина
router.post('/login', [
    (0, express_validator_1.check)('email', 'Некорректный email').isEmail(),
    (0, express_validator_1.check)('password', 'Пароль обязателен').exists(),
], authController_1.login);
exports.default = router;
