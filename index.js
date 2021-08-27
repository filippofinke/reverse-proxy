const fs = require("fs");
const http = require("http");
const httpProxy = require("http-proxy");
const fetch = require("node-fetch");
const ipRangeCheck = require("ip-range-check");

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

let cloudflareIps = [];

fetch("https://www.cloudflare.com/ips-v4")
  .then((r) => r.text())
  .then((text) => {
    cloudflareIps = text.split("\n");
  });

proxy.on("proxyReq", (proxyReq, req, res, options) => {
  let timeout = setTimeout(() => proxyReq.destroy(), options.timeout);

  proxyReq.on("connect", () => {
    clearTimeout(timeout);
  });
});

const server = http.createServer((req, res) => {
  let hostname = req.headers.host;

  delete req.headers["x-forwarded-for"];
  delete req.headers["x-forwarded-host"];
  delete req.headers["x-forwarded-proto"];

  if (
    ipRangeCheck(req.socket.remoteAddress, cloudflareIps) &&
    req.headers["cf-connecting-ip"]
  ) {
    req.headers["x-forwarded-for"] = req.headers["cf-connecting-ip"];
  } else {
    req.headers["x-forwarded-for"] = req.socket.remoteAddress;
  }

  let service = config.services.find((s) => {
    if (typeof s.hostname === "string") {
      s.hostname = [s.hostname];
    }

    for (let host of s.hostname) {
      console.log(hostname, host);
      if (hostname == host || (s.endsWith && hostname.endsWith(host))) {
        return true;
      }
    }

    return false;
  });

  console.log(service);

  if (service) {
    let target = service.target;
    log(`${hostname} -> ${target}`);
    proxy.web(
      req,
      res,
      { target, timeout: service.timeout || config.connectionTimeout },
      (err, req, res) => {
        res.writeHead(503, { "Content-Type": "text/plain" });
        res.write("The requested service is unavailable.");
        res.end();
      }
    );
  } else {
    log(`${hostname} -> not found!`);
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.write("Service not found.");
    res.end();
  }
});

server.listen(config.port, "0.0.0.0", () => {
  console.log(`reverse-proxy listening on port ${config.port}`);
});
