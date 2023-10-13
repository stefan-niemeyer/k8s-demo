# k8s-demo
This repository contains a simple Node.js application that can be used to demonstrate the basic concepts of Kubernetes.

# Endpoints
| Method | Path            | Description                                                                                                                                                                |
|--------|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET    | /               | Endpoint that serves an image.                                                                                                                                             |
| GET    | /state          | Get the current program state.<br/>The state is a JSON object that contains among others the fields<br/>`host`, `version`, `totalRequests`, `healthState` and `readyState` |
| GET    | /ready          | Get the ready state. Can be used for a readinessProbe in Kubernetes.                                                                                                       |
| PUT    | /ready/{state}  | Set the ready state with 'true' or 'false'                                                                                                                                 |
| GET    | /health         | Get the health state. Can be used for a livenessProbe in Kubernetes.                                                                                                       |
| PUT    | /health/{state} | Set the health state with 'true' or 'false'                                                                                                                                |
| GET    | /error          | Causes a crash of the app.<br/>Can be used to show the restart of pods in Kubernetes.                                                                                      |

## Example Calls

### App State
```shell
$ curl -X GET -w " - > %{response_code}\n" http://localhost:3000/state
{"host":"localhost","method":"GET","path":"/state","version":"v1","totalRequests":1,"readyState":true,"healthState":true} - > 200
```

### Ready/Health State
The examples use the `/ready` endpoint. The `/health` endpoint works the same way.

```shell
$ curl -X GET -w " - > %{response_code}\n" http://localhost:3000/ready
{"state":true} - > 200

curl -X PUT -H "Content-Type: application/json" -d '{"state": false}' -w " - > %{response_code}\n" http://localhost:3000/ready
{"host":"localhost","method":"PUT","path":"/ready","version":"v1","totalRequests":0,"readyState":false,"healthState":true} - > 200

$ curl -X GET -w " - > %{response_code}\n" http://localhost:3000/ready
{"state":false} - > 503

$ curl -X PUT -H "Content-Type: application/json" -d '{"state": true}' -w " - > %{response_code}\n" http://localhost:3000/ready
{"host":"localhost","method":"PUT","path":"/ready","version":"v1","totalRequests":0,"readyState":true,"healthState":true} - > 200
```

# Source of the Photos
* canary.jpg: [Jelle Taman](https://unsplash.com/@jelletaman?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/60WkGpWyadY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
* blue.jpg [Marek Szturc](https://unsplash.com/@marxgall?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash) on [Unsplash](https://unsplash.com/photos/FhmJJuudRIM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash)
 * green.jpg on [Pixabay](https://pixabay.com/photos/animal-cat-domestic-eye-eyes-face-17545/)
 * v1.jpg, v2.jpg, v3.jpg by [Stefan Niemeyer](https://github.com/stefan-niemeyer)
