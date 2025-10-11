import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const nodePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // optionnel
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = nodePrisma;
