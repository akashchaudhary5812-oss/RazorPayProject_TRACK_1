const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/send-otp", userController.sendOtp);
router.post("/resend-otp", userController.resendOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-reset-otp", userController.verifyResetOtp);
router.post("/reset-password", userController.resetPassword);

module.exports = router;