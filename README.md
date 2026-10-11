# Help Desk API

## Começar

### Pré-requisitos

- Docker e Docker Compose instalados.
- [Bun](https://bun.sh/) (v1.3+ ou superior) para executar testes e scripts locais:
  ```bash
  npm install -g bun
  ```
- Arquivo `.env` configurado a partir do `.env.example`.

### Inicialização

1. Copie o arquivo `.env.example` para `.env` e configure as credenciais do PostgreSQL e do administrador inicial.

```bash
   cp .env.example .env
```

2. Inicie os serviços construindo as imagens:

```bash
   docker compose up -d --build
```

3. Acesse a API em `http://localhost:3000`. O endpoint de verificação de saúde está disponível em `/health`.

## Documentação dos Endpoints (Swagger)

A especificação completa de todos os endpoints da API (métodos HTTP, caminhos, parâmetros obrigatórios/opcionais, permissões de acesso, schemas de entrada e exemplos de resposta) está documentada interativamente via **Swagger UI**.

- **URL de acesso:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Arquivo de especificação OpenAPI:** localizado em [`docs/openapi.yaml`](docs/openapi.yaml)

### Testes e Verificação de Qualidade

- **Executar testes unitários e de integração:**
  ```bash
  bun run test
  ```
- **Executar testes com verificação de cobertura (mínimo 70%):**
  ```bash
  bun run test:coverage
  ```
- **Executar verificação de lint (ESLint):**
  ```bash
  bun run lint
  ```

### Inicialização do banco de dados

O Docker Compose inicia o PostgreSQL 18, aplica as migrations pendentes e executa o seed inicial definido em `prisma/seed.js`.

O seed centraliza a execução de rotinas independentes para criação dos papéis, categorias e usuário administrador. Esses scripts são escritos em JavaScript, versionados no Git e idempotentes, podendo ser executados novamente sem duplicar os registros previstos.

## Sobre o projeto

O **Help Desk API** é uma API REST para gerenciamento de chamados de suporte de TI.

O sistema permite que usuários previamente cadastrados pela administração registrem chamados, acompanhem seu andamento, adicionem comentários e anexos, enquanto usuários com permissões administrativas ou de atendimento podem gerenciar categorias, atribuir responsáveis e atualizar informações dos chamados.

## Objetivo

O objetivo do sistema é centralizar o atendimento de solicitações de suporte de TI, permitindo:

- abertura e acompanhamento de chamados;
- classificação por categoria e prioridade;
- atribuição de responsáveis;
- atualização do status dos chamados;
- comunicação por meio de comentários;
- inclusão de arquivos e anexos;
- registro do histórico de alterações;
- notificações relacionadas aos chamados;
- controle de acesso por perfis;
- ativação de usuários e definição inicial de senha por e-mail;
- recuperação de senha por e-mail.

## Escopo

O sistema terá como entidade central o **Ticket (chamado)**.

A partir dele, outras entidades estarão relacionadas para representar o processo de atendimento:

- usuários que solicitam ou atendem chamados;
- categorias utilizadas para classificar os chamados;
- comentários realizados durante o atendimento;
- anexos relacionados a chamados e comentários;
- eventos que registram ações relevantes realizadas nos chamados;
- tokens utilizados nos processos de ativação de usuários, definição inicial de senha e recuperação de senha.

O modelo inclui notificações associadas a usuários e chamados. A entrega real de e-mails e demais integrações será incorporada conforme a evolução do projeto.

## Perfis de usuário

### Usuário comum

Pode:

- autenticar-se no sistema;
- criar chamados;
- visualizar seus próprios chamados;
- acompanhar o andamento dos chamados;
- adicionar comentários;
- adicionar anexos;
- atualizar informações permitidas de seus chamados;
- definir a senha inicial por meio do convite enviado pelo sistema;
- utilizar o processo de recuperação de senha.

### Agente

Representa um usuário autorizado a atuar no atendimento dos chamados.

Pode, conforme as regras de autorização definidas:

- visualizar chamados destinados ao atendimento;
- assumir ou receber chamados;
- alterar status;
- alterar prioridade;
- adicionar comentários;
- adicionar anexos;
- acompanhar o histórico dos chamados.

### Administrador

Possui permissões administrativas adicionais, como:

- gerenciar usuários;
- ativar ou desativar usuários;
- gerenciar categorias;
- administrar chamados;
- atribuir responsáveis;
- consultar informações administrativas;
- executar operações restritas aos administradores.

Um mesmo usuário poderá possuir mais de um papel.

## Entidades

### User

Representa os usuários do sistema.

Principais atributos:

- `id` — UUID
- `name`
- `email`
- `password` — nullable enquanto o usuário aguarda ativação; quando definida, é armazenada com hash Argon2id
- `active`
- `createdAt`
- `updatedAt`

Usuários desativados não poderão realizar autenticação, mas seus registros serão mantidos para preservar o histórico do sistema.

Não haverá cadastro público de usuários. Novos usuários serão criados por administradores e receberão um token temporário por e-mail para realizar a ativação e definir a senha inicial.

O primeiro administrador será criado por meio de um seed durante a inicialização do ambiente.

### Role

Representa um papel de acesso do sistema.

Principais atributos:

- `id` — UUID
- `name`
- `description`

Papéis inicialmente previstos:

- `USER`
- `AGENT`
- `ADMIN`

### UserRole

Tabela de relacionamento entre usuários e papéis.

Atributos:

- `userId` — UUID
- `roleId` — UUID

A combinação `userId + roleId` deverá ser única.

### Ticket

Representa um chamado de suporte.

Principais atributos:

- `id` — UUID
- `title`
- `description`
- `status` — `OPEN`, `IN_PROGRESS`, `WAITING_USER`, `RESOLVED` ou `CLOSED`
- `priority` — `LOW`, `MEDIUM`, `HIGH` ou `CRITICAL`
- `requesterId` — usuário solicitante
- `categoryId`
- `assignedUserId` — responsável pelo atendimento, quando houver
- `dueDate` — prazo previsto para atendimento
- `createdAt`
- `updatedAt`
- `closedAt`

Status inicialmente previstos:

- `OPEN`
- `IN_PROGRESS`
- `WAITING_USER`
- `RESOLVED`
- `CLOSED`

Prioridades inicialmente previstas:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

### Category

Representa a categoria de um chamado.

Principais atributos:

- `id` — UUID
- `name`
- `description`
- `active`
- `createdAt`
- `updatedAt`

Categorias inativas não deverão ser utilizadas na abertura de novos chamados.

### Comment

Representa uma mensagem adicionada a um chamado.

Principais atributos:

- `id` — UUID
- `ticketId`
- `userId`
- `content`
- `createdAt`
- `updatedAt`

### Attachment

Representa um arquivo armazenado pelo sistema.

Principais atributos:

- `id` — UUID
- `storageKey`
- `fileName`
- `mimeType`
- `size` — tamanho em bytes
- `createdAt`

### TicketAttachment

Relaciona arquivos aos chamados.

Atributos:

- `ticketId` — UUID
- `attachmentId` — UUID

### CommentAttachment

Relaciona arquivos aos comentários.

Atributos:

- `commentId` — UUID
- `attachmentId` — UUID

### TicketEvent

Representa eventos relevantes ocorridos em um chamado.

Principais atributos:

- `id` — UUID
- `ticketId` — UUID
- `userId` — UUID
- `type`
- `metadata`
- `createdAt`

Tipos inicialmente previstos:

- `CREATED`
- `STATUS_CHANGED`
- `PRIORITY_CHANGED`
- `ASSIGNED`
- `UNASSIGNED`
- `COMMENT_ADDED`
- `ATTACHMENT_ADDED`
- `CATEGORY_CHANGED`
- `DUE_DATE_CHANGED`

O histórico deverá registrar ações relevantes para acompanhamento do chamado, não simplesmente qualquer alteração interna realizada no banco.

O campo `metadata` poderá armazenar informações complementares da alteração, como valor anterior e novo valor.

### UserToken

Representa tokens temporários relacionados a processos de segurança do usuário.

Principais atributos:

- `id` — UUID
- `userId` — UUID
- `token`
    Hash do token utilizado para ativação ou recuperação de senha.
- `type`
- `createdAt`
- `expiresAt`
- `usedAt`
- `revokedAt`

Tipos inicialmente previstos:

- `PASSWORD_SETUP` — utilizado para ativação do usuário e definição da senha inicial;
- `PASSWORD_RESET` — utilizado para recuperação/redefinição de senha.


Tokens de tipos diferentes possuem finalidades independentes. Para cada tipo, somente o token mais recente poderá permanecer válido.

### Notification

Representa uma notificação destinada a um usuário e a um canal. É diferente de `TicketEvent`: o evento registra o fato ocorrido; a notificação registra quem deve ser informado.

Principais atributos:

- `id` — UUID
- `userId` — destinatário
- `ticketId` — chamado relacionado, quando aplicável
- `type` — `TICKET_ASSIGNED`, `NEW_COMMENT`, `STATUS_CHANGED`, `PRIORITY_CHANGED`, `DUE_SOON` ou `OVERDUE`
- `channel` — `IN_APP` ou `EMAIL`
- `status` — `PENDING`, `PROCESSING`, `DELIVERED` ou `FAILED`
- `attempts` — quantidade de tentativas de entrega
- `lastError` — erro mais recente, quando houver
- `deliveredAt` — instante da entrega
- `readAt` — instante em que o usuário leu a notificação interna
- `createdAt` e `updatedAt`

Cada registro representa um destinatário e canal. Notificações internas aparecem na caixa do usuário; e-mails ficam pendentes para integração futura. O conteúdo é montado pela aplicação quando necessário.

## Relacionamentos

- `User` N:N `Role`, através de `UserRole`.
- `User` 1:N `Ticket`, como solicitante.
- `User` 1:N `Ticket`, como responsável pelo atendimento.
- `Category` 1:N `Ticket`.
- `Ticket` 1:N `Comment`.
- `User` 1:N `Comment`.
- `Ticket` 1:N `TicketEvent`.
- `User` 1:N `TicketEvent`.
- `User` 1:N `Notification`.
- `Ticket` 1:N `Notification`.
- `Ticket` N:N `Attachment`, através de `TicketAttachment`.
- `Comment` N:N `Attachment`, através de `CommentAttachment`.
- `User` 1:N `UserToken`.

## Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    users {
        UUID id PK
        string name
        string email
        string password
        boolean active
        datetime created_at
        datetime updated_at
    }

    roles {
        UUID id PK
        string name
        string description
    }

    user_roles {
        UUID user_id PK, FK
        UUID role_id PK, FK
    }

    tickets {
        UUID id PK
        string title
        string description
        string status
        string priority
        UUID requester_id FK
        UUID category_id FK
        UUID assigned_user_id FK
        datetime due_date
        datetime created_at
        datetime updated_at
        datetime closed_at
    }

    categories {
        UUID id PK
        string name
        string description
        boolean active
        datetime created_at
        datetime updated_at
    }

    comments {
        UUID id PK
        UUID ticket_id FK
        UUID user_id FK
        string content
        datetime created_at
        datetime updated_at
    }

    attachments {
        UUID id PK
        string storage_key
        string file_name
        string mime_type
        long size
        datetime created_at
    }

    ticket_attachments {
        UUID ticket_id PK, FK
        UUID attachment_id PK, FK
    }

    comment_attachments {
        UUID comment_id PK, FK
        UUID attachment_id PK, FK
    }

    ticket_events {
        UUID id PK
        UUID ticket_id FK
        UUID user_id FK
        string type
        json metadata
        datetime created_at
    }

    user_tokens {
        UUID id PK
        UUID user_id FK
        string token
        string type
        datetime created_at
        datetime expires_at
        datetime used_at
        datetime revoked_at
    }

    notifications {
        UUID id PK
        UUID user_id FK
        UUID ticket_id FK
        string type
        string channel
        string status
        integer attempts
        string last_error
        datetime delivered_at
        datetime read_at
        datetime created_at
        datetime updated_at
    }

    users ||--o{ user_roles : has
    roles ||--o{ user_roles : assigned

    users ||--o{ tickets : requests
    users ||--o{ tickets : assigned
    categories ||--o{ tickets : categorizes

    tickets ||--o{ comments : contains
    users ||--o{ comments : writes

    tickets ||--o{ ticket_attachments : has
    attachments ||--o{ ticket_attachments : linked

    comments ||--o{ comment_attachments : has
    attachments ||--o{ comment_attachments : linked

    tickets ||--o{ ticket_events : records
    users ||--o{ ticket_events : performs

    users ||--o{ user_tokens : owns
    users ||--o{ notifications : receives
    tickets o|--o{ notifications : relates
```

## Regras de negócio iniciais

1. Todo usuário deverá possuir pelo menos um papel de acesso.

2. Um usuário desativado não poderá realizar autenticação.

3. O e-mail do usuário deverá ser único.

4. Todo chamado deverá possuir título, descrição, categoria, prioridade e usuário solicitante.

5. Um chamado poderá não possuir responsável inicialmente.

6. O responsável por um chamado deverá ser um usuário autorizado a atuar no atendimento.

7. Categorias inativas não poderão ser utilizadas em novos chamados.

8. Todo comentário deverá estar associado a um chamado e a um usuário.

9. Arquivos poderão estar associados a chamados ou comentários.

10. Alterações relevantes nos chamados deverão gerar eventos no histórico.

11. Um chamado poderá possuir uma data limite de atendimento (`dueDate`).

12. Chamados encerrados deverão possuir registro de encerramento (`closedAt`).

13. Tokens deverão possuir prazo de validade.

14. Um token utilizado, expirado ou revogado não poderá ser reutilizado.

15. Para cada tipo de token, somente o token mais recente poderá permanecer válido. A emissão de um novo token do mesmo tipo deverá revogar o anterior.

16. `PASSWORD_SETUP` será utilizado para ativação do usuário e definição da senha inicial.

17. `PASSWORD_RESET` será utilizado para recuperação ou redefinição de senha de usuários já ativados.

18. Senhas não deverão ser armazenadas em texto puro. O sistema deverá armazená-las utilizando um mecanismo seguro de hash de senha.

19. Tokens de ativação e recuperação deverão ser tratados como credenciais sensíveis e armazenados de forma segura, preferencialmente utilizando hash, de modo que o valor original não permaneça diretamente armazenado no banco de dados.

20. Novos usuários deverão ser cadastrados por um administrador; não haverá cadastro público de usuários.

21. O sistema deverá possuir um administrador inicial criado por meio de seed durante a inicialização do ambiente.

22. O administrador poderá criar usuários e definir seus papéis de acesso.

23. Usuários recém-criados deverão realizar a ativação e definição da senha inicial por meio de um token enviado por e-mail.

24. Enquanto o usuário estiver pendente de ativação, um novo `PASSWORD_SETUP` poderá ser solicitado para reenvio do convite.

25. Operações administrativas deverão ser protegidas por autorização baseada no papel do usuário.

26. Usuários comuns somente poderão acessar e modificar recursos para os quais possuam autorização.

27. A API deverá retornar respostas HTTP coerentes com erros de validação, autenticação, autorização, conflito e recurso não encontrado.

28. Chamados encerrados deverão ter `closedAt`; a aplicação deverá preservar eventos de auditoria, sem exclusão em cascata dos registros históricos.
## Funcionalidades planejadas

### Autenticação e segurança

- Login com e-mail e senha.
- Autenticação utilizando JWT.
- Autorização baseada em papéis.
- Gerenciamento de usuários pelo administrador.
- Ativação de usuários e definição inicial de senha por e-mail.
- Recuperação/redefinição de senha por e-mail.
- Expiração e invalidação de tokens de ativação e recuperação.
- Reenvio do convite de ativação para usuários ainda não ativados.
- Proteção de informações sensíveis.

O sistema não terá cadastro público. O primeiro administrador será criado por meio de seed, e os demais usuários serão cadastrados pelos administradores.

### Chamados

- Criação de chamados.
- Consulta de chamados.
- Atualização de chamados.
- Alteração de status.
- Alteração de prioridade.
- Atribuição e remoção de responsável.
- Definição de prazo.
- Encerramento.
- Filtros, busca e paginação.

### Comentários

- Adição de comentários.
- Consulta de comentários de um chamado.
- Edição quando permitida pelas regras de negócio.
- Associação de anexos.

### Anexos

- Upload de arquivos.
- Associação de arquivos a chamados e comentários.
- Armazenamento utilizando serviço externo.

### Histórico

- Registro de eventos relevantes.
- Consulta do histórico de um chamado.
- Registro do usuário responsável por cada ação.

### Notificações

O modelo utiliza a entidade `Notification` para representar notificações destinadas aos usuários.

A ideia é diferenciar:

- **TicketEvent:** registra o que aconteceu no chamado.
- **Notification:** informa um usuário de que algo relevante aconteceu.

Possíveis notificações:

- chamado atribuído;
- novo comentário;
- alteração de status;
- alteração de prioridade;
- chamado próximo do vencimento;
- chamado atrasado.

Cada notificação pertence a um destinatário e canal. A caixa interna e a futura fila de e-mails compartilham o registro, mas mantêm estado de leitura separado do estado de entrega.

## API externa

O projeto deverá utilizar uma API ou serviço externo de maneira significativa em uma funcionalidade do sistema.

Uma das opções planejadas é utilizar o **Cloudinary** para armazenamento e gerenciamento dos arquivos enviados como anexos.

Nesse cenário, o sistema será responsável por controlar os metadados e relacionamentos dos anexos, enquanto o armazenamento físico dos arquivos será realizado pelo serviço externo.

A integração deverá fazer parte efetiva do fluxo da aplicação, e não apenas consistir em uma consulta isolada.

## Tecnologias

- Node.js
- Express
- PostgreSQL
- Docker
- JWT
- API externa para armazenamento de arquivos
- Swagger/OpenAPI
- Postman

A arquitetura será estruturada seguindo princípios de **Clean Architecture**, buscando separar regras de negócio, casos de uso, acesso à aplicação, persistência e integrações externas.

## Identificadores

As entidades do sistema utilizarão **UUIDs** como identificadores.

Além de dificultar a enumeração simples de recursos, a padronização facilita a geração e integração dos identificadores entre diferentes componentes do sistema.

## Status do projeto

**Em desenvolvimento**

O projeto encontra-se na etapa de definição do escopo e modelagem inicial. As decisões de arquitetura, entidades e regras poderão ser refinadas conforme as necessidades identificadas durante a implementação.
