# Stage 1: Build source code TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript compiler)
RUN npm ci

# Copy source code and configs
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript (creates /app/dist)
RUN npm run build

# Stage 2: Production Dependencies
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Stage 3: Runner (Production Image - Siêu nhẹ & Bảo mật)
FROM node:22-alpine AS runner

WORKDIR /app

# Khởi tạo môi trường production
ENV NODE_ENV=production
ENV PORT=5000

# Tạo và sử dụng user phi-root để tăng cường bảo mật
USER node

# Copy production node_modules và build output
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node package*.json ./

# Mở cổng 5000
EXPOSE 5000

# Khởi chạy server
CMD ["node", "dist/server.js"]
