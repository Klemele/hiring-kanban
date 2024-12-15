FROM node:22.12.0-alpine AS development

WORKDIR /usr/src/app
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .
USER node
EXPOSE 5173

FROM node:22.12.0-alpine AS build

WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN yarn build
RUN yarn --production --frozen-lockfile
USER node

FROM nginx:1.27.3-alpine AS production

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]