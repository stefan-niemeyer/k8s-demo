/* eslint-disable no-console */
const express = require('express');
const { ReasonPhrases, StatusCodes } = require('http-status-codes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || 'v1';
const APP_PICTURE = process.env.APP_PICTURE || 'v1.jpg';
const UNSTABLE = process.env.UNSTABLE;

const host = process.env.HOSTNAME || 'localhost';
const PATH_BASE = '/';
const PATH_STATE = '/state';
const PATH_READY = '/ready';
const PATH_HEALTH = '/health';
const PATH_CRASH = '/crash';
const startTime = new Date();

let totalRequests = 0;
let readyState = true;
let healthState = true;

const createResponse = (endpoint, method = 'GET') => {
  console.log(`Host: ${host} | Path: ${endpoint} | Version: ${APP_VERSION} | Total Requests: ${totalRequests} | Ready: ${readyState} | Health: ${healthState} | App Uptime: ${(new Date() - startTime)/1000} seconds | Log Time: ${new Date()}`);
  return {
    host,
    method,
    path: endpoint,
    version: APP_VERSION,
    totalRequests,
    readyState,
    healthState
  }
}

app.use(express.json());

// Return the image for the app
app.get(PATH_BASE, (_, res) => {
  if (!healthState) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR})
  } else if (!readyState) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).send({status: ReasonPhrases.SERVICE_UNAVAILABLE})
  } else {
    totalRequests += 1;
    createResponse(PATH_BASE)

    const imagePath = path.join(__dirname, 'images', APP_PICTURE);
    res.sendFile(imagePath);
  }
});

// Return the state of the app
app.get(PATH_STATE, (_, res) => {
  if (!healthState) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: ReasonPhrases.INTERNAL_SERVER_ERROR})
  } else if (!readyState) {
    res.status(StatusCodes.SERVICE_UNAVAILABLE).send({status: ReasonPhrases.SERVICE_UNAVAILABLE})
  } else {
    totalRequests += 1;
    res.send(createResponse(PATH_STATE))
  }
});

// Endpoint for a readinessProbe
app.get(PATH_READY, (_, res) => {
  const statusCode = readyState ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
  res.status(statusCode).send({state: readyState});
});

// Endpoint to set the ready state
app.put(PATH_READY, (req, res) => {
  const {state} = req.body;
  if (state === undefined) {
    console.log(`Host: ${host} | Path: ${PATH_READY} | Method: PUT | Value for 'state' missing in body | Log Time: ${new Date()}`);
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return
  }

  readyState = state;
  res.send(createResponse(PATH_READY, 'PUT'))
})

// Endpoint for a livenessProbe
app.get(PATH_HEALTH, (_, res) => {
  const statusCode = healthState ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(statusCode).send({state: healthState});
});

// Endpoint to set the health state
app.put(PATH_HEALTH, (req, res) => {
  const {state} = req.body;
  if (state === undefined) {
    console.log(`Host: ${host} | Path: ${PATH_HEALTH} | Method: PUT | Value for 'state' missing in body | Log Time: ${new Date()}`);
    res.sendStatus(StatusCodes.BAD_REQUEST);
    return
  }

  healthState = state;
  res.send(createResponse(PATH_HEALTH, 'PUT'))
});

// Endpoint to crash the app
app.get(PATH_CRASH, (_, res) => {
  console.log(`Host: ${host} | Path: ${PATH_CRASH} | Total Requests: ${totalRequests} | Health State: ${healthState} | Ready State: ${readyState} | App Uptime: ${(new Date() - startTime)/1000} seconds | Log Time: ${new Date()}`);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status: "Unexpected Error Occurred"})
  process.exit(1);
});

app.listen(PORT, () => console.log(`server: App listening on port ${PORT}!`));

if (UNSTABLE !== undefined) {
  setTimeout(() => {
    console.log(`server: UNSTABLE=${UNSTABLE}s`);
    healthState = false;
  }, +UNSTABLE * 1000);
}

