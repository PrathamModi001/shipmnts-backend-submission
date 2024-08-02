const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
    road_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Road',
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    traffic_condition: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('TrafficUpdate', trafficSchema);
