import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import initializeSocket from "./sockets/socket.js";   // <-- Add this

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  initializeSocket(io);   // <-- Add this

  httpServer.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

startServer();