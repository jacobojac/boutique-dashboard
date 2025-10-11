import { edgePrisma } from "./edge-client";
import { nodePrisma } from "./node-client";

const isEdge = typeof WebSocket !== "undefined" && !("require" in globalThis);

export const prisma = isEdge ? edgePrisma : nodePrisma;
