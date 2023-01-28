<h1 align="center">Welcome to reverse-proxy 👋</h1>

> A very simple reverse proxy

## Install

```sh
npm install
```

## Configuration
See [example configuration file](config.sample.js)

This configuration file exports an object that contains the following properties:

##### `port`
The port number that the server will listen on.

##### `services`
An array of service objects that define the routing rules for the server. Each service object has the following properties:

##### `hostname`
A string or array of strings representing the hostname(s) that this service will handle requests for.

##### `target`
A string representing the target URL that the server will proxy requests to.

##### `timeout`
An optional number representing the number of milliseconds before a request will timeout. If not specified, a default timeout of 10 seconds is used.

##### `endsWith`
An optional boolean value that determines if the hostname should match only if it ends with the hostname in the config. Defaults to false.

## Usage

```sh
npm run start
```

## Author

👤 **Filippo Finke**

- Website: https://filippofinke.ch
- Github: [@filippofinke](https://github.com/filippofinke)
- LinkedIn: [@filippofinke](https://linkedin.com/in/filippofinke)

## Todo
- [ ] Web Dashboard
  - [ ] Users
  - [ ] Usage
  - [ ] Requests

## Show your support

Give a ⭐️ if this project helped you!

<a href="https://www.buymeacoffee.com/filippofinke">
  <img src="https://github.com/filippofinke/filippofinke/raw/main/images/buymeacoffe.png" alt="Buy Me A McFlurry">
</a>
