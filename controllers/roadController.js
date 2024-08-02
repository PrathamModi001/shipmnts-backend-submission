const Road = require('../models/road');
const Location = require('../models/location');
const { parse } = require('json2csv');

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

exports.addRoad = async (req, res) => {
    try {
        var {
            start_location_id,
            end_location_id,
            distance,
            traffic_condition
        } = req.body;

        // check to see if they actually exist or not,
        const startLocation = await Location.findById(start_location_id);
        const endLocation = await Location.findById(end_location_id);
        // if not then throw an error
        if (!startLocation) {
            return res.status(400).json({ error: "Start Location ID does not exist." });
        }
        if (!endLocation) {
            return res.status(400).json({ error: "End Location ID does not exist." });
        }

        // also check if start and end location are same because that ofc is not possible
        if (start_location_id === end_location_id) {
            return res.status(400).json({ error: "Start and End Location cannot be the same." });
        }

        // so that Clear clear ClEar all are accepted
        traffic_condition = traffic_condition.toLowerCase();

        // only these strings are allowed, MY ASSUMPTION
        if (!trafficConditions.hasOwnProperty(traffic_condition)) {
            return res.status(400).json({
                error:
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

        // assign weight based on traffic condition
        const trafficWeight = trafficConditions[traffic_condition];

        // check if a road doesnt already exist:
        const roadExists = await Road.findOne({ start_location_id, end_location_id });
        if (roadExists) {
            return res.status(400).json({ error: "Road between these locations already exists." });
        }

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

exports.generateCsvReportForRoad = async (req, res) => {
    try {
        const roadId = req.params.id;

        const road = await Road.findById(roadId);

        if (!road) {
            return res.status(404).json({ error: "Road not found." });
        }

        const csv = parse([{
            road_id: road._id,
            start_location_id: road.start_location_id,
            end_location_id: road.end_location_id,
            distance: road.distance,
            traffic_condition: road.traffic_condition
        }]);

        console.log(csv);

        // Set response headers for CSV file download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="road_${roadId}_traffic_condition.csv"`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
