# fan.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC

import sys
import json
import requests
import time

length = len(sys.argv)

if length >= 2:
	command = sys.argv[1]
else:
	command = 0
	
if length >= 3:
	device = sys.argv[2]
else:
	device = 'FALSE'
	
speedR = 'DS' + device + 'SpR'
speedW = 'DS' + device + 'SpW'
button = 'C' + device + command

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
	time.sleep(2)
	setState(False)

def sendCommand(json):
	try:
		mblogic = requests.post('http://10.1.0.120:8082/', headers={'Cascadas': json})
	except Exception as e:
		print("Request error: " + str(e))
	else:
# Convert from JSON into a dictionary.
		try:
			response = mblogic.json()
#			print(response)
		except ValueError as e:
			print('Fan write failure.')
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 102:			# If getting state, return fan speed
					return response['read'].get(speedR)
			else:
				print("Request error")
				
if command == 'get' and device is not 'FALSE':
	print(getState())
elif command >= '0' and command <= '3' and device is not 'FALSE':
	fanState = getState()
	if fanState != command:
		pressButton()
		time.sleep(10)
	print(getState())
else:
	print('0')
