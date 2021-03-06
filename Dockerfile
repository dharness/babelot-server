# Dockerfile
FROM node:5

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Bundle app source
COPY ./app /usr/src/app

# RUN npm i

EXPOSE 8080

CMD [ "npm", "start" ]
