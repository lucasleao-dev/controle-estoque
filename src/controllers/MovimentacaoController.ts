import { Request, Response } from 'express';
import { Produto, produtos } from './ProdutoController';

export interface Movimentacao {
  id: number;
  produto_id: number;
  usuario_id: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  observacao?: string;
  data_hora: Date;
}

export let movimentacoes: Movimentacao[] = [];
let nextIdMov = 1;

// Listar movimentações
export const listarMovimentacoes = (req: Request, res: Response) => {
  const user = (req as any).user;
  const { produto_id, data_inicio, data_fim } = req.query;

  let filtradas = [...movimentacoes];

  if (user.perfil !== 'admin') {
    filtradas = filtradas.filter(m => m.usuario_id === user.id);
  }

  if (produto_id) {
    filtradas = filtradas.filter(m => m.produto_id === Number(produto_id));
  }

  if (data_inicio) {
    const inicio = new Date(data_inicio as string);
    filtradas = filtradas.filter(m => m.data_hora >= inicio);
  }
  if (data_fim) {
    const fim = new Date(data_fim as string);
    filtradas = filtradas.filter(m => m.data_hora <= fim);
  }

  const resultado = filtradas.map(m => {
    const produto = produtos.find(p => p.id === m.produto_id);
    return {
      ...m,
      estoque_baixo: produto ? produto.estoque_atual < produto.estoque_minimo : false
    };
  });

  res.json(resultado);
};

// Registrar movimentação
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

  if (tipo === 'saida' && produto.estoque_atual < quantidade) {
    return res.status(400).json({ erro: 'Estoque insuficiente para a saída.' });
  }

  if (tipo === 'entrada') produto.estoque_atual += quantidade;
  else produto.estoque_atual -= quantidade;

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
    data_hora: new Date()
  };

  movimentacoes.push(novaMov);
  res.status(201).json(novaMov);
};