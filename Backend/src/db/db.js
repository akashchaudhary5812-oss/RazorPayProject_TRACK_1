const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!uri) {
        console.warn("MongoDB connection URI (MONGODB_URI or DATABASE_URL) not found in environment variables.");
        return null;
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(uri, {
            bufferCommands: false,
        }).then((mongooseInstance) => {
            console.log("MongoDB is Connected!!");
            return mongooseInstance;
        }).catch((err) => {
            cached.promise = null;
            console.error("Error Occurred While Connecting Database:", err.message);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (e) {
        cached.promise = null;
        throw e;
    }
}

module.exports = connectDB;