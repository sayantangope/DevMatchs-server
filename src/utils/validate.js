const validator = require("validator");

const validateSignup = (req) => {
  const { firstName, lastName, age, password, emailId } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  }

  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not valid");
  }

  if (!age || age < 18) {
    throw new Error("Age is not valid");
  }
};

const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "skills",
    "about",
    "profileUrl",
  ];
  const isEdiAllowed = Object.keys(req.body).every((key) =>
    allowedFields.includes(key),
  );
  return isEdiAllowed;
};

module.exports = { validateSignup, validateEditProfileData };
