CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_normalized_check" CHECK ("email" = lower(btrim("email")) AND char_length("email") > 3 AND position('@' IN "email") > 1)
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

COMMENT ON TABLE public.users IS 'Contas de usuarios do sistema.';
COMMENT ON COLUMN public.users.id IS 'Identificador unico do usuario.';
COMMENT ON COLUMN public.users.name IS 'Nome do usuario.';
COMMENT ON COLUMN public.users.email IS 'Endereco de email usado pelo usuario.';
COMMENT ON COLUMN public.users.password IS 'Senha do usuario armazenada como hash.';
COMMENT ON COLUMN public.users.active IS 'Indica se o usuario pode acessar o sistema.';
COMMENT ON COLUMN public.users.created_at IS 'Data e hora de criacao da conta.';
COMMENT ON COLUMN public.users.updated_at IS 'Data e hora da ultima atualizacao da conta.';


CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(32) NOT NULL,
    "description" VARCHAR(500),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "roles_name_allowed_check" CHECK ("name" IN ('USER', 'AGENT', 'ADMIN'))
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

COMMENT ON TABLE public.roles IS 'Papeis de acesso disponiveis no sistema.';
COMMENT ON COLUMN public.roles.id IS 'Identificador unico do papel.';
COMMENT ON COLUMN public.roles.name IS 'Nome do papel de acesso.';
COMMENT ON COLUMN public.roles.description IS 'Descricao do papel de acesso.';


CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

COMMENT ON TABLE public.user_roles IS 'Papeis associados aos usuarios.';
COMMENT ON COLUMN public.user_roles.user_id IS 'Usuario associado ao papel.';
COMMENT ON COLUMN public.user_roles.role_id IS 'Papel associado ao usuario.';


CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

COMMENT ON TABLE public.categories IS 'Categorias usadas para classificar chamados.';
COMMENT ON COLUMN public.categories.id IS 'Identificador unico da categoria.';
COMMENT ON COLUMN public.categories.name IS 'Nome da categoria.';
COMMENT ON COLUMN public.categories.description IS 'Descricao da categoria.';
COMMENT ON COLUMN public.categories.active IS 'Indica se a categoria pode ser usada em novos chamados.';
COMMENT ON COLUMN public.categories.created_at IS 'Data e hora de criacao da categoria.';
COMMENT ON COLUMN public.categories.updated_at IS 'Data e hora da ultima atualizacao da categoria.';


CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "requester_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "assigned_user_id" UUID,
    "due_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "closed_at" TIMESTAMPTZ(6),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tickets_status_allowed_check" CHECK ("status" IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED')),
    CONSTRAINT "tickets_priority_allowed_check" CHECK ("priority" IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT "tickets_closed_at_status_check" CHECK (("status" = 'CLOSED') = ("closed_at" IS NOT NULL)),
    CONSTRAINT "tickets_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "tickets_requester_id_created_at_idx" ON "tickets"("requester_id", "created_at");
CREATE INDEX "tickets_assigned_user_id_status_idx" ON "tickets"("assigned_user_id", "status");
CREATE INDEX "tickets_category_id_idx" ON "tickets"("category_id");
CREATE INDEX "tickets_status_priority_created_at_idx" ON "tickets"("status", "priority", "created_at");

COMMENT ON TABLE public.tickets IS 'Chamados de suporte registrados no sistema.';
COMMENT ON COLUMN public.tickets.id IS 'Identificador unico do chamado.';
COMMENT ON COLUMN public.tickets.title IS 'Titulo do chamado.';
COMMENT ON COLUMN public.tickets.description IS 'Descricao da solicitacao de suporte.';
COMMENT ON COLUMN public.tickets.status IS 'Situacao atual do chamado.';
COMMENT ON COLUMN public.tickets.priority IS 'Prioridade de atendimento do chamado.';
COMMENT ON COLUMN public.tickets.requester_id IS 'Usuario que abriu o chamado.';
COMMENT ON COLUMN public.tickets.category_id IS 'Categoria usada para classificar o chamado.';
COMMENT ON COLUMN public.tickets.assigned_user_id IS 'Usuario responsavel pelo atendimento do chamado.';
COMMENT ON COLUMN public.tickets.due_date IS 'Prazo previsto para atendimento do chamado.';
COMMENT ON COLUMN public.tickets.created_at IS 'Data e hora de abertura do chamado.';
COMMENT ON COLUMN public.tickets.updated_at IS 'Data e hora da ultima atualizacao do chamado.';
COMMENT ON COLUMN public.tickets.closed_at IS 'Data e hora de encerramento do chamado.';


CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "comments_ticket_id_created_at_idx" ON "comments"("ticket_id", "created_at");
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

COMMENT ON TABLE public.comments IS 'Comentarios registrados nos chamados.';
COMMENT ON COLUMN public.comments.id IS 'Identificador unico do comentario.';
COMMENT ON COLUMN public.comments.ticket_id IS 'Chamado associado ao comentario.';
COMMENT ON COLUMN public.comments.user_id IS 'Usuario que escreveu o comentario.';
COMMENT ON COLUMN public.comments.content IS 'Conteudo do comentario.';
COMMENT ON COLUMN public.comments.created_at IS 'Data e hora de criacao do comentario.';
COMMENT ON COLUMN public.comments.updated_at IS 'Data e hora da ultima atualizacao do comentario.';


CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "storage_key" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(127) NOT NULL,
    "size" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attachments_size_positive_check" CHECK ("size" > 0)
);

CREATE UNIQUE INDEX "attachments_storage_key_key" ON "attachments"("storage_key");

COMMENT ON TABLE public.attachments IS 'Metadados de arquivos armazenados externamente.';
COMMENT ON COLUMN public.attachments.id IS 'Identificador unico do anexo.';
COMMENT ON COLUMN public.attachments.storage_key IS 'Identificador do arquivo no servico de armazenamento.';
COMMENT ON COLUMN public.attachments.file_name IS 'Nome original do arquivo.';
COMMENT ON COLUMN public.attachments.mime_type IS 'Tipo de conteudo do arquivo.';
COMMENT ON COLUMN public.attachments.size IS 'Tamanho do arquivo em bytes.';
COMMENT ON COLUMN public.attachments.created_at IS 'Data e hora de registro do anexo.';


CREATE TABLE "ticket_attachments" (
    "ticket_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("ticket_id","attachment_id"),
    CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ticket_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ticket_attachments_attachment_id_idx" ON "ticket_attachments"("attachment_id");

COMMENT ON TABLE public.ticket_attachments IS 'Anexos associados aos chamados.';
COMMENT ON COLUMN public.ticket_attachments.ticket_id IS 'Chamado associado ao anexo.';
COMMENT ON COLUMN public.ticket_attachments.attachment_id IS 'Anexo associado ao chamado.';


CREATE TABLE "comment_attachments" (
    "comment_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,

    CONSTRAINT "comment_attachments_pkey" PRIMARY KEY ("comment_id","attachment_id"),
    CONSTRAINT "comment_attachments_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "comment_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "comment_attachments_attachment_id_idx" ON "comment_attachments"("attachment_id");

COMMENT ON TABLE public.comment_attachments IS 'Anexos associados aos comentarios.';
COMMENT ON COLUMN public.comment_attachments.comment_id IS 'Comentario associado ao anexo.';
COMMENT ON COLUMN public.comment_attachments.attachment_id IS 'Anexo associado ao comentario.';


CREATE TABLE "ticket_events" (
    "id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "user_id" UUID,
    "type" VARCHAR(32) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ticket_events_type_allowed_check" CHECK ("type" IN ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'COMMENT_ADDED', 'ATTACHMENT_ADDED', 'CATEGORY_CHANGED', 'DUE_DATE_CHANGED')),
    CONSTRAINT "ticket_events_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "ticket_events_ticket_id_created_at_idx" ON "ticket_events"("ticket_id", "created_at");
CREATE INDEX "ticket_events_user_id_idx" ON "ticket_events"("user_id");

COMMENT ON TABLE public.ticket_events IS 'Eventos que compoem o historico dos chamados.';
COMMENT ON COLUMN public.ticket_events.id IS 'Identificador unico do evento.';
COMMENT ON COLUMN public.ticket_events.ticket_id IS 'Chamado relacionado ao evento.';
COMMENT ON COLUMN public.ticket_events.user_id IS 'Usuario responsavel pelo evento, quando aplicavel.';
COMMENT ON COLUMN public.ticket_events.type IS 'Tipo de evento registrado.';
COMMENT ON COLUMN public.ticket_events.metadata IS 'Dados complementares do evento.';
COMMENT ON COLUMN public.ticket_events.created_at IS 'Data e hora em que o evento ocorreu.';


CREATE TABLE "user_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_tokens_type_allowed_check" CHECK ("type" IN ('PASSWORD_SETUP', 'PASSWORD_RESET')),
    CONSTRAINT "user_tokens_expiration_after_creation_check" CHECK ("expires_at" > "created_at"),
    CONSTRAINT "user_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "user_tokens_token_key" ON "user_tokens"("token");
CREATE INDEX "user_tokens_user_id_type_created_at_idx" ON "user_tokens"("user_id", "type", "created_at");

COMMENT ON TABLE public.user_tokens IS 'Tokens temporarios de ativacao e recuperacao de conta.';
COMMENT ON COLUMN public.user_tokens.id IS 'Identificador unico do token.';
COMMENT ON COLUMN public.user_tokens.user_id IS 'Usuario associado ao token.';
COMMENT ON COLUMN public.user_tokens.token IS 'Hash do token temporario.';
COMMENT ON COLUMN public.user_tokens.type IS 'Finalidade do token temporario.';
COMMENT ON COLUMN public.user_tokens.created_at IS 'Data e hora de criacao do token.';
COMMENT ON COLUMN public.user_tokens.expires_at IS 'Data e hora de expiracao do token.';
COMMENT ON COLUMN public.user_tokens.used_at IS 'Data e hora de utilizacao do token.';
COMMENT ON COLUMN public.user_tokens.revoked_at IS 'Data e hora de revogacao do token.';


CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ticket_id" UUID,
    "type" VARCHAR(32) NOT NULL,
    "channel" VARCHAR(16) NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" VARCHAR(2000),
    "delivered_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_type_allowed_check" CHECK ("type" IN ('TICKET_ASSIGNED', 'NEW_COMMENT', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'DUE_SOON', 'OVERDUE')),
    CONSTRAINT "notifications_channel_allowed_check" CHECK ("channel" IN ('IN_APP', 'EMAIL')),
    CONSTRAINT "notifications_status_allowed_check" CHECK ("status" IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
    CONSTRAINT "notifications_attempts_nonnegative_check" CHECK ("attempts" >= 0),
    CONSTRAINT "notifications_in_app_delivery_status_check" CHECK ("channel" <> 'IN_APP' OR "status" = 'DELIVERED'),
    CONSTRAINT "notifications_email_read_at_check" CHECK ("channel" <> 'EMAIL' OR "read_at" IS NULL),
    CONSTRAINT "notifications_delivered_at_status_check" CHECK (("status" = 'DELIVERED') = ("delivered_at" IS NOT NULL)),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "notifications_user_id_read_at_created_at_idx" ON "notifications"("user_id", "read_at", "created_at");
CREATE INDEX "notifications_status_created_at_idx" ON "notifications"("status", "created_at");
CREATE INDEX "notifications_ticket_id_created_at_idx" ON "notifications"("ticket_id", "created_at");

COMMENT ON TABLE public.notifications IS 'Notificacoes destinadas aos usuarios.';
COMMENT ON COLUMN public.notifications.id IS 'Identificador unico da notificacao.';
COMMENT ON COLUMN public.notifications.user_id IS 'Usuario destinatario da notificacao.';
COMMENT ON COLUMN public.notifications.ticket_id IS 'Chamado relacionado a notificacao, quando aplicavel.';
COMMENT ON COLUMN public.notifications.type IS 'Tipo de notificacao.';
COMMENT ON COLUMN public.notifications.channel IS 'Canal destinado a receber a notificacao.';
COMMENT ON COLUMN public.notifications.status IS 'Situacao de entrega da notificacao.';
COMMENT ON COLUMN public.notifications.attempts IS 'Quantidade de tentativas de entrega.';
COMMENT ON COLUMN public.notifications.last_error IS 'Descricao da ultima falha de entrega.';
COMMENT ON COLUMN public.notifications.delivered_at IS 'Data e hora de entrega da notificacao.';
COMMENT ON COLUMN public.notifications.read_at IS 'Data e hora em que a notificacao foi lida.';
COMMENT ON COLUMN public.notifications.created_at IS 'Data e hora de criacao da notificacao.';
COMMENT ON COLUMN public.notifications.updated_at IS 'Data e hora da ultima atualizacao da notificacao.';
