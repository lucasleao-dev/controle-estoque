"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.autenticar = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Secret JWT (usar mesmo do controller de usuários)
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta';
// Middleware de autenticação
const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }
    const [, token] = authHeader.split(' ');
    if (!token) {
        return res.status(401).json({ erro: 'Token inválido' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Coloca os dados do usuário autenticado no req
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
};
exports.autenticar = autenticar;
// Middleware para verificar perfil admin
const adminOnly = (req, res, next) => {
    const user = req.user;
    if (user.perfil !== 'admin') {
        return res.status(403).json({ erro: 'Acesso negado: somente administradores' });
    }
    next();
};
exports.adminOnly = adminOnly;
