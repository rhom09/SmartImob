import { z } from 'zod';

// ─── Validação de CPF ────────────────────────────────────────────────
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(cleaned[10]);
}

// ─── Validação de CNPJ ──────────────────────────────────────────────
function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * weights1[i];
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(cleaned[i]) * weights2[i];
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  return digit2 === parseInt(cleaned[13]);
}

export function isValidCpfCnpj(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 11) return isValidCPF(cleaned);
  if (cleaned.length === 14) return isValidCNPJ(cleaned);
  return false;
}

// ─── Schemas de Proprietários ────────────────────────────────────────
export const createOwnerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpfCnpj: z.string().refine(isValidCpfCnpj, 'CPF/CNPJ inválido'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
});

export const updateOwnerSchema = createOwnerSchema.partial();

// ─── Schemas de Imóveis ─────────────────────────────────────────────
export const createPropertySchema = z.object({
  ownerId: z.string().uuid('ID do proprietário inválido'),
  tipo: z.enum(['CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'SALA', 'GALPAO', 'OUTROS']),
  finalidade: z.enum(['VENDA', 'LOCACAO', 'AMBOS']),
  endereco: z.string().min(3, 'Endereço obrigatório'),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().max(2).optional(),
  cep: z.string().optional(),
  descricao: z.string().optional(),
  codigo: z.string().optional(),

  // Características
  areaTotal: z.number().positive().optional(),
  areaConstruida: z.number().positive().optional(),
  quartos: z.number().int().min(0).optional(),
  suites: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),

  // Valores
  valorVenda: z.number().positive().optional(),
  valorLocacao: z.number().positive().optional(),
  valorCondominio: z.number().min(0).optional(),
  valorIptu: z.number().min(0).optional(),

  observacoes: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

// ─── Schema de filtros de listagem ──────────────────────────────────
export const propertyFiltersSchema = z.object({
  tipo: z.enum(['CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'SALA', 'GALPAO', 'OUTROS']).optional(),
  finalidade: z.enum(['VENDA', 'LOCACAO', 'AMBOS']).optional(),
  status: z.enum(['VAGO', 'OCUPADO', 'SUSPENSO']).optional(),
  cidade: z.string().optional(),
  bairro: z.string().optional(),
  precoMin: z.coerce.number().optional(),
  precoMax: z.coerce.number().optional(),
  quartos: z.coerce.number().int().optional(),
  busca: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  orderBy: z.enum(['createdAt', 'valorVenda', 'valorLocacao', 'areaTotal']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ─── Schemas de Clientes (Inquilinos/Interessados) ───────────────────
export const createTenantSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpfCnpj: z.string().refine(isValidCpfCnpj, 'CPF/CNPJ inválido'),
  rg: z.string().optional(),
  dataNascimento: z.coerce.date().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  tipo: z.enum(['INQUILINO', 'INTERESSADO']).default('INQUILINO'),
});

export const updateTenantSchema = createTenantSchema.partial();

// ─── Schemas de Interações ───────────────────────────────────────────
export const createInteractionSchema = z.object({
  tipo: z.enum(['LIGACAO', 'EMAIL', 'VISITA', 'WHATSAPP', 'OUTROS']),
  descricao: z.string().min(3, 'A descrição é obrigatória'),
  usuarioId: z.string().uuid().optional(),
});

// ─── Schemas de Contratos ───────────────────────────────────────────
const contractBaseSchema = z.object({
  imovelId: z.string().uuid('ID do imóvel inválido'),
  inquilinoId: z.string().uuid('ID do inquilino inválido'),
  usuarioId: z.string().uuid().optional(),
  numeroContrato: z.string().min(1, 'Número do contrato é obrigatório'),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date(),
  valorAluguel: z.number().positive('O valor do aluguel deve ser positivo'),
  diaVencimento: z.number().int().min(1).max(31, 'Dia de vencimento inválido'),
  observacoes: z.string().optional(),
});

export const createContractSchema = contractBaseSchema.refine(data => data.dataFim > data.dataInicio, {
  message: 'A data de fim deve ser posterior à data de início',
  path: ['dataFim'],
});

export const updateContractSchema = contractBaseSchema.partial();
