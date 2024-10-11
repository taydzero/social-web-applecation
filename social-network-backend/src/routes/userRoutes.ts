// src/routes/userRoutes.ts
import { Router } from 'express';
import { getUserProfile, updateUserProfile, getUserById } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { check } from 'express-validator';
import upload from '../middlewares/upload';

const router = Router();

// Получение профиля текущего пользователя
router.get('/profile', authenticateToken, getUserProfile);

// Получение профиля пользователя по ID
router.get('/:id', authenticateToken, getUserById);

// Обновление профиля пользователя с загрузкой аватара
router.put(
    '/profile',
    authenticateToken,
    upload.single('avatar'),
    [
        check('name', 'Имя обязательно').optional().not().isEmpty(),
        check('email', 'Некорректный email').optional().isEmail(),
        check('password', 'Пароль должен быть минимум 6 символов').optional().isLength({ min: 6 }),
    ],
    updateUserProfile
);

export default router;
