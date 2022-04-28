const express = require('express');
const cors = require('cors');
const Service = require('./util/service');
const config = require('./config.json');
const service = new Service(config.path);

const app = express();

app.use(express.json());
app.use(express.static('../build'));
app.use(cors());

app.get('/list', async (req, res) => {
    let list = service.get();
    res.json(list.services);
})

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
})