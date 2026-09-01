const express = require('express');
const cors = require('cors');
const app = express();

const productRoutes = require('./routes/product.route');
const aiRoutes = require('./routes/ai.route');

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);

module.exports = app;