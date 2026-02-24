import { Router } from 'express';
import { autenticar, adminOnly } from '../middleware/auth';
import { listarAjustes, ajustarEstoque } from '../controllers/AjusteEstoqueController';

const router = Router();

// Listar ajustes (qualquer usuário autenticado)
router.get('/', autenticar, listarAjustes);

// Registrar ajuste de estoque (somente admin)
router.post('/', autenticar, adminOnly, ajustarEstoque);

export default router;