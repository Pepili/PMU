const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
require("dotenv").config();
const { createServer } = require('http');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Game - PMU",
      version: "1.0.0",
      description:
        "The PMU game uses this API to manage the game and rounds between you and your friends.",
    },
    servers: [{ url: process.env.PMU_API }],
  },

  apis: ["./src/doc/api/*.yaml"],
};
const specs = swaggerJsdoc(options);

//Connect to db
const sqlite3 = require("sqlite3").verbose();
const connection = new sqlite3.Database("./database/db.sqlite");

const userRoutes = require("./src/routes/user.js");
const roomRoutes = require("./src/routes/room.js");
const roundRoutes = require("./src/routes/round.js");
const betRoutes = require("./src/routes/bet.js");
const messageRoutes = require("./src/routes/message.js");
const currentGamesRoutes = require("./src/routes/currentGames.js");
const mailSenderRoutes = require("./src/routes/mailSender.js");

const socket = require('./src/socket.js');
const server = createServer(app);

socket(server)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  req.db = connection;
  next();
});

app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/round", roundRoutes);
app.use("/api/bet", betRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/currentGames", currentGamesRoutes);
app.use("/api/mailSender", mailSenderRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
