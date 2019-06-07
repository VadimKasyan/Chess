var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = [];
var queueID = [""];
var rooms = [];

app.get('/', function(req, res){
    app.use(express.static(__dirname + '/chess'));
    res.sendFile(__dirname + "/chess/chess.html");
});

io.on("connection", (socket) => {
    console.log(socket.id + " connected, online - "+ io.engine.clientsCount);

    socket.emit("updateUserCount", {
        playersOnline: io.engine.clientsCount
    });
    socket.broadcast.emit("updateUserCount", {
        playersOnline: io.engine.clientsCount
    });

    players[players.length] = [];
    players[players.length-1][0] = socket.id;
    players[players.length-1][1] = "";        //enemyID
    players[players.length-1][2] = 0;         //gameID
    players[players.length-1][3] = false;     //inGame

    socket.on("randomPlayerSearch", () => {
        if(players[getPlayerNumber(socket.id)][3]){ //if already in game
            socketMessage(socket.id, "You already in the game.", 0);
            socket.emit("menuSwitch");
        } else {
            if(queueID[0] == ""){
                queueID[0] = socket.id;
                socketMessage(socket.id, "Random search. Waiting for players...", 0);
            } else {
                var player = getPlayerNumber(socket.id);
                var enemy = getPlayerNumber(queueID[0]);
                if(players[player][0] != queueID[0]){
                    if(players[player][2] != 0){
                        rooms.splice(rooms.indexOf(players[player][2]), 1);
                        players[player][2] = 0;
                    }

                    players[player][1] = queueID[0];
                    players[player][3] = true;
                    players[enemy][1] = players[player][0];
                    players[enemy][3] = true;

                    if(Math.round(Math.random())){
                        socket.emit("gameStart", {
                            playerColor: 0
                        });
                        io.sockets.connected[players[enemy][0]].emit("gameStart", {
                            playerColor: 1
                        });
                    } else {
                        socket.emit("gameStart", {
                            playerColor: 1
                        });
                        io.sockets.connected[players[enemy][0]].emit("gameStart", {
                            playerColor: 0
                        });
                    }
                    queueID[0] = "";
                } else {
                    socketMessage(players[player][0], "You already in queue.", 0);
                    socket.emit("menuSwitch");
                }
            }
        }
    });

    socket.on("movePiece", (data) => {
        var player = getPlayerNumber(socket.id);
        var enemy = getPlayerNumber(players[player][1]);

        io.sockets.connected[players[enemy][0]].emit("movePiece", {
            x: data.x,
            y: data.y,
            toX: data.toX,
            toY: data.toY
        });
    });

    socket.on("message", (data) => {
        var player = getPlayerNumber(socket.id);

        if(players[player][1] != ""){
            socketMessage(players[player][1], data.message, 1);
            socketMessage(players[player][0], data.message, 2);
        } else {
            socketMessage(players[player][0], "You are not in the game.", 0);
        }
    });

    socket.on("createRoom", function createRoom(){
        var player = getPlayerNumber(socket.id);
        if(players[player][3]){ //if already in game
            socketMessage(socket.id, "You already in the game.", 0);
            socket.emit("menuSwitch");
        } else {
            if(players[player][2] == 0){
                if(players[player][0] == queueID[0]){
                    queueID[0] = "";
                }

                var randomValue = Math.floor(1000 + Math.random() * 9000); // 1 000 - 10 000
                for(var i = 0; i < rooms.length; i++){
                    if(randomValue == rooms[i])
                        createRoom();
                }

                rooms[rooms.length] = randomValue;
                players[player][2] = randomValue;
                socketMessage(players[player][0], "Room id- "+ randomValue +". Waiting for enemy join.", 0);

                socket.emit("menuSwitch");
            } else {
                socketMessage(players[player][0], "The room has already been created, waiting for the enemy. Room id- "+ players[player][2], 0);
                socket.emit("menuSwitch");
            }
        }
    });

    socket.on("joinRoom", (data) => {
        if(players[getPlayerNumber(socket.id)][2] == data.roomID){
            socketMessage(players[getPlayerNumber(socket.id)][0], "You already in this room.", 0);
            socket.emit("menuSwitch");
            return;
        }
        if(players[getPlayerNumber(socket.id)][3]){ //if already in game
            socketMessage(socket.id, "You already in the game.", 0);
            socket.emit("menuSwitch");
        } else {
            var player = getPlayerNumber(socket.id);
            var isJoined = false;

            if(players[player][2] != 0){
                rooms.splice(rooms.indexOf(players[player][2]), 1);
            }

            for(var i = 0; i < rooms.length; i++){
                if(rooms[i] == data.roomID){
                    var temp;
                    for(var j = 0; j < players.length; j++){
                        if(players[j][2] == data.roomID){
                            temp = j;
                        }
                    }
                    rooms.splice(i, 1);
                    
                    var enemy = getPlayerNumber(players[temp][0]);

                    players[player][1] = players[enemy][0];
                    players[player][3] = true;
                    players[enemy][1] = players[player][0];
                    players[enemy][3] = true;

                    if(Math.round(Math.random())){
                        socket.emit("gameStart", {
                            playerColor: 0
                        });
                        io.sockets.connected[players[enemy][0]].emit("gameStart", {
                            playerColor: 1
                        });
                    } else {
                        socket.emit("gameStart", {
                            playerColor: 1
                        });
                        io.sockets.connected[players[enemy][0]].emit("gameStart", {
                            playerColor: 0
                        });
                    }

                    isJoined = true;
                } 
            }
            socket.emit("menuSwitch");
            if(!isJoined){
                socketMessage(players[getPlayerNumber(socket.id)][0], "There is no such room", 0);
            }
        }
    });

    socket.on("surrender", () => {
        if(players[getPlayerNumber(socket.id)][3] == true){
            var player = getPlayerNumber(socket.id);

            if(players[player][3]){
                var enemy = getPlayerNumber(players[player][1]);

                socket.emit("gameStop", {
                    reason: "System: you lose."
                });
                io.to(players[enemy][0]).emit("gameStop", {
                    reason: "System: you win! Enemy surrender."
                });

                players[player][1] = "";
                players[player][2] = 0;
                players[player][3] = false;
                players[enemy][1] = "";
                players[enemy][2] = 0;
                players[enemy][3] = false;
            } else {
                socketMessage(players[player][0], "You are not in the game.", 0);
                socket.emit("menuSwitch");
            }
        }
    })

    socket.on("askDraw", () => {
        if(players[getPlayerNumber(socket.id)][3] == true){
            var player = getPlayerNumber(socket.id);
            var enemy = getPlayerNumber(players[player][1]);

            io.to(players[enemy][0]).emit("askDraw");
        }
    });

    socket.on("drawAnswer", (data) => {
        var player = getPlayerNumber(socket.id);
        var enemy = getPlayerNumber(players[player][1]);

        if(data.answer){
            socket.emit("gameStop", {
                reason: "System: game draw."
            });
            socket.to(players[enemy][0]).emit("gameStop", {
                reason: "System: game draw."
            });

            players[player][1] = "";
            players[player][2] = 0;
            players[player][3] = false;
            players[enemy][1] = "";
            players[enemy][2] = 0;
            players[enemy][3] = false;
        } else {
            socketMessage(players[player][0], "draw failure.", 0);
            socketMessage(players[enemy][0], "draw failure.", 0);
        }
    });

    socket.on("gameOver", (data) =>{
        var player = getPlayerNumber(socket.id);
        var enemy = getPlayerNumber(players[player][1]);

        socket.emit("gameStop", {
            reason: "\nSystem: you win!"
        });

        io.to(players[enemy][0]).emit("gameStop", {
            reason: "\nSystem: you lose."
        });

        players[player][1] = "";
        players[player][2] = 0;
        players[player][3] = false;
        players[enemy][1] = "";
        players[enemy][2] = 0;
        players[enemy][3] = false;
    });

    socket.on("disconnect", () => {
        var player = getPlayerNumber(socket.id);
        console.log(socket.id + " disconnected, online - "+ io.engine.clientsCount);

        if(queueID[0] == players[player][0]){
            queueID[0] = "";
        }

        socket.broadcast.emit("updateUserCount", {
            playersOnline: io.engine.clientsCount
        });

        if(players[player][2] != 0){
            rooms.splice(rooms.indexOf(players[player][2]), 1);
        }

        if(players[player][3]){ //if disconnect while in game, we say to enemy that this player disconnected
            var enemy = getPlayerNumber(players[player][1]);
            players[enemy][1] = "";
            players[enemy][2] = 0;
            players[enemy][3] = false;
            
            io.sockets.connected[players[enemy][0]].emit("gameStop", {
                reason: "System: enemy disconnected"
            });
        }

        players.splice(player, 1);
    });
});

function socketMessage(socket, text, messageKind){
    io.to(socket).emit("message", {
        message: text,
        messageKind: messageKind // 0- system message, 1- enemy player
    });
}

function getPlayerNumber(id){
    for(var i = 0; i < players.length; i++){
        if(players[i][0] == id)
            return i;
    }
}

server.listen(80, () => {
    console.log("Server started");
});

//npm run dev
