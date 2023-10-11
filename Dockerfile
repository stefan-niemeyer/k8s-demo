FROM node:20.8.0-alpine3.18 as builder

WORKDIR /convert

USER 0

COPY src/images input/

ARG APP_VERSION

RUN mkdir output && \
    apk --no-cache add bash curl imagemagick ghostscript-fonts && \
    convert -size 300x50 xc:none -pointsize 30 -gravity center -draw "fill white text 1,1 'Version $APP_VERSION' text 0,0 'Version $APP_VERSION' fill black text -1,-1 'Version $APP_VERSION' " WATERMARK_FILE.png && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/standard.jpg output/standard.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/blue.jpg output/blue.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/green.jpg output/green.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/canary.jpg output/canary.jpg

FROM node:20.8.0-alpine3.18 as runtime

WORKDIR /app

RUN mkdir -p /home/node/.npm-global && \
    npm config set prefix '/home/node/.npm-global'  && \
    export PATH=/home/node/.npm-global/bin:$PATH

ENV npm_config_cache=/home/node/.npm

COPY package.json package-lock.json ./
RUN npm install

COPY src src/
COPY --from=builder /convert/output/ src/images/

EXPOSE 5000

USER 65534

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

ARG APP_PICTURE
ENV APP_PICTURE=$APP_PICTURE

CMD npm start
