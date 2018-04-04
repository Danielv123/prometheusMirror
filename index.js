const http = require("http");

const queryString = require("query-string");
const Prometheus = require('prom-client');

const prometheusPrefix = "mirror_";
Prometheus.collectDefaultMetrics({ timeout: 10000 }); // collects RAM usage etc every 10 s

const gauges = {};


http.createServer(function (req, res) {
	if (req.method == 'POST') {
		console.log("POST");
		// req.setHeader("Access-Control-Allow-Origin", "*");
		var body = '';
		req.on('data', function (data) {
			body += data;
			// console.log("Partial body: " + body);
		});
		req.on('end', function () {
			body = queryString.parse(body);
			console.log("Body: " + JSON.stringify(body));
			if(body.name && body.value){
				if(!Array.isArray(body.labelNames)) body.labelNames = [];
				if(!gauges[body.name]){
					gauges[body.name] = new Prometheus.Gauge({
						name: prometheusPrefix + body.name + "_gauge",
						help: "Automatically generated value",
						labelNames: body.labelNames,
					});
				}
				gauges[body.name].set(body.value);
			}
		});
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end('post received');
	} else {
		console.log("GET");
		res.end(Prometheus.register.metrics());
	}
}).listen(8053); //the server object listens on port 8053