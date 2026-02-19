import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testeRoutes from './routes/teste';
import produtosRoutes from './routes/produtos';
import usuariosRoutes from './routes/usuarios';
import movimentacoesRoutes from './routes/movimentacoes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/teste', testeRoutes);
app.use('/produtos', produtosRoutes); // ✅ registrando a rota de produtos
app.use('/usuarios', usuariosRoutes);
app.use('/movimentacoes', movimentacoesRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API Controle de Estoque funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
