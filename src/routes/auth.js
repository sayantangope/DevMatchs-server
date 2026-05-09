const express = require("express");
const { validateSignup } = require("../utils/validate");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

const saltRounds = 10;

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req);

    const { firstName, lastName, age, gender, password, emailId } = req.body;

    const hashPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      firstName,
      lastName,
      age,
      gender,
      emailId,
      password: hashPassword,
    });

    const savedUser = await user.save();

    // Generate token
    const token = savedUser.getJWT();

    //  Set cookie (same as login)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
    });

    //  Send user
    res.send(user);

  } catch (error) {
    res.status(400).send("Error, Please Try Again: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    const token = user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
    });
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

authRouter.post("/logout", (req, res)=> {
  res.cookie("token", null , {
    expires : new Date(Date.now()),
  })
  res.send("Log out sucessfully")
})

module.exports = authRouter;
