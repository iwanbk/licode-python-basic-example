import json

from flask import Flask, render_template, request, jsonify

import nuve
import config

app = Flask(__name__)

nuve_client = nuve.Nuve(config.superserviceID, config.superserviceKey, config.nuveHost, config.nuvePort)
#myRoom = ""

def get_room():
	rooms = nuve_client.getRooms()
	if len(rooms) == 0:
		pass
	else:
		room = rooms[0]["_id"]
	return room

myRoom = get_room()

@app.route("/token/", methods=['POST'])
def create_token():
	print "request.data=", request.data
	print "request.json=", request.json
	username = request.get_json()['username']
	role = request.get_json()['role']
	
	print "username = ", username, ".role = ", role, ". room ", myRoom
	
	resp = nuve_client.createToken(myRoom, username, role)
	print "resp = ", resp
	
	return jsonify( { 'token': resp } ), 201


@app.route("/")
def main():
	return render_template("index.html")

if __name__ == "__main__":
	app.run(debug=True, host="0.0.0.0")