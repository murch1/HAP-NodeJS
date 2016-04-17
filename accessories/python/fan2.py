# fan2.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC
# Arguments:
#	[0] fan2.py
#		Unused
#	[1] value
#		'get' = no changes, just get values from HMI
#		'0' to '3' = describes desired fan rotation speed.
#	[2] accessory
#		Defines the common name for the accessory.

import sys
import json
import requests
import time

defaultReply = -1

def getState():
	fanRead = {
		'id':'fanRead',
		'msgid':102,
		'read':[speedR]
	}
	
	JsonOut = json.dumps(fanRead)
	
	return sendCommand(JsonOut)
	
def setState(state):
	fanWrite = {
		'id':'fanWrite',
		'msgid':103,
		'write':{
			button:state
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
				if msgid == 102:			# If getting state, return fan speed
					return int(response['read'].get(speedR))
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
	
	speedR = 'DS' + device + 'FNSpR'
	button = 'C' + device + 'FN' + sys.argv[1]

	try:
		command = int(sys.argv[1])
	except ValueError as e: # If sys.argv[1] isn't an integer, assume 'get' command has been triggered
		print(getState())
	else:
		if command >= 0 and command <= 3:
			fanState = getState()
			if fanState != command:
				pressButton()
				print(check(command))
			else:
				print(fanState)
		else:
			button = 'C' + device + 'FN0'	# If invalid command, stop the fan
			pressButton()
			print(check(0))
