var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./firebase');
var port = process.env.PORT || 8080;

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

app.get('/other', (req, res) => {
	res.sendFile(__dirname + "/otherindex.html");
});


app.get('/change-room', (req, res) => {
	var class_hash = req.param('class', 0);
	res.send(db.enter_room(class_hash));
	//res.send(class_hash);
	//res.sendFile(__dirname + "/otherindex.html");
});



io.on('connection', function(socket){
	console.log("user connected");
	
	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
 
 
  	socket.on('chat message', function(msg){
    	console.log('message: ' + msg);
    	io.emit('chat message', msg);
    	
    	db.save_message(msg);
    	
  	});
});


//Listen on the port
http.listen(port, () => {
	console.log('Server listening on port : ' + port);
});
