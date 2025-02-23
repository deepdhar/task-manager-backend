const express = require("express");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: 'all fields are required'
      })
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(500).send({ 
          success: false,
          message: "User already exists with this email" 
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).send({ 
      message: 'Signup successfull',
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    });
  } catch (err) {
    res.status(500).send({ success: false, message: "Error creating user", error: err });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(500).send({
        success: false,
        message: 'Please provide email and password'
      })
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ 
      message: 'Logged in successfully', 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err });
  }
});

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    // const resetToken = crypto.randomBytes(32).toString('hex');
    const resetCode = generateResetCode();
    const resetCodeExpiration = Date.now() + 3600000; // 1 hour

    user.resetCode = resetCode;
    user.resetCodeExpiration = resetCodeExpiration;
    await user.save();

    // Send email
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;

    const mailOptions = {
      from: `Task Manager <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Code',
      html: `
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code expires in 1 hour.</p>
      `
    };

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset code email sent" });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: "Error sending reset code", error: err });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ 
      email,
      resetCode: code,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid code or code expired" 
      });
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update password and clear reset token
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: "Error resetting password", error: err });
  }
});

module.exports = router;