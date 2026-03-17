const home = document.getElementById("home");
const ticks = document.getElementById("game");
const scoreBoard = document.getElementById("scoreboard");
const htmlBoard = document.getElementById("board");
const lowerText = document.getElementById("lowmessage");


function cell (status, location, prev, next) {
    this.status = status;
    this.location = location;
    this.prev = prev;
    this.next = next;
}

let board = []

snake = []  

score = 1;
scoreBoard.innerText = score;

let snakeHead = null;
let snakeTail = null;

const wall = '⬛';
const app = '🍎';
const app2 = '🍏';
const sup = '⬆️';
const sleft = '⬅️';
const sdown = '⬇️';
const sright = '➡️';
const body = '🟢'



function makeBoard(){
    // 16 x 16 board
    for (let y = 0; y < 16; y++){
        const row = [];
        for (let x = 0; x < 16; x++){
            row.push(new cell(wall, [x, y], null, null));            
            // if (y % 2 == 0){
            //     row.push(new cell('#', [x, y]));            
            // }
            // else{
            //     row.push(new cell('X', [x, y]));            
            // }            
            if (x == 8 & y == 6) {
                row[8].status = body;
            }
            if (x == 8 && y == 7) {
                row[8].status = sdown;
            }


        }
        board.push(row)
        //console.log(row);
    }
    //console.log(board[1]);
    snakeTail = board[6][8];
    snakeHead = board[7][8];
    snakeTail.next = snakeHead;
    snakeHead.prev = snakeTail;    
}


const dirs = [sup, sleft, sdown, sright];

function drawBoard(){
    // Reset Board
    htmlBoard.textContent = "";

    //Redraw board
    board.forEach(row => {
        row.forEach(c => {
            htmlBoard.textContent += c.status;           
            // if (dirs.includes(c.status)){
            //     snakeHead = c;
            // }            
        });
        htmlBoard.textContent += "\n";
    });

}

document.addEventListener('keydown', function(event){
    if (event.key === 'w'){
        handleMovement(sup);
        // console.log(snakeHead);
        //board[snakeHead.location[1]][snakeHead.location[0]].status = '^';

    }

    if (event.key === 'a'){
        handleMovement(sleft);
        //board[snakeHead.location[1]][snakeHead.location[0]].status = '<';
    }

    if (event.key === 's'){
        handleMovement(sdown);
        //board[snakeHead.location[1]][snakeHead.location[0]].status = 'v';
    }

    if (event.key === 'd'){
        handleMovement(sright);
        //board[snakeHead.location[1]][snakeHead.location[0]].status = '>';
    }

    if (event.key === 'b'){
        console.log(apples);
        //console.log(snakeHead);
        // board.forEach(ca =>{
        //     console.log(ca);
        // });
    }
});

function handleMovement(dir){
    // 1 up - 2 left - 3 down - 4 right
    // If not going in opposite direction, change directions
    //console.log(snakeHead.status);

    if (Math.abs(dirs.indexOf(snakeHead.status) - dirs.indexOf(dir)) !== 2 ){
        board[snakeHead.location[1]][snakeHead.location[0]].status = dir;
    }
}


moveCount = 0;

//moveFrameGap = 8;

function moveSnake(){

    function checkSpace(x, y){
        if (0 > x || x >= board[0].length || 0 > y || y >= board.length){            
            return false;
        }
        else if (board[y][x].status == body){
            return false;
        }
        else {            
            return true;
                        //move head to correct square
            //move all body segments forward
            // board[y][x].status = snakeHead.status; 
            // board[y][x] = snakeHead;
            
            // c = snakeHead;
            // cou = 0;
            // while (c.prev != null){

            //     c = c.prev;
            //     cou++;
            //     board[c.location[1]][c.location[0]].status = c.status;
            //     //board[c.location[1]][c.location[0]] = c;
            // }
            // console.log(cou);
        }
    }

    //If it's a moving frame, move (skips amount of frames specified in moveFrameGap)
    if (moveCount == moveFrameGap){        

        x = snakeHead.location[0];
        y = snakeHead.location[1];
        tailX = snakeTail.location[0];
        tailY = snakeTail.location[1];

        moveCount = 0; 

        //Checks snake head direction, updates x / y shift accordingly
        dx = 0, dy = 0;
        if (snakeHead.status ==sup) dy = -1;
        if (snakeHead.status ==sleft) dx = -1;
        if (snakeHead.status ==sdown) dy = 1;
        if (snakeHead.status ==sright) dx = 1;

    //checks if space is occupied by body / out of bounds
    if (checkSpace(x + dx, y + dy)) {
      
        //if eating an apple, removes apple from list, update score
        if (board[y + dy][x + dx].status == app){               
            apples.splice(apples.indexOf([x + dx, y + dy]), 1);    
            changeScore(1, "add");        
        }
        else{
            // only removes tail if not eating an apple
            board[snakeTail.location[1]][snakeTail.location[0]].status = wall;
            snakeTail = snakeTail.next;
            snakeTail.prev = null;
        }

        // create new head
        newHead = board[y + dy][x + dx];
        newHead.status = snakeHead.status;

        snakeHead.next = newHead;
        newHead.prev = snakeHead;
        snakeHead.status = body;
        snakeHead = newHead;

        board[snakeTail.location[1]][snakeTail.location[0]].status = body;
    }
    else{
        gameOver();
    }
        }

        moveCount++;
}

//Apples spawned at a time
//maxApples = 2;
//Stores apple locations
apples = [];

function createApple(){
    //Randomly distributes apples until hits max apples
    while (apples.length < maxApples){
        pos = [Math.floor(Math.random() * board[0].length), Math.floor(Math.random() * board.length)];        
        if (board[pos[1]][pos[0]].status == wall){
            board[pos[1]][pos[0]].status = app;
            apples.push([pos[0], pos[1]]); 
        }
    }
    // if (apples.length < maxApples){
    //     for (const row of board){
    //             for (const c of row){
    //                 if (c.status == wall){
    //                     c.status = app;   
    //                     apples.push([c.location[0], c.location[1]]);
    //                     return true;
    //                 }
    //             }
    //         }
    // }
    
}


function changeScore(amt, mode){
    // 1 add | 2 subtract | 3 multiply | 4 divide
    if (mode == "add" || mode == "1"){
        score += amt;
    }
    scoreBoard.innerText = score;
}

function gameOver(){
    lowerText.innerText = "You lost!"; 
    clearInterval(gameId);
}


i = 0;
function update(){
    i++;
    ticks.innerText = i;
    drawBoard();
    createApple();
    moveSnake();
}

// const startButton = document.createElement("button");
// startButton.textContent = "Play";
// startButton.addEventListener("click", startGame);
// home.appendChild(startButton);


const slider = document.getElementById("difficulty");

function updateColour(){
    const r = Math.round((slider.value - 1) * 255 / 4);
    const g = 255 - Math.round((slider.value - 1) * 255 / 4);
    slider.style.accentColor = `rgb(${r}, ${g}, 0)`;
}

slider.addEventListener("input", updateColour);

updateColour();

function startGame(){

    //+ Converts slider.value into a number
    difValue = +slider.value;
    // Adjusts slider so max and min values are extreme
    if (difValue == slider.min){
        difValue -= 0.01;
    }
    else if (difValue == slider.max){
        difValue += 0.01;
    }

    //Sets max apples and speed based on difficulty slider
    maxApples = 6 - difValue;
    moveFrameGap = parseInt(13 - difValue * 2);
    // console.log(moveFrameGap);

    home.style.display = "none";
    document.getElementById("gameplay").style.display = "block";
    makeBoard();
    gameId = setInterval(update, 62.5);
}