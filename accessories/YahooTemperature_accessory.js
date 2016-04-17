// HomeKit types required
var types = require("./types.js");
var exports = module.exports = {};
var PythonShell = require('python-shell');

var getRandomInt = function(max,min) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

var TEMP_CHAR = {
	currentTemp: undefined};
	
var TEMP_VAR = {
	device: 'Yahoo',
	isReady: false,
	currentTemp: 25.0,
	interval: getRandomInt(75000,50000),
	execute: function(characteristic,accessory) { 
//		console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/temphum2.py", {
	    	args: [characteristic,accessory]
	    	}, function (err,results) {
	    		console.log(TEMP_VAR.device + ' Temperature Results: ' + results);
    			if(!isNaN(results)) {
    				temp = parseFloat(results);
    				TEMP_VAR.currentTemp = temp;
    				TEMP_CHAR.currentTemp.updateValue(TEMP_VAR.currentTemp);
    			} else {
    				TEMP_VAR.currentTemp = -99;
    				TEMP_CHAR.currentTemp.updateValue(TEMP_VAR.currentTemp);
    			};
    			
    			if (!TEMP_VAR.isReady) {
					TEMP_VAR.isReady = true;
				};
    		});
	    }
	};
	
exports.accessory = {
  displayName: TEMP_VAR.device + ' Weather Temperature',
  username: "CA:33:CD:5E:5E:25",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: TEMP_VAR.device + ' Weather Temperature',
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
      initialValue: "https://weather.yahoo.com.au/forecast",
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
    sType: types.TEMPERATURE_SENSOR_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: TEMP_VAR.device + ' Temperature',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Characteristic/Siri Name",
      designedMaxLength: 255   
    },{
      cType: types.CURRENT_TEMPERATURE_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		TEMP_CHAR.currentTemp = characteristic;
		TEMP_VAR.execute('temp',TEMP_VAR.device);
		},
	  onRead: function(callback) { 
    	if (TEMP_VAR.isReady) callback(TEMP_VAR.currentTemp);
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
    }]
  }]
}

// Update the temperature readings randomly between 50sec and 75sec
setInterval(function() {
  
	TEMP_VAR.execute('temp',TEMP_VAR.device);
  
}, TEMP_VAR.interval);