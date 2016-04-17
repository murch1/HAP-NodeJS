// HomeKit types required
var types = require("./types.js");
var exports = module.exports = {};
var PythonShell = require('python-shell');

var getRandomInt = function(max,min) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

var HUM_CHAR = {
	currentHum: undefined};
	
var HUM_VAR = {
	device: 'Yahoo',
	isReady: false,
	currentHum: 50,
	interval: getRandomInt(75000,50000),
	execute: function(characteristic,accessory) { 
//		console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/temphum2.py", {
	    	args: [characteristic,accessory]
	    	}, function (err,results) {
	    		console.log(HUM_VAR.device + ' Humidity Results: ' + results);
    			if(!isNaN(results)) {
    				hum = parseInt(results);
    				HUM_VAR.currentHum = hum;
    				HUM_CHAR.currentHum.updateValue(HUM_VAR.currentHum);
    			} else {
    				HUM_VAR.currentHum = -99
    				HUM_CHAR.currentHum.updateValue(HUM_VAR.currentHum);
    			};
    			
    			if (!HUM_VAR.isReady) {
					HUM_VAR.isReady = true;
				};
    		});
	    }
	};
	
exports.accessory = {
  displayName: HUM_VAR.device + ' Weather Humidity',
  username: "CC:45:CC:4D:5E:21",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: HUM_VAR.device + ' Weather Humidity',
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
    sType: types.HUMIDITY_SENSOR_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: HUM_VAR.device + ' Humidity',
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Characteristic/Siri Name",
      designedMaxLength: 255   
    },{
      cType: types.CURRENT_RELATIVE_HUMIDITY_CTYPE,
	  onRegister: function(characteristic) {
		this.currentStateCharacteristic = characteristic;
		characteristic.eventEnabled = true;
		HUM_CHAR.currentHum = characteristic;
		HUM_VAR.execute('hum',HUM_VAR.device);
		},
	  onRead: function(callback) { 
    	if (HUM_VAR.isReady) callback(HUM_VAR.currentHum);
    	},
      perms: ["pr","ev"],
      format: "int",
      initialValue: 50,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Humidity",
      designedMinValue: -99,
      designedMaxValue: 99,
      designedMinStep: 1,
      unit: "percent"
    }]
  }]
}

// Update the humidity readings randomly between 50sec and 75sec
setInterval(function() {
  
	HUM_VAR.execute('hum',HUM_VAR.device);
  
}, HUM_VAR.interval);