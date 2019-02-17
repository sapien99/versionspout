var express = require('express');
var bodyParser = require('body-parser')
var app = express();

// parse application/json
app.use(bodyParser.json())

app.all('/', function (req, res) {
  console.log(req.body);
  res.status(200).send();
});

app.listen(3001, function () {
  console.log('Example webhook listening on port 3001!');
});
