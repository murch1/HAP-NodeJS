# temphum.py
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
		return (-99)
	else:
		try:
			response = mblogic.json()
		except ValueError as e:
			return (-99)
		else:
			stat = response.get('stat')
			if stat == 'ok':
				msgid = response.get('msgid')
				if msgid == 201:
					return float(response['read'].get(device))
				elif msgid == 202:
					return int(response['read'].get(device))		
			else:
				return (-99)
				
if command == 'temp':
	device += 'Temp'
	print(getTemp(device))
elif command == 'hum':
	device += 'Hum'
	print(getHum(device))
else:
	print(-99)
