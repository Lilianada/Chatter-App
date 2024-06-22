const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse.js");
const Users = require("../models/userModels.js");
const generateToken = require("../helpers/generateToken.js");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await Users.find();
    if (!users) {
      return res.status(404).json({ message: `No users found` });
    }

    res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error("Error in fetching users:", err);
    next(new ErrorResponse("Error in fetching users", 500));
  }
});

exports.getSingleUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    res.status(200).json({
      success: true,
      message: `User found for id ${id}`,
      data: user,
    });
  } catch (err) {
    console.error("Error in fetching user:", err);
    next(new ErrorResponse("Error in fetching user", 500));
  }
});

exports.userSignup = asyncHandler(async (req, res, next) => {
  console.log("Request body:", req.body);
  const { name, email, password, role = "user" } = req.body;

  try {
    const user = new Users({
      name,
      email,
      password,
      role,
    });

    const newUser = await user.save();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    console.error("Error in creating user:", err);
    next(new ErrorResponse("Error in creating user", 500));
  }
});

exports.userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found for email ${email}` });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: `Invalid password` });
    }

    res.status(200).json({
      success: true,
      message: `User logged in for email ${email}`,
      data: user,
    });
  } catch (err) {
    console.error("Error in logging in user:", err);
    next(new ErrorResponse("Error in logging in user", 500));
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    await user.remove();
    res.status(200).json({
      success: true,
      message: `User deleted for id ${id}`,
    });
  } catch (err) {
    console.error("Error in deleting user:", err);
    next(new ErrorResponse("Error in deleting user", 500));
  }
});

exports.profileUpdate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    userName,
    email,
    profilePic,
    phoneNumber,
    country,
    lang,
    password,
    role,
  } = req.body;

  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: `User not found for id ${id}` });
    }

    // Update user fields if provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.country = country || user.country;
    user.lang = lang || user.lang;
    user.password = password || user.password; // Consider hashing the password if it's new
    user.role = role || user.role;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      message: `User updated successfully for id ${id}`,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error in updating user:", err);
    next(new ErrorResponse("Error in updating user", 500));
  }
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
  
    try {
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found with this email." });
      }
  
      // Generate a reset token
      const resetToken = user.getResetPasswordToken();
  
      await user.save({ validateBeforeSave: false });
  
      // Create reset url to email to provided email
      const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
  
      const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  
      try {
        await sendEmail({
          email: user.email,
          subject: 'Password reset token',
          message
        });
  
        res.status(200).json({ success: true, message: 'Email sent' });
      } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
  
        return next(new ErrorResponse('Email could not be sent', 500));
      }
    } catch (err) {
      next(err);
    }
  });

  exports.changePassword = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
      const user = await Users.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      // Set new password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
  
      // Log the user in
      sendTokenResponse(user, 200, res);
    } catch (err) {
      next(err);
    }
  });
  