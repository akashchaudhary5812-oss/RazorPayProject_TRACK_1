const { instance } = require('../config/razorpay');
const crypto = require("crypto");

async function processPayment(req, res) {

    const options = {
        amount: Number(req.body.amount),
        currency: "INR"
    }

    const order = await instance.orders.create(options);
    res.status(200).json({
        success: true,
        order
    })
}

async function getKey(req, res) {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
}

async function paymentVerification(req, res) {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = (expectedSignature === razorpay_signature);

    if (isAuthentic) {
        return res.redirect(`http://localhost:5173/paymentsuccess?reference=${razorpay_payment_id}`);
    }
    else {
        res.status(400).json({
            success: false
        })
    }
}

module.exports = { processPayment, getKey, paymentVerification };