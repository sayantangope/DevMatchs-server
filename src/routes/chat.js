const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetId } = req.params;

    const chat = await Chat.findOne({
      participants: { $all: [userId, targetId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName profileUrl",
    });

    res.json(chat);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = chatRouter;