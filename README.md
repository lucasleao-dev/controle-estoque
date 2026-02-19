# 📦 Sistema de Controle de Estoque Web/Mobile

## Descrição
Sistema web/mobile desenvolvido em **TypeScript** para controle de estoque, com atualização em tempo real, registro de movimentações por usuário, alertas de estoque mínimo e relatórios gerenciais.

O sistema possui perfis de usuário diferenciados, permitindo que administradores controlem produtos e usuários, enquanto usuários operacionais realizam movimentações e consultas.

---

## 🎯 Objetivo
- Controlar estoque de produtos com atualização automática.  
- Registrar todas as movimentações com logs completos.  
- Alertar quando o estoque estiver abaixo do mínimo.  
- Gerar relatórios exportáveis em PDF ou Excel.  
- Garantir segurança e controle de permissões.  

---

## 👤 Perfis de Usuário

### Administrador
- Cadastrar, editar e excluir produtos.  
- Ajustar estoque manualmente.  
- Criar e gerenciar usuários.  
- Visualizar relatórios.  
- Definir estoque mínimo.  

### Usuário Operacional
- Registrar entradas e saídas de produtos.  
- Consultar estoque disponível.  
- Consultar histórico próprio de movimentações.  

---

## 📌 Funcionalidades

### Dashboard
- Total de produtos.  
- Produtos com estoque baixo.  
- Últimas movimentações.  
- Gráfico de consumo semanal (entrada vs saída).  

### Tela de Produtos
- Listagem completa de produtos.  
- Buscar por nome ou código.  
- Filtrar por categoria.  
- Indicador de estoque:
  - **Verde** → estoque suficiente  
  - **Vermelho** → estoque abaixo do mínimo  

### Tela de Movimentação
- Selecionar produto.  
- Informar quantidade.  
- Escolher tipo de movimentação: entrada/saída.  
- Confirmar operação (validações automáticas).  

### Relatórios
- Consumo por período (diário, semanal, mensal).  
- Movimentação por usuário.  
- Produto mais consumido.  
- Histórico completo exportável (PDF/Excel).  

---

## 🔐 Segurança
- Login e senhas criptografadas (bcrypt ou Argon2).  
- Controle de permissões por perfil.  
- Registro de logs de acesso e movimentação.  
- Tokens JWT para autenticação segura.  

---

## 🗄️ Banco de Dados

### Tabela `produtos`
| Campo           | Tipo           |
|-----------------|----------------|
| id              | SERIAL PK      |
| nome            | VARCHAR(100)   |
| codigo          | VARCHAR(50)    |
| categoria       | VARCHAR(50)    |
| unidade_medida  | VARCHAR(10)    |
| estoque_atual   | DECIMAL(10,2)  |
| estoque_minimo  | DECIMAL(10,2)  |
| ativo           | BOOLEAN        |
| data_criacao    | TIMESTAMP      |

### Tabela `usuarios`
| Campo        | Tipo                          |
|--------------|-------------------------------|
| id           | SERIAL PK                     |
| nome         | VARCHAR(100)                  |
| email        | VARCHAR(100)                  |
| senha        | VARCHAR(255)                  |
| perfil       | ENUM('admin','operacional')   |
| ativo        | BOOLEAN                        |
| data_criacao | TIMESTAMP                     |

### Tabela `movimentacoes`
| Campo        | Tipo                          |
|--------------|-------------------------------|
| id           | SERIAL PK                     |
| produto_id   | INT FK produtos(id)           |
| usuario_id   | INT FK usuarios(id)           |
| tipo         | ENUM('entrada','saida')       |
| quantidade   | DECIMAL(10,2)                 |
| observacao   | TEXT                          |
| data_hora    | TIMESTAMP                     |

### Tabela opcional `ajuste_estoque`
| Campo            | Tipo           |
|-----------------|----------------|
| id               | SERIAL PK      |
| produto_id       | INT FK produtos(id) |
| quantidade_anterior | DECIMAL(10,2) |
| quantidade_nova  | DECIMAL(10,2)  |
| motivo           | TEXT           |
| data_hora        | TIMESTAMP      |

---

## 🛠️ Tecnologias Sugeridas
| Camada         | Tecnologia                     |
|----------------|--------------------------------|
| Front-end      | Ionic + Angular                |
| Back-end       | Node.js + Express (TypeScript) |
| Banco de Dados | PostgreSQL ou MySQL            |
| Tempo real     | WebSocket (Socket.io)          |
| Exportação     | PDF: jsPDF, Excel: SheetJS     |
| Hospedagem     | AWS / Azure / GCP / Heroku     |
| Segurança      | JWT, bcrypt, TLS/HTTPS         |

---

## ⚙️ Regras de Negócio
1. Não permitir saída maior que o estoque atual.  
2. Atualização automática do estoque ao registrar movimentação.  
3. Alertas quando estoque < estoque mínimo.  
4. Apenas administrador pode excluir produtos.  
5. Histórico de movimentações não pode ser apagado (apenas inativado).  
6. Logs completos de movimentação e acesso.  

---

## 🔮 Expansões Futuras
- Leitura de código de barras.  
- Integração com financeiro.  
- Controle por centro de custo/unidade/filial.  
- Notificação automática por e-mail ou push.  

---

## 📈 Diagrama ER
```mermaid
erDiagram
    USUARIOS {
        int id PK
        string nome
        string email
        string senha
        enum perfil
        boolean ativo
        timestamp data_criacao
    }

    PRODUTOS {
        int id PK
        string nome
        string codigo
        string categoria
        string unidade_medida
        decimal estoque_atual
        decimal estoque_minimo
        boolean ativo
        timestamp data_criacao
    }

    MOVIMENTACOES {
        int id PK
        int produto_id FK
        int usuario_id FK
        enum tipo
        decimal quantidade
        text observacao
        timestamp data_hora
    }

    AJUSTE_ESTOQUE {
        int id PK
        int produto_id FK
        decimal quantidade_anterior
        decimal quantidade_nova
        text motivo
        timestamp data_hora
    }

    PRODUTOS ||--o{ MOVIMENTACOES : "possui"
    USUARIOS ||--o{ MOVIMENTACOES : "registra"
    PRODUTOS ||--o{ AJUSTE_ESTOQUE : "ajustado"
