var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const admin = require("firebase-admin");
var port = process.env.PORT || 8080;

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get('/other', (req, res) => {
	res.sendFile(__dirname + "/otherindex.html");
});


// Fetch the service account key JSON file contents
const serviceAccount = require(__dirname + '/service-account.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});




const db = admin.firestore();



io.on('connection', function(socket){
	console.log("user connected");
	
	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
  	
  	socket.on('chat message', function(msg){
    	console.log('message: ' + msg);
    	io.emit('chat message', msg);
    	
    	var obj = JSON.parse(msg);
    	var date = new Date();
    	
    	var db_message = {
    		display_name: obj.display_name,
			message: obj.message,
			timestamp: date.getTime(),
			user_id: obj.userid
    	}
    	
    	db.collection('CPEN_321').add(db_message);
  	});
});


//Listen on the port
http.listen(port, () => {
	console.log('Server listening on port : ' + port);
});
