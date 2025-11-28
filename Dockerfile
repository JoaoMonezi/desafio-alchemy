# Estágio 1: Base
FROM node:20-alpine AS base

# Estágio 2: Dependências (Instala pacotes necessários)
FROM base AS deps
# Adiciona libc6-compat (necessário para algumas libs em Alpine)
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia arquivos de pacote
COPY package.json package-lock.json* ./

# Instala dependências de forma limpa
RUN npm ci

# Estágio 3: Builder (Compila a aplicação)
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilita telemetria do Next.js durante o build
ENV NEXT_TELEMETRY_DISABLED 1

# Gera o build (Atenção: requer output: 'standalone' no next.config.ts)
RUN npm run build

# Estágio 4: Runner (Imagem final de produção)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Cria grupo e usuário para não rodar como root (Segurança)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos públicos
COPY --from=builder /app/public ./public

# Configura permissões para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia apenas o output 'standalone' (o servidor otimizado)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expõe a porta 3000
EXPOSE 3000

# Configura host para aceitar conexões externas ao container
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Inicia o servidor
CMD ["node", "server.js"]