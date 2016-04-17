# fanctrl.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC
# Arguments:
#	[0] fanctrl.py
#		Unused
#	[1] characteristic
#		Defines what characteristic is currently being focused on. Each accessory can only focus on one characteristic at one time.
#		'autoMan','setpoint'
#	[2] value
#		'get' = no changes, just get values from HMI
#		'true' or 'false' = accompanies the 'autoMan' characteristic. Describes desired control mode (true = Automatic).
#		'15.0' to '35.0' = accompanies the 'setpoint' characteristic. Describes desired temperature setpoint.
#	[3] accessory
#		Defines the common name for the accessory.

import sys
import json
import requests
import time

defaultReply = ',,,,'
        	
def getState():
	fanRead = {
		'id':'controlRead',
		'msgid':108,
		'read':[pilot,setpointR,temperature,humidity,speed]
	}
	
	JsonOut = json.dumps(fanRead)
	
	return sendCommand(JsonOut)
	
def setState(state):
	fanWrite = {
		'id':'fanAMWrite',
		'msgid':109,
		'write':{
			button:state,
		}
	}

	JsonOut = json.dumps(fanWrite)
	
	sendCommand(JsonOut)

def setSetpoint(setpoint):
	fanWrite = {
		'id':'fanSPWrite',
		'msgid':110,
		'write':{
			setpointW:setpoint
		}
	}

	JsonOut = json.dumps(fanWrite)
	
	sendCommand(JsonOut)
	
def pressButton():
	setState(True)
	time.sleep(3)
	setState(False)

def sendCommand(json):
	try:
		mblogic = requests.post('http://10.1.0.120:8082/', headers={'Cascadas': json})
	except Exception as e:
#		print("Request error: " + str(e))
		print(defaultReply)
	else:
# Convert from JSON into a dictionary.
		try:
			response = mblogic.json()
#			print(response)
		except ValueError as e:
			print(defaultReply)
			sys.exit()
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 108:			# If getting state, return fan controller state
					pilotResp = response['read'].get(pilot)
					if pilotResp == 1:
						pilotReply = 'true'
					else:
						pilotReply = 'false'
					setpointResp = response['read'].get(setpointR)
					setpointReply = float(setpointResp) / 10
					tempReply = response['read'].get(temperature)
					humReply = response['read'].get(humidity)
					speedReply = response['read'].get(speed)
					return pilotReply + ',' + str(setpointReply) + ',' + str(tempReply) + ',' + str(humReply) + ',' + str(speedReply)
			else:
				print(defaultReply)
				sys.exit()
				
def check(type,value):
	time.sleep(2)
	checkState = getState()
	reply = initState.split(",")
	retry = 0
	if type == 0:
		while True:
			time.sleep(2)
			checkState = getState()
			reply = checkState.split(",")
#			print("Value = " + str(value) + "Reply = " + str(reply[0]))
			retry += 1
			if value == reply[0] or retry == 15:
				break
	elif type == 1:
		while True:
			time.sleep(2)
			checkState = getState()
			reply = checkState.split(",")
			replySP = int(float(reply[1]) * 10)
#			print("Value = " + str(value) + "Reply = " + str(replySP))
			retry += 1
			if value == replySP or retry == 15:
				break
	return checkState
							
length = len(sys.argv)
if length != 4:
	print(defaultReply)
	sys.exit()
else:
	characteristic = sys.argv[1]
	setpointR = 'DS' + sys.argv[3] + 'TempSPR'
	setpointW = 'DS' + sys.argv[3] + 'TempSPW'
	temperature = 'DS' + sys.argv[3] + 'Temp'
	humidity = 'DS' + sys.argv[3] + 'Hum'
	speed = 'DS' + sys.argv[3] + 'FNSpR'
	button = 'C' + sys.argv[3] + 'FNAM'
	pilot = 'PL' + sys.argv[3] + 'FNAM'

	try:
		value = int(float(sys.argv[2]) * 10)
	except ValueError as e:
		value = sys.argv[2]
		if value == 'get':
			print(getState())
			sys.exit()

initState = getState()
reply = initState.split(",")
if type(value) is int:
	replySP = int(float(reply[1]) * 10)
	if value != replySP:
		setSetpoint(value)
		print(check(1,value))
	else:
		print(initState)
else:
	if value != reply[0]:
		pressButton()
		print(check(0,value))
	else:
		print(initState)
