export interface AjusteEstoque {
  id: number;
  produto_id: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  motivo: string;
  usuario_id: number;  // adiciona usuário que fez o ajuste
  data_hora: Date;
}