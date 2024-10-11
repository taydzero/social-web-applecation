import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.sendStatus(401); // Unauthorized
        return; // Завершаем выполнение функции
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.sendStatus(403); // Forbidden
            return; // Завершаем выполнение функции
        }
        req.user = { userId: (decoded as any).userId }; // Type assertion
        next(); // Proceed to the next middleware
    });
};
