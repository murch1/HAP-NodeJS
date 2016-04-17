var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var PythonShell = require('python-shell');
var device = 'FamilyLT';

// here's a hardware device that we'll expose to HomeKit
var LIGHT_OBJ = {
  powerOn: false,

  setPowerOn: function(on) {
    PythonShell.run("/accessories/python/light.py", {
    	args: [on,device]
    }, function (err,results) {
//    	console.log("Turning the light %s!", on ? "on" : "off");
    	if (results == 'false') {
    		LIGHT_OBJ.powerOn = false;
    	} else {
    		LIGHT_OBJ.powerOn = true;
    	}
    }); 
  },
  
  identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:light');

// This is the Accessory that we'll return to HAP-NodeJS that represents our  light.
var light = exports.accessory = new Accessory('Family Light', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "1A:2B:3C:4D:5E:FF";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Mercator")
  .setCharacteristic(Characteristic.Model, "Macedon")
  .setCharacteristic(Characteristic.SerialNumber, device);

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  LIGHT_OBJ.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Light") // services exposed to the user should have "names" like "Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    LIGHT_OBJ.setPowerOn(value);
    callback(); // Our Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems
    PythonShell.run("/accessories/python/light.py", {
    	args: ['get',device]
    }, function (err,results) {
//    	console.log("Turning the light %s!", on ? "on" : "off");
    	if (results == 'false') {
    		LIGHT_OBJ.powerOn = false;
//    		console.log("Are we on? No.");
      		callback(err, false);
    	} else {
    		LIGHT_OBJ.powerOn = true;
//    		console.log("Are we on? Yes.");
      		callback(err, true);
    	}
    });
  });

