const Location = require('../models/location');

exports.addLocation = async (req, res) => {
    try {
        const { 
            name, 
            latitude, 
            longitude 
        } = req.body;
        
        // check to see if location with same name exists or not
        const locationExists = await Location.findOne({ name });
        if (locationExists) {
            return res.status(400).json({ error: "Location with this name already exists." });
        }

        // check to see if latitude and longitude are valid or not
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({ error: "Latitude must be between -90 and 90." });
        }
        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: "Longitude must be between -180 and 180." });
        }

        // check to see if latitude and longitude are same but name is different
        const locationExistsWithSameCoordinates = await Location
            .findOne({ latitude, longitude });
        if (locationExistsWithSameCoordinates) {
            return res.status(400).json({ error: "Location with these coordinates already exists." });
        }

        const location = new Location({ name, latitude, longitude });
        await location.save();
        res.status(201).json(location);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
