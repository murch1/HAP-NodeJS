# temphum2.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC
# Arguments:
#	[0] temphum2.py
#		Unused
#	[1] value
#		'temp' = get temperature values from HMI
#		'hum' = get humidity values from HMI
#	[2] accessory
#		Defines the common name for the accessory.

import sys
import json
import requests
import time

defaultReply = -99

def getTemp(device):
	tempRead = {
		'id':'tempRead',
		'msgid':201,
		'read':[device]
	}
	
	JsonOut = json.dumps(tempRead)
	
	return sendCommand(JsonOut)
	
def getHum(device):
	humRead = {
		'id':'humRead',
		'msgid':202,
		'read':[device]
	}
	
	JsonOut = json.dumps(humRead)
	
	return sendCommand(JsonOut)

def sendCommand(json):
	try:
		mblogic = requests.post('http://10.1.0.120:8082/', headers={'Cascadas': json})
	except Exception as e:
#		print("Request error: " + str(e))
		return defaultReply
	else:
		try:
			response = mblogic.json()
		except ValueError as e:
			return defaultReply
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 201:
					return float(response['read'].get(device))
				elif msgid == 202:
					return int(response['read'].get(device))		
			else:
				return defaultReply
				
length = len(sys.argv)

if length != 3:
	print(defaultReply)
	sys.exit()
else:
	command = sys.argv[1]
	device = 'DS' + sys.argv[2] + sys.argv[1].capitalize()

if command == 'temp':
	print(getTemp(device))
elif command == 'hum':
	print(getHum(device))
else:
	print(defaultReply)
