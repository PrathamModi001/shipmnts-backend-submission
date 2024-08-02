const TrafficUpdate = require('../models/traffic');
const Road = require('../models/road');
const { parse } = require('json2csv');

exports.analyzeTrafficUpdates = async (req, res) => {
    try {
        // Define the time period for the report
        const period = req.query.period || '1h'; // Default to past hour
        const now = new Date();
        let startTime;

        switch (period) {
            case '1d':
                startTime = new Date(now.setDate(now.getDate() - 1));
                break;
            case '1h':
                startTime = new Date(now.setHours(now.getHours() - 1));
                break;
            default:
                return res.status(400).json({ error: 'Invalid period. Use "1h" or "1d".' });
        }

        // Fetch traffic updates for the specified period
        const trafficUpdates = await TrafficUpdate.find({ timestamp: { $gte: startTime } });

        if (!trafficUpdates.length) {
            return res.status(404).json({ error: "No traffic updates found for the specified period." });
        }

        // Fetch all roads to map road IDs to names
        const roads = await Road.find();
        const roadMap = new Map(roads.map(road => [road._id.toString(), road]));

        // Aggregate traffic data
        const trafficData = trafficUpdates.reduce((acc, update) => {
            const road = roadMap.get(update.road_id.toString());

            if (road) {
                if (!acc[road._id]) {
                    acc[road._id] = {
                        road_id: road._id,
                        start_location_id: road.start_location_id,
                        end_location_id: road.end_location_id,
                        distance: road.distance,
                        traffic_conditions: []
                    };
                }

                acc[road._id].traffic_conditions.push({
                    timestamp: update.timestamp,
                    traffic_condition: update.traffic_condition
                });
            }

            return acc;
        }, {});

        // Convert aggregated data to CSV format
        const csvData = Object.values(trafficData).map(road => ({
            road_id: road.road_id,
            start_location_id: road.start_location_id,
            end_location_id: road.end_location_id,
            distance: road.distance,
            traffic_conditions: road.traffic_conditions.map(condition => 
                `Timestamp: ${condition.timestamp}, Condition: ${condition.traffic_condition}`
            ).join('; ')
        }));

        const csv = parse(csvData);

        // Log CSV content for debugging
        console.log(csv);

        // Set response headers for CSV file download
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="traffic_report_${period}.csv"`);
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
