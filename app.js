const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const users = {};
let onlineUsersCount = 0;

io.on("connection", (socket) => {
  socket.on("new-user-join", (name) => {
    if (name && name.trim().length > 0) {
      users[socket.id] = name;
      onlineUsersCount++;
      io.emit("update-user-count", onlineUsersCount);
      socket.broadcast.emit("user-joined", name);
    } else {
      socket.emit("name-error", "Name is required");
    }
  });

  socket.on("send", (message) => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("receive", { message: message, name: name });
    }
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("user-left", name);
      delete users[socket.id];
      onlineUsersCount--;
      io.emit("update-user-count", onlineUsersCount);
    }
  });

  // Handle typing status
  socket.on("typing", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("user-typing", name);
    }
  });

  socket.on("stop-typing", () => {
    const name = users[socket.id];
    if (name) {
      socket.broadcast.emit("user-stopped-typing", name);
    }
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
