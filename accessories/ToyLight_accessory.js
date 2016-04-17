// HomeKit types required
var types = require("./types.js")
var exports = module.exports = {};
var PythonShell = require('python-shell');

var getRandomInt = function(max,min) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

var LIGHT_CHAR = {
	powerState: undefined};
	
var LIGHT_VAR = {
	device: 'Toy',
	isReady: false,
	powerState: false,
	reqInProgress: false,
	updateInProgress: false,
	interval: getRandomInt(75000,50000),
	execute: function(value,accessory) { 
//		console.log("executed accessory: " + accessory + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/light2.py", {
	    	args: [value,accessory]
	    	}, function (err,results) {
				var parsedResults = String(results).toLowerCase();
				console.log(LIGHT_VAR.device + ' Light Results: ' + parsedResults);
//				console.log('LIGHT_VAR.reqInProgress: ',LIGHT_VAR.reqInProgress);
//				console.log('LIGHT_VAR.updateInProgress: ',LIGHT_VAR.updateInProgress);
				if ((LIGHT_VAR.reqInProgress == true && LIGHT_VAR.updateInProgress == false) || (LIGHT_VAR.reqInProgress == false && LIGHT_VAR.updateInProgress == true)) {				
					if (parsedResults == 'true') {
						LIGHT_VAR.powerState = true;
					} else {
						LIGHT_VAR.powerState = false;
					}
					LIGHT_CHAR.powerState.updateValue(LIGHT_VAR.powerState);
				
					if (!LIGHT_VAR.isReady) {
						LIGHT_VAR.isReady = true;
					};
					
					if (LIGHT_VAR.updateInProgress) LIGHT_VAR.updateInProgress = false;
					if (LIGHT_VAR.reqInProgress) LIGHT_VAR.reqInProgress = false;
				} else if (LIGHT_VAR.reqInProgress == true && LIGHT_VAR.updateInProgress == true) {
					LIGHT_VAR.updateInProgress = false;
				};
	    	});
	    }
	};

exports.accessory = {
  displayName: LIGHT_VAR.device + ' Room Light',
  username: "CC:23:3D:EE:5E:FA",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: LIGHT_VAR.device + ' Room Light',
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
    sType: types.LIGHTBULB_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: LIGHT_VAR.device + ' Light',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Characteristic/Siri Name",
      designedMaxLength: 255   
    },{
      cType: types.POWER_STATE_CTYPE,
      onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		LIGHT_CHAR.powerState = characteristic;
		LIGHT_VAR.reqInProgress = true;
		LIGHT_VAR.execute('get',LIGHT_VAR.device);
		},
      onUpdate: function(value) {
      	if (value != LIGHT_VAR.powerState) {
      		LIGHT_VAR.reqInProgress = true; 
      		LIGHT_VAR.execute(value, LIGHT_VAR.device);
      	};
      	},
      onRead: function(callback) {
    	if (LIGHT_VAR.isReady) {
			callback(LIGHT_VAR.powerState);
		};
		},
      perms: ["pw","pr","ev"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Change the power state of the light",
      designedMaxLength: 1    
    }]
  }]
}

// Update the light status randomly between 50sec and 75sec
setInterval(function() {
  
	if (!LIGHT_VAR.reqInProgress) {
		LIGHT_VAR.updateInProgress = true;
		LIGHT_VAR.execute('get',LIGHT_VAR.device);
	}

//	if (LIGHT_VAR.updateInProgress) console.log(LIGHT_VAR.device + ' Light interval update in progress');
  
}, LIGHT_VAR.interval);