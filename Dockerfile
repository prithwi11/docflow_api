#---------------------- Stage 1: Builder --------------------
FROM node:22-slim AS builder

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

#----------------------------------------- STAGE 2: Production Runtime --------------------------------
FROM node:22-slim AS production

WORKDIR /src

ENV NODE_ENV=production

RUN useradd -m appUser

COPY package.json package-lock.json ./
RUN npm ci --omit-dev

COPY --from=builder /src/dist ./dist

RUN chown -R appUser:appUser /src
USER appUser

CMD ["node", "dist/app.js"]


#--------------------------------------- STAGE 3: Test Runtime -------------------------------
FROM builder as Test

ENV NODE_ENV=Test

CMD ["npm", "run", "test"]