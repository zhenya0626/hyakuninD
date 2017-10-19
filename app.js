




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

// ゲーム準備準備--------------------------------------------------------
		
	// ①出題する問題を決定する（n問）

		//百首をランダムに並べる-------------------------------------　ここから
		var tmpQuesSet = [];	//tmpQuesSet[札の並び順] = 歌番号
		for(var i=1; i<=100; i++){
			tmpQuesSet.push(i);
		}
		var a = tmpQuesSet.length;
		 
		//シャッフルアルゴリズム
		while (a) {
		    var j = Math.floor( Math.random() * a );
		    var t = tmpQuesSet[--a];
		    tmpQuesSet[a] = tmpQuesSet[j];
		    tmpQuesSet[j] = t;
		}
		//百首をランダムに並べる-------------------------------------　ここまで


		//quesSet作成---------------------------------------------　ここから
		var quesSet =[]; //quesSet[札の並び順(画面上)] = 歌番号 
		var n = 30;   //出題数
		for(var i=0; i<n; i++){
			quesSet.push(tmpQuesSet[i]);  //tmpQuesSetの前から問題数分を代入
		}
		//quesSet作成---------------------------------------------　ここまで
		

	// ②出題する順番を決定する
		var quesOrder = []; //quesOrder[問題番号] = 歌番号
		for(var i=0; i<quesSet.length; i++){
			quesOrder.push(quesSet[i]);  //tmpQuesSetの前から問題数分を代入
		}

		//シャッフルアルゴリズム
		while (n) {
		    var j = Math.floor( Math.random() * n );
		    var t = quesOrder[--n];
		    quesOrder[n] = quesOrder[j];
		    quesOrder[j] = t;
		}
		var point1 = 0;
		var point2 = 0;
		var qNum = 0 ;
		var bool =false;



//問題送信
var ques = io.of('/ques').on('connection', function(socket){
	socket.on('quesSet', function(data){

		socket.join(data.room);
		// socket.emit('ques','you are in' + data.room);
		// socket.emit('ques', '[' + data.name + '] : ' + data.msg);
		// socket.broadcast.to(data.room).emit('ques', '[' + data.name + '] : ' + data.msg);


		socket.json.emit('quesSet',{
					quesSet: quesSet,
					quesOrder: quesOrder,
					qNum:qNum,
				});
		// socket.client_name = data.name;
        // io.to(data.room).emit('ques', '[' + data.name + '] : ' + data.msg);
		
	});
});

//ふだid受信 //正解orお手つき //結果送信
var judge = io.of('/judge').on('connection', function(socket){

	socket.on('judge', function(data){
		
		qNum = data.qNum;
		id = data.id;
		// var palyer = data.name;
		
		if(String(quesOrder[qNum]) === id){
			point1 ++;
			qNum ++;
			bool = true;

		}else{
			
			point2 ++;
			bool = false;
		}

		socket.json.emit('judge',{
					qNum: qNum,
					point1: point1,
					point2: point2,
					bool: bool
		});
		socket.json.broadcast.emit('judge',{
					qNum: qNum,
					point1: point2,
					point2: point1,
					bool: bool
		});

		
		socket.client_name = data.name;
        io.to(data.room).emit('id', '[' + data.name + '] : ' + data.msg);
		
	});
});



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