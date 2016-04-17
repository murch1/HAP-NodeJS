# temphum_plc.py
# Used for HomeKit enabled home automation.
# Interfaces between HAP-NodeJS (HomeKit) and MBLogic that then interfaces with the home PLC

import sys
import json
import requests
import time

command = sys.argv[1]

def getTemp():
	tempRead = {
		'id':'tempRead',
		'msgid':201,
		'read':['DS5']
	}
	
	JsonOut = json.dumps(tempRead)
	
	return sendCommand(JsonOut)
	
def getHum():
	humRead = {
		'id':'humRead',
		'msgid':202,
		'read':['DS4']
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
					return float(response['read'].get('DS5'))
				elif msgid == 202:
					return int(response['read'].get('DS4'))		
			else:
				return (-99)
				
if command == 'temp':
	print(getTemp())
elif command == 'hum':
	print(getHum())
else:
	print(-99)
