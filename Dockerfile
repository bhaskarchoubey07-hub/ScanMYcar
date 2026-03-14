FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm install

COPY . .

EXPOSE 5000 5173

CMD ["npm", "run", "dev"]
