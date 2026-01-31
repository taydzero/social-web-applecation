import { Router } from 'express';
import { getAllUsers, getUserProfile, getUserById, updateUserProfile } from '../controllers/userController';
import { check } from 'express-validator';
import upload from '../middlewares/upload';

const router = Router();

router.get('/', getAllUsers);

router.get('/profile', getUserProfile);

router.get('/:id', getUserById);

router.put('/profile', upload.single('avatar'), updateUserProfile);

export default router;

