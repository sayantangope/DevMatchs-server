const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();
const User = require("../models/user");
const USER_SAFE_DATA = "firstName lastName age gender profileUrl about skills"
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      "fromUserId",
      USER_SAFE_DATA,
    );
  
  const data = connectionRequests.map(req => ({
    requestId: req._id,          
    user: req.fromUserId         
  }));
    res.status(200).json({
      message: "Data Fetched Succesfully",
      data: data,
    });
  } catch (error) {
    res.status(400).send(error.message)
  }
});




// 1. finds the connections requests from collection no matter the user is to or from
// 2. hideuserid a set from from the document of connections request add it
// 3. once we get the hide user id go to the User Model find the alternative user
/* 
         AND
               ID!= from hideuserId
               ID!= loggedInUSerID

*/
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    }).populate("fromUserId toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() == loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(400).send("ERROR :" + error.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    let limit = parseInt(req.query.limit) || 10
    limit = limit > 50 ? 50:limit
    const skip = (page -1)*limit;

    const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequest.find({
    $or: [
      {
        toUserId: loggedInUser._id
      },
      {
        fromUserId: loggedInUser._id
      },
    ]
  }).select("fromUserId toUserId")

  const hideUserFromFeed = new Set();
  connectionRequests.forEach((req) => 
    { hideUserFromFeed.add(req.fromUserId?.toString());
      hideUserFromFeed.add(req.toUserId?.toString());
})

const showUsers = await User.find({
  _id: {
    $nin: Array.from(hideUserFromFeed),
    $ne: loggedInUser._id
  }
}).select(USER_SAFE_DATA).skip(skip).limit(limit);
  

  res.status(200).json({
    message : "User Feed is fetched succesfully",
    data : showUsers,
  })
  } catch (error) {
    res.status(400).json({
      message: "Error: " + error.message,
    });
  }

})




module.exports = userRouter;