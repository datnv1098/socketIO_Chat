require('dotenv').config()
const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 3000 || process.env.PORT;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

const activeUsers = new Set();

io.on("connection", function (socket) {
  console.log("Made socket connection");

  socket.on("new user", function (data) {
    console.log("new User:",data)
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    console.log("disconnect User:",socket.userId)
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    console.log("chat message:",data)
    io.emit("chat message", data);
  });
  
  socket.on("typing", function (data) {
    console.log("typing:",data)
    socket.broadcast.emit("typing", data);
  });
});