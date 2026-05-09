const mongoose = require("mongoose");
var validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2],
      maxLength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      lowercase: true,
      unique: [true, "Enter a unique email ID"],
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid format"],
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Must be atleast 8 characters"],
      maxLength: 72,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong");
        }
      },
    },
    age: {
      type: Number,
      required: [true, "Enter your age"],
      trim: true,
      min: 18,
    },
    gender: {
      type: String,
      trim: true,
      required: [true, "Enter your gender"],
      lowercase: true,
      enum: {
        values: ["male", "female", "others"],
        message: "Not a valid gender",
      },
    },
    profileUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/9131/9131478.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Image link is not valid");
        }
      },
    },
    about: {
      type: String,
      default: "This is a default bio",
      maxLength: 100,
    },
    skills: {
      type: [String],
      required: false,
      /*  validate: {
        validator: function (arr) {
          if (!arr) return true; // if undefined/null → OK
          return arr.length >= 1 && arr.length <= 5;
        },
        message: "Skills must be between 1 and 5",
      }, */
    },
    isPremium : {
      type : Boolean,
      default : false
    },
    membershipType : {
      type : String,
    },
  },

  {
    timestamps: true,
  },
);
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (userInputPassword) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(userInputPassword, passwordHash);
  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
