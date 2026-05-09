require('dotenv').config();
const express = require("express");
const app = express();
const connectDb = require("./config/databse");
const port = process.env.PORT;
const { validateSignup } = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
const authRouter = require("./routes/auth");
const requestRouter = require("./routes/request");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const cors = require("cors");
const paymentRouter = require('./routes/payment');
const {createServer} = require("http");
const initializeSocket = require('./utils/socket');
const chatRouter = require('./routes/chat');


require("./utils/cronjob")
app.use(express.json());
app.use(cookieParser());
// CREATE

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use("/", authRouter);
app.use("/", requestRouter);
app.use("/", profileRouter);
app.use("/", userRouter); 
app.use("/",paymentRouter)
app.use("/",chatRouter)


const server = createServer(app);
initializeSocket(server)

connectDb()
  .then(() => {
    console.log("Database is connected");
    server.listen(port, () => {
      console.log(`Example listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database is not connected");
  });
