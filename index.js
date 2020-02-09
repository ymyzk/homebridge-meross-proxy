const axios = require("axios");

let Characteristic, Service;

module.exports = (homebridge) => {
  Characteristic = homebridge.hap.Characteristic;
  Service = homebridge.hap.Service;
  homebridge.registerAccessory("homebridge-meross-proxy", "meross-proxy", LightAccessory);
}

class LightAccessory {
  constructor(log, config) {
    this._log = log;
    this.name = config.name || "Meross Proxy";
    this.url = config.url;
    this.devices = config.devices;

    this._services = this.devices.map((d) => {
      const service = new Service.Switch(d.name);
      service.getCharacteristic(Characteristic.On)
        .on('get', this._getOn.bind(this, d.id))
        .on('set', this._setOn.bind(this, d.id));
      return service;
    });
  }

  getServices() {
    return this._services;
  }

  async _getOn(id, callback) {
    const res = await this._sendGetRequest(`/plugs/${id}`);
    callback(null, res.data.status);
  }

  async _setOn(id, on, callback) {
    const desiredState = Boolean(on);
    const command = desiredState ? "on" : "off";
    await this._sendPostRequest(`/plugs/${id}/turn_${command}`);
    callback();
  }

  async _sendGetRequest(path) {
    this._log(`Sending GET request: ${path}`);
    const url = `${this.url}${path}`;
    return axios.get(url);
  }

  async _sendPostRequest(path) {
    this._log(`Sending POST request: ${path}`);
    const url = `${this.url}${path}`;
    return axios.post(url);
  }
}
