const fs = require("fs");
const http = require("http");
const httpProxy = require("http-proxy");

const log = (text) => {
	let date = new Date();
	console.log(date.toISOString() + " | " + text);
};

if (!fs.existsSync("config.js")) {
	log("ERROR! Please copy your config.sample.js to config.js");
	process.exit(0);
}
const config = require("./config.js");

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
	let hostname = req.headers.host;

	if (config.services[hostname]) {
		let target = config.services[hostname];
		log(`${hostname} -> ${target}`);
		return proxy.web(req, res, { target }, (err, req, res) => {
			log(`${hostname} -> is offline!`);
			return res.end(`The requested service is not responding.`);
		});
	}

	log(`${hostname} -> not found!`);
	return res.end("Service not found");
});

server.listen(config.port, () => {
	console.log(`reverse-proxy listening on port ${config.port}`);
});
