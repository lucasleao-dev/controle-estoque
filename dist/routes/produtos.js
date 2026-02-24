"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProdutoController_1 = require("../controllers/ProdutoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Listar produtos → qualquer usuário autenticado
router.get('/', auth_1.autenticar, ProdutoController_1.listarProdutos);
// Criar produto → apenas admin
router.post('/', auth_1.autenticar, auth_1.adminOnly, ProdutoController_1.criarProduto);
// Atualizar produto → apenas admin
router.put('/:id', auth_1.autenticar, auth_1.adminOnly, ProdutoController_1.atualizarProduto);
// Deletar produto → apenas admin
router.delete('/:id', auth_1.autenticar, auth_1.adminOnly, ProdutoController_1.deletarProduto);
exports.default = router;
