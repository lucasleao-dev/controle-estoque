import { Request, Response } from 'express';
import { produtos } from './ProdutoController';
import { Movimentacao } from '../models/Movimentacao';

export let movimentacoes: Movimentacao[] = [];
let nextIdMov = 1;

// Listar todas movimentações (admin) ou do próprio usuário, com filtros por produto/data
export const listarMovimentacoes = (req: Request, res: Response) => {
    const user = (req as any).user;
    const { produto_id, data_inicio, data_fim } = req.query;

    let filtradas = [...movimentacoes];

    // Filtro por usuário operacional
    if (user.perfil !== 'admin') {
        filtradas = filtradas.filter(m => m.usuario_id === user.id);
    }

    // Filtro por produto
    if (produto_id) {
        filtradas = filtradas.filter(m => m.produto_id === Number(produto_id));
    }

    // Filtro por datas
    if (data_inicio) {
        const inicio = new Date(data_inicio as string);
        filtradas = filtradas.filter(m => m.data_hora >= inicio);
    }
    if (data_fim) {
        const fim = new Date(data_fim as string);
        filtradas = filtradas.filter(m => m.data_hora <= fim);
    }

    // Adiciona flag estoque_baixo
    const resultado = filtradas.map(m => {
        const produto = produtos.find(p => p.id === m.produto_id);
        return {
            ...m,
            estoque_baixo: produto ? produto.estoque_atual < produto.estoque_minimo : false
        };
    });

    res.json(resultado);
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