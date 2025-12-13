import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Cria uma nova instância do PrismaClient se não existir uma global
// Caso contrário, reutiliza a instância existente
export const db =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Em ambiente de desenvolvimento, anexa a instância ao objeto global
// Isso garante que no hot reloading, a mesma instância seja usada
if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

export default db;