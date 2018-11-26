var async = require('asyncawait/async');
var await = require('asyncawait/await');
var synch = require('deasync');
const admin = require("firebase-admin");

const DEBUG = 0;


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
		
		messages = get_questions_messages(question);
		console.log("JSON-STR (no DB): " + messages);
		
		json[msg_k].push(messages);
		
		return json;
	},
	
	ask_question: function(params){
		
		//Create a new document and then add the data into it
		var question = db.collection('questions').doc();
		
		var date = new Date();
		var question_obj = {
			user_id:	params.user_id,
			text: 		params.question,
			classroom: 	params.classroom,
			id: 		question.id,	
			timestamp: 	date.getTime()
		};
		
		question.set(question_obj);
		return question_obj;
		
	},
	
	get_questions: function(classroom){
		return get_class_questions(classroom);
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

function get_questions_messages(question){
	var json = [];
	var sync = true;
	
	console.log("trying to get messages for quetion: " + question);
		
	//Get all the messages that are for all rooms
	var roomRef = db.collection('messages').where('question_id', '==', 'ALL');
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			if(DEBUG){
				console.log(doc.id, "=>", doc.data());
			}
			json.push(doc.data());
		});
		
		sync = false;
	});
	while(sync) {synch.sleep(100);}
	sync = true;
	
	//Get all the messages that are for just this question
	roomRef = db.collection('messages').where('question_id', '==', question);
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			if(DEBUG){
				console.log(doc.id, "=>", doc.data());
			}
			json.push(doc.data());
		});
		
		sync = false;
	});
	while(sync) {synch.sleep(100);}
	
	//Order the messages by timestamp
	json.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
	
	return json;
}

function get_class_questions(classroom){
	var json = {};
	var sync = true;
	
	var classroom_k = "Classroom";
	var messages_k = "Messages";
	
	json[classroom_k] = classroom;
	json[messages_k] = [];
	
	console.log("trying to get messages for classroom: " + classroom);
		
	//Get all the messages that are for all classes
	var roomRef = db.collection('questions').where('classroom', '==', 'ALL');
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			if(DEBUG){
				console.log(doc.id, "=>", doc.data());
			}
			json[messages_k].push(doc.data());
		});
		
		sync = false;
	});
	while(sync) {synch.sleep(100);}
	sync = true;
	
	//Get all the messages that are for just this class
	roomRef = db.collection('questions').where('classroom', '==', classroom);
	roomRef.get().then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			if(DEBUG){
				console.log(doc.id, "=>", doc.data());
			}
			json[messages_k].push(doc.data());
		});
		
		sync = false;
	});
	while(sync) {synch.sleep(100);}
	
	//Order the messages by timestamp
	json[messages_k].sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
	
	return json;
}

