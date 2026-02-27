// models/Movimentacao.ts
export class Movimentacao {
    id: number;
    produto_id: number;
    usuario_id: number;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    observacao?: string;
    data_hora: Date;

    constructor(dbRow: any) {
        this.id = dbRow.ID;
        this.produto_id = dbRow.PRODUTO_ID;
        this.usuario_id = dbRow.USUARIO_ID;
        this.tipo = dbRow.TIPO.toLowerCase() as 'entrada' | 'saida';
        this.quantidade = dbRow.QUANTIDADE;
        this.observacao = dbRow.OBSERVACAO;
        this.data_hora = dbRow.DATA_MOVIMENTACAO; // aqui você garante o nome correto
    }
}