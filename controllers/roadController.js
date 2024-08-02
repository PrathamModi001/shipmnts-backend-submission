const Road = require('../models/road');

const trafficConditions = {
    clear: 1,
    moderate: 5,
    high: 10
};

exports.addRoad = async (req, res) => {
    try {
        var {
            start_location_id,
            end_location_id,
            distance,
            traffic_condition
        } = req.body;

        traffic_condition = traffic_condition.toLowerCase();

        // Validate the traffic condition
        if (!trafficConditions.hasOwnProperty(traffic_condition)) {
            return res.status(400).json({ error: "Invalid traffic condition. Valid values are: Clear, Moderate, High." });
        }

        // Assign weight based on traffic condition
        const trafficWeight = trafficConditions[traffic_condition];

        const road = new Road({ 
            start_location_id, 
            end_location_id, 
            distance, 
            traffic_condition,  
            traffic_weight: trafficWeight
        });

        await road.save();
        res.status(201).json(road);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
