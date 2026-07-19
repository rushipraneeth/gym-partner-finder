import Message from "../models/Message.js";
import Block from "../models/Block.js";

const initializeSocket = (io) => {
  console.log("Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);

      console.log(
        `Socket ${socket.id} joined conversation ${conversationId}`
      );
    });

    // Send and save message
    socket.on("sendMessage", async (messageData) => {
      try {
        const { conversationId, senderId, receiverId, text } = messageData;

        // Check if either user has blocked the other
        const blocked = await Block.findOne({
          $or: [
            {
              blockerId: senderId,
              blockedId: receiverId,
            },
            {
              blockerId: receiverId,
              blockedId: senderId,
            },
          ],
        });

        if (blocked) {
          return socket.emit("chatError", {
            success: false,
            message: "Blocked users cannot chat.",
          });
        }

        console.log("Message received:", messageData);

        // Save the message in MongoDB
        const savedMessage = await Message.create({
          conversationId,
          senderId,
          text,
        });

        console.log("Message saved:", savedMessage);

        // Send the saved message to everyone in the room
        io.to(conversationId).emit("receiveMessage", savedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default initializeSocket;