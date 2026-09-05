const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');

const app = express();

const productRoutes = require('./routes/product.route');
const aiRoutes = require('./routes/ai.route');
const userRoutes = require('./routes/user.route');
const paymentRoutes = require('./routes/payment.route');

// Production-ready CORS configuration for local dev and Vercel domains
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV !== 'production'
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serverless DB connection middleware: ensures MongoDB is connected for every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error("Database connection middleware error:", err.message);
        next();
    }
});


app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", userRoutes);
app.use("/api", paymentRoutes);

module.exports = app;