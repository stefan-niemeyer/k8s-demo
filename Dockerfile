FROM node:22.14-alpine3.21 as builder

WORKDIR /convert

USER 0

COPY src/images input/

ARG APP_VERSION

RUN mkdir output && \
    apk --no-cache add imagemagick imagemagick-jpeg ghostscript-fonts && \
    magick -size 300x50 xc:none -pointsize 30 -gravity center -draw "fill white text 1,1 'Version $APP_VERSION' text 0,0 'Version $APP_VERSION' fill black text -1,-1 'Version $APP_VERSION' " WATERMARK_FILE.png && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/v1.jpg output/v1.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/v2.jpg output/v2.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/v3.jpg output/v3.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/blue.jpg output/blue.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/green.jpg output/green.jpg && \
    composite -dissolve 90% -gravity south-east WATERMARK_FILE.png input/canary.jpg output/canary.jpg

FROM node:22.14-alpine3.21 as runtime

RUN apk --no-cache add bash curl

WORKDIR /app

RUN mkdir -p /home/node/.npm-global && \
    npm config set prefix '/home/node/.npm-global'  && \
    export PATH=/home/node/.npm-global/bin:$PATH && \
    mkdir -p /home/node/.npm && \
    chown -R 65534:65534 '/home/node/.npm'

ENV npm_config_cache=/home/node/.npm

COPY package.json package-lock.json ./
RUN npm install
COPY src src/

COPY --from=builder /convert/output/ src/images/

EXPOSE 5000

RUN chown -R 65534:65534 '/home/node/.npm'

USER 65534

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

ARG APP_PICTURE
ENV APP_PICTURE=$APP_PICTURE

ARG UNSTABLE
ENV UNSTABLE=$UNSTABLE

CMD npm start
