// models/ProdutoModel.ts
import { Produto } from './Produto';

export class ProdutoModel implements Produto {
    id: number;
    nome: string;
    codigo: string; // obrigatório agora
    categoria: string;
    unidade_medida: string;
    estoque_atual: number;
    estoque_minimo: number;
    ativo: boolean;
    data_criacao: Date;

    constructor(row: any) {
        this.id = row.ID;
        this.nome = row.NOME;
        this.codigo = row.CODIGO || ''; // garante string
        this.categoria = row.CATEGORIA;
        this.unidade_medida = row.UNIDADE_MEDIDA;
        this.estoque_atual = row.ESTOQUE_ATUAL;
        this.estoque_minimo = row.ESTOQUE_MINIMO;
        this.ativo = row.ATIVO === 'S';
        this.data_criacao = row.DATA_CRIACAO;
    }
}