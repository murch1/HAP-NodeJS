var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var PythonShell = require('python-shell');
var device = 'DSFamily';

// here's a humidity sensor device that we'll expose to HomeKit
var HUM_SENSOR = {
  CurrentRelativeHumidity: 20,
  
  getHumidity: function() { 
//    console.log("Getting the current humidity!");
    PythonShell.run("/accessories/python/temphum.py", {
    	args: ['hum',device]
    }, function (err,results) {
    	hum = parseInt(results);
//    	console.log('*Humidity = ' + hum);
    	if (hum) {
    		HUM_SENSOR.CurrentRelativeHumidity = hum;
    	} else {
    		HUM_SENSOR.CurrentRelativeHumidity = -99;
    	}
    }); 
  },

}

// Generate a consistent UUID for our Humidity Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "humidity-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:humidity-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Family Humidity', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C2:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual HumiditySensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.HumiditySensor)
  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on('get', function(callback) {
    
    // return our current value
    PythonShell.run("/accessories/python/temphum.py", {
    	args: ['hum',device]
    }, function (err,results) {
//    	console.log('Humidity = ' + results);
    	hum = parseInt(results);
    	if (hum) {
    		HUM_SENSOR.CurrentRelativeHumidity = hum;
    		callback(null, HUM_SENSOR.CurrentRelativeHumidity);
    	} else {
    		HUM_SENSOR.CurrentRelativeHumidity = -99;
    		callback(null, HUM_SENSOR.CurrentRelativeHumidity);
    	}
    });
    
  });

// Update our humidity reading every 60 seconds
setInterval(function() {
  
  HUM_SENSOR.getHumidity();
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, HUM_SENSOR.CurrentRelativeHumidity);
  
}, 60000);
