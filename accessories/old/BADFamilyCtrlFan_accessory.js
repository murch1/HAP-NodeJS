var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var PythonShell = require('python-shell');
var device = 'FamilyFN';

// here's a hardware device that we'll expose to HomeKit
var FANCTRL_OBJ = {
  AutoManual: false,	// Manual = false, Automatic = true
  
  targetTemp: 150,
  
  forceUpdate: function() {
	fan
      .getService(Service.Fan)
      .setCharacteristic(Characteristic.RotationSpeed, FANCTRL_OBJ.targetTemp)
      .setCharacteristic(Characteristic.On, FANCTRL_OBJ.AutoManual); 
  },

//  setTemp: function(temp) {
//    PythonShell.run("/accessories/python/fanctrl.py", {
//    	args: [temp,device]
//    }, function (err,results) {
//		FANCTRL_OBJ.targetTemp = parseInt(results);
//		FANCTRL_OBJ.forceUpdate;
//    }); 
//  },

//  setAutoManual: function(on) {
//    PythonShell.run("/accessories/python/fanctrl.py", {
//    	args: [on,device]
//    }, function (err,results) {
//		if (results == 'true') {
//			FANCTRL_OBJ.AutoManual = true;
//		} else {
//			FANCTRL_OBJ.AutoManual = false;
//		}	
//		FANCTRL_OBJ.forceUpdate;
//    }); 
//  },
  
  identify: function() {
    console.log("Identify the fan controller!");
  }
}

// Generate a consistent UUID for our fan Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "fanctrl".
var fanUUID = uuid.generate('hap-nodejs:accessories:fanctrl');

// This is the Accessory that we'll return to HAP-NodeJS that represents our  fan.
var fan = exports.accessory = new Accessory('Family Fan Control', fanUUID);
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
fan.username = "1A:2B:3C:4D:3A:FE";
fan.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
fan
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Mercator")
  .setCharacteristic(Characteristic.Model, "Swift Mini")
  .setCharacteristic(Characteristic.SerialNumber, device);

// listen for the "identify" event for this Accessory
fan.on('identify', function(paired, callback) {
  FANCTRL_OBJ.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
fan
  .addService(Service.Fan, "Fan Control") // services exposed to the user should have "names" like "fan" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    console.log("Set On-Characterisitc Power is: " + value);
    var state = 0;
    var err = null;
  	if (value != FANCTRL_OBJ.AutoManual) {
  		if (value == true) {
	  		state = 2;
	  	} else {
	  		state = 0;
	  	}
	    PythonShell.run("/accessories/python/fanctrl.py", {
	    	args: [state,device]
	    }, function (err,results) {
	    	if (results == '0') {
	    		FANCTRL_OBJ.AutoManual = false;
	    	} else {
	    		FANCTRL_OBJ.AutoManual = true;
	    	}
	    	FANCTRL_OBJ.targetTemp = parseInt(results);
	    	FANCTRL_OBJ.forceUpdate();
	    	console.log("Set On-Fan speed is: " + results);
	    });
	} else {
		console.log("No power change required");
	}
    callback(); // Our fan is synchronous - this value has been successfully set
  });

var pref = ({
    format: Characteristic.Formats.INT,
    unit: Characteristic.Units.CELCIUS,
    maxValue: 35,
    minValue: 15,
    minStep: 1,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
  });
  
fan
  .getService(Service.Fan) // services exposed to the user should have "names" like "fan" for us
  .getCharacteristic(Characteristic.RotationSpeed)
  .on('set', function(value, callback) {
    var err = null;
    console.log("Set speed-Characteristic Speed is: " + value);
    if (value != FANCTRL_OBJ.targetTemp) {
	    PythonShell.run("/accessories/python/fanctrl.py", {
	    	args: [value,device]
	    }, function (err,results) {
	    	if (results == '0') {
	    		FANCTRL_OBJ.AutoManual = false;
	    	} else {
	    		FANCTRL_OBJ.AutoManual = true;
	    	}
			FANCTRL_OBJ.targetTemp = parseInt(results);
			FANCTRL_OBJ.forceUpdate();
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
    PythonShell.run("/accessories/python/fanctrl.py", {
    	args: ['get',device]
    }, function (err,results) {
	   	console.log("Get-Fan speed is: " + results);
    	FANCTRL_OBJ.targetTemp = parseInt(results);
    	callback(err, FANCTRL_OBJ.targetTemp);
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
    PythonShell.run("/accessories/python/fanctrl.py", {
    	args: ['get',device]
    }, function (err,results) {
    	if (results == '0') {
    		FANCTRL_OBJ.AutoManual = false;
    		console.log("Fan is OFF");
    	} else {
    		FANCTRL_OBJ.AutoManual = true;
    		console.log("Fan is ON");
    	}
    	callback(err, FANCTRL_OBJ.AutoManual);
    });
  });

// Update our fan reading every 60 seconds
setInterval(function() {
  
    PythonShell.run("/accessories/python/fanctrl.py", {
    	args: ['get',device]
    }, function (err,results) {
    	FANCTRL_OBJ.targetTemp = parseInt(results);
    	if (results == '0') {
    		FANCTRL_OBJ.AutoManual = false;
    	} else {
    		FANCTRL_OBJ.AutoManual = true;
    	}
	   	console.log("Update-Fan speed is: " + FANCTRL_OBJ.targetTemp + ", power is: " + FANCTRL_OBJ.AutoManual);
    });
    		
  // update the characteristic value so interested iOS devices can get notified
	FANCTRL_OBJ.forceUpdate();
  
}, 60000);

console.log(fan);