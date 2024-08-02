const Road = require('../models/road');

exports.addRoad = async (req, res) => {
    try {
        const { 
            start_location_id, 
            end_location_id, 
            distance, 
            traffic_condition 
        } = req.body;
        
        const road = new Road({ start_location_id, end_location_id, distance, traffic_condition });
        
        await road.save();
        res.status(201).json(road);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
