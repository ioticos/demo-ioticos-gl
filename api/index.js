//requires 
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const colors = require("colors");



require('dotenv').config();

//instances
const app = express();

//express config
app.use(morgan("tiny"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(cors());

//express routes
app.use("/api", require("./routes/devices.js"));
app.use("/api", require("./routes/users.js"));
app.use("/api", require("./routes/templates.js"));
app.use("/api", require("./routes/webhooks.js"));
app.use("/api", require("./routes/emqxapi.js"));
app.use("/api", require("./routes/alarms.js"));
app.use("/api", require("./routes/dataprovider.js"));
 
module.exports = app;

//listener
app.listen(process.env.API_PORT, () => {
  console.log("API server listening on port " + process.env.API_PORT);
});


if (process.env.SSLREDIRECT == "true"){

  const app2 = express();

  app2.listen(3002, function(){
    console.log("Listening on port 3002 (for redirect to ssl)");
  });
  
  app2.all('*', function(req, res){
    console.log("NO SSL ACCESS ... REDIRECTING...");
    return res.redirect("https://" + req.headers["host"] + req.url);
  });
}

//Mongo Connection
const mongoUserName = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

var uri =
  "mongodb://" +
  mongoUserName +
  ":" +
  mongoPassword +
  "@" +
  mongoHost +
  ":" +
  mongoPort +
  "/" +
  mongoDatabase;

  console.log(uri);

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
  authSource: "admin"
};

mongoose.connect(uri, options).then(
  () => {
    console.log("\n");
    console.log("*******************************".green);
    console.log("✔ Mongo Successfully Connected!".green);
    console.log("*******************************".green);
    console.log("\n");
    global.check_mqtt_superuser();

  },
  err => {
    console.log("\n");
    console.log("*******************************".red);
    console.log("    Mongo Connection Failed    ".red);
    console.log("*******************************".red);
    console.log("\n");
    console.log(err);
  }
);




//********************************************* */
//*******    C A M A R I T A ****************** */
//********************************************* */

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
    //console.log("  " + connectedCams.length);
  }, 1000);
}

sendClientsToCam();




