import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { InvalidFileTypeError } from '../../domain/errors/DomainError';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads/invoices');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class FileStorageService {
    private readonly allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

    async uploadInvoice(file: Express.Multer.File): Promise<string> {
        if (!this.allowedTypes.includes(file.mimetype)) {
            throw new InvalidFileTypeError(this.allowedTypes);
        }

        if (file.size > this.maxFileSize) {
            throw new Error('El archivo excede el tamaño máximo permitido de 5MB');
        }

        const extension = path.extname(file.originalname);
        const filename = `${uuidv4()}${extension}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await fs.promises.rename(file.path, filepath);

        // Return relative path or URL
        return `/uploads/invoices/${filename}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const filename = path.basename(fileUrl);
        const filepath = path.join(UPLOAD_DIR, filename);

        if (fs.existsSync(filepath)) {
            await fs.promises.unlink(filepath);
        }
    }

    getFilePath(fileUrl: string): string {
        const filename = path.basename(fileUrl);
        return path.join(UPLOAD_DIR, filename);
    }
}

export const fileStorageService = new FileStorageService();
