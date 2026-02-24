"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const teste_1 = __importDefault(require("./routes/teste"));
const produtos_1 = __importDefault(require("./routes/produtos"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const movimentacoes_1 = __importDefault(require("./routes/movimentacoes"));
const ajustes_1 = __importDefault(require("./routes/ajustes"));
dotenv_1.default.config();
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas
app.use('/teste', teste_1.default);
app.use('/produtos', produtos_1.default); // ✅ registrando a rota de produtos
app.use('/usuarios', usuarios_1.default);
app.use('/movimentacoes', movimentacoes_1.default);
app.use('/ajustes', ajustes_1.default);
app.use('/dashboard', dashboard_1.default);
app.get('/', (req, res) => {
    res.send('API Controle de Estoque funcionando!');
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
