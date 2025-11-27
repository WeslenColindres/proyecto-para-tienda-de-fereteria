import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

export const authorizeRole = (allowedRoles: number[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !allowedRoles.includes(req.user.roleId)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};

// Optional authentication - allows desktop app to access without token
export const authenticateTokenOptional = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const sourceApp = req.headers['x-source-app'];

    // If request is from desktop app, allow access regardless of token validity
    if (sourceApp === 'stock-manager-desktop') {
        // If token exists and is valid, set user context
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
                if (!err) {
                    req.user = user;
                }
                // Even if token is invalid, allow desktop app through with no user context
                return next();
            });
        } else {
            // No token, allow with no user context
            req.user = null;
            return next();
        }
    } else {
        // Not from desktop app - require valid token
        if (!token) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    }
};
