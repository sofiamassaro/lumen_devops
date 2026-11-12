FROM node:20-alpine

WORKDIR /app

# Copia só os manifestos primeiro para aproveitar o cache de camadas:
# se o código mudar mas as dependências não, o npm ci não roda de novo.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Não roda como root dentro do container.
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
