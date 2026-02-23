import { Router } from 'express';
import { autenticar, adminOnly } from '../middleware/auth';
import { listarAjustes, ajustarEstoque } from '../controllers/AjusteEstoqueController';

const router = Router();

// listar ajustes (autenticado)
router.get('/', autenticar, listarAjustes);

// ajustar estoque (somente admin)
router.post('/', autenticar, adminOnly, ajustarEstoque);

export default router;