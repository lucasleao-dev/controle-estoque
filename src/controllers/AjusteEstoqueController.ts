import { Request, Response } from 'express';
import { produtos } from './ProdutoController';
import { AjusteEstoque } from '../models/AjusteEstoque';

export let ajustes: AjusteEstoque[] = [];
let nextIdAjuste = 1;

// Listar ajustes (filtros por produto/data)
export const listarAjustes = (req: Request, res: Response) => {
    const { produto_id, data_inicio, data_fim } = req.query;

    let filtrados = [...ajustes];

    if (produto_id) {
        filtrados = filtrados.filter(a => a.produto_id === Number(produto_id));
    }

    if (data_inicio) {
        const inicio = new Date(data_inicio as string);
        filtrados = filtrados.filter(a => a.data_hora >= inicio);
    }

    if (data_fim) {
        const fim = new Date(data_fim as string);
        filtrados = filtrados.filter(a => a.data_hora <= fim);
    }

    const resultado = filtrados.map(a => {
        const produto = produtos.find(p => p.id === a.produto_id);
        return {
            ...a,
            estoque_baixo: produto ? produto.estoque_atual < produto.estoque_minimo : false
        };
    });

    res.json(resultado);
};

// Ajustar estoque manual (admin)
export const ajustarEstoque = (req: Request, res: Response) => {
    const user = (req as any).user;
    const { produto_id, quantidade_nova, motivo } = req.body;

    if (!produto_id || quantidade_nova == null || !motivo) {
        return res.status(400).json({ erro: 'Campos obrigatórios: produto_id, quantidade_nova, motivo' });
    }

    const produto = produtos.find(p => p.id === Number(produto_id));
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

    const quantidadeAnterior = produto.estoque_atual;

    produto.estoque_atual = quantidade_nova;

    const novoAjuste: AjusteEstoque = {
        id: nextIdAjuste++,
        produto_id: produto.id,
        quantidade_anterior: quantidadeAnterior,
        quantidade_nova,
        motivo,
        usuario_id: user.id,
        data_hora: new Date(),
    };

    ajustes.push(novoAjuste);

    res.status(201).json({
        mensagem: 'Estoque ajustado com sucesso.',
        ajuste: novoAjuste,
        produto: {
            ...produto,
            estoque_baixo: produto.estoque_atual < produto.estoque_minimo
        }
    });
};