var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./firebase');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	void req;
	res.sendFile(__dirname + "/index.html");
});


app.get('/get-question-messages', (req, res) => {
	var question = req.param('question-id');
	res.send(db.get_messages(question));
});

app.get('/get-questions', (req, res) => {
	var classroom = req.param('class');
	res.send(db.get_questions(classroom));
});

app.get('/get-class-info', (req, res) => {
	var classroom = req.param('class');
	res.send(db.get_class(classroom));
});

app.get('/get-user-classes', (req, res) => {
	var user = req.param('user');
	res.send(db.get_user_classes(user));
});

app.get('/close-question', (req, res) => {
	var question = req.param('question-id');
	res.send(db.close_question(question));
});

app.get('/add-user', (req, res) => {
	var uuid = req.param('uuid');
	var name = req.param('name');
	res.send(db.add_user(uuid, name));
});

app.post('/ask-question', function (req, res) {
  var body = req.body;
  res.send(db.ask_question(body));
});

app.post('/set-classes', function (req, res) {
  var body = req.body;
  res.send(db.set_user_classes(body));
});





io.on('connection', function(socket){
	
	/*Default to connect to room 'default'*/
	socket.join('default', function(){
		let rooms = Object.keys(socket.rooms);
		socket.room_now = 'default';
		console.log(rooms);
	});
	
	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
 
 
  	socket.on('chat message', function(msg){
    	console.log('message: ' + msg);
    	
    	socket.to(socket.room_now).emit('chat message', msg);
    	
    	db.save_message(msg);
    	
  	});
  	
  	socket.on('change room', function(room){
  		console.log("Socket leaving room: ", socket.room_now);
  		socket.leave(socket.room_now);
  		socket.join(room, function(){
  			socket.room_now = room;
  			console.log("Socket joined room: ", socket.room_now);
  		});
  		
  	});
});


//Listen on the port
http.listen(port, () => {
	console.log('Server listening on port : ' + port);
});
