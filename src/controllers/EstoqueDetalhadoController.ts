import { Request, Response } from 'express';
import { produtos, Produto } from './ProdutoController';
import { movimentacoes, Movimentacao } from './MovimentacaoController';
import { ajustesEstoque, AjusteEstoque } from './AjusteEstoqueController';

export const obterEstoqueDetalhado = (req: Request, res: Response) => {
    try {
        const estoqueDetalhado = produtos.map((produto: Produto) => {
            // Movimentações do produto
            const movs: Movimentacao[] = movimentacoes.filter(m => m.produto_id === produto.id);
            
            // Ajustes do produto
            const ajustes: AjusteEstoque[] = ajustesEstoque.filter(a => a.produto_id === produto.id);

            // Estoque atual baseado no último ajuste
            const ultimoAjuste = ajustes.sort((a, b) => b.data_hora.getTime() - a.data_hora.getTime())[0];
            const estoqueAtual = ultimoAjuste ? ultimoAjuste.quantidade_nova : produto.estoque_atual;

            return {
                id: produto.id,
                nome: produto.nome,
                codigo: produto.codigo,
                categoria: produto.categoria,
                unidade_medida: produto.unidade_medida,
                estoque_atual: estoqueAtual,
                estoque_minimo: produto.estoque_minimo,
                ativo: produto.ativo,
                estoque_baixo: estoqueAtual < produto.estoque_minimo,
                movimentacoes: movs,
                ajustes: ajustes
            };
        });

        res.json(estoqueDetalhado);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao obter estoque detalhado', detalhes: err });
    }
};