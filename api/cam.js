const WebSocket = require("ws");

const WS_PORT = 65080;

const wsServer = new WebSocket.Server({ port: WS_PORT }, () =>
  console.log(`WS Server is listening at ${WS_PORT}`)
);

let connectedClients = [];
let connectedCams = [];

//Servidor atento a que se realice una
//conexión
wsServer.on("connection", (ws, req) => {
  console.log("Connected");

  ws.on("message", data => {
    if (data.indexOf("WEB_CLIENT") !== -1) {
      connectedClients.push(ws);
      console.log("WEB_CLIENT ADDED");
      console.log(connectedClients.length);
      return;
    }

    if (data == "CAM_CLIENT") {
      connectedCams.push(ws);
      console.log("CAM CLIENT ADDED");
      console.log(connectedCams.length);
      return;
    }

    connectedClients.forEach((ws, i) => {
      if (connectedClients[i] == ws && ws.readyState === ws.OPEN) {
        ws.send(data);
      } else {
        connectedClients.splice(i, 1);
        console.log("WEB_CLIENT DELETED");
      }
    });
  });

  ws.on("error", error => {
    console.error("WebSocket error observed: ", error);
  });
});

function sendClientsToCam() {
  connectedCams.forEach((ws, i) => {
    if (connectedCams[i] == ws && ws.readyState === ws.OPEN) {
      ws.send(connectedClients.length.toString());
      console.log(
        "Cantidad de usuarios viendo la cámara   " + connectedClients.length
      );
    } else {
      connectedCams.splice(i, 1);
      console.log("CAM_CLIENT DELETED");
    }
  });

  setTimeout(() => {
    sendClientsToCam();
    console.log("  " + connectedCams.length);
  }, 1000);
}

sendClientsToCam();



