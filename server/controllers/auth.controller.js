const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const RefreshToken = db.refreshToken;
const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

exports.signup = async (req, res) => {
  try {
    // Create user
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      mobile_no: req.body.mobile_no
    });

    // Assign roles
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles
          }
        }
      });
      await user.setRoles(roles);
      res.send({ message: "User registered successfully!" });
    } else {
      // Default role = 2 (admin)
      await user.setRoles([2]);
      res.send({ message: "User registered successfully!" });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const LoginCredential = db.loginCredential;
    // Accept either email or username for login
    const identifier = req.body.email || req.body.username;
    const user = await LoginCredential.findOne({
      where: {
        username: identifier
      }
    });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid password!"
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, config.secret, {
      expiresIn: config.expiresIn
    });

    // Optionally, you can implement refresh tokens if needed
    // For now, just send the access token and user info
    res.status(200).send({
      id: user.id,
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
      active: user.active,
      last_login: user.last_login,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    // Find the refresh token in the database
    const refreshToken = await RefreshToken.findOne({ 
      where: { token: requestToken } 
    });

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token not found!" });
    }

    // Verify if the refresh token has expired
    if (RefreshToken.verifyExpiration(refreshToken)) {
      // If expired, remove it from the database
      await RefreshToken.destroy({ where: { id: refreshToken.id } });
      
      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    // Get the user associated with the refresh token
    const user = await User.findByPk(refreshToken.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new access token
    const newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.expiresIn,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

// Logout - invalidate refresh token
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).send({ message: "Refresh Token is required!" });
    }
    
    // Delete the refresh token from the database
    const result = await RefreshToken.destroy({ 
      where: { token: refreshToken } 
    });
    
    if (result > 0) {
      return res.status(200).send({ message: "Logged out successfully!" });
    } else {
      return res.status(400).send({ message: "Invalid refresh token" });
    }
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

// Forgot password - send reset link
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).send({ message: "Email is required!" });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).send({ 
        message: "If your email is registered, you will receive a password reset link." 
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Save reset token to user
    user.reset_password_key = resetTokenHash;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@school.com',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    logger.info(`Password reset email sent to ${user.email}`);
    
    return res.status(200).send({ 
      message: "If your email is registered, you will receive a password reset link." 
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return res.status(500).send({ message: "Error processing your request" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).send({ message: "Token and password are required!" });
    }
    
    // Hash the token from the URL to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with this reset token
    const user = await User.findOne({ 
      where: { reset_password_key: resetTokenHash } 
    });
    
    if (!user) {
      return res.status(400).send({ message: "Invalid or expired reset token" });
    }
    
    // Update password and clear reset token
    user.password = bcrypt.hashSync(password, 8);
    user.reset_password_key = null;
    await user.save();
    
    logger.info(`Password reset successful for user ${user.email}`);
    
    return res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    return res.status(500).send({ message: "Error resetting password" });
  }
};