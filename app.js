const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const keys = require('./config/keys');

const locationRoutes = require('./routes/locationRoutes');
const roadRoutes = require('./routes/roadRoutes');

const app = express();

app.use(bodyParser.json());

mongoose
    .connect(
        keys.mongoURI,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

app.use('/api', locationRoutes);
app.use('/api', roadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
