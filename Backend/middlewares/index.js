const fs = require('fs');
// const { getDeliveryLocation } = require('../services/redis');
// const DeliveryDetails = require('../models/delivery');

function logReqRes(filename) {
    return (req, res, next) => fs.appendFile(filename,
        `\n${Date.now()}:${req.ip} ${req.method}: ${req.path}\n`,
        (err, data) => {
            next();
        });
}

// Middleware to validate delivery agent's location updates
async function validateLocationUpdate(req, res, next) {
    try {
        const { deliveryId, latitude, longitude } = req.body;
        
        if (!deliveryId || !latitude || !longitude) {
            return res.status(400).json({ error: 'Missing required location data' });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: 'Invalid coordinates' });
        }

        // Check if delivery exists and agent is authorized
        const delivery = await DeliveryDetails.findById(deliveryId);
        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        if (delivery.assigned_to.delivery_agent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized to update this delivery' });
        }

        next();
    } catch (error) {
        console.error('Location validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Middleware to check if user can access delivery tracking
async function canAccessDeliveryTracking(req, res, next) {
    try {
        const { deliveryId } = req.params;
        const delivery = await DeliveryDetails.findById(deliveryId);

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery not found' });
        }

        // Allow access if user is admin, delivery agent assigned to this delivery, or the customer
        const isAdmin = req.user.role === 'ADMIN';
        const isAssignedAgent = delivery.assigned_to.delivery_agent.toString() === req.user._id.toString();
        const isCustomer = delivery.user.toString() === req.user._id.toString();

        if (!isAdmin && !isAssignedAgent && !isCustomer) {
            return res.status(403).json({ error: 'Unauthorized to access this delivery' });
        }

        // Attach delivery to request for later use
        req.delivery = delivery;
        next();
    } catch (error) {
        console.error('Access validation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    logReqRes,
    validateLocationUpdate,
    canAccessDeliveryTracking
}