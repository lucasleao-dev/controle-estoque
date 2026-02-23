import { Request, Response } from 'express';
import { produtos } from './ProdutoController';
import { movimentacoes } from './MovimentacaoController';

export const obterDashboard = (req: Request, res: Response) => {
    const totalProdutos = produtos.filter(p => p.ativo).length;

    const produtosEstoqueBaixo = produtos.filter(
        p => p.ativo && p.estoque_atual < p.estoque_minimo
    );

    const ultimasMovimentacoes = [...movimentacoes]
        .sort((a, b) => b.data_hora.getTime() - a.data_hora.getTime())
        .slice(0, 10)
        .map(m => {
            const produto = produtos.find(p => p.id === m.produto_id);
            return {
                ...m,
                produto_nome: produto?.nome || 'Produto não encontrado',
                estoque_baixo: produto ? produto.estoque_atual < produto.estoque_minimo : false
            };
        });

    res.json({
        totalProdutos,
        produtosEstoqueBaixo,
        ultimasMovimentacoes
    });
};