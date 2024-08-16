FROM node:20-alpine

# Create app directory
WORKDIR /app

COPY . .

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
