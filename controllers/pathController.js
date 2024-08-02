const Location = require('../models/location');
const Road = require('../models/road');
const { Graph } = require('graphlib');

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

// Assume speeds based on traffic conditions
const averageSpeeds = {
    clear: 60,
    light: 50,
    moderate: 40,
    busy: 30,
    congested: 20,
    heavy: 15,
    "very heavy": 10,
    severe: 5,
    extreme: 2,
    gridlock: 1
};

// Dijkstra's algorithm implementation
function dijkstra(graph, start) {
    const distances = {};
    const previous = {};
    const nodes = new Set();

    graph.nodes().forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
        nodes.add(node);
    });
    distances[start] = 0;

    while (nodes.size) {
        const closestNode = Array.from(nodes).reduce((minNode, node) => {
            if (minNode === null || distances[node] < distances[minNode]) {
                return node;
            }
            return minNode;
        }, null);

        nodes.delete(closestNode);

        if (distances[closestNode] === Infinity) {
            break;
        }

        graph.neighbors(closestNode).forEach(neighbor => {
            const weight = graph.edge(closestNode, neighbor);
            const alternative = distances[closestNode] + weight;

            if (alternative < distances[neighbor]) {
                distances[neighbor] = alternative;
                previous[neighbor] = closestNode;
            }
        });
    }

    return { distances, previous };
}

exports.getShortestPath = async (req, res) => {
    try {
        const { start_location_id, end_location_id } = req.query;

        // Validate input
        if (!start_location_id || !end_location_id) {
            return res.status(400).json({ error: "Both start and end location IDs are required." });
        }

        // Check if start_location_id and end_location_id exist
        const [startLocation, endLocation] = await Promise.all([
            Location.findById(start_location_id),
            Location.findById(end_location_id)
        ]);

        if (!startLocation || !endLocation) {
            return res.status(400).json({ error: "One or both location IDs do not exist." });
        }

        // Fetch all roads and build the graph
        const roads = await Road.find().populate('start_location_id end_location_id');
        const graph = new Graph();

        roads.forEach(road => {
            const weight = calculateRoadWeight(road);
            graph.setEdge(road.start_location_id._id.toString(), road.end_location_id._id.toString(), weight);
            graph.setEdge(road.end_location_id._id.toString(), road.start_location_id._id.toString(), weight); // for undirected graph
        });

        // Calculate shortest path using Dijkstra's algorithm
        const { distances, previous } = dijkstra(graph, start_location_id.toString());

        if (distances[end_location_id.toString()] === Infinity) {
            return res.status(404).json({ error: "No path found between the locations." });
        }

        // Reconstruct path
        const path = reconstructPath(previous, start_location_id.toString(), end_location_id.toString());

        // Calculate total distance and time
        const { totalDistance, totalTime } = calculateDistanceAndTime(path, roads);

        res.status(200).json({
            path: path,
            total_distance: parseFloat(totalDistance.toFixed(2)),
            estimated_time: parseFloat(totalTime.toFixed(2))
        });
    } catch (error) {
        console.error('Error in getShortestPath:', error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};

function calculateRoadWeight(road) {
    return road.distance + trafficConditions[road.traffic_condition];
}

function reconstructPath(previous, startId, endId) {
    const path = [];
    let currentNode = endId;

    while (currentNode) {
        path.unshift(currentNode);
        currentNode = previous[currentNode];
    }

    return path;
}

function calculateDistanceAndTime(path, roads) {
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
        const currentLocation = path[i];
        const nextLocation = path[i + 1];

        const road = roads.find(r =>
            (r.start_location_id._id.toString() === currentLocation && r.end_location_id._id.toString() === nextLocation) ||
            (r.start_location_id._id.toString() === nextLocation && r.end_location_id._id.toString() === currentLocation)
        );

        if (road) {
            totalDistance += road.distance;
            const roadAverageSpeed = averageSpeeds[road.traffic_condition];
            totalTime += (road.distance / roadAverageSpeed) * 60; // convert time to minutes
        }
    }

    return { totalDistance, totalTime };
}