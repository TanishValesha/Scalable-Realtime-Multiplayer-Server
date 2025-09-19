FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine as run-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build-stage /app/dist ./dist

EXPOSE 8080

CMD [ "node", "dist/index.js" ]