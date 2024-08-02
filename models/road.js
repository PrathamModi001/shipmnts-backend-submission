const mongoose = require('mongoose');

const roadSchema = new mongoose.Schema({
    start_location_id:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location', required: true
    },

    end_location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location', required: true
    },

    distance: {
        type: Number,
        required: true
    },
    traffic_condition: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Road', roadSchema);
