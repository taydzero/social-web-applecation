import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req: Request, file, cb) {
        cb(null, `${req.user?.userId}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неверный тип файла'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2000000 },
});

export default upload;
