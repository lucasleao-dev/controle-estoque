import { Router } from 'express';
import { listarUsuarios, criarUsuario, loginUsuario } from '../controllers/UsuarioController';

const router = Router();

router.get('/', listarUsuarios);       // listar todos (teste)
router.post('/', criarUsuario);        // criar usuário
router.post('/login', loginUsuario);   // login

export default router;
