import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server!");
  console.log("Socket ID:", socket.id);

  socket.emit("joinConversation", "6a5afffbe34cd1f81f4e0d80");

  socket.emit("sendMessage", {
    conversationId: "6a5afffbe34cd1f81f4e0d80",
    senderId: "6a4f4747f2554b2a5d97606a",
    receiverId: "6a54768ef30ed269cd38ca63",
    text: "Hello after blocking!",
    });
});

socket.on("receiveMessage", (message) => {
  console.log("Received Message:", message);
});

socket.on("chatError", (data) => {
  console.log("Chat Error:", data);
});

socket.on("disconnect", () => {
  console.log("Disconnected from server.");
});