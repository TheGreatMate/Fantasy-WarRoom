FROM node:22-alpine
WORKDIR /app
COPY war-room.html serve.js ./
EXPOSE 8934
CMD ["node", "serve.js"]
