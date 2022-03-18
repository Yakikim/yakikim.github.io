FROM node:alpine3.12 
COPY docker/qemu-*-static /usr/bin/
RUN npm install -g nodemon
WORKDIR /app
COPY package*.json /app/
RUN npm install && mv /app/node_modules /node_modules
COPY . /app
EXPOSE 8080
EXPOSE 8081
CMD [ "nodemon", "--legacy-watch" , "--ext", "js,mjs,json,md", "--delay", "3600", "--watch", "posts", "--watch", "_includes"]

