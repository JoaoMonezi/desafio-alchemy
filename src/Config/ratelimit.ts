import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Cria o cliente Redis usando as variáveis de ambiente
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Define a regra: Permitir 3 requisições a cada janela de 60 segundos ("1 m")
export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // Ajuste para 10, 5, etc. conforme quiser
  analytics: true,
  prefix: "@upstash/ratelimit",
});