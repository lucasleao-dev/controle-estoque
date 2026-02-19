import { Router } from 'express';
import { listarMovimentacoes, registrarMovimentacao } from '../controllers/MovimentacaoController';
import { autenticar, adminOnly } from '../middleware/auth';

const router = Router();

// Listar movimentações → admin vê todas, operacional só as próprias
router.get('/', autenticar, listarMovimentacoes);

// Registrar movimentação → qualquer usuário autenticado
router.post('/', autenticar, registrarMovimentacao);

export default router;
