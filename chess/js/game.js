var io = io();

var contentVisible = false;

var playerColor = 1; // 0- black  1- white
var playerMove = 1; // 0- black  1- white

var isSelected = false;
var selected = []; // x  y

var enabledHistory = false;
var moveHistory = []; // x y toX toY

var board = []; //  0- free  1-6 - black pieces 11-16 - white pieces
var possibleMoves = []; // 0 - nothing  1 - move  2 - destroy enemy

for(var i = 0; i < 8; i++){
	board[i] = [];
	for(var j = 0; j < 8; j++){
		board[i][j] = 0;
	}
}
for(var i = 0; i < 8; i++){
	possibleMoves[i] = [];
	for(var j = 0; j < 8; j++){
		possibleMoves[i][j] = 0;
	}
}

function menuSwitch(n){
	$(".connection-content").css("display", "none");
	$(".game-content").css("display", "none");
	switch(n){
		case 0:
			$(".connection-content").css("display", "block");
			break;
		case 1:
			$(".game-content").css("display", "block");
			break;
	}
}

function showContent(){
	if(contentVisible){
		$(".content").css("display", "none");
		contentVisible = false;
	} else {
		$(".content").css("display", "block");
		contentVisible = true;
	}
}

// functions below for game logic
function arrangePieces(){
	if(playerColor == 0){
		board[0][0] = 12;
		board[0][7] = 12;
		board[0][1] = 13;
		board[0][6] = 13;
		board[0][2] = 14;
		board[0][5] = 14;
		board[0][3] = 16;
		board[0][4] = 15;
		for(var i = 0; i < 8; i++){
			board[1][i] = 11;
		}
		for(var j = 0; j < 8; j++){
			board[6][j] = 1;
		}
		board[7][0] = 2;
		board[7][7] = 2;
		board[7][1] = 3;
		board[7][6] = 3;
		board[7][2] = 4;
		board[7][5] = 4;
		board[7][3] = 6;
		board[7][4] = 5;
	} else {
		board[0][0] = 2;
		board[0][7] = 2;
		board[0][1] = 3;
		board[0][6] = 3;
		board[0][2] = 4;
		board[0][5] = 4;
		board[0][3] = 5;
		board[0][4] = 6;
		for(var i = 0; i < 8; i++){
			board[1][i] = 1;
		}
		for(var j = 0; j < 8; j++){
			board[6][j] = 11;
		}
		board[7][0] = 12;
		board[7][7] = 12;
		board[7][1] = 13;
		board[7][6] = 13;
		board[7][2] = 14;
		board[7][5] = 14;
		board[7][3] = 15;
		board[7][4] = 16;
	}
}

function drawBoard(){
	$(".chess-table").remove();
	$(".game").append("<table class='chess-table'>");

	var switcher = 0;
	for (var i = 0; i < 8; i++) {
		$(".chess-table").append("<tr class='table-tr-"+ i +"'>");
		for (var j = 0; j < 8; j++) {
			if(switcher == 0){
				$(".table-tr-"+ i).append("<td class='table-cell brawn-light' id='t"+ j + i +"' onclick='cellPress(\"#t"+ j + i +"\")'></td>");
				switcher = 1;
			} else {
				$(".table-tr-"+ i).append("<td class='table-cell brawn-dark' id='t"+ j+ i +"' onclick='cellPress(\"#t"+ j + i +"\")'></td>");
				switcher = 0;
			}
		}
		if(switcher == 0)
			switcher = 1;
		else
			switcher = 0;
		$(".game").append("</tr>");
	}
	$(".game").append("</table>");

	if(enabledHistory){
		$("#t"+ moveHistory[1] + moveHistory[0]).css("background-color", "grey");
		$("#t"+ moveHistory[3] + moveHistory[2]).css("background-color", "grey");
	}

	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if(possibleMoves[i][j] == 1){
				$("#t"+ i + j).css("background-color", "yellow");
			}
			if(possibleMoves[i][j] == 2){
				$("#t"+ i + j).css("background-color", "red");
			}
		}
	}

	if(isSelected){
		$("#t"+ selected[0] + selected[1]).css("background-color", "green");
	}
}

function drawPieces(){
	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){
			if(board[i][j] == 1)
				$("#t"+ j + i).css("backgroundImage", "url(images/pawn-dark.png)");
			if(board[i][j] == 2)
				$("#t"+ j + i).css("backgroundImage", "url(images/rook-dark.png)");
			if(board[i][j] == 3)
				$("#t"+ j + i).css("backgroundImage", "url(images/knight-dark.png)");
			if(board[i][j] == 4)
				$("#t"+ j + i).css("backgroundImage", "url(images/bishop-dark.png)");
			if(board[i][j] == 5)
				$("#t"+ j + i).css("backgroundImage", "url(images/queen-dark.png)");
			if(board[i][j] == 6)
				$("#t"+ j + i).css("backgroundImage", "url(images/king-dark.png)");

			if(board[i][j] == 11)
				$("#t"+ j + i).css("backgroundImage", "url(images/pawn-light.png)");
			if(board[i][j] == 12)
				$("#t"+ j + i).css("backgroundImage", "url(images/rook-light.png)");
			if(board[i][j] == 13)
				$("#t"+ j + i).css("backgroundImage", "url(images/knight-light.png)");
			if(board[i][j] == 14)
				$("#t"+ j + i).css("backgroundImage", "url(images/bishop-light.png)");
			if(board[i][j] == 15)
				$("#t"+ j + i).css("backgroundImage", "url(images/queen-light.png)");
			if(board[i][j] == 16)
				$("#t"+ j + i).css("backgroundImage", "url(images/king-light.png)");
		}
	}
}

function getPieceColor(x, y){
	if(board[x][y] == 11 || board[x][y] == 12 || board[x][y] == 13 || board[x][y] == 14 || board[x][y] == 15 || board[x][y] == 16)
		return 0;
	if(board[x][y] == 1 || board[x][y] == 2 || board[x][y] == 3 || board[x][y] == 4 || board[x][y] == 5 || board[x][y] == 6)
		return 1;
}

function cellPress(id){
	if(playerColor == playerMove){
		var temp = id.toString().split('');
		if(isSelected){
			if(getPieceColor(temp[3], temp[2]) == (playerColor == 0 ? 1 : 0)){
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 8; j++) {
						possibleMoves[j][i] = 0;
					}
				}
				selectPiece(temp);
				drawBoard();
				drawPieces();
			} else if(possibleMoves[temp[2]][temp[3]] != 0){
				isSelected = false;
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 8; j++) {
						possibleMoves[j][i] = 0;
					}
				}
				io.emit("movePiece", {
					x: selected[0],
           			y: selected[1],
            		toX: temp[2],
            		toY: temp[3]
				});
				movePiece(selected[1], selected[0], temp[3], temp[2]);
			}
		} else {
			selectPiece(temp);
			drawBoard();
			drawPieces();
		}
	}
}

function selectPiece(temp){
	selected[0] = parseInt(temp[2]);
	selected[1] = parseInt(temp[3]);

	if(getPieceColor(selected[1], selected[0]) == playerColor){
		isSelected = false;
	} else {
		if(board[selected[1]][selected[0]] == 0){
			isSelected = false;
		} else {
			isSelected = true;
			checkPossibleMoves(selected[0], selected[1]);
		}
	}
}

function checkPossibleMoves(y, x){
	if(board[x][y] == 1 || board[x][y] == 11){ // pawn
		if(x > 0){
			if(board[x-1][y] == 0){
				possibleMoves[y][x-1] = 1;
				if(x == 6){
					if(board[x-2][y] == 0){
						possibleMoves[y][x-2] = 1;
					}
				}
			}
			if(y > 0){
				if(getPieceColor(x-1, y-1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-1][x-1] = 2;
				}
			}
			if(y < 7){
				if(getPieceColor(x-1, y+1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+1][x-1] = 2;
				}
			}
		}
	} else if(board[x][y] == 2 || board[x][y] == 12){ // rook 
		if(x > 0){
			for(var i = x - 1; i >= 0; i--){
				if(board[i][y] == 0){
					possibleMoves[y][i] = 1;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y][i] = 2;
					break;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(y < 7){
			for(var i = y + 1; i <= 7; i++){
				if(board[x][i] == 0){
					possibleMoves[i][x] = 1;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[i][x] = 2;
					break;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(x < 7){
			for(var i = x + 1; i <= 7; i++){
				if(board[i][y] == 0){
					possibleMoves[y][i] = 1;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y][i] = 2;
					break;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(y > 0){
			for(var i = y - 1; i >= 0; i--){
				if(board[x][i] == 0){
					possibleMoves[i][x] = 1;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[i][x] = 2;
					break;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 1 : 0)){
					break;
				} 
			}
		}
	} else if(board[x][y] == 3 || board[x][y] == 13){ // knight x|  y-
		if(x > 1){
			if(y > 0){
				if(board[x-2][y-1] == 0){
					possibleMoves[y-1][x-2] = 1;
				} else if(getPieceColor(x-2, y-1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-1][x-2] = 2;
				} 
			}
			if(y < 7){
				if(board[x-2][y+1] == 0){
					possibleMoves[y+1][x-2] = 1;
				} else if(getPieceColor(x-2, y+1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+1][x-2] = 2;
				} 
			}
		}
		if(y < 6){
			if(x > 0){
				if(board[x-1][y+2] == 0){
					possibleMoves[y+2][x-1] = 1;
				} else if(getPieceColor(x-1, y+2) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+2][x-1] = 2;
				} 
			}
			if(x < 7){
				if(board[x+1][y+2] == 0){
					possibleMoves[y+2][x+1] = 1;
				} else if(getPieceColor(x+1, y+2) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+2][x+1] = 2;
				} 
			}
		}
		if(x < 6){
			if(y > 0){
				if(board[x+2][y-1] == 0){
					possibleMoves[y-1][x+2] = 1;
				} else if(getPieceColor(x+2, y-1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-1][x+2] = 2;
				} 
			}
			if(y < 7){
				if(board[x+2][y+1] == 0){
					possibleMoves[y+1][x+2] = 1;
				} else if(getPieceColor(x+2, y+1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+1][x+2] = 2;
				} 
			}
		}
		if(y > 1){
			if(x > 0){
				if(board[x-1][y-2] == 0){
					possibleMoves[y-2][x-1] = 1;
				} else if(getPieceColor(x-1, y-2) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-2][x-1] = 2;
				} 
			}
			if(x < 7){
				if(board[x+1][y-2] == 0){
					possibleMoves[y-2][x+1] = 1;
				} else if(getPieceColor(x+1, y-2) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-2][x+1] = 2;
				} 
			}
		}
	} else if(board[x][y] == 4 || board[x][y] == 14){ // bishop
		if(x > 0){
			if(y > 0){
				for(var i = x-1, j = y-1; i >= 0 && j >= 0; i--, j--){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
			if(y < 7){
				for(var i = x-1, j = y+1; i >= 0 && j <= 7; i--, j++){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
		}
		if(x < 7){
			if(y > 0){
				for(var i = x+1, j = y-1; i <= 7 && j >= 0; i++, j--){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
			if(y < 7){
				for(var i = x+1, j = y+1; i <= 7 && j <= 7; i++, j++){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
		}
	} else if(board[x][y] == 5 || board[x][y] == 15){ // queen
		if(x > 0){
			for(var i = x - 1; i >= 0; i--){
				if(board[i][y] == 0){
					possibleMoves[y][i] = 1;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y][i] = 2;
					break;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(y < 7){
			for(var i = y + 1; i <= 7; i++){
				if(board[x][i] == 0){
					possibleMoves[i][x] = 1;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[i][x] = 2;
					break;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(x < 7){
			for(var i = x + 1; i <= 7; i++){
				if(board[i][y] == 0){
					possibleMoves[y][i] = 1;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y][i] = 2;
					break;
				} else if(getPieceColor(i, y) == (playerColor == 0 ? 1 : 0)){
					break;
				}
			}
		}
		if(y > 0){
			for(var i = y - 1; i >= 0; i--){
				if(board[x][i] == 0){
					possibleMoves[i][x] = 1;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[i][x] = 2;
					break;
				} else if(getPieceColor(x, i) == (playerColor == 0 ? 1 : 0)){
					break;
				} 
			}
		}
		if(x > 0){
			if(y > 0){
				for(var i = x-1, j = y-1; i >= 0 && j >= 0; i--, j--){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
			if(y < 7){
				for(var i = x-1, j = y+1; i >= 0 && j <= 7; i--, j++){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
		}
		if(x < 7){
			if(y > 0){
				for(var i = x+1, j = y-1; i <= 7 && j >= 0; i++, j--){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
			if(y < 7){
				for(var i = x+1, j = y+1; i <= 7 && j <= 7; i++, j++){
					if(board[i][j] == 0){
						possibleMoves[j][i] = 1;
					} else if(getPieceColor(i, j) == (playerColor == 0 ? 0 : 1)){
						possibleMoves[j][i] = 2;
						break;
					}  else if(getPieceColor(i, j) == (playerColor == 0 ? 1 : 0)){
						break;
					}
				}
			}
		}
	} else if(board[x][y] == 6 || board[x][y] == 16){ // king
		if(y > 0){
			if(board[x][y-1] == 0){
				possibleMoves[y-1][x] = 1;
			} else if(getPieceColor(x, y-1) == (playerColor == 0 ? 0 : 1)){
				possibleMoves[y-1][x] = 2;
			}
		}
		if(y < 7){
			if(board[x][y+1] == 0){
				possibleMoves[y+1][x] = 1;
			} else if(getPieceColor(x, y+1) == (playerColor == 0 ? 0 : 1)){
				possibleMoves[y+1][x] = 2;
			}
		}
		if(x > 0){
			if(board[x-1][y] == 0){
				possibleMoves[y][x-1] = 1;
			} else if(getPieceColor(x-1, y) == (playerColor == 0 ? 0 : 1)){
				possibleMoves[y][x-1] = 2;
			}
			if(y > 0){
				if(board[x-1][y-1] == 0){
					possibleMoves[y-1][x-1] = 1;
				} else if(getPieceColor(x-1, y-1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-1][x-1] = 2;
				}
			}
			if(y < 7){
				if(board[x-1][y+1] == 0){
					possibleMoves[y+1][x-1] = 1;
				} else if(getPieceColor(x-1, y+1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+1][x-1] = 2;
				}
			}
		}
		if(x < 7){
			if(board[x+1][y] == 0){
				possibleMoves[y][x+1] = 1;
			} else if(getPieceColor(x+1, y) == (playerColor == 0 ? 0 : 1)){
				possibleMoves[y][x+1] = 2;
			}
			if(y > 0){
				if(board[x+1][y-1] == 0){
					possibleMoves[y-1][x+1] = 1;
				} else if(getPieceColor(x+1, y-1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y-1][x+1] = 2;
				}
			}
			if(y < 7){
				if(board[x+1][y+1] == 0){
					possibleMoves[y+1][x+1] = 1;
				} else if(getPieceColor(x+1, y+1) == (playerColor == 0 ? 0 : 1)){
					possibleMoves[y+1][x+1] = 2;
				}
			}
		}
	}
}

function movePiece(x, y, toX, toY){
	if(playerColor == 0){
		if(board[toX][toY] == 16){
			io.emit("gameOver");
		}
	} else {
		if(board[toX][toY] == 6){
			io.emit("gameOver");
		}
	}

	board[toX][toY] = 0;
	board[toX][toY] = board[x][y];
	board[x][y] = 0;

	moveHistory[0] = x;
	moveHistory[1] = y;
	moveHistory[2] = toX;
	moveHistory[3] = toY;
	enabledHistory = true;

	drawBoard();
	drawPieces();

	playerMove = (playerMove == 1? 0 : 1);
}

$(document).ready(function(){
	drawBoard();
})

//functions below for connection logic
io.on("updateUserCount", (data) =>{
	$(".players-online").remove();
	$(".nav-menu").append("<li class='players-online'><p> Players online- "+ data.playersOnline +"</p></li>");
});

io.on("gameStart", (data) => {
	playerColor = data.playerColor;

	$("#textArea").append("System: the game has begun!\n");

	arrangePieces();
	drawPieces();
});

io.on("gameStop", (data) => {
	$("#textArea").append(data.reason +"\n");

	enabledHistory = false;

	for(var i = 0; i < 8; i++)
		for(var j = 0; j < 8; j++)
			board[i][j] = 0;

	drawBoard();
});

io.on("message", (data) => {
	if(data.messageKind == 0)
		$("#textArea").append("System: "+ data.message +"\n");
	if(data.messageKind == 1)
		$("#textArea").append("Enemy: "+ data.message +"\n");
	if(data.messageKind == 2)
		$("#textArea").append("You: "+ data.message +"\n");
});

io.on("movePiece", (data) => {
	movePiece(7-data.y, 7-data.x, 7-data.toY, 7-data.toX);
});

io.on("menuSwitch", ()=> {
	menuSwitch(1);
});

io.on("askDraw", () => {
	if(!document.hasFocus()){
		var temp = false;
		var interval = setInterval(() => {
			if(!temp){
				document.title = "New message!";
				temp = !temp;
			} else {
				document.title = "Chess";
				temp = !temp;
			}
			if(document.hasFocus()){
				clearInterval(interval);
				document.title = "Chess";
				if(confirm("Opponent offers a draw, do you agree?")){
					io.emit("drawAnswer", {
						answer: true
					});
				} else {
					io.emit("drawAnswer", {
						answer: false
					});
				}
			}
		}, 1000);
	}
});

function createRoom(){
	io.emit("createRoom");
}

function joinRoom(){
	io.emit("joinRoom", {
		roomID: $("#roomID").val()
	});
}

function findRoom(){
	menuSwitch(1);
	io.emit("randomPlayerSearch");
}

$('#message').on('keydown', function(e) { 
    if (e.which == 13) { 		//if Enter
        sendMessage();
    }
});
function sendMessage(){
	if($("#message").val() != ""){
		io.emit("message", {
			message: $("#message").val()
		});

		$("#message").val("");
	}	
}

function surrender(){
	if(confirm("Are you sure you want to give up"))
		io.emit("surrender");
}

function draw(){
	io.emit("askDraw");
}