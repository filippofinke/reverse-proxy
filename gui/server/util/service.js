class Service{
    constructor(path){
        this.config = require(path);
    }

    get(){
        return this.config;
    }
}

module.exports = Service;