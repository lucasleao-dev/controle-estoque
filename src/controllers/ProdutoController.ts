import { Request, Response } from 'express';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';

export interface Produto {
    id: number;
    nome: string;
    codigo?: string;
    categoria: string;
    unidade_medida: string;
    estoque_atual: number;
    estoque_minimo: number;
    ativo: number;
    data_criacao?: Date;
}

export let produtos: Produto[] = [];

// Listar produtos
export const listarProdutos = async (req: Request, res: Response) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT id, nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo, ativo, data_criacao 
             FROM produtos WHERE ativo = 1`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // importante para vir como objeto
        );

        produtos = (result.rows as any[]).map((row) => ({
            id: row.ID,
            nome: row.NOME,
            codigo: row.CODIGO,
            categoria: row.CATEGORIA,
            unidade_medida: row.UNIDADE_MEDIDA,
            estoque_atual: row.ESTOQUE_ATUAL,
            estoque_minimo: row.ESTOQUE_MINIMO,
            ativo: row.ATIVO,
            data_criacao: row.DATA_CRIACAO
        }));

        await conn.close();
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao listar produtos', detalhes: err });
    }
};

// Criar produto
export const criarProduto = async (req: Request, res: Response) => {
    const { nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo } = req.body;

    if (!nome || !categoria || !unidade_medida)
        return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });

    try {
        const conn = await getConnection();

        // Tipando o outBinds corretamente
        const result = await conn.execute(
            `INSERT INTO produtos 
            (nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo)
            VALUES (:nome, :codigo, :categoria, :unidade_medida, :estoque_atual, :estoque_minimo)
            RETURNING id INTO :id`,
            {
                nome,
                codigo,
                categoria,
                unidade_medida,
                estoque_atual,
                estoque_minimo,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        // ⚡ Aqui garantimos que o TypeScript entende que outBinds tem id
        const novoId = (result.outBinds as { id: number[] }).id[0];

        const novoProduto: Produto = {
            id: novoId,
            nome,
            codigo,
            categoria,
            unidade_medida,
            estoque_atual,
            estoque_minimo,
            ativo: 1
        };

        produtos.push(novoProduto);
        await conn.close();

        res.status(201).json(novoProduto);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar produto', detalhes: err });
    }
};