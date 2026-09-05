const express = require('express');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post("/payment/process", paymentController.processPayment);
router.get("/getKey", paymentController.getKey);
router.post("/paymentVerification", paymentController.paymentVerification);

module.exports = router;
