const Location = require('../models/location');

exports.addLocation = async (req, res) => {
    try {
        const { 
            name, 
            latitude, 
            longitude 
        } = req.body;
        
        const location = new Location({ name, latitude, longitude });
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
