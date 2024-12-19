FROM node:19.8.1-alpine
WORKDIR /home/node/app

ARG NEXT_PUBLIC_ASSET_PREFIX
ENV NEXT_PUBLIC_ASSET_PREFIX=$NEXT_PUBLIC_ASSET_PREFIX
ARG TIMESTAMP
ENV TIMESTAMP=$TIMESTAMP

COPY package.json .
COPY node_modules ./node_modules

COPY .env .
COPY next.config.ts .
COPY public/robots.txt ./public/robots.txt
COPY .next ./.next
COPY . .

EXPOSE 3000
CMD ["npm", "start"]