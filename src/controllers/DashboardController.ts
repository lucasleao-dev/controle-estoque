// controllers/DashboardController.ts
import { Request, Response } from 'express';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';

// Tipagem do Produto
interface ProdutoDash {
  ID: number;
  NOME: string;
  ESTOQUE_ATUAL: number;
  ESTOQUE_MINIMO: number;
  ATIVO: 'S' | 'N';
}

// Tipagem da Movimentação
interface MovimentacaoDash {
  ID: number;
  PRODUTO_ID: number;
  USUARIO_ID: number;
  TIPO: 'entrada' | 'saida';
  QUANTIDADE: number;
  OBSERVACAO?: string;
  DATA_HORA: Date;
  PRODUTO_NOME?: string;
  ESTOQUE_ATUAL?: number;
  ESTOQUE_MINIMO?: number;
}

export const obterDashboard = async (req: Request, res: Response) => {
  let conn: oracledb.Connection | undefined;
  try {
    conn = await getConnection();

    // Total de produtos ativos
    const totalProdutosResult = await conn.execute<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL FROM PRODUTOS WHERE ATIVO = 'S'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const totalProdutos = totalProdutosResult.rows?.[0]?.TOTAL || 0;

    // Produtos com estoque abaixo do mínimo
    const produtosEstoqueBaixoResult = await conn.execute<ProdutoDash>(
      `SELECT ID, NOME, QUANTIDADE AS ESTOQUE_ATUAL, ESTOQUE_MINIMO, ATIVO
       FROM PRODUTOS
       WHERE ATIVO = 'S' AND QUANTIDADE < ESTOQUE_MINIMO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const produtosEstoqueBaixo = produtosEstoqueBaixoResult.rows || [];

    // Últimas 10 movimentações com info do produto
    const ultimasMovimentacoesResult = await conn.execute<MovimentacaoDash>(
      `SELECT m.ID, m.PRODUTO_ID, m.USUARIO_ID, m.TIPO, m.QUANTIDADE, m.OBSERVACAO,
              m.DATA_MOVIMENTACAO AS DATA_HORA,
              p.NOME AS PRODUTO_NOME, p.QUANTIDADE AS ESTOQUE_ATUAL, p.ESTOQUE_MINIMO
       FROM MOVIMENTACOES m
       LEFT JOIN PRODUTOS p ON m.PRODUTO_ID = p.ID
       ORDER BY m.DATA_MOVIMENTACAO DESC
       FETCH FIRST 10 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const ultimasMovimentacoes = (ultimasMovimentacoesResult.rows || []).map(m => ({
      ...m,
      estoque_baixo:
        m.ESTOQUE_ATUAL !== undefined &&
        m.ESTOQUE_MINIMO !== undefined &&
        m.ESTOQUE_ATUAL < m.ESTOQUE_MINIMO
    }));

    res.json({
      totalProdutos,
      produtosEstoqueBaixo,
      ultimasMovimentacoes
    });
  } catch (err) {
    console.error('Erro ao obter dashboard:', err);
    res.status(500).json({ erro: 'Erro ao obter dashboard', detalhes: err });
  } finally {
    if (conn) await conn.close();
  }
};