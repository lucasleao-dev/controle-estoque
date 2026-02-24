"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarios = exports.loginUsuario = exports.criarUsuario = exports.listarUsuarios = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Array em memória
let usuarios = [];
exports.usuarios = usuarios;
let nextId = 1;
// Secret JWT (em produção, colocar no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta';
// Listar usuários (somente para teste)
const listarUsuarios = (req, res) => {
    res.json(usuarios);
};
exports.listarUsuarios = listarUsuarios;
// Criar usuário
const criarUsuario = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Body vazio ou inválido' });
    }
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha || !perfil) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }
    // Verifica email duplicado
    const existe = usuarios.find(u => u.email === email);
    if (existe)
        return res.status(409).json({ erro: 'Email já cadastrado.' });
    const senhaHash = await bcryptjs_1.default.hash(senha, 10);
    const novoUsuario = {
        id: nextId++,
        nome,
        email,
        senha: senhaHash,
        perfil,
        ativo: true,
        data_criacao: new Date(),
    };
    usuarios.push(novoUsuario);
    res.status(201).json({ id: novoUsuario.id, nome, email, perfil, ativo: true });
};
exports.criarUsuario = criarUsuario;
// Login
const loginUsuario = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Body vazio ou inválido' });
    }
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario)
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (!usuario.ativo)
        return res.status(403).json({ erro: 'Usuário inativo.' });
    const senhaValida = await bcryptjs_1.default.compare(senha, usuario.senha);
    if (!senhaValida)
        return res.status(401).json({ erro: 'Senha incorreta.' });
    const token = jsonwebtoken_1.default.sign({ id: usuario.id, perfil: usuario.perfil }, JWT_SECRET, { expiresIn: '2h' });
    res.json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
    });
};
exports.loginUsuario = loginUsuario;
