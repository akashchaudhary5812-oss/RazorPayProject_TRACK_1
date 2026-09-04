try {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../Backend/.env') });
} catch (_) {}

const app = require('../Backend/src/app');
const connectDB = require('../Backend/src/db/db');

module.exports = async (req, res) => {
    try {
        await connectDB();
    } catch (err) {
        console.error("Vercel serverless DB initialization error:", err.message);
    }
    return app(req, res);
};
