module.exports = {
  port: 8080,
  services: [
    {
      hostname: "test.com",
      target: "http://127.0.0.1:3000",
      timeout: 5000,
      endsWith: false,
    },
    {
      hostname: ["127.0.0.1", "localhost"],
      target: "http://127.0.0.1:3000",
    },
  ],
};
