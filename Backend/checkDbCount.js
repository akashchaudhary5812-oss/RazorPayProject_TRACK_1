require('dotenv').config();
const connectDB = require('./src/db/db');
const productModel = require('./src/models/product.model');

async function check() {
  await connectDB();
  const count = await productModel.countDocuments();
  console.log("Total Products in MongoDB:", count);

  const categories = await productModel.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  console.log("Categories Breakdown:", categories);
  process.exit(0);
}

check();
