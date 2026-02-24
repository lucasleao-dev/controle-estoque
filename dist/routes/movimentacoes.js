"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MovimentacaoController_1 = require("../controllers/MovimentacaoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Listar movimentações → admin vê todas, operacional só as próprias
router.get('/', auth_1.autenticar, MovimentacaoController_1.listarMovimentacoes);
// Registrar movimentação → qualquer usuário autenticado
router.post('/', auth_1.autenticar, MovimentacaoController_1.registrarMovimentacao);
exports.default = router;
