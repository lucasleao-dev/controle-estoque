export interface Movimentacao {
    id: number;
    produto_id: number;
    usuario_id: number;
    tipo: 'entrada' | 'saida';
    quantidade: number;
    observacao?: string;
    data_hora: Date;
}
