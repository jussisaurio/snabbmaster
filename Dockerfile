# this is deprecated for now
# base image debian stretch
FROM node:lts-stretch
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN apt-get update
RUN apt-get -y install g++-multilib

# Hack because mrswatson assumes distro information is located in /etc/lsb-release
RUN cp /etc/os-release /etc/lsb-release

COPY . .

EXPOSE 8080

CMD ["npm", "start"]