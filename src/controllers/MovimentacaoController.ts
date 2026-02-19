import { Request, Response } from 'express';
import { produtos } from './ProdutoController';
import { usuarios } from './UsuarioController';
import { Movimentacao } from '../models/Movimentacao';

let movimentacoes: Movimentacao[] = [];
let nextIdMov = 1;

// Listar todas movimentações (admin) ou do próprio usuário
export const listarMovimentacoes = (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.perfil === 'admin') {
        return res.json(movimentacoes);
    } else {
        return res.json(movimentacoes.filter(m => m.usuario_id === user.id));
    }
};

// Registrar movimentação (entrada/saída)
export const registrarMovimentacao = (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Body vazio ou inválido' });
    }

    const user = (req as any).user;
    const { produto_id, tipo, quantidade, observacao } = req.body;

    if (!produto_id || !tipo || quantidade == null) {
        return res.status(400).json({ erro: 'Campos obrigatórios: produto_id, tipo, quantidade' });
    }

    const produto = produtos.find(p => p.id === Number(produto_id));
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

    // Validação de estoque na saída
    if (tipo === 'saida' && produto.estoque_atual < quantidade) {
        return res.status(400).json({ erro: 'Estoque insuficiente para a saída.' });
    }

    // Atualiza estoque automaticamente
    if (tipo === 'entrada') {
        produto.estoque_atual += quantidade;
    } else {
        produto.estoque_atual -= quantidade;
    }

    // Alerta estoque mínimo
    if (produto.estoque_atual < produto.estoque_minimo) {
        console.warn(`Alerta: Produto "${produto.nome}" abaixo do estoque mínimo!`);
    }

    const novaMov: Movimentacao = {
        id: nextIdMov++,
        produto_id: produto.id,
        usuario_id: user.id,
        tipo,
        quantidade,
        observacao,
        data_hora: new Date(),
    };

    movimentacoes.push(novaMov);

    res.status(201).json(novaMov);
};
