import { Router } from 'express';
import { autenticar } from '../middleware/auth';
import { obterEstoqueDetalhado } from '../controllers/EstoqueDetalhadoController';

const router = Router();

// Rota para obter estoque detalhado → apenas usuários autenticados
router.get('/', autenticar, obterEstoqueDetalhado);

export default router; // ✅ export default para funcionar com import estoqueDetalhadoRoutes