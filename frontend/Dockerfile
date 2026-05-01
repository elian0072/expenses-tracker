FROM node:22-alpine

WORKDIR /app/frontend

COPY frontend/package.json /app/frontend/package.json
COPY frontend/package-lock.json /app/frontend/package-lock.json

RUN npm ci --no-audit --no-fund

COPY frontend /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev"]
