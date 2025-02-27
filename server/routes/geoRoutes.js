const express = require('express');
const { processNearbyUsers} = require('../controllers/geoController'); // Adjust the path
const router = express.Router();

// Define the route
router.post('/geoData',processNearbyUsers);

module.exports = router;
