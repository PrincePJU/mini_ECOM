// const DeliveryDetails = require('../../models/delivery');
const User = require('../../models/user');

const handleAssignDeliveryAgent = async (req, res) => {
    try {
        const { orderId, deliveryAgentId } = req.body;

        if (!orderId || !deliveryAgentId) {
            return res.status(400).json({ 
                error: 'Order ID and Delivery Agent ID are required' 
            });
        }

        // Verify delivery agent exists and has correct role
        const deliveryAgent = await User.findOne({
            _id: deliveryAgentId,
            role: 'DELIVERY_AGENT'
        });

        if (!deliveryAgent) {
            return res.status(404).json({ 
                error: 'Delivery agent not found' 
            });
        }

        // Create or update delivery details
        const deliveryDetails = await DeliveryDetails.findOneAndUpdate(
            { order_id: orderId },
            {
                delivery_agent: deliveryAgentId,
                status: 'assigned',
                assigned_at: new Date(),
                current_location: null,
                route: null
            },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: 'Order assigned successfully',
            delivery: deliveryDetails
        });
    } catch (error) {
        console.error('Order assignment error:', error);
        res.status(500).json({ 
            error: 'Failed to assign order to delivery agent' 
        });
    }
};

module.exports = {
    handleAssignDeliveryAgent
};
