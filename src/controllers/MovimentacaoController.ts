// MovimentacaoController.ts
import { Request, Response } from 'express';
import { getConnection } from '../db/oracle';
import { Produto } from '../models/Produto';
import oracledb from 'oracledb';

// Tipagem da linha retornada pelo SELECT
interface MovRow {
    ID: number;
    PRODUTO_ID: number;
    USUARIO_ID: number;
    TIPO: string;
    QUANTIDADE: number;
    OBSERVACAO?: string;
    DATA_MOVIMENTACAO: Date;
    ESTOQUE_ATUAL: number;
    ESTOQUE_MINIMO: number;
}

// Listar movimentações
export const listarMovimentacoes = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { produto_id, data_inicio, data_fim } = req.query;

    try {
        const conn = await getConnection();

        // Seleciona todas as movimentações, com estoque atual e mínimo do produto
        let sql = `
            SELECT m.ID, m.PRODUTO_ID, m.USUARIO_ID, m.TIPO, m.QUANTIDADE, m.OBSERVACAO, m.DATA_MOVIMENTACAO,
                   p.QUANTIDADE AS ESTOQUE_ATUAL, p.ESTOQUE_MINIMO
            FROM MOVIMENTACOES m
            JOIN PRODUTOS p ON m.PRODUTO_ID = p.ID
            WHERE 1=1
        `;
        const binds: any = {};

        if (user.perfil !== 'ADMIN') {
            sql += ' AND m.USUARIO_ID = :usuarioId';
            binds.usuarioId = user.id;
        }

        if (produto_id) {
            sql += ' AND m.PRODUTO_ID = :produtoId';
            binds.produtoId = Number(produto_id);
        }

        if (data_inicio) {
            sql += ' AND m.DATA_MOVIMENTACAO >= TO_DATE(:dataInicio, \'YYYY-MM-DD\')';
            binds.dataInicio = data_inicio;
        }
        if (data_fim) {
            sql += ' AND m.DATA_MOVIMENTACAO <= TO_DATE(:dataFim, \'YYYY-MM-DD\')';
            binds.dataFim = data_fim;
        }

        const result = await conn.execute<MovRow>(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        await conn.close();

        const movimentacoes = (result.rows || []).map((m: MovRow) => ({
            id: m.ID,
            produto_id: m.PRODUTO_ID,
            usuario_id: m.USUARIO_ID,
            tipo: m.TIPO,
            quantidade: m.QUANTIDADE,
            observacao: m.OBSERVACAO,
            data_hora: m.DATA_MOVIMENTACAO,
            estoque_baixo: m.ESTOQUE_ATUAL < m.ESTOQUE_MINIMO
        }));

        res.json(movimentacoes);
    } catch (err) {
        console.error('Erro ao listar movimentações:', err);
        res.status(500).json({ erro: 'Erro ao listar movimentações', detalhes: err });
    }
};

// Registrar movimentação
export const registrarMovimentacao = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { produto_id, tipo, quantidade, observacao } = req.body;

    if (!produto_id || !tipo || quantidade == null) {
        return res.status(400).json({ erro: 'Campos obrigatórios: produto_id, tipo, quantidade' });
    }

    try {
        const conn = await getConnection();

        // Busca o produto
        const prodRes = await conn.execute<Produto>(
            `SELECT ID, QUANTIDADE AS ESTOQUE_ATUAL, ESTOQUE_MINIMO FROM PRODUTOS WHERE ID = :id AND ATIVO = 'S'`,
            [produto_id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (!prodRes.rows || prodRes.rows.length === 0) {
            await conn.close();
            return res.status(404).json({ erro: 'Produto não encontrado ou inativo.' });
        }

        const produto = prodRes.rows[0] as any;
        let estoqueAtual = produto.ESTOQUE_ATUAL;
        const estoqueMinimo = produto.ESTOQUE_MINIMO;

        // Verifica estoque para saída
        if (tipo.toLowerCase() === 'saida' && estoqueAtual < quantidade) {
            await conn.close();
            return res.status(400).json({ erro: 'Estoque insuficiente para a saída.' });
        }

        // Atualiza estoque
        if (tipo.toLowerCase() === 'entrada') estoqueAtual += quantidade;
        else estoqueAtual -= quantidade;

        await conn.execute(
            `UPDATE PRODUTOS SET QUANTIDADE = :quantidade WHERE ID = :id`,
            { quantidade: estoqueAtual, id: produto_id },
            { autoCommit: true }
        );

        // Insere movimentação
        const result = await conn.execute(
            `INSERT INTO MOVIMENTACOES (PRODUTO_ID, USUARIO_ID, TIPO, QUANTIDADE, OBSERVACAO, DATA_MOVIMENTACAO)
             VALUES (:produto_id, :usuario_id, :tipo, :quantidade, :observacao, SYSDATE)
             RETURNING ID INTO :id`,
            {
                produto_id,
                usuario_id: user.id,
                tipo,
                quantidade,
                observacao,
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        const novaMov = {
            id: (result.outBinds as { id: number[] }).id[0],
            produto_id,
            usuario_id: user.id,
            tipo,
            quantidade,
            observacao,
            data_hora: new Date(),
            estoque_baixo: estoqueAtual < estoqueMinimo
        };

        await conn.close();
        res.status(201).json(novaMov);
    } catch (err) {
        console.error('Erro ao registrar movimentação:', err);
        res.status(500).json({ erro: 'Erro ao registrar movimentação', detalhes: err });
    }
};