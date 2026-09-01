const aiModel = require('../models/ai.model');
const { generateBundles } = require("../services/openai.service");

async function userRequirements(req, res) {
    try {
        const { products, preferredBrands, startingPrice, endingPrice, releaseCategory, discount, naturalText } = req.body;

        const requirements = new aiModel({
            products: Array.isArray(products) ? products : (products ? [products] : []),
            preferredBrands: Array.isArray(preferredBrands) ? preferredBrands : (preferredBrands ? [preferredBrands] : []),
            startingPrice: startingPrice ? Number(startingPrice) : null,
            endingPrice: endingPrice ? Number(endingPrice) : null,
            releaseCategory: Array.isArray(releaseCategory) ? releaseCategory : (releaseCategory ? [releaseCategory] : []),
            discount: discount ? Number(discount) : null,
            naturalText: naturalText || ""
        });

        const savedReq = await requirements.save();

        return res.status(201).json({
            status: "Success",
            message: "Form Submitted Successfully",
            requirementId: savedReq._id,
            requirements: savedReq
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
}

async function AiEfficientSearch(req, res) {
    try {
        const requirementId = req.params.id || req.query.id || req.body.requirementId;

        let requirements = null;
        if (requirementId) {
            requirements = await aiModel.findById(requirementId);
        }

        if (!requirements) {
            requirements = req.body && Object.keys(req.body).length > 0 ? req.body : { products: ["Mobile Phones"] };
        }

        const bundleResult = await generateBundles(requirements);

        return res.status(200).json({
            status: "Success",
            requirementId: requirementId || null,
            preferences: bundleResult.preferences,
            totalBundles: bundleResult.bundles ? bundleResult.bundles.length : 0,
            bundles: bundleResult.bundles
        });

    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
}

async function getLatestBundles(req, res) {
    try {
        const latestReq = await aiModel.findOne().sort({ createdAt: -1 });
        const requirements = latestReq || { products: ["Mobile Phones"], preferredBrands: ["Apple", "Samsung"] };
        
        const bundleResult = await generateBundles(requirements);

        return res.status(200).json({
            status: "Success",
            requirementId: latestReq ? latestReq._id : null,
            preferences: bundleResult.preferences,
            totalBundles: bundleResult.bundles ? bundleResult.bundles.length : 0,
            bundles: bundleResult.bundles
        });
    } catch (error) {
        return res.status(500).json({
            status: "Failed",
            message: error.message
        });
    }
}

module.exports = { userRequirements, AiEfficientSearch, getLatestBundles };
