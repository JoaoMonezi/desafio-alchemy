import { z } from "zod";

// 1. Regra de Senha Forte (Reutilizável)
// Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Deve conter pelo menos um número")
  .regex(/[^a-zA-Z0-9]/, "Deve conter pelo menos um caractere especial (!@#$...)");

// 2. Schema para Login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// 3. Schema para Registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    // Regex para bloquear números e símbolos no nome (Permite letras e acentos)
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, "O nome deve conter apenas letras"), 
  email: z.string().email("Email inválido"),
  password: passwordSchema, // Usa a regra forte criada acima
});