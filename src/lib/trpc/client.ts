import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./router";

// Cria os hooks do React com tipagem automática do Backend
export const trpc = createTRPCReact<AppRouter>();