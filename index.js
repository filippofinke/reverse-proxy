const fs = require("fs");
const http = require("http");
const httpProxy = require("http-proxy");

const { log } = require("./src/Logger");
const Cloudflare = require("./src/CloudFlare");

if (!fs.existsSync("config.js")) {
  log("ERROR! Please copy your config.sample.js to config.js");
  process.exit(0);
}
const config = require("./config.js");

const proxy = httpProxy.createProxyServer({});

const findService = (hostname) => {
  let service = config.services.find((s) => {
    if (typeof s.hostname === "string") {
      s.hostname = [s.hostname];
    }

    for (let host of s.hostname) {
      if (hostname && (hostname == host || (s.endsWith && hostname.endsWith(host)))) {
        return true;
      }
    }

    return false;
  });
  return service;
};

proxy.on("proxyReq", (proxyReq, req, res, options) => {
  let timeout = setTimeout(() => proxyReq.destroy(), options.timeout);

  proxyReq.on("connect", () => {
    clearTimeout(timeout);
  });
});

const server = http.createServer((req, res) => {
  let hostname = req.headers.host;
  let remoteAddress = req.socket.remoteAddress;

  delete req.headers["x-forwarded-for"];
  delete req.headers["x-forwarded-host"];
  delete req.headers["x-forwarded-proto"];

  if (req.headers["cf-connecting-ip"] && Cloudflare.isValidIp(remoteAddress)) {
    req.headers["x-forwarded-for"] = req.headers["cf-connecting-ip"];
  } else {
    req.headers["x-forwarded-for"] = req.socket.remoteAddress;
  }

  let service = findService(hostname);

  if (service) {
    let target = service.target;
    log(`${hostname} -> ${target}`);

    proxy.web(
      req,
      res,
      { target, timeout: service.timeout || config.connectionTimeout || 5000 },
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

// To refactor
server.on("upgrade", (req, socket, head) => {
  let hostname = req.headers.host;

  let service = findService(hostname);

  if (service) {
    log(`websocket -> ${hostname} -> ${service.target}`);
    proxy.ws(req, socket, head, {
      target: service.target,
    });
  } else {
    log(`websocket -> ${hostname} -> not found!`);
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.end();
  }
});

Cloudflare.fetchIps().then(() => {
  log(`Ready to serve ${config.services.length} services`);

  server.listen(config.port, "0.0.0.0", () => {
    log(`http listening on port ${config.port}`);
  });

  if (config.httpsPort) {
    const httpsProxy = httpProxy.createServer({
      target: {
        host: "localhost",
        port: config.port,
      },
      ssl: {
        key: fs.readFileSync("./certs/server.key", "utf8"),
        cert: fs.readFileSync("./certs/server.crt", "utf8"),
      },
    });

    httpsProxy.listen(config.httpsPort, () => {
      log("https listening on port " + config.httpsPort);
    });
  }
});
