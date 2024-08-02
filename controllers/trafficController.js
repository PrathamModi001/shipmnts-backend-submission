const TrafficUpdate = require('../models/traffic');
const Road = require('../models/road');

const trafficConditions = {
    clear: 1,
    light: 2,
    moderate: 3,
    busy: 4,
    congested: 5,
    heavy: 6,
    "very heavy": 7,
    severe: 8,
    extreme: 9,
    gridlock: 10
};

exports.updateTrafficCondition = async (req, res) => {
    try {
        var {
            road_id,
            timestamp,
            traffic_condition
        } = req.body;
        

        // check to see if road with this id exists or not
        const roadExists = await Road.findById(road_id);
        if (!roadExists) {
            return res.status(400).json({ error: "Road with this ID does not exist." });
        }

        // so that Clear clear ClEar all are accepted
        traffic_condition = traffic_condition.toLowerCase();

        // only these strings are allowed, MY ASSUMPTION
        if (!trafficConditions.hasOwnProperty(traffic_condition)) {
            return res.status(400).json({ error: 
                ```Invalid traffic condition. Valid values are: 
                Clear: 1
                Light: 2
                Moderate: 3
                Busy: 4
                Congested: 5
                Heavy: 6
                Very Heavy: 7
                Severe: 8
                Extreme: 9
                Gridlock: 10." 
                ```
            });
        }

        const trafficUpdate = new TrafficUpdate({ road_id, timestamp, traffic_condition });

        await trafficUpdate.save();

        res.status(201).json(trafficUpdate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
