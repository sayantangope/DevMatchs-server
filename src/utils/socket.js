const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const getSecretRoomId = (userId, targetId) => {
    return crypto
      .createHash("sha256")
      .update([userId, targetId].sort().join("-"))
      .digest("hex");
  };

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetId }) => {
      const roomId = getSecretRoomId(userId, targetId);

      socket.join(roomId);

    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetId, message, profileUrl }) => {
        try {
          const roomId = [userId, targetId].sort().join("-");

          /* - Find whether there is a chat present inDB of these participants
         - if present - push the newchat to it
         - else - create a new chat
            */

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetId],
              messages: [],
            });
          }

          chat.messages.push({ senderId: userId, text: message });
          await chat.save();

          io.to(roomId).emit("messageReceived", {
            firstName,
            message,
            profileUrl,
          });
        } catch (error) {
          console.log(error.message);
        }
      },
    );
  });
};

module.exports = initializeSocket;
