import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("User B Connected!");
  console.log("Socket ID:", socket.id);

  // Join the actual conversation room
  socket.emit("joinConversation", "6a5afffbe34cd1f81f4e0d80");

  // Uncomment this only if you want User B to also send a message

  socket.emit("sendMessage", {
    conversationId: "6a5afffbe34cd1f81f4e0d80",
    senderId: "6a54768ef30ed269cd38ca63",
    receiverId: "6a4f4747f2554b2a5d97606a",
    text: "Hello from User B!"
  });
});

// Listen for incoming messages
socket.on("receiveMessage", (message) => {
  console.log("User B received:", message);
});

// Listen for chat errors
socket.on("chatError", (data) => {
  console.log("User B Chat Error:", data);
});

socket.on("disconnect", () => {
  console.log("User B Disconnected.");
});