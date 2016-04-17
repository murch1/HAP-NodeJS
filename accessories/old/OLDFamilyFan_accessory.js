var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var PythonShell = require('python-shell');
var device = 'FamilyFN';

// here's a hardware device that we'll expose to HomeKit
var FAN_OBJ = {
  powerOn: false,
  
  rotationSpeed: 0,
  
  forceUpdate: function() {
	fan
      .getService(Service.Fan)
      .setCharacteristic(Characteristic.RotationSpeed, FAN_OBJ.rotationSpeed)
      .setCharacteristic(Characteristic.On, FAN_OBJ.powerOn); 
  },

//  setSpeed: function(speed) {
//  	console.log("!Required speed: " + speed);
//    PythonShell.run("/accessories/python/fan.py", {
//    	args: [speed,device]
//    }, function (err,results) {
//		FAN_OBJ.rotationSpeed = parseInt(results);
//		console.log("!Speed is now: " + results);
//    }); 
//  },

//  setPowerOn: function(on) {
//  	var state = 0;
//  	if (on) {
//  		if (FAN_OBJ.rotationSpeed != 0) {
//  			state = FAN_OBJ.rotationSpeed;
//  		} else {
// 			state = 2;
//  		}
//  	} else {
//  		state = 0;
//  	}
//  	console.log("*Required speed: " + state);
//    PythonShell.run("/accessories/python/fan.py", {
//    	args: [state,device]
//    }, function (err,results) {
//    	if (results == '0') {
//    		FAN_OBJ.powerOn = false;
//    	} else {
//    		FAN_OBJ.powerOn = true;
//    	}
//    	FAN_OBJ.rotationSpeed = parseInt(results);
//    }); 
//  },
  
  identify: function() {
    console.log("Identify the fan!");
  }
}

// Generate a consistent UUID for our fan Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "fan".
var fanUUID = uuid.generate('hap-nodejs:accessories:fan');

// This is the Accessory that we'll return to HAP-NodeJS that represents our  fan.
var fan = exports.accessory = new Accessory('Family Fan', fanUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
fan.username = "1A:2B:3C:4D:3A:FF";
fan.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
fan
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Mercator")
  .setCharacteristic(Characteristic.Model, "Swift Mini")
  .setCharacteristic(Characteristic.SerialNumber, device);

// listen for the "identify" event for this Accessory
fan.on('identify', function(paired, callback) {
  FAN_OBJ.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
fan
  .addService(Service.Fan, "Fan") // services exposed to the user should have "names" like "fan" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    console.log("Set On-Characterisitc Power is: " + value);
    var state = 0;
    var err = null;
  	if (value != FAN_OBJ.powerOn) {
  		if (value == true) {
	  		state = 2;
	  	} else {
	  		state = 0;
	  	}
	    PythonShell.run("/accessories/python/fan.py", {
	    	args: [state,device]
	    }, function (err,results) {
	    	if (results == '0') {
	    		FAN_OBJ.powerOn = false;
	    	} else {
	    		FAN_OBJ.powerOn = true;
	    	}
	    	FAN_OBJ.rotationSpeed = parseInt(results);
	    	FAN_OBJ.forceUpdate();
	    	console.log("Set On-Fan speed is: " + results);
	    });
	} else {
		console.log("No power change required");
	}
    callback(); // Our fan is synchronous - this value has been successfully set
  });
  
fan
  .getService(Service.Fan) // services exposed to the user should have "names" like "fan" for us
  .getCharacteristic(Characteristic.RotationSpeed)
  .on('set', function(value, callback) {
    var err = null;
    console.log("Set speed-Characteristic Speed is: " + value);
    if (value != FAN_OBJ.rotationSpeed) {
	    PythonShell.run("/accessories/python/fan.py", {
	    	args: [value,device]
	    }, function (err,results) {
	    	if (results == '0') {
	    		FAN_OBJ.powerOn = false;
	    	} else {
	    		FAN_OBJ.powerOn = true;
	    	}
			FAN_OBJ.rotationSpeed = parseInt(results);
			FAN_OBJ.forceUpdate();
			console.log("Set Speed-Fan speed is: " + results);
	    });
	} else {
		console.log("No speed change required");
	}
    callback(); // Our fan is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
fan
  .getService(Service.Fan)
  .getCharacteristic(Characteristic.RotationSpeed)
  .on('get', function(callback) {

    // This event is emitted when you ask Siri directly the rotation speed of the fan. You might query
    // the fan hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems
    PythonShell.run("/accessories/python/fan.py", {
    	args: ['get',device]
    }, function (err,results) {
	   	console.log("Get-Fan speed is: " + results);
    	FAN_OBJ.rotationSpeed = parseInt(results);
    	callback(err, FAN_OBJ.rotationSpeed);
    });
  });
  
fan
  .getService(Service.Fan)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // This event is emitted when you ask Siri directly whether your fan is on or not. You might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems
    PythonShell.run("/accessories/python/fan.py", {
    	args: ['get',device]
    }, function (err,results) {
    	if (results == '0') {
    		FAN_OBJ.powerOn = false;
    		console.log("Fan is OFF");
    	} else {
    		FAN_OBJ.powerOn = true;
    		console.log("Fan is ON");
    	}
    	callback(err, FAN_OBJ.powerOn);
    });
  });

// Update our fan reading every 60 seconds
setInterval(function() {
  
    PythonShell.run("/accessories/python/fan.py", {
    	args: ['get',device]
    }, function (err,results) {
    	FAN_OBJ.rotationSpeed = parseInt(results);
    	if (results == '0') {
    		FAN_OBJ.powerOn = false;
    	} else {
    		FAN_OBJ.powerOn = true;
    	}
	   	console.log("Update-Fan speed is: " + FAN_OBJ.rotationSpeed + ", power is: " + FAN_OBJ.powerOn);
    });
    		
  // update the characteristic value so interested iOS devices can get notified
	FAN_OBJ.forceUpdate();
  
}, 60000);

