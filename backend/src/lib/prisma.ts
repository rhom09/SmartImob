import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Extensão global para lidar com Decimal do Prisma na serialização JSON antes de qualquer uso
(Decimal.prototype as any).toJSON = function () {
  return this.toString();
};

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

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
