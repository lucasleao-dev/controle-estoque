import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import testeRoutes from './routes/teste';
import produtosRoutes from './routes/produtos';
import usuariosRoutes from './routes/usuarios';
import movimentacoesRoutes from './routes/movimentacoes';
import ajustesRoutes from './routes/ajustes';
dotenv.config();
import dashboardRoutes from './routes/dashboard';
import produtoRoutes from './routes/produtoRoutesAntigo';
import estoqueDetalhadoRoutes from './routes/estoque-detalhado';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/teste', testeRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/movimentacoes', movimentacoesRoutes);
app.use('/ajustes', ajustesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/produtos', produtoRoutes);
app.use('/estoque-detalhado', estoqueDetalhadoRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('API Controle de Estoque funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
