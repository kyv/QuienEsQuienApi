FROM mhart/alpine-node:8
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

ENV PORT=${PORT:-8080}
ENV NODE_ENV=production

RUN apk --no-cache add tini \
  && addgroup -S node \
  && adduser -S -G node node

WORKDIR /src

COPY package.json .

COPY . .

RUN chown -R node:node /src

EXPOSE $PORT

USER node
RUN npm install --silent

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
