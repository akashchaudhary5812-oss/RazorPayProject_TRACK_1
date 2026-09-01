const express = require('express');
const AIController = require('../controllers/ai.controller');
const router = express.Router();

router.post('/userRequirements', AIController.userRequirements);
router.get('/aiEfficientSearch/:id', AIController.AiEfficientSearch);
router.post('/aiEfficientSearch/:id', AIController.AiEfficientSearch);
router.post('/aiEfficientSearch', AIController.AiEfficientSearch);

// Dedicated /bundles endpoints requested by user
router.get('/bundles/:id', AIController.AiEfficientSearch);
router.get('/bundles', AIController.getLatestBundles);

module.exports = router;