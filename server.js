const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Change this to your Next.js frontend domain in production
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "*", // ✅ Same here
    methods: ["GET", "POST"],
    credentials: true,
  })
);
// Middleware
// app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("room:join", ({ room, user }) => {
    console.table({
      "room-id": room,
      "user-id": user.id,
      "user-name": user.name,
    });

    socket.join(room);
    socket.to(room).emit("user:joined", user);

    socket.on("disconnect", () => {
      socket.to(room).emit("user:left", user.id);
    });

    socket.on("user:leave", (userId) => {
      socket.to(room).emit("user:left", userId);
    });

    socket.on("host:mute-user", (userId) => {
      socket.to(room).emit("host:muted-user", userId);
    });

    socket.on("host:remove-user-shared-screen", () => {
      socket.to(room).emit("host:removed-user-shared-screen");
    });

    socket.on("user:toggle-audio", (userId) => {
      socket.to(room).emit("user:toggled-audio", userId);
    });

    socket.on("user:toggle-video", (userId) => {
      socket.to(room).emit("user:toggled-video", userId);
    });

    socket.on("user:share-screen", (username) => {
      socket.to(room).emit("user:shared-screen", username);
    });

    socket.on("user:stop-share-screen", () => {
      socket.to(room).emit("user:stopped-screen-share", user.name);
    });

    socket.on("chat:post", (message) => {
      socket.to(room).emit("chat:get", message);
    });
  });
});

server.listen(3001, () => {
  console.log("WebSocket Server running on http://localhost:3001");
});
