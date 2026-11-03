FROM node:20-alpine

WORKDIR /app

COPY project-client/package*.json ./

RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]