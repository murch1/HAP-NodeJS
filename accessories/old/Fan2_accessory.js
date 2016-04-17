var PythonShell = require('python-shell');
// HomeKit types required
var types = require("./types.js")
var exports = module.exports = {};

var execute = function(accessory,characteristic,value){ console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + "."); }

exports.accessory = {
  displayName: "Mercator Fan",
  username: "10:23:3D:DD:4E:FB",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
    	cType: types.NAME_CTYPE, 
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "Family Ceiling Fan",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Name of the accessory",
		designedMaxLength: 255    
    },{
    	cType: types.MANUFACTURER_CTYPE, 
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "Mercator",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Manufacturer",
		designedMaxLength: 255    
    },{
    	cType: types.MODEL_CTYPE,
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "Rev-1",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Model",
		designedMaxLength: 255    
    },{
    	cType: types.SERIAL_NUMBER_CTYPE, 
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "'FamilyFN'",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "SN",
		designedMaxLength: 255    
    },{
    	cType: types.IDENTIFY_CTYPE, 
    	onUpdate: null,
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
		initialValue: "Ceiling Fan Control",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Name of service",
		designedMaxLength: 255   
    },{
    	cType: types.POWER_STATE_CTYPE,
	onUpdate: function(value)
    	{ 
    		console.log("Change:",value);
    		if (value) {
    		//	PythonShell.run('fan2.py', function (err) {
  				console.log('Fan On');
			//	});
    		} else {
    		//	PythonShell.run('fan0.py', function (err) {
  				console.log('Fan Off');
			//	});
    		}
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
	onUpdate: function(value)
    	{ 
    		console.log("Change:",value);
    		switch(value) {
    		case 1: 
    			console.log('Fan set to 1');
    			break;
    		case 2:
    			console.log('Fan set to 2');
    			break;
    		case 3:
    			console.log('Fan set to 3');
    			break;
    		default:
    			console.log('Fan set to default');
    			break;
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
