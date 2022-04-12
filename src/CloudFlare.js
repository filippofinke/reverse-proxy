const fetch = require("node-fetch");
const ipRangeCheck = require("ip-range-check");

const { log } = require("./Logger");

let cloudflareIps = null;

const fetchIps = async () => {
  log("Fetching Cloudflare IPs...");

  let response = await fetch("https://www.cloudflare.com/ips-v4");
  let text = await response.text();
  cloudflareIps = text.split("\n");

  log(`Fetched ${cloudflareIps.length} Cloudflare IPs`);
};

const isValidIp = (ip) => {
  if (cloudflareIps === null) {
    throw new Error("Fetch Cloudflare IPs first!");
  }

  return ipRangeCheck(ip, cloudflareIps);
};

module.exports = {
  fetchIps,
  isValidIp,
};
