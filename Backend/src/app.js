const express = require('express');
const cors = require('cors');
const app = express();

const productRoutes = require('./routes/product.route');
const aiRoutes = require('./routes/ai.route');
const userRoutes = require('./routes/user.route');

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", userRoutes);

module.exports = app;