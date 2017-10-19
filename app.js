




var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs');
var path = require('path');
var mime = {
  ".html": "text/html",
  ".css":  "text/css",
  ".png": "	image/png"
  // 読み取りたいMIMEタイプはここに追記
};

app.listen(1337);
// io.set('log level',1);
// var express = require('express');
// var app2 = express();
// app2.use(express.static(__dirname));
function handler(req,res){


	if (req.url == '/') {
    filePath = '/index.html';
  } else {
    filePath = req.url;
  }
  var fullPath = __dirname + filePath;

	fs.readFile(fullPath,function(err,data){
		if(err){
			res.writeHead(500);
			return res.end('Error');
		}
		 res.writeHead(200, {"Content-Type": mime[path.extname(fullPath)] || "text/plain"});
		res.write(data);
		res.end();
	})
}

//問題生成
//問題送信

//ふだid受信
//正解orお手つき
//結果送信


var chat = io.of('/chat').on('connection', function(socket){
	socket.on('emit_from_client', function(data){

		socket.join(data.room);
		// socket.emit('emit_from_server','you are in' + data.room);
		socket.emit('emit_from_server', '[' + data.name + '] : ' + data.msg);
		socket.broadcast.to(data.room).emit('emit_from_server', '[' + data.name + '] : ' + data.msg);


		socket.emit('room',{
					msg: data.msg,
					name: data.name,
					room: data.room
				});
		// socket.client_name = data.name;
        // io.to(data.room).emit('emit_from_server', '[' + data.name + '] : ' + data.msg);
		
	});
});


// var news = io.of('/news').on('connection', function(socket){
// 	socket.emit('emit_from_server','today: '+ new Date());
// });