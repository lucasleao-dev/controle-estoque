// controllers/ProdutoController.ts
import { Request, Response } from 'express';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';
import { Produto } from '../models/Produto';
import { ProdutoModel } from '../models/ProdutoModel';

// Listar todos produtos ativos
export const listarProdutos = async (req: Request, res: Response) => {
    try {
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT ID, NOME, CODIGO_BARRAS AS CODIGO, CATEGORIA, UNIDADE_MEDIDA, 
                    QUANTIDADE AS ESTOQUE_ATUAL, ESTOQUE_MINIMO, ATIVO, DATA_CRIACAO
             FROM PRODUTOS
             WHERE ATIVO = 'S'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Mapeando diretamente para ProdutoModel
        const produtos: Produto[] = (result.rows || []).map(row => new ProdutoModel(row));

        await conn.close();
        res.json(produtos);
    } catch (err) {
        console.error('Erro ao listar produtos:', err);
        res.status(500).json({ erro: 'Erro ao listar produtos', detalhes: err });
    }
};

// Criar produto
export const criarProduto = async (req: Request, res: Response) => {
    const { nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo } = req.body;

    if (!nome || !categoria || !unidade_medida) {
        return res.status(400).json({ erro: 'Campos obrigatórios faltando.' });
    }

    try {
        const conn = await getConnection();

        const result = await conn.execute(
            `INSERT INTO PRODUTOS (NOME, CODIGO_BARRAS, CATEGORIA, UNIDADE_MEDIDA, QUANTIDADE, ESTOQUE_MINIMO)
             VALUES (:nome, :codigo, :categoria, :unidade_medida, :estoque_atual, :estoque_minimo)
             RETURNING ID INTO :id`,
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

        const novoId = (result.outBinds as { id: number[] }).id[0];

        const novoProduto: Produto = new ProdutoModel({
            ID: novoId,
            NOME: nome,
            CODIGO: codigo,
            CATEGORIA: categoria,
            UNIDADE_MEDIDA: unidade_medida,
            ESTOQUE_ATUAL: estoque_atual,
            ESTOQUE_MINIMO: estoque_minimo,
            ATIVO: 'S',
            DATA_CRIACAO: new Date()
        });

        await conn.close();
        res.status(201).json(novoProduto);
    } catch (err) {
        console.error('Erro ao criar produto:', err);
        res.status(500).json({ erro: 'Erro ao criar produto', detalhes: err });
    }
};

// Atualizar produto
export const atualizarProduto = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo, ativo } = req.body;

    try {
        const conn = await getConnection();

        await conn.execute(
            `UPDATE PRODUTOS SET
                NOME = :nome,
                CODIGO_BARRAS = :codigo,
                CATEGORIA = :categoria,
                UNIDADE_MEDIDA = :unidade_medida,
                QUANTIDADE = :estoque_atual,
                ESTOQUE_MINIMO = :estoque_minimo,
                ATIVO = :ativo
             WHERE ID = :id`,
            {
                id: Number(id),
                nome,
                codigo,
                categoria,
                unidade_medida,
                estoque_atual,
                estoque_minimo,
                ativo: ativo ? 'S' : 'N'
            },
            { autoCommit: true }
        );

        await conn.close();
        res.json({ mensagem: 'Produto atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhes: err });
    }
};

// Deletar produto (soft delete)
export const deletarProduto = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const conn = await getConnection();

        await conn.execute(
            `UPDATE PRODUTOS SET ATIVO = 'N' WHERE ID = :id`,
            { id: Number(id) },
            { autoCommit: true }
        );

        await conn.close();
        res.json({ mensagem: 'Produto desativado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        res.status(500).json({ erro: 'Erro ao deletar produto', detalhes: err });
    }
};