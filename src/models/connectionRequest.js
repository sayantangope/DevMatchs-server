const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref : "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: "Invalid Connection Status",
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
  { unique: true }
);


connectionRequestSchema.pre("save", function (next) {
  ConnectionRequest.fromUserId = this;
  // check if it is allow
  if (ConnectionRequest.fromUserId.equals(ConnectionRequest.toUserId)) {
    throw new Error("You can not send connections to yourself");
  }
});

const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequest;