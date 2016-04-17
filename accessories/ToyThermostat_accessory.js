// HomeKit types required
var types = require("./types.js");
var exports = module.exports = {};
var PythonShell = require('python-shell');

var getRandomInt = function(max,min) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

var THERMO_CHAR = {
	currentState: undefined,
	targetState: undefined,
	currentTemp: undefined,
	targetTemp: undefined,
	currentHum: undefined};
	
var THERMO_VAR = {
	device: 'Toy',
	isReady: false,
	autoMan: false,
	amReqInProgress: false,
	amUpdateInProgress: false,
	currentTemp: 25.0,
	targetTemp: 25.0,
	ttReqInProgress: false,
	ttUpdateInProgress: false,
	interval: getRandomInt(75000,50000),
	currentHum: 50,
	currentSpeed: 0,
	execute: function(characteristic,value,accessory) { 
//		console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/fanctrl.py", {
	    	args: [characteristic,value,accessory]
	    	}, function (err,results) {
	    		console.log(THERMO_VAR.device + ' Thermostat Results: ' + results[0]);
				var parsedResults = results[0].split(",");
				if (parsedResults[2]) {
					THERMO_VAR.currentTemp = parseFloat(parsedResults[2]);
					THERMO_CHAR.currentTemp.updateValue(THERMO_VAR.currentTemp);	
				};
				if (parsedResults[3]) {
					THERMO_VAR.currentHum = parseInt(parsedResults[3]);
					THERMO_CHAR.currentHum.updateValue(THERMO_VAR.currentHum);	
				};
				if (parsedResults[4]) {
					THERMO_VAR.currentSpeed = parseInt(parsedResults[4]);					
				};
				if (!THERMO_VAR.isReady) {
					THERMO_VAR.isReady = true;
				};
				
				if (characteristic == 'autoMan') {
//					console.log('amReqInProgress: ',THERMO_VAR.amReqInProgress);
//					console.log('updateInProgress: ',THERMO_VAR.amUpdateInProgress);
					if ((THERMO_VAR.amReqInProgress == true && THERMO_VAR.amUpdateInProgress == false) || (THERMO_VAR.amReqInProgress == false && THERMO_VAR.amUpdateInProgress == true)) {
						if (parsedResults[0] == 'true') {
							THERMO_VAR.autoMan = true;
							THERMO_CHAR.currentState.updateValue(2);
							THERMO_CHAR.targetState.updateValue(2);
						} else if (parsedResults[0] == 'false') {
							THERMO_VAR.autoMan = false;
							THERMO_CHAR.currentState.updateValue(0);
							THERMO_CHAR.targetState.updateValue(0);
						};
						if (THERMO_VAR.amUpdateInProgress) THERMO_VAR.amUpdateInProgress = false;
						if (THERMO_VAR.amReqInProgress) THERMO_VAR.amReqInProgress = false;
					} else if (THERMO_VAR.amReqInProgress == true && THERMO_VAR.amUpdateInProgress == true) {
						THERMO_VAR.amUpdateInProgress = false;
					};
				} else {
					if ((THERMO_VAR.ttReqInProgress == true && THERMO_VAR.ttUpdateInProgress == false) || (THERMO_VAR.ttReqInProgress == false && THERMO_VAR.ttUpdateInProgress == true)) { 
						THERMO_VAR.targetTemp = parseFloat(parsedResults[1]);
						THERMO_CHAR.targetTemp.updateValue(THERMO_VAR.targetTemp);
						THERMO_VAR.ttUpdateInProgress = false;
						THERMO_VAR.ttReqInProgress = false;
					} else if (THERMO_VAR.ttReqInProgress == true && THERMO_VAR.ttUpdateInProgress == true) {
						THERMO_VAR.ttUpdateInProgress = false;
					};
				};
	    	});
	    }
	};
	
exports.accessory = {
  displayName: THERMO_VAR.device + ' Thermostat',
  username: "CA:3E:BC:4C:5D:21",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: THERMO_VAR.device + ' Thermostat',
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
      initialValue: "V1.0",
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
    sType: types.THERMOSTAT_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: THERMO_VAR.device + ' Control',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Characteristic/Siri Name",
      designedMaxLength: 255   
    },{
      cType: types.CURRENTHEATINGCOOLING_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		THERMO_CHAR.currentState = characteristic;
		THERMO_VAR.amReqInProgress = true;
		THERMO_VAR.execute('autoMan','get',THERMO_VAR.device);
		},
	  onRead: function(callback) {
    	if (THERMO_VAR.isReady) {
			if (THERMO_VAR.autoMan){
				callback(2);
			} else {
				callback(0);
			};
		};
		
		},
      perms: ["pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Mode",
      designedMaxLength: 1,
      designedMinValue: 0,
      designedMaxValue: 2,
      designedMinStep: 1,    
    },{
      cType: types.TARGETHEATINGCOOLING_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		THERMO_CHAR.targetState = characteristic;
		},
      onUpdate: function(value) {
		if (value != THERMO_CHAR.currentState.value) {
			THERMO_VAR.amReqInProgress = true;
			switch(value) {
				case 0: THERMO_CHAR.currentState.updateValue(value); THERMO_VAR.autoMan = false; break;
				case 1: THERMO_CHAR.currentState.updateValue(0); THERMO_VAR.autoMan = false; break;
				case 2: THERMO_CHAR.currentState.updateValue(value); THERMO_VAR.autoMan = true; break;
				case 3: THERMO_CHAR.currentState.updateValue(2); THERMO_VAR.autoMan = true; break;
				default: THERMO_CHAR.currentState.updateValue(value); THERMO_VAR.autoMan = false; break;
			};
			THERMO_VAR.execute('autoMan',THERMO_VAR.autoMan,THERMO_VAR.device);
      	};
		},
	  onRead: function(callback) {
    	if (THERMO_VAR.isReady) {
			if (THERMO_VAR.autoMan){
				callback(2);
			} else {
				callback(0);
			};
		};
    	},
      perms: ["pw","pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Mode",
      designedMinValue: 0,
      designedMaxValue: 3,
      designedMinStep: 1,
    },{
      cType: types.CURRENT_TEMPERATURE_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		THERMO_CHAR.currentTemp = characteristic;
		},
	  onRead: function(callback) { 
    	if (THERMO_VAR.isReady) callback(THERMO_VAR.currentTemp);
    	},
      perms: ["pr","ev"],
      format: "float",
      initialValue: 20.0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Temperature",
      designedMinValue: -99.0,
      designedMaxValue: 99.0,
      designedMinStep: 0.1,
      unit: "celsius"
    },{
      cType: types.TARGET_TEMPERATURE_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		THERMO_CHAR.targetTemp = characteristic;
		THERMO_VAR.ttReqInProgress = true;
		THERMO_VAR.execute('setpoint','get',THERMO_VAR.device);
		},
      onUpdate: function(value) { 
		THERMO_VAR.ttReqInProgress = true;
		if (value != THERMO_VAR.targetTemp) THERMO_VAR.execute('setpoint',value,THERMO_VAR.device);
		},
	  onRead: function(callback) {
    	if (THERMO_VAR.isReady) callback(THERMO_VAR.targetTemp);
    	},
      perms: ["pw","pr","ev"],
      format: "float",
      initialValue: 25.0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Temperature",
      designedMinValue: 15.0,
      designedMaxValue: 35.0,
      designedMinStep: 0.5,
      unit: "celsius"
    },{
      cType: types.TEMPERATURE_UNITS_CTYPE,
      onUpdate: function(value) {  
		},
      perms: ["pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Temperature Unit"
    },{
      cType: types.CURRENT_RELATIVE_HUMIDITY_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		THERMO_CHAR.currentHum = characteristic;
		},
	  onRead: function(callback) {
    	if (THERMO_VAR.isReady) callback(THERMO_VAR.currentHum);
    	},
      perms: ["pr","ev"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Relative Humidity",
      maxValue: 100,
      minValue: 0,
      minStep: 1,
      unit: "percentage"
    }]
  }]
}

// Update the thermostat readings randomly between 50sec and 75sec
setInterval(function() {
  
	if (THERMO_VAR.amReqInProgress) {
		THERMO_VAR.execute('autoMan','get',THERMO_VAR.device);
		THERMO_VAR.amUpdateInProgress = true;
	}
	if (!THERMO_VAR.ttReqInProgress) {
		THERMO_VAR.execute('setpoint','get',THERMO_VAR.device);
		THERMO_VAR.ttUpdateInProgress = true;
	}
//	if (THERMO_VAR.amUpdateInProgress) console.log(THERMO_VAR.device + ' Thermostat autoMan interval update in progress');
//	if (THERMO_VAR.ttUpdateInProgress) console.log(THERMO_VAR.device + ' Thermostat setpoint interval update in progress');
  
}, THERMO_VAR.interval);