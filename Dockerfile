# build production dependencies
FROM node:10-slim as prod-dependencies
RUN npm install -g yarn
WORKDIR /opt/app
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install --production

# build dev dependencies
FROM node:10-slim as dev-dependencies
RUN npm install -g yarn
WORKDIR /opt/app
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY --from=prod-dependencies /opt/app/node_modules node_modules
RUN yarn install

# do a build with unit-tests using the dev-dependencies layer
FROM node:10-slim as builder
RUN npm install -g jest
WORKDIR /opt/app
COPY --from=dev-dependencies /opt/app/node_modules node_modules
COPY tsconfig.json tsconfig.json
COPY tsconfig.spec.json tsconfig.spec.json
COPY package.json package.json
COPY mounts mounts
COPY src src
COPY test test
# do a build
RUN npm run prestart:prod
# do unit-tests
RUN npm run -s test

# package the application using the prod-dependencies layer
FROM node:10-slim
ENV PORT 3000
ENV NODE production
EXPOSE 3000
WORKDIR /opt/app
COPY swagger swagger
COPY --from=prod-dependencies /opt/app/node_modules node_modules
COPY --from=builder /opt/app/package.json package.json
COPY --from=builder /opt/app/dist dist

CMD ["node", "dist/main.js"]
