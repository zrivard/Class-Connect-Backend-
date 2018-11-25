var async = require('asyncawait/async');
var await = require('asyncawait/await');
var synch = require('deasync');
const admin = require("firebase-admin");


// Fetch the service account key JSON file contents
const serviceAccount = require(__dirname + '/service-account.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

module.exports = {
	
	save_message: function(msg) {
		/*ZR_FIXME, remove this parsing when working from the app
		 as using the web browser simply sends a string. Should
		 just be able to go msg.uuid and such*/
		//var obj = JSON.parse(msg);
	
		var display_name = msg.display_name;
		var message		 = msg.message;
		var class_hash 	 = msg.class_hash;
		var user 	     = msg.uuid;
		
		var date = new Date();
		
		var db_message = {
			display_name: display_name,
			message: message,
			timestamp: date.getTime(),
			user_id: user
		};
		
		add_msg_to_db(db_message, user, class_hash);
				
		
	},
	
	enter_room: function(class_hash){
		
		var json = {};
		var messages;
		
		/* Make sure the return knows what class it was for */
		var class_k = "Class";
		json[class_k] = class_hash;
		
		/* Get the message from the database */
		var msg_k = "Messages";
		json[msg_k] = [];
		
		messages = get_messages(class_hash);
		console.log("JSON-STR (no DB): " + messages);
		
		json[msg_k].push(messages);
		
		return json;
	}
};


var validate_user = function(user_id) {
	
	var userRef = db.collection('users').doc(user_id);
	
	var promise = new Promise(function(resolve){
		userRef.get().then(function(user_doc){
			if(user_doc.exists){
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
	return promise;
};

var validate_room = function(passed, room){
	var roomRef = db.collection('messages').doc(room);
	
	
	var promise = new Promise(function(resolve){
		roomRef.get().then(function(room_doc){
			if(room_doc.exists && passed){
				resolve(true);
			} else {
				resolve(passed);
			}
		});
	});
	return promise;
};


var push_message = function(passed, msg, room){
	var roomRef = db.collection('messages').doc(room);
	
	var promise = new Promise(function(resolve){
		if(passed){
			roomRef.collection('messages').add(msg);
		}
		resolve(passed);
	});
	
	return promise;
};

function add_msg_to_db(msg, user_id, room){
	async (function () {
			
			var passed;
			passed = await (validate_user(user_id));
			passed = await (validate_room(passed, room));
			passed = await (push_message(passed, msg, room));
			
		    await (console.log("Added message with status: " + passed));
		})();
		
}

function get_messages(room){
	var roomRef = db.collection('messages').doc(room).collection('messages');
	var json = [];
	var sync = true;
	
	console.log("trying to get messages from room: " + room);
		
	
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			console.log(doc.id, "=>", doc.data());
			json.push(doc.data());
		});
		
		sync = false;
	});
	
	while(sync) {synch.sleep(100);}
	return json;
}



function get_messages_from_db(class_hash){
	
	var json = {};
	var messages;
	
	/* Make sure the return knows what class it was for */
	var class_k = "Class";
	json[class_k] = class_hash;
	
	/* Get the message from the database */
	var msg_k = "Messages";
	json[msg_k] = [];
	
	messages = get_messages(class_hash);
	console.log("JSON-STR (no DB): " + messages);
	
	json[msg_k].push(messages);
	
	return JSON.stringify(json);

}
