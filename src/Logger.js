const log = (...args) => {
  let date = new Date();
  console.log(date.toISOString(), "|", ...args);
};

module.exports = { log };
