require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/db/db');
const productModel = require('./src/models/product.model');

const catalogData = [
  // ==================== MOBILE PHONES (60+ total items across categories) ====================
  // APPLE
  { productName: "iPhone 11 (64GB)", stockAvailable: 25, brandName: "Apple", releaseDate: "2019-09-20", discount: 30, price: 38900, category: "Mobile Phones" },
  { productName: "iPhone 13 (128GB)", stockAvailable: 40, brandName: "Apple", releaseDate: "2021-09-24", discount: 22, price: 52900, category: "Mobile Phones" },
  { productName: "iPhone 14 (128GB)", stockAvailable: 35, brandName: "Apple", releaseDate: "2022-09-16", discount: 18, price: 61900, category: "Mobile Phones" },
  { productName: "iPhone 15 Pro (128GB)", stockAvailable: 50, brandName: "Apple", releaseDate: "2023-09-22", discount: 15, price: 119900, category: "Mobile Phones" },
  { productName: "iPhone 15 Pro Max (256GB)", stockAvailable: 30, brandName: "Apple", releaseDate: "2023-09-22", discount: 12, price: 139900, category: "Mobile Phones" },
  { productName: "AirPods 2nd Gen", stockAvailable: 60, brandName: "Apple", releaseDate: "2019-03-20", discount: 25, price: 9900, category: "Mobile Phones" },
  { productName: "AirPods Pro 2nd Gen", stockAvailable: 80, brandName: "Apple", releaseDate: "2023-09-12", discount: 10, price: 23900, category: "Mobile Phones" },
  { productName: "Apple Watch Series 9", stockAvailable: 45, brandName: "Apple", releaseDate: "2023-09-22", discount: 14, price: 41900, category: "Mobile Phones" },

  // SAMSUNG
  { productName: "Samsung Galaxy A14", stockAvailable: 55, brandName: "Samsung", releaseDate: "2023-01-12", discount: 20, price: 13499, category: "Mobile Phones" },
  { productName: "Samsung Galaxy M34 5G", stockAvailable: 40, brandName: "Samsung", releaseDate: "2023-07-07", discount: 25, price: 17999, category: "Mobile Phones" },
  { productName: "Samsung Galaxy S22 Ultra", stockAvailable: 20, brandName: "Samsung", releaseDate: "2022-02-25", discount: 35, price: 74999, category: "Mobile Phones" },
  { productName: "Samsung Galaxy S23 FE", stockAvailable: 30, brandName: "Samsung", releaseDate: "2023-10-04", discount: 28, price: 49999, category: "Mobile Phones" },
  { productName: "Samsung Galaxy S24 Ultra", stockAvailable: 45, brandName: "Samsung", releaseDate: "2024-01-17", discount: 25, price: 108900, category: "Mobile Phones" },
  { productName: "Samsung Galaxy Buds2 Pro", stockAvailable: 50, brandName: "Samsung", releaseDate: "2022-08-26", discount: 30, price: 12999, category: "Mobile Phones" },
  { productName: "Samsung Galaxy Watch6", stockAvailable: 35, brandName: "Samsung", releaseDate: "2023-08-11", discount: 22, price: 24999, category: "Mobile Phones" },

  // GOOGLE
  { productName: "Google Pixel 6a", stockAvailable: 25, brandName: "Google", releaseDate: "2022-07-21", discount: 35, price: 27999, category: "Mobile Phones" },
  { productName: "Google Pixel 7a", stockAvailable: 35, brandName: "Google", releaseDate: "2023-05-10", discount: 20, price: 37999, category: "Mobile Phones" },
  { productName: "Google Pixel 8 Pro", stockAvailable: 30, brandName: "Google", releaseDate: "2023-10-04", discount: 15, price: 93999, category: "Mobile Phones" },
  { productName: "Pixel Buds Pro", stockAvailable: 40, brandName: "Google", releaseDate: "2022-07-28", discount: 25, price: 14990, category: "Mobile Phones" },

  // ONEPLUS
  { productName: "OnePlus Nord CE 3 Lite", stockAvailable: 60, brandName: "OnePlus", releaseDate: "2023-04-11", discount: 12, price: 19999, category: "Mobile Phones" },
  { productName: "OnePlus 11R 5G", stockAvailable: 35, brandName: "OnePlus", releaseDate: "2023-02-16", discount: 18, price: 37999, category: "Mobile Phones" },
  { productName: "OnePlus 12 5G", stockAvailable: 40, brandName: "OnePlus", releaseDate: "2024-01-23", discount: 10, price: 64999, category: "Mobile Phones" },
  { productName: "OnePlus Buds Pro 2", stockAvailable: 50, brandName: "OnePlus", releaseDate: "2023-02-07", discount: 20, price: 9999, category: "Mobile Phones" },

  // XIAOMI
  { productName: "Redmi Note 12", stockAvailable: 70, brandName: "Xiaomi", releaseDate: "2023-01-05", discount: 20, price: 14999, category: "Mobile Phones" },
  { productName: "Xiaomi 13 Pro", stockAvailable: 25, brandName: "Xiaomi", releaseDate: "2023-02-26", discount: 25, price: 69999, category: "Mobile Phones" },
  { productName: "Xiaomi 14 Ultra", stockAvailable: 20, brandName: "Xiaomi", releaseDate: "2024-02-25", discount: 15, price: 99999, category: "Mobile Phones" },

  // MOTOROLA
  { productName: "Moto G54 5G", stockAvailable: 45, brandName: "Motorola", releaseDate: "2023-09-06", discount: 15, price: 15999, category: "Mobile Phones" },
  { productName: "Motorola Edge 40 Neo", stockAvailable: 30, brandName: "Motorola", releaseDate: "2023-09-21", discount: 18, price: 22999, category: "Mobile Phones" },
  { productName: "Motorola Razr 40 Ultra", stockAvailable: 15, brandName: "Motorola", releaseDate: "2023-06-01", discount: 30, price: 69999, category: "Mobile Phones" },

  // NOTHING
  { productName: "Nothing Phone (1)", stockAvailable: 20, brandName: "Nothing", releaseDate: "2022-07-12", discount: 30, price: 26999, category: "Mobile Phones" },
  { productName: "Nothing Phone (2)", stockAvailable: 35, brandName: "Nothing", releaseDate: "2023-07-11", discount: 20, price: 36999, category: "Mobile Phones" },
  { productName: "Nothing Ear (2)", stockAvailable: 40, brandName: "Nothing", releaseDate: "2023-03-22", discount: 22, price: 8999, category: "Mobile Phones" },

  // REALME
  { productName: "Realme C55", stockAvailable: 60, brandName: "Realme", releaseDate: "2023-03-21", discount: 15, price: 10999, category: "Mobile Phones" },
  { productName: "Realme 12 Pro+ 5G", stockAvailable: 35, brandName: "Realme", releaseDate: "2024-01-29", discount: 14, price: 29999, category: "Mobile Phones" },

  // ==================== LAPTOPS ====================
  { productName: "MacBook Air M1 (8GB, 256GB)", stockAvailable: 35, brandName: "Apple", releaseDate: "2020-11-10", discount: 25, price: 69900, category: "Laptops" },
  { productName: "MacBook Air M3 (13.6-inch)", stockAvailable: 40, brandName: "Apple", releaseDate: "2024-03-08", discount: 20, price: 99900, category: "Laptops" },
  { productName: "MacBook Pro M3 Max 16-inch", stockAvailable: 15, brandName: "Apple", releaseDate: "2023-11-07", discount: 10, price: 319900, category: "Laptops" },
  { productName: "Dell XPS 13 Plus", stockAvailable: 20, brandName: "Dell", releaseDate: "2023-05-15", discount: 15, price: 145000, category: "Laptops" },
  { productName: "HP Spectre x360 OLED", stockAvailable: 25, brandName: "HP", releaseDate: "2023-08-20", discount: 18, price: 139990, category: "Laptops" },
  { productName: "Lenovo IdeaPad Slim 3", stockAvailable: 50, brandName: "Lenovo", releaseDate: "2023-02-10", discount: 22, price: 38990, category: "Laptops" },
  { productName: "ASUS ROG Zephyrus G14 Gaming Laptop", stockAvailable: 18, brandName: "ASUS", releaseDate: "2024-01-10", discount: 15, price: 174990, category: "Laptops" },
  { productName: "Logitech MX Master 3S Wireless Mouse", stockAvailable: 60, brandName: "Logitech", releaseDate: "2022-05-24", discount: 20, price: 9995, category: "Laptops" },
  { productName: "Logitech MX Keys S Wireless Keyboard", stockAvailable: 45, brandName: "Logitech", releaseDate: "2023-05-31", discount: 15, price: 11995, category: "Laptops" },

  // ==================== GAMING ====================
  { productName: "Sony PlayStation 5 Disc Edition", stockAvailable: 30, brandName: "Sony", releaseDate: "2020-11-12", discount: 10, price: 54990, category: "Gaming" },
  { productName: "Sony PS5 DualSense Wireless Controller", stockAvailable: 75, brandName: "Sony", releaseDate: "2020-11-12", discount: 15, price: 5990, category: "Gaming" },
  { productName: "Sony PULSE 3D Wireless Headset", stockAvailable: 40, brandName: "Sony", releaseDate: "2020-11-12", discount: 20, price: 8590, category: "Gaming" },
  { productName: "Microsoft Xbox Series X", stockAvailable: 25, brandName: "Microsoft", releaseDate: "2020-11-10", discount: 12, price: 52990, category: "Gaming" },
  { productName: "Xbox Wireless Controller (Robot White)", stockAvailable: 60, brandName: "Microsoft", releaseDate: "2020-11-10", discount: 18, price: 5390, category: "Gaming" },
  { productName: "Nintendo Switch OLED Model", stockAvailable: 35, brandName: "Nintendo", releaseDate: "2021-10-08", discount: 15, price: 31990, category: "Gaming" },
  { productName: "Razer BlackShark V2 Pro Gaming Headset", stockAvailable: 30, brandName: "Razer", releaseDate: "2023-04-27", discount: 22, price: 16999, category: "Gaming" },

  // ==================== SPORTS ====================
  { productName: "Nike Air Zoom Pegasus 40 Running Shoes", stockAvailable: 45, brandName: "Nike", releaseDate: "2023-04-01", discount: 25, price: 8995, category: "Sports" },
  { productName: "Adidas Ultraboost Light Running Shoes", stockAvailable: 40, brandName: "Adidas", releaseDate: "2023-02-23", discount: 30, price: 11999, category: "Sports" },
  { productName: "Puma Future Match Football Boots", stockAvailable: 30, brandName: "Puma", releaseDate: "2023-01-15", discount: 20, price: 6999, category: "Sports" },
  { productName: "Under Armour Gym Training Duffle Bag", stockAvailable: 50, brandName: "Under Armour", releaseDate: "2022-09-10", discount: 35, price: 2999, category: "Sports" },
  { productName: "Decathlon 10kg Rubber Dumbbell Set", stockAvailable: 60, brandName: "Decathlon", releaseDate: "2022-01-01", discount: 15, price: 3499, category: "Sports" },
  { productName: "Fitbit Charge 6 Fitness Tracker", stockAvailable: 35, brandName: "Fitbit", releaseDate: "2023-09-28", discount: 18, price: 14999, category: "Sports" },

  // ==================== JEWELLERY ====================
  { productName: "22K Gold Plated Solitaire Pendant Necklace", stockAvailable: 20, brandName: "Tanishq", releaseDate: "2023-10-15", discount: 15, price: 24999, category: "Jewellery" },
  { productName: "Sterling Silver Diamond Stud Earrings", stockAvailable: 30, brandName: "CaratLane", releaseDate: "2023-08-01", discount: 20, price: 12499, category: "Jewellery" },
  { productName: "Rose Gold Adjustable Charm Bracelet", stockAvailable: 25, brandName: "GIVA", releaseDate: "2023-11-20", discount: 30, price: 4499, category: "Jewellery" },
  { productName: "Traditional Kundan & Pearl Choker Set", stockAvailable: 15, brandName: "Senco", releaseDate: "2023-09-05", discount: 25, price: 18999, category: "Jewellery" },

  // ==================== KIDS TOYS ====================
  { productName: "LEGO Classic Creative Bricks (790 Pieces)", stockAvailable: 50, brandName: "LEGO", releaseDate: "2022-01-01", discount: 15, price: 4999, category: "Kids Toys" },
  { productName: "Hot Wheels 20-Car Gift Pack", stockAvailable: 70, brandName: "Hot Wheels", releaseDate: "2022-06-15", discount: 20, price: 2299, category: "Kids Toys" },
  { productName: "Barbie Dreamhouse Playset", stockAvailable: 20, brandName: "Barbie", releaseDate: "2023-05-10", discount: 25, price: 14999, category: "Kids Toys" },
  { productName: "NERF Elite 2.0 Commander Blaster", stockAvailable: 45, brandName: "NERF", releaseDate: "2022-09-01", discount: 18, price: 1799, category: "Kids Toys" },

  // ==================== FOOD ====================
  { productName: "Organic Cold Pressed Virgin Coconut Oil (1L)", stockAvailable: 80, brandName: "Nutiva", releaseDate: "2023-01-10", discount: 20, price: 899, category: "Food" },
  { productName: "Artisanal Dark Chocolate Gift Box (12 Bars)", stockAvailable: 60, brandName: "Lindt", releaseDate: "2023-09-01", discount: 15, price: 2499, category: "Food" },
  { productName: "Gourmet Whole Roasted Almonds & Cashews Pack", stockAvailable: 100, brandName: "Happilo", releaseDate: "2023-06-01", discount: 30, price: 1199, category: "Food" },
  { productName: "Premium Japanese Matcha Green Tea (100g)", stockAvailable: 40, brandName: "Tenzo", releaseDate: "2023-08-15", discount: 25, price: 1899, category: "Food" }
];

async function seedDatabase() {
  try {
    await connectDB();

    console.log("Clearing existing sample products...");
    await productModel.deleteMany({});

    console.log(`Inserting ${catalogData.length} products into MongoDB...`);
    const inserted = await productModel.insertMany(catalogData);
    
    console.log(`\nSUCCESS: Successfully inserted ${inserted.length} products into MongoDB across categories!`);
    
    // Category Breakdown summary
    const categories = {};
    inserted.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    console.log("\nCategory Distribution:", categories);

    process.exit(0);
  } catch (error) {
    console.error("ERROR seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
