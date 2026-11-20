
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3002

CMD ["npm", "run", "start:prod"]
