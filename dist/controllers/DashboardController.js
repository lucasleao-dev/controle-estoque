"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterDashboard = void 0;
const ProdutoController_1 = require("./ProdutoController");
const MovimentacaoController_1 = require("./MovimentacaoController");
const obterDashboard = (req, res) => {
    const totalProdutos = ProdutoController_1.produtos.filter(p => p.ativo).length;
    const produtosEstoqueBaixo = ProdutoController_1.produtos.filter(p => p.ativo && p.estoque_atual < p.estoque_minimo);
    const ultimasMovimentacoes = [...MovimentacaoController_1.movimentacoes]
        .sort((a, b) => b.data_hora.getTime() - a.data_hora.getTime())
        .slice(0, 10)
        .map(m => {
        const produto = ProdutoController_1.produtos.find(p => p.id === m.produto_id);
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
exports.obterDashboard = obterDashboard;
