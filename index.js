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

proxy.on("proxyReq", (proxyReq, req, res, options) => {
	let timeout = setTimeout(() => proxyReq.destroy(), config.connectionTimeout);

	proxyReq.on("connect", () => {
		clearTimeout(timeout);
	});
});

const server = http.createServer((req, res) => {
	let hostname = req.headers.host;

	if (config.services[hostname]) {
		let target = config.services[hostname];
		log(`${hostname} -> ${target}`);
		proxy.web(req, res, { target }, (err, req, res) => {
			res.writeHead(501, { "Content-Type": "text/plain" });
			res.write("The requested service is unavailable.");
			res.end();
		});
	} else {
		log(`${hostname} -> not found!`);
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.write("Service not found.");
		res.end();
	}
});

server.listen(config.port, () => {
	console.log(`reverse-proxy listening on port ${config.port}`);
});
