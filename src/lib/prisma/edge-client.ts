import { PrismaClient } from "@/lib/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

export const edgePrisma = new PrismaClient().$extends(withAccelerate());
