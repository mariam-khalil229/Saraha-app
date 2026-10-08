import fs from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import multer from 'multer';

export const multerLocal = ({ customPath = "General", customTypes = [] }) => {

    const fullPath = `uploads/${customPath}`;
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            console.log(file);
            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            console.log({ file });
            cb(null, randomUUID() + "__" + file.originalname);
        }
    });

    function fileFilter(req, file, cb) {
        if (!customTypes.includes(file.mimetype)) {
            cb(new Error('InValid file!'));
        } else {
            cb(null, true);
        }
    }

    const upload = multer({ storage, fileFilter });

    return upload;
}