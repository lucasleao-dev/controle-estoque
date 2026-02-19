import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Secret JWT (usar mesmo do controller de usuários)
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta';

// Tipagem customizada para req.user
export interface JwtPayloadCustom {
    id: number;
    perfil: 'admin' | 'operacional';
}

// Middleware de autenticação
export const autenticar = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
        return res.status(401).json({ erro: 'Token inválido' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
        // Coloca os dados do usuário autenticado no req
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
};

// Middleware para verificar perfil admin
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayloadCustom;
    if (user.perfil !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado: somente administradores' });
    }
    next();
};
