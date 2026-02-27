// dentro do MovimentacaoController.ts
interface MovRow {
    ID: number;
    PRODUTO_ID: number;
    USUARIO_ID: number;
    TIPO: 'entrada' | 'saida';
    QUANTIDADE: number;
    OBSERVACAO?: string;
    DATA_MOVIMENTACAO: Date;
    ESTOQUE_ATUAL: number;
    ESTOQUE_MINIMO: number;
}