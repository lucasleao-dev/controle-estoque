"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const AjusteEstoqueController_1 = require("../controllers/AjusteEstoqueController");
const router = (0, express_1.Router)();
// listar ajustes (autenticado)
router.get('/', auth_1.autenticar, AjusteEstoqueController_1.listarAjustes);
// ajustar estoque (somente admin)
router.post('/', auth_1.autenticar, auth_1.adminOnly, AjusteEstoqueController_1.ajustarEstoque);
exports.default = router;
