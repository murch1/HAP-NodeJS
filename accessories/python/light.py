# light.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC

import sys
import json
import requests
import time

command = sys.argv[1]
device = sys.argv[2]
pilot = 'PL' + device
button = 'C' + device

def getState():
	lightRead = {
		'id':'lightRead',
		'msgid':101,
		'read':[pilot]
	}
	
	JsonOut = json.dumps(lightRead)
	
	return sendCommand(JsonOut)
	
def setState(state):
	lightWrite = {
		'id':'lightWrite',
		'msgid':100,
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
		print("Request error: " + str(e))
	else:
# Convert from JSON into a dictionary.
		try:
			response = mblogic.json()
#			print(response)
		except ValueError as e:
			print('Light write failure.')
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 101:
					state = response['read'].get(pilot)
					if state == 0:
						return ('false')
					else:
						return ('true')
			else:
				print("Request error")
				
if command == 'get':
	print(getState())
else:
	lightState = getState()
	if lightState != command:
		pressButton()
	print(getState())
