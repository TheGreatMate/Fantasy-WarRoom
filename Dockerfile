FROM node:22-alpine
WORKDIR /app
COPY war-room.html serve.js ./
VOLUME ["/app/data"]
EXPOSE 8934
CMD ["node", "serve.js"]
