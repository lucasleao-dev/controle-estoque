"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtos = exports.deletarProduto = exports.atualizarProduto = exports.criarProduto = exports.listarProdutos = void 0;
// Array em memória inicial
let produtos = [];
exports.produtos = produtos;
let nextId = 1;
const listarProdutos = (req, res) => {
    res.json(produtos);
};
exports.listarProdutos = listarProdutos;
const criarProduto = (req, res) => {
    const { nome, codigo, categoria, unidade_medida, estoque_atual, estoque_minimo } = req.body;
    if (!nome || !codigo || !categoria || !unidade_medida || estoque_atual == null || estoque_minimo == null) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }
    const novoProduto = {
        id: nextId++,
        nome,
        codigo,
        categoria,
        unidade_medida,
        estoque_atual,
        estoque_minimo,
        ativo: true,
        data_criacao: new Date(),
    };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
};
exports.criarProduto = criarProduto;
const atualizarProduto = (req, res) => {
    // ✅ Verifica se o body existe e não está vazio
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ erro: 'Body vazio ou inválido' });
    }
    const { id } = req.params;
    const produto = produtos.find(p => p.id === Number(id));
    if (!produto)
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    // Atualiza apenas os campos enviados no body
    if (req.body.nome !== undefined)
        produto.nome = req.body.nome;
    if (req.body.codigo !== undefined)
        produto.codigo = req.body.codigo;
    if (req.body.categoria !== undefined)
        produto.categoria = req.body.categoria;
    if (req.body.unidade_medida !== undefined)
        produto.unidade_medida = req.body.unidade_medida;
    if (req.body.estoque_atual !== undefined)
        produto.estoque_atual = req.body.estoque_atual;
    if (req.body.estoque_minimo !== undefined)
        produto.estoque_minimo = req.body.estoque_minimo;
    if (req.body.ativo !== undefined)
        produto.ativo = req.body.ativo;
    res.json(produto);
};
exports.atualizarProduto = atualizarProduto;
const deletarProduto = (req, res) => {
    const { id } = req.params;
    const index = produtos.findIndex(p => p.id === Number(id));
    if (index === -1)
        return res.status(404).json({ erro: 'Produto não encontrado.' });
    produtos[index].ativo = false; // apenas inativamos
    res.json({ mensagem: 'Produto inativado com sucesso.' });
};
exports.deletarProduto = deletarProduto;
