export interface AjusteEstoque {
    id: number;
    produto_id: number;
    quantidade_anterior: number;
    quantidade_nova: number;
    motivo: string;
    data_hora: Date;
}
