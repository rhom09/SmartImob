-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MANAGER');

-- CreateEnum
CREATE TYPE "StatusGeral" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('VAGO', 'OCUPADO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'SALA', 'GALPAO', 'OUTROS');

-- CreateEnum
CREATE TYPE "FinalidadeImovel" AS ENUM ('VENDA', 'LOCACAO', 'AMBOS');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('ATIVO', 'ENCERRADO', 'RENOVADO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "StatusRecibo" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "IndiceReajuste" AS ENUM ('IGPM', 'IPCA', 'MANUAL', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoDespesa" AS ENUM ('IPTU', 'CONDOMINIO', 'AGUA', 'LUZ', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusDespesa" AS ENUM ('PENDENTE', 'PAGO');

-- CreateEnum
CREATE TYPE "TipoAlerta" AS ENUM ('VENCIMENTO', 'REAJUSTE', 'RECIBO', 'INADIMPLENCIA', 'INTERESSADO', 'CONTRATO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusAlerta" AS ENUM ('ATIVO', 'LIDO', 'RESOLVIDO');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('INQUILINO', 'INTERESSADO');

-- CreateEnum
CREATE TYPE "TipoInteracao" AS ENUM ('LIGACAO', 'EMAIL', 'VISITA', 'WHATSAPP', 'OUTROS');

-- CreateTable
CREATE TABLE "USUARIOS" (
    "id" TEXT NOT NULL,
    "supabase_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT,
    "perfil" "Role" NOT NULL DEFAULT 'USER',
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USUARIOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PROPRIETARIOS" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,
    "forma_pagamento" TEXT,
    "chave_pix" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "conta" TEXT,

    CONSTRAINT "PROPRIETARIOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IMOVEIS" (
    "id" TEXT NOT NULL,
    "proprietario_id" TEXT NOT NULL,
    "tipo" "TipoImovel" NOT NULL DEFAULT 'CASA',
    "finalidade" "FinalidadeImovel" NOT NULL DEFAULT 'LOCACAO',
    "endereco" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "descricao" TEXT,
    "codigo" TEXT,
    "area_total" DECIMAL(65,30),
    "area_construida" DECIMAL(65,30),
    "quartos" INTEGER,
    "suites" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "valor_venda" DECIMAL(65,30),
    "valor_locacao" DECIMAL(65,30),
    "valor_condominio" DECIMAL(65,30) DEFAULT 0,
    "valor_iptu" DECIMAL(65,30) DEFAULT 0,
    "status" "StatusImovel" NOT NULL DEFAULT 'VAGO',
    "observacoes" TEXT,
    "valor_agua" DECIMAL(65,30) DEFAULT 0,
    "valor_luz" DECIMAL(65,30) DEFAULT 0,
    "outros_debitos" DECIMAL(65,30) DEFAULT 0,
    "descontos" DECIMAL(65,30) DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IMOVEIS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IMOVEL_FOTOS" (
    "id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "is_capa" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IMOVEL_FOTOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CLIENTES" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "rg" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "tipo" "TipoCliente" NOT NULL DEFAULT 'INQUILINO',
    "status" "StatusGeral" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CLIENTES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "INTERACOES" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "tipo" "TipoInteracao" NOT NULL DEFAULT 'OUTROS',
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "INTERACOES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CONTRATOS" (
    "id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "inquilino_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "numero_contrato" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "valor_aluguel" DECIMAL(65,30) NOT NULL,
    "percentual_comissao" DECIMAL(65,30) NOT NULL DEFAULT 8,
    "dia_vencimento" INTEGER NOT NULL,
    "status" "StatusContrato" NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CONTRATOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RECIBOS" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "referencia_mes" INTEGER NOT NULL,
    "referencia_ano" INTEGER NOT NULL,
    "valor_bruto" DECIMAL(65,30) NOT NULL,
    "descontos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valor_liquido" DECIMAL(65,30) NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "status" "StatusRecibo" NOT NULL DEFAULT 'PENDENTE',
    "numero_recibo" TEXT NOT NULL,
    "observacoes" TEXT,
    "valor_iptu" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valor_condominio" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valor_agua" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "valor_luz" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "outros_debitos" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "forma_pagamento" TEXT,
    "comprovante_url" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RECIBOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "REAJUSTES" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "data_reajuste" TIMESTAMP(3) NOT NULL,
    "indice" "IndiceReajuste" NOT NULL,
    "percentual" DECIMAL(65,30) NOT NULL,
    "valor_anterior" DECIMAL(65,30) NOT NULL,
    "novo_valor" DECIMAL(65,30) NOT NULL,
    "observacoes" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "REAJUSTES_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DESPESAS" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "tipo" "TipoDespesa" NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "data_vencimento" TIMESTAMP(3) NOT NULL,
    "data_pagamento" TIMESTAMP(3),
    "status" "StatusDespesa" NOT NULL DEFAULT 'PENDENTE',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DESPESAS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ALERTAS" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT,
    "usuario_id" TEXT,
    "tipo" "TipoAlerta" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "data_evento" TIMESTAMP(3) NOT NULL,
    "status" "StatusAlerta" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ALERTAS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AUDITORIA" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "tabela_afetada" TEXT NOT NULL,
    "registro_id" TEXT,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "data_acao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_maquina" TEXT,

    CONSTRAINT "AUDITORIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PREFERENCIAS_NOTIFICACAO" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_alerta" "TipoAlerta" NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PREFERENCIAS_NOTIFICACAO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIOS_supabase_id_key" ON "USUARIOS"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "USUARIOS_email_key" ON "USUARIOS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PROPRIETARIOS_cpf_cnpj_key" ON "PROPRIETARIOS"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "IMOVEIS_codigo_key" ON "IMOVEIS"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "CLIENTES_cpf_cnpj_key" ON "CLIENTES"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "CONTRATOS_numero_contrato_key" ON "CONTRATOS"("numero_contrato");

-- CreateIndex
CREATE UNIQUE INDEX "RECIBOS_numero_recibo_key" ON "RECIBOS"("numero_recibo");

-- CreateIndex
CREATE UNIQUE INDEX "PREFERENCIAS_NOTIFICACAO_usuario_id_tipo_alerta_key" ON "PREFERENCIAS_NOTIFICACAO"("usuario_id", "tipo_alerta");

-- AddForeignKey
ALTER TABLE "IMOVEIS" ADD CONSTRAINT "IMOVEIS_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "PROPRIETARIOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IMOVEL_FOTOS" ADD CONSTRAINT "IMOVEL_FOTOS_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "IMOVEIS"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INTERACOES" ADD CONSTRAINT "INTERACOES_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "CLIENTES"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "INTERACOES" ADD CONSTRAINT "INTERACOES_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIOS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CONTRATOS" ADD CONSTRAINT "CONTRATOS_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "IMOVEIS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CONTRATOS" ADD CONSTRAINT "CONTRATOS_inquilino_id_fkey" FOREIGN KEY ("inquilino_id") REFERENCES "CLIENTES"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RECIBOS" ADD CONSTRAINT "RECIBOS_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "CONTRATOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "REAJUSTES" ADD CONSTRAINT "REAJUSTES_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "CONTRATOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DESPESAS" ADD CONSTRAINT "DESPESAS_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "CONTRATOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ALERTAS" ADD CONSTRAINT "ALERTAS_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "CONTRATOS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ALERTAS" ADD CONSTRAINT "ALERTAS_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIOS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AUDITORIA" ADD CONSTRAINT "AUDITORIA_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PREFERENCIAS_NOTIFICACAO" ADD CONSTRAINT "PREFERENCIAS_NOTIFICACAO_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "USUARIOS"("id") ON DELETE CASCADE ON UPDATE CASCADE;
