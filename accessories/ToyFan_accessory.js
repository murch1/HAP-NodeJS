// HomeKit types required
var types = require("./types.js")
var exports = module.exports = {};
var PythonShell = require('python-shell');

var getRandomInt = function(max,min) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

var FAN_CHAR = {
	powerState: undefined,
	rotationSpeed: undefined};
	
var FAN_VAR = {
	device: 'Toy',
	isReady: false,
	powerState: false,
	rotationSpeed: 0,
	spReqInProgress: false,
	spUpdateInProgress: false,
	interval: getRandomInt(75000,50000),
	execute: function(value,accessory) { 
//		console.log("executed accessory: " + accessory + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/fan2.py", {
	    	args: [value,accessory]
	    	}, function (err,results) {
	    		console.log(FAN_VAR.device + ' Fan Speed Results: ' + results);
				var parsedResults = parseInt(results);
//				console.log('FAN_VAR.spReqInProgress: ',FAN_VAR.spReqInProgress);
//				console.log('FAN_VAR.spUpdateInProgress: ',FAN_VAR.spUpdateInProgress);
				if ((FAN_VAR.spReqInProgress == true && FAN_VAR.spUpdateInProgress == false) || (FAN_VAR.spReqInProgress == false && FAN_VAR.spUpdateInProgress == true)) {
					FAN_VAR.rotationSpeed = parsedResults;
					FAN_CHAR.rotationSpeed.updateValue(FAN_VAR.rotationSpeed);
				
					if (FAN_VAR.rotationSpeed > 0) {
						FAN_VAR.powerState = true;
					} else {
						FAN_VAR.powerState = false;
					}
					FAN_CHAR.powerState.updateValue(FAN_VAR.powerState);
				
					if (!FAN_VAR.isReady) {
						FAN_VAR.isReady = true;
					};
					
					if (FAN_VAR.spUpdateInProgress) FAN_VAR.spUpdateInProgress = false;
					if (FAN_VAR.spReqInProgress) FAN_VAR.spReqInProgress = false;
				} else if (FAN_VAR.spReqInProgress == true && FAN_VAR.spUpdateInProgress == true) {
					FAN_VAR.spUpdateInProgress = false;
				};
	    	});
	    }
	};

exports.accessory = {
  displayName: FAN_VAR.device + ' Room Fan',
  username: "CC:21:3D:EE:5E:FA",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: FAN_VAR.device + ' Room Fan',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Name",
      designedMaxLength: 255    
    },{
      cType: types.MANUFACTURER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "MurchHome",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Manufacturer",
      designedMaxLength: 255    
    },{
      cType: types.MODEL_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "V2.0",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Version Number",
      designedMaxLength: 255    
    },{
      cType: types.SERIAL_NUMBER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "A1S2NASF88EW",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Serial Number",
      designedMaxLength: 255    
    },{
      cType: types.IDENTIFY_CTYPE, 
      onUpdate: function(value) {
      	console.log('Identifying ',value);
      	},
      perms: ["pw"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Identify Accessory",
      designedMaxLength: 1    
    }]
  },{
    sType: types.FAN_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: FAN_VAR.device + ' Fan',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Characteristic/Siri Name",
      designedMaxLength: 255   
    },{
      cType: types.POWER_STATE_CTYPE,
      onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		FAN_CHAR.powerState = characteristic;
		if(!FAN_VAR.spReqInProgress) {
			FAN_VAR.spReqInProgress = true;
			FAN_VAR.execute('get',FAN_VAR.device);
		};
		},
      onUpdate: function(value) {
      	if (value != FAN_VAR.powerState) {
      		FAN_VAR.spReqInProgress = true; 
      		if(value) {
      			FAN_VAR.execute(2, FAN_VAR.device);
      		} else {
      			FAN_VAR.execute(0, FAN_VAR.device);
      		};
      	};
      	},
      onRead: function(callback) {
    	if (FAN_VAR.isReady) {
			callback(FAN_VAR.powerState);
		};
		},
      perms: ["pw","pr","ev"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Change the power state of the fan",
      designedMaxLength: 1    
    },{
      cType: types.ROTATION_SPEED_CTYPE,
      onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		FAN_CHAR.rotationSpeed = characteristic;
		if(!FAN_VAR.spReqInProgress) {
			FAN_VAR.spReqInProgress = true;
			FAN_VAR.execute('get',FAN_VAR.device);
		};
		},
	  onUpdate: function(value) {
	  	if (value != FAN_VAR.rotationSpeed) {
	  		FAN_VAR.spReqInProgress = true;
			FAN_VAR.execute(value, FAN_VAR.device);
		};
    	},
      onRead: function(callback) {
    	if (FAN_VAR.isReady) {
			callback(FAN_VAR.rotationSpeed);
		};
		},
    	perms: ["pw","pr","ev"],
		format: "int",
		initialValue: 0,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Change the speed  of the fan",
		designedMinValue: 0,
		designedMaxValue: 3,
		designedMinStep: 1,
		unit: "speed"
    }]
  }]
}

// Update the fan readings randomly between 50sec and 75sec
setInterval(function() {
  
	if (!FAN_VAR.spReqInProgress) {
		FAN_VAR.spUpdateInProgress = true;
		FAN_VAR.execute('get',FAN_VAR.device);
	}

//	if (FAN_VAR.spUpdateInProgress) console.log(FAN_VAR.device + ' Fan interval update in progress');
  
}, FAN_VAR.interval);