import { Request, Response } from 'express';
import { produtos, Produto } from './ProdutoController';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';

// Tipagem para ajustes
export interface AjusteEstoque {
    id?: number;
    produto_id: number;
    quantidade_anterior: number;
    quantidade_nova: number;
    motivo: string;
    estoque_baixo: boolean;
    data_hora: Date;
}

// Mantemos ajustes em memória
export let ajustesEstoque: AjusteEstoque[] = [];

// Listar ajustes
export const listarAjustes = async (req: Request, res: Response) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT id, produto_id, quantidade_anterior, quantidade_nova, motivo, data_hora
             FROM ajuste_estoque ORDER BY data_hora DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const ajustes = (result.rows as any[]).map(row => {
            const produto = produtos.find(p => p.id === row.PRODUTO_ID);
            return {
                id: row.ID,
                produto_id: row.PRODUTO_ID,
                quantidade_anterior: row.QUANTIDADE_ANTERIOR,
                quantidade_nova: row.QUANTIDADE_NOVA,
                motivo: row.MOTIVO,
                estoque_baixo: produto ? row.QUANTIDADE_NOVA < produto.estoque_minimo : false,
                data_hora: row.DATA_HORA
            } as AjusteEstoque;
        });

        await conn.close();
        res.json(ajustes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar ajustes', detalhes: err });
    }
};

// Registrar ajuste de estoque
export const ajustarEstoque = async (req: Request, res: Response) => {
    const { produto_id, quantidade_nova, motivo } = req.body;

    if (!produto_id || quantidade_nova == null || !motivo) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
    }

    const produto = produtos.find(p => p.id === Number(produto_id)) as Produto | undefined;
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

    const quantidadeAnterior = produto.estoque_atual;
    produto.estoque_atual = quantidade_nova;

    try {
        const conn = await getConnection();

        const result = await conn.execute(
            `INSERT INTO ajuste_estoque (produto_id, quantidade_anterior, quantidade_nova, motivo)
             VALUES (:produto_id, :quantidade_anterior, :quantidade_nova, :motivo)
             RETURNING id INTO :id`,
            {
                produto_id: produto.id,
                quantidade_anterior: quantidadeAnterior,
                quantidade_nova,
                motivo,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const novoId = (result.outBinds as { id: number[] }).id[0];

        const ajuste: AjusteEstoque = {
            id: novoId,
            produto_id: produto.id,
            quantidade_anterior: quantidadeAnterior,
            quantidade_nova,
            motivo,
            estoque_baixo: quantidade_nova < produto.estoque_minimo,
            data_hora: new Date()
        };

        ajustesEstoque.push(ajuste);
        await conn.close();

        res.status(201).json(ajuste);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao registrar ajuste', detalhes: err });
    }
};