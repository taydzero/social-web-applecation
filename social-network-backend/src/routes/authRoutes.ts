// src/routes/authRoutes.ts
import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { check } from 'express-validator';

const router = Router();

// Маршрут регистрации
router.post(
    '/register',
    [
        check('name', 'Имя обязательно').not().isEmpty(),
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Пароль должен быть минимум 6 символов').isLength({ min: 6 }),
    ],
    register
);

// Маршрут логина
router.post(
    '/login',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Пароль обязателен').exists(),
    ],
    login
);

export default router;
