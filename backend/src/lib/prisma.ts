import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Solução para o erro de serialização do JSON quando o Prisma retorna campos Decimal.
 * O JSON.stringify nativo não sabe como serializar o objeto Decimal do Prisma.
 */
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Extensão global para lidar com Decimal do Prisma na serialização JSON
import { Decimal } from '@prisma/client/runtime/library';
(Decimal.prototype as any).toJSON = function () {
  return this.toString();
};
