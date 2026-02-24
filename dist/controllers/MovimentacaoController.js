"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarMovimentacao = exports.listarMovimentacoes = exports.movimentacoes = void 0;
const ProdutoController_1 = require("./ProdutoController");
exports.movimentacoes = [];
let nextIdMov = 1;
// Listar todas movimentações (admin) ou do próprio usuário, com filtros por produto/data
const listarMovimentacoes = (req, res) => {
    const user = req.user;
    const { produto_id, data_inicio, data_fim } = req.query;
    let filtradas = [...exports.movimentacoes];
    // Filtro por usuário operacional
    if (user.perfil !== 'admin') {
        filtradas = filtradas.filter(m => m.usuario_id === user.id);
    }
    // Filtro por produto
    if (produto_id) {
        filtradas = filtradas.filter(m => m.produto_id === Number(produto_id));
    }
    // Filtro por datas
    if (data_inicio) {
        const inicio = new Date(data_inicio);
        filtradas = filtradas.filter(m => m.data_hora >= inicio);
    }
    if (data_fim) {
        const fim = new Date(data_fim);
        filtradas = filtradas.filter(m => m.data_hora <= fim);
    }
    // Adiciona flag estoque_baixo
    const resultado = filtradas.map(m => {
        const produto = ProdutoController_1.produtos.find(p => p.id === m.produto_id);
        return {
            ...m,
            estoque_baixo: produto ? produto.estoque_atual < produto.estoque_minimo : false
        };
    });
    res.json(resultado);
};
exports.listarMovimentacoes = listarMovimentacoes;
// Registrar movimentação (entrada/saída)
const registrarMovimentacao = (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Body vazio ou inválido' });
    }
    const user = req.user;
    const { produto_id, tipo, quantidade, observacao } = req.body;
    if (!produto_id || !tipo || quantidade == null) {
        return res.status(400).json({ erro: 'Campos obrigatórios: produto_id, tipo, quantidade' });
    }
    const produto = ProdutoController_1.produtos.find(p => p.id === Number(produto_id));
    if (!produto)
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    // Validação de estoque na saída
    if (tipo === 'saida' && produto.estoque_atual < quantidade) {
        return res.status(400).json({ erro: 'Estoque insuficiente para a saída.' });
    }
    // Atualiza estoque automaticamente
    if (tipo === 'entrada') {
        produto.estoque_atual += quantidade;
    }
    else {
        produto.estoque_atual -= quantidade;
    }
    // Alerta estoque mínimo
    if (produto.estoque_atual < produto.estoque_minimo) {
        console.warn(`Alerta: Produto "${produto.nome}" abaixo do estoque mínimo!`);
    }
    const novaMov = {
        id: nextIdMov++,
        produto_id: produto.id,
        usuario_id: user.id,
        tipo,
        quantidade,
        observacao,
        data_hora: new Date(),
    };
    exports.movimentacoes.push(novaMov);
    res.status(201).json(novaMov);
};
exports.registrarMovimentacao = registrarMovimentacao;
