export interface Produto {
    id: number;
    nome: string;
    codigo: string;
    categoria: string;
    unidade_medida: string; // ex: kg, g, L
    estoque_atual: number;
    estoque_minimo: number;
    ativo: boolean;
    data_criacao: Date;
}
