var async = require('asyncawait/async');
var await = require('asyncawait/await');
const admin = require("firebase-admin");


// Fetch the service account key JSON file contents
const serviceAccount = require(__dirname + '/service-account.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

module.exports = {
	
	save_message: function(msg) {
		var obj = JSON.parse(msg);
	
		var display_name = obj.display_name;
		var message		 = obj.message;
		var class_hash 	 = obj.class_hash;
		var user 	     = obj.uuid;
		
		var date = new Date();
		
		var db_message = {
			display_name: display_name,
			message: message,
			timestamp: date.getTime(),
			user_id: user
		};
		
		save_message(db_message, user, class_hash);
				
		
	}/*,
	
	enter_room: function(class_hash){
		
		return get_messages_from_db(class_hash);
	}*/
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
				resolve(false);
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
		resolve(true);
	});
	
	return promise;
};

function save_message(msg, user_id, room){
	async (function add_msg_to_db() {
			var passed = true;
			
			passed = await (validate_user(user_id));
			passed = await (validate_room(passed, room));
			passed = await (push_message(passed, msg, room));
			
		    await (console.log("Added message with status: " + passed));
		})();
}






/*var get_class = function(class_hash){
	
};

function get_messages_from_db(class_hash){
	
	get_class(class_hash)
	.then()
	
	var json = {};
	var key = "Messages";
	json[key] = [];
	
	var msg1 = {
		display_name: 'hey there',
		timestamp: '123456',
		message: 'this is the first message'
	};
	var msg2 = {
		display_name: 'hey there (again)',
		timestamp: '1234556',
		message: 'this is the second message'
	};
	
	json[key].push(msg1);
	json[key].push(msg2);
	
	var classRef = db.collection('cities');
	var allCities = citiesRef.get()
	  .then(snapshot => {
	    snapshot.forEach(doc => {
	      console.log(doc.id, '=>', doc.data());
	    });
	  })
	  .catch(err => {
	    console.log('Error getting documents', err);
	  });
	
	return JSON.stringify(json);
	
}*/
