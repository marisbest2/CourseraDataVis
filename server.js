const path = require('path')
const express = require('express');
const logger = require('morgan');
const app = express();

app.set('port', (process.env.PORT || 3000));

// Log the requests
app.use(logger('dev'));

// Serve static files
app.use(express.static(__dirname)); 
// app.get('*', (req, res) => res.render(path.join(__dirname,"weather.html")))

app.get('/', (request, response) => response.render('weather.html'));

// Fire it up!
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

