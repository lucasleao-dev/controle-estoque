export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string; // senha hash
    perfil: 'admin' | 'operacional';
    ativo: boolean;
    data_criacao: Date;
}
