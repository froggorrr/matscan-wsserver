import express from "express";
import http from "http";
import { Server } from "socket.io";
import { startDiscordServices } from "./services/discord.js"; // Path menyesuaikan
import path from "path";
import { fileURLToPath } from "url";
import { search } from "./controllers/search.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingInterval: 25000, // default 25s
  pingTimeout: 5000,   // default 5s

});

const PORT = process.env.PORT || 3000;

startDiscordServices(io, PORT);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);


  socket.emit("message", "Hello from server!");

  socket.on("message", (msg) => {
    console.log(`📨 Received message: ${msg}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });

  socket.on("ping", () => {
    console.log("Ping received from client, sending pong...");
    socket.emit("pong");
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO server is running.");
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
