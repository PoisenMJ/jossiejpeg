const mongoose = require('mongoose');
const config = require('../config.json');

mongoose.connect(config.dbURI);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
    console.log(`Mongoose connection error: ${err}`);
    process.exit(1);
});