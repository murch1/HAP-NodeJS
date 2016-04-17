var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var PythonShell = require('python-shell');
var device = 'Open';

// here's a temperature sensor device that we'll expose to HomeKit
var TEMP_SENSOR = {
  currentTemperature: 20.0,
  
  getTemperature: function() { 
    PythonShell.run("/accessories/python/temphum.py", {
    	args: ['temp',device]
    }, function (err,results) {
    	temp = parseFloat(results);
//    	console.log('*Temperature = ' + temp);
    	if (temp) {
    		TEMP_SENSOR.currentTemperature = temp;
    	} else {
    		TEMP_SENSOR.currentTemperature = -99.0;
    	}
    }); 
  },

}

// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('OpenWeather Temperature', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FC";
sensor.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
sensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Open Weather")
  .setCharacteristic(Characteristic.Model, "Weather API")
  .setCharacteristic(Characteristic.SerialNumber, "GladstoneTemp");

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    PythonShell.run("/accessories/python/temphum.py", {
    	args: ['temp',device]
    }, function (err,results) {
//    	console.log('Temperature = ' + results);
    	temp = parseFloat(results);
    	if (temp) {
    		TEMP_SENSOR.currentTemperature = temp;
    		callback(null, TEMP_SENSOR.currentTemperature);
    	} else {
    		TEMP_SENSOR.currentTemperature = -99.0;
    		callback(null, TEMP_SENSOR.currentTemperature);
    	}
    });
    
  });

// Update our temperature reading every 60 seconds
setInterval(function() {
  
  TEMP_SENSOR.getTemperature();
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, TEMP_SENSOR.currentTemperature);
  
}, 60000);
