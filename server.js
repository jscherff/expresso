// Import required modules.
const express = require('express');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import the base API router.
const apiRouter = require('./server/api');

// Instantiate the application and configure the listening port.
const app = express();
const PORT = process.env.PORT || 4000;

// Instantiate middleware for handling errors.
app.use(errorhandler());

// Instantiate middleware for parsing request body into JSON object.
app.use(bodyParser.json());

// Instantiate middleware for handling CORS requests.
app.use(cors());

// Mount the base API router.
app.use('/api', apiRouter);

// Start the server listening on the designated port.
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
