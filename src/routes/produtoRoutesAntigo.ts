import { Router } from 'express';
import {
  criarProduto,
  listarProdutos,
  atualizarProduto,
  deletarProduto
} from '../controllers/ProdutoController';

const router = Router();

router.post('/', criarProduto);
router.get('/', listarProdutos);
router.put('/:id', atualizarProduto);
router.delete('/:id', deletarProduto);

export default router;