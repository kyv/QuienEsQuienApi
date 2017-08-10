FROM mhart/alpine-node
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

WORKDIR /src

COPY package.json .
RUN npm install --silent

COPY . .

EXPOSE 80

CMD ["npm", "start"]
