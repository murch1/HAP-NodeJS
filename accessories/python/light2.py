# light2.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC
# Arguments:
#	[0] light2.py
#		Unused
#	[1] value
#		'get' = no changes, just get values from HMI
#		'0' or 'false' || '1' or 'true' = describes desired light power state.
#	[2] accessory
#		Defines the common name for the accessory.

import sys
import json
import requests
import time

defaultReply = -1

def toBool(value):
    if str(value).lower() in ("yes", "y", "true",  "t", "1"): return True
    if str(value).lower() in ("no",  "n", "false", "f", "0", "0.0", "", "none", "[]", "{}", "undefined"): return False
    raise Exception('Invalid value for boolean conversion: ' + str(value))
# Thanks Petrucio. http://stackoverflow.com/questions/715417/converting-from-a-string-to-boolean-in-python

def getState():
	lightRead = {
		'id':'lightRead',
		'msgid':100,
		'read':[pilot]
	}
	
	JsonOut = json.dumps(lightRead)
	
	return sendCommand(JsonOut)
	
def setState(state):
	lightWrite = {
		'id':'lightWrite',
		'msgid':101,
		'write':{
			button:state
		}
	}

	JsonOut = json.dumps(lightWrite)
	
	sendCommand(JsonOut)
	
def pressButton():
	setState(True)
	time.sleep(3)
	setState(False)

def sendCommand(json):
	try:
		mblogic = requests.post('http://10.1.0.120:8082/', headers={'Cascadas': json})
	except Exception as e:
		return(defaultReply)
	else:
# Convert from JSON into a dictionary.
		try:
			response = mblogic.json()
#			print(response)
		except ValueError as e:
			return(defaultReply)
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 100:			# If getting state, return light status
					return toBool(response['read'].get(pilot))
			else:
				return(defaultReply)
				
def check(value):
	retry = 0
	while True:
		reply = getState()
#		print("Value = " + str(value) + "Reply = " + str(reply))
		retry += 1
		if value == reply:
			return reply
			break
		elif retry == 15:
			return defaultReply
			break
		time.sleep(2)
	
	
length = len(sys.argv)
if length != 3:
	print(defaultReply)
	sys.exit()
else:
	device = sys.argv[2]
	
	button = 'C' + device + 'LT'
	pilot = 'PL' + device + 'LT'

	try:
		command = toBool(sys.argv[1])
	except:		# If sys.argv[1] isn't a boolean, assume 'get' command has been triggered
		print(getState())
	else:
		fanState = getState()
		if fanState != command:
			pressButton()
			print(check(command))
		else:
			print(fanState)
