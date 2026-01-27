import { Router } from 'express';
import { getAllUsers, getUserProfile, getUserById, updateUserProfile } from '../controllers/userController';
import { check } from 'express-validator';
import upload from '../middlewares/upload';

const router = Router();

// Получение списка всех пользователей
router.get('/', getAllUsers);

// Получение профиля текущего пользователя
router.get('/profile', getUserProfile);

// Получение профиля пользователя по ID
router.get('/:id', getUserById);

// Обновление профиля пользователя с загрузкой аватара
router.put('/profile', upload.single('avatar'), updateUserProfile);

export default router;

