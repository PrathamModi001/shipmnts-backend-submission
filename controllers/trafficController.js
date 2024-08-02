const TrafficUpdate = require('../models/traffic');

exports.updateTrafficCondition = async (req, res) => {
    try {
        const { 
            road_id, 
            timestamp, 
            traffic_condition 
        } = req.body;
        
        const trafficUpdate = new TrafficUpdate({ road_id, timestamp, traffic_condition });
        
        await trafficUpdate.save();
        
        res.status(201).json(trafficUpdate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
