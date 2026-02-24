"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UsuarioController_1 = require("../controllers/UsuarioController");
const router = (0, express_1.Router)();
router.get('/', UsuarioController_1.listarUsuarios); // listar todos (teste)
router.post('/', UsuarioController_1.criarUsuario); // criar usuário
router.post('/login', UsuarioController_1.loginUsuario); // login
exports.default = router;
