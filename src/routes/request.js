const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestRouter = express.Router();
const sendEmail = require("../utils/sendEmail")

// sent request
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const fromUserId = user._id;

      // 1. Status validation
      

      const isAllowedStatus = ["interested", "ignored"];
      if (!isAllowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      //  2. Prevent self request
      if (fromUserId.equals(toUserId)) {
        return res.status(400).json({
          message: "You cannot send request to yourself",
        });
      }
      // 3. check user exists
      const isValidUserID = await User.findById(toUserId);
      if (!isValidUserID) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res.status(400).json({
          message: "Connection request already exists",
        });
      }
      const newRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      await newRequest.save();
      const emailRes = await sendEmail.run()
      console.log(emailRes);
      
      res.status(200).json({
        message: `${user.firstName} sent a ${status} request to ${isValidUserID.firstName}`,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Error: " + error.message);
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    /* Checks to be made :
          - LoggedIn userID = touserId,
          - allowedStatus only accepted or rejected,
          - check only can change if the request is inetretd stage
        */

    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const isAllowedStatus = ["accepted", "rejected"];
      if (!isAllowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }


      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res
          .status(404)
          .json({ message: "Connection request not found" });
      }
      connectionRequest.status = status;

      await connectionRequest.save();
      res.json({
        message: "Connection request " + status + " successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(400).send("Error: " + error.message);
    }
  },
);

module.exports = requestRouter;
