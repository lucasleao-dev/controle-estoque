// controllers/EstoqueDetalhadoController.ts
import { Request, Response } from 'express';
import { getConnection } from '../db/oracle';
import oracledb from 'oracledb';

// Tipagem Produto
interface Produto {
  ID: number;
  NOME: string;
  QUANTIDADE: number;
  ESTOQUE_MINIMO: number;
  ATIVO: 'S' | 'N';
}

// Tipagem Movimentação
interface Movimentacao {
  ID: number;
  PRODUTO_ID: number;
  USUARIO_ID: number;
  TIPO: 'entrada' | 'saida';
  QUANTIDADE: number;
  OBSERVACAO?: string;
  DATA_MOVIMENTACAO: Date;
}

export const obterEstoqueDetalhado = async (req: Request, res: Response) => {
  let conn: oracledb.Connection | undefined;
  try {
    conn = await getConnection();

    // Buscar produtos ativos
    const produtosResult = await conn.execute<Produto>(
      `SELECT ID, NOME, QUANTIDADE, ESTOQUE_MINIMO, ATIVO
       FROM PRODUTOS
       WHERE ATIVO = 'S'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const produtos = produtosResult.rows || [];

    // Buscar movimentações
    const movimentacoesResult = await conn.execute<Movimentacao>(
      `SELECT ID, PRODUTO_ID, USUARIO_ID, TIPO, QUANTIDADE, OBSERVACAO, DATA_MOVIMENTACAO
       FROM MOVIMENTACOES
       ORDER BY DATA_MOVIMENTACAO DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const movimentacoes = movimentacoesResult.rows || [];

    // Mapear estoque detalhado
    const estoqueDetalhado = produtos.map(produto => {
      const movs = movimentacoes.filter(m => m.PRODUTO_ID === produto.ID);
      return {
        ...produto,
        estoque_baixo: produto.QUANTIDADE < produto.ESTOQUE_MINIMO,
        movimentacoes: movs
      };
    });

    res.json(estoqueDetalhado);
  } catch (err) {
    console.error('Erro ao obter estoque detalhado:', err);
    res.status(500).json({ erro: 'Erro ao obter estoque detalhado', detalhes: err });
  } finally {
    if (conn) await conn.close();
  }
};