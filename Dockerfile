
# FROM node:10-alpine

# ENV MONGODB_USER ariefyudia
# ENV MONGODB_PASSWORD LaTYrccbgaiTZo9b
# ENV MONGODB_CONNECTION mongodb+srv://ariefyudia:LaTYrccbgaiTZo9b@cluster0.90fkiic.mongodb.net/

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# WORKDIR /app

# COPY package*.json ./

# USER node

# RUN npm install --save

# COPY --chown=node:node . .

# EXPOSE 3000

# CMD [ "node", "users.js" ]

# Fetching the minified node image on apline linux
FROM node:slim

# Declaring env
ENV MONGODB_USER ariefyudia
ENV MONGODB_PASSWORD LaTYrccbgaiTZo9b
ENV MONGODB_CONNECTION mongodb+srv://ariefyudia:LaTYrccbgaiTZo9b@cluster0.90fkiic.mongodb.net/

# Setting up the work directory
WORKDIR /codeid

# Copying all the files in our project
COPY . .

# Installing dependencies
RUN npm install

# Starting our application
CMD [ "node","users.js","npm","start","dev","redis-server" ]

# Exposing server port
EXPOSE 3000