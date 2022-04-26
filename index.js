const fs = require("fs");
const express = require("express");
const httpProxy = require("http-proxy");
const fetch = require("node-fetch");
const ipRangeCheck = require("ip-range-check");

const app = express();

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

app.use(auth);
app.all("*", (req, res, head) => {
  let hostname = req.headers.host;
  delete req.headers["x-forwarded-for"];
  delete req.headers["x-forwarded-host"];
  delete req.headers["x-forwarded-proto"];

  if (ipRangeCheck(req.socket.remoteAddress, cloudflareIps) && req.headers["cf-connecting-ip"]) {
    req.headers["x-forwarded-for"] = req.headers["cf-connecting-ip"];
  } else {
    req.headers["x-forwarded-for"] = req.socket.remoteAddress;
  }
  let service = getService(hostname);
  if (service) {
    let target = service.target;
    log(`${hostname} -> ${target}`);
    const proxyWebOption = {
      target,
      timeout: service.timeout || config.connectionTimeout || 5000
    };
    proxy.web(req, res, proxyWebOption, (err, req, res) => {
      res.writeHead(503, { "Content-Type": "text/plain" });
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

// To refactor
app.on("upgrade", (req, socket, head) => {
  let hostname = req.headers.host;
  let service = getService(hostname);
  if (service) {
    log(`websocket -> ${hostname} -> ${service.target}`);
    proxy.ws(req, socket, head, {
      target: service.target,
    });
  }
});

app.listen(config.port, "0.0.0.0", () => {
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

function auth(req, res, next) {
  let hostname = req.headers.host;
  let path = req.path;
  let service = getService(hostname);
  console.log(path);
  if (service) {
    console.log(service)
    if (service.ignore && service.ignore.includes(path)) {
      console.log(`${hostname} -> ${path} -> ignored`);
      next();
      return;
    }
    if (service.auth) {
      if (service.authOnly && !service.authOnly.includes(path)) {
        console.log(`${hostname} -> ${path} -> authOnly`);
        next();
        return;
      }
      var auth;
      if (req.headers.authorization) {
        auth = new Buffer(req.headers.authorization.substring(6), 'base64').toString().split(':');
      }
      if (!auth || auth[0] !== service.auth.username || auth[1] !== service.auth.password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
      } else {
        next();
      }
    } else {
      next();
      return
    }
  } else {
    next();
    return
  }
}

function getService(hostname) {
  return config.services.find((s) => {
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
}