/* eslint-disable no-console */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || 'unknown';
const APP_PICTURE = process.env.APP_PICTURE || 'standard.jpg';

const host = process.env.HOSTNAME || 'localhost';
const PATH_READY = '/ready';
const PATH_HEALTH = '/health';
const PATH_ERROR = '/error';
const startTime = new Date();

let totalRequests = 0;
let readyState = true;
let healthState = true;

const createResponse = (path, method = 'GET') => {
  console.log(`Host: ${host} | Path: ${path} | Version: ${APP_VERSION} | Total Requests: ${totalRequests} | Health: ${healthState} | Ready: ${readyState} | App Uptime: ${(new Date() - startTime)/1000} seconds | Log Time: ${new Date()}`);
  return {
    host,
    method,
    path,
    version: APP_VERSION,
    totalRequests,
    health: healthState,
    ready: readyState
  }
}

app.use(express.json());

app.get('/', (_req, res) => {
  if (!healthState) {
    return res.status(500).send({status: "Internal Server Error"})
  }
  if (!readyState) {
    return res.status(503).send({status: "Service Unavailable"})
  }
  totalRequests += 1;
  res.send(createResponse('/'))
});

app.get('/image', (req, res) => {
  const imagePath = path.join(__dirname, 'images', APP_PICTURE);
  res.sendFile(imagePath);
});

app.get(PATH_READY, (_, res) => {
  const statusCode = readyState ? 200 : 503;
  res.status(statusCode).send({ready: readyState, statusCode: statusCode});
});

app.post(PATH_READY, (_, res) => {
  readyState = true;
  res.send(createResponse(PATH_READY, 'POST'))
})

app.delete(PATH_READY, (_, res) => {
  readyState = false;
  res.send(createResponse(PATH_READY, 'DELETE'))
})

app.get(PATH_HEALTH, (_, res) => {
  const statusCode = healthState ? 200 : 500;
  res.status(statusCode).send({health: healthState, statusCode: statusCode});
});

app.post(PATH_HEALTH, (_, res) => {
  healthState = true;
  res.send(createResponse(PATH_HEALTH, 'POST'))
});

app.delete(PATH_HEALTH, (_, res) => {
  healthState = false;
  res.send(createResponse(PATH_HEALTH, 'DELETE'))
});

app.get(PATH_ERROR, (_, res) => {
  console.log(`Host: ${host} | Path: ${PATH_ERROR} | Total Requests: ${totalRequests} | Health: ${healthState} | Ready: ${readyState} | App Uptime: ${(new Date() - startTime)/1000} seconds | Log Time: ${new Date()}`);
  res.status(503).send({status: "Unexpected Error Occurred"})
  process.exit(1);
});

app.listen(PORT, () => console.log(`server: App listening on port ${PORT}!`));
