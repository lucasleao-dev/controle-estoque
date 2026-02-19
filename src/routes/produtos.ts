import { Router } from 'express';
import { listarProdutos, criarProduto, atualizarProduto, deletarProduto } from '../controllers/ProdutoController';
import { autenticar, adminOnly } from '../middleware/auth';

const router = Router();

// Listar produtos → qualquer usuário autenticado
router.get('/', autenticar, listarProdutos);

// Criar produto → apenas admin
router.post('/', autenticar, adminOnly, criarProduto);

// Atualizar produto → apenas admin
router.put('/:id', autenticar, adminOnly, atualizarProduto);

// Deletar produto → apenas admin
router.delete('/:id', autenticar, adminOnly, deletarProduto);

export default router;
