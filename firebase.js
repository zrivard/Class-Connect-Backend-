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
		
		var date = new Date();
		
		var db_message = {
			display_name: 	msg.display_name,
			message: 		msg.message,
			user_id: 		msg.uuid,
			classroom: 		msg.classroom,
			question_id: 	msg.question_id,
			
			timestamp: date.getTime()
		};
		
		add_msg_to_db(db_message, msg.uuid);
				
		
	},
	
	enter_room: function(question){
		
		var json = {};
		var messages;
		
		/* Make sure the return knows what class it was for */
		var class_k = "Question";
		json[class_k] = question;
		
		/* Get the message from the database */
		var msg_k = "Messages";
		json[msg_k] = [];
		
		messages = get_messages(question);
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


var push_message = function(passed, msg){
	var roomRef = db.collection('messages');
	
	var promise = new Promise(function(resolve){
		if(passed){
			roomRef.add(msg);
		}
		resolve(passed);
	});
	
	return promise;
};

function add_msg_to_db(msg, user_id){
	async (function () {
			
			var passed;
			passed = await (validate_user(user_id));
			passed = await (push_message(passed, msg));
			
		    await (console.log("Added message with status: " + passed));
		})();
		
}

function get_messages(question){
	var json = [];
	var sync = true;
	
	console.log("trying to get messages for quetion: " + question);
		
	//Get all the messages that are for all rooms
	var roomRef = db.collection('messages').where('question_id', '==', 'ALL');
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			console.log(doc.id, "=>", doc.data());
			json.push(doc.data());
		});
		
		sync = false;
	});
	while(sync) {synch.sleep(100);}
	
	//Get all the messages that are for just this question
	roomRef = db.collection('messages').where('question_id', '==', question);
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

