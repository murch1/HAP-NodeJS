var PythonShell = require('python-shell');
// HomeKit types required
var types = require("./types.js")
var exports = module.exports = {};

var FAN_CNTRL = {
	device: 'Family',
	autoMan: false,
	setpoint: 25,
	isCurrent: false,
	execute: function(characteristic,value,accessory) { 
		console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + ".");
    	PythonShell.run("/accessories/python/fanctrl.py", {
	    	args: [characteristic,value,accessory]
	    	}, function (err,results) {
	    		console.log(results[0]);
				var parsedResults = results[0].split(",");
				if(characteristic == 'autoMan') {
					if (parsedResults[0] == 'true'){
						FAN_CNTRL.autoMan = true;
					} else {
						FAN_CNTRL.autoMan = false;
					}
					return FAN_CNTRL.autoMan;
				} else {
					FAN_CNTRL.setpoint = parseInt(parsedResults[1]);
					console.log('Feed back setpoint Temp: ',FAN_CNTRL.setpoint);
					return FAN_CNTRL.setpoint;
				}
	    	});
	    }
	}

exports.accessory = {
  displayName: "Mercator",
  username: "10:23:3D:E4:4E:FE",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
    	cType: types.NAME_CTYPE, 
    	onUpdate: null,
    	perms: ["pr"],
		format: "string",
		initialValue: "Ceiling Fan Control",
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
		initialValue: FAN_CNTRL.device + 'CTRL',
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
		initialValue: "Ceiling Fan Auto Control",
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Name of service",
		designedMaxLength: 255   
    },{
    	cType: types.POWER_STATE_CTYPE,
	onRegister: function(characteristic) {
//		console.log("AutoMan On register - characteristic: ",characteristic);
		this.currentStateCharacteristic = characteristic;
//		characteristic.eventEnabled = true
		characteristic.setValue(FAN_CNTRL.autoMan);
		},
	onUpdate: function(value) {
		console.log('AutoMan On Update: ',value);
		var setting;
		if (value == 1) {
			setting = 'true';
		} else {
			setting = 'false';
		}
		var callback = FAN_CNTRL.execute('autoMan',setting,FAN_CNTRL.device);
//		currentStateCharacteristic.setValue(value);
    	},
    onRead: function(callback) {
//    	console.log('AutoMan On Read: ',callback);
		var err = null;
		var feedback = FAN_CNTRL.execute('autoMan','get',FAN_CNTRL.device);
    	callback(feedback);
    	},
    	perms: ["pw","pr","ev"],
		format: "bool",
		initialValue: FAN_CNTRL.autoMan,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Auto/Manual fan control",
		designedMaxLength: 1    
    },{
    	cType: types.ROTATION_SPEED_CTYPE,
	onRegister: function(characteristic) {
//		console.log("Setpoint On register - characteristic: ",characteristic);
		this.currentStateCharacteristic = characteristic;
//		characteristic.eventEnabled = true
		characteristic.setValue(FAN_CNTRL.setpoint);
		},
	onUpdate: function(value) {
//		console.log('Setpoint On Update: ',value);
		var callback = FAN_CNTRL.execute('setpoint',value,FAN_CNTRL.device);
//		currentStateCharacteristic.setValue(value);
    	},
    onRead: function(callback) {
//    	console.log('Setpoint On Read: ',callback);
		var err = null;
		var feedback = FAN_CNTRL.execute('setpoint','get',FAN_CNTRL.device);
    	callback(feedback);
    	},
    	perms: ["pw","pr","ev"],
		format: "int",
		initialValue: FAN_CNTRL.setpoint,
		supportEvents: false,
		supportBonjour: false,
		manfDescription: "Temperature setpoint",
		designedMinValue: 15,
		designedMaxValue: 35,
		designedMinStep: 1,
		unit: "celsius"
    }]
  }]
}
