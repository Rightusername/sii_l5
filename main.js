var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var Net = require('./net');
var net = new Net();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


app.get('/', function (req, res) {
	res.sendFile( __dirname + "/public/" + "index.html" );
});

app.get('/settings', function(req, res){
    var settings = {
        width: net.width,
        height: net.height
    }
    res.send(JSON.stringify(settings));
});

app.post('/canvas', function(req, res){
    net.inputs = JSON.parse( req.body.canvas );
    net.calcNeurons();
    net.calcOutputs();
    res.send(net.outputs);
});


app.listen(3000, function () {
	console.log('liste----n on 3000');
});