module.exports = {
  port: 8080,
  services: [
    {
      hostname: "localhost:8080",
      target: "http://127.0.0.1:8081",
      timeout: 5000,
      endsWith: false,
      auth:{
        username: "admin",
        password: "admin"
      }
    },
    {
      hostname: "127.0.0.1:8080",
      target: "http://127.0.0.1:8081",
      timeout: 5000,
      endsWith: false
    }
  ]
};
