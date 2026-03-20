const home = document.getElementById("home");
const ticks = document.getElementById("game");
const scoreBoard = document.getElementById("scoreboard");
const htmlBoard = document.getElementById("board");
const lowerText = document.getElementById("lowmessage");
const bd = document.body;
const retryB = document.getElementById("retryB");

function cell (status, location, prev, next) {
    this.status = status;
    this.location = location;
    this.prev = prev;
    this.next = next;
}

// let board = []

// snake = []  

// score = 1;
// scoreBoard.innerText = score;

// let snakeHead = null;
// let snakeTail = null;

const wall = '⬛';
const app = '🍎';
const app2 = '🍏';
const sup = '⬆️';
const sleft = '⬅️';
const sdown = '⬇️';
const sright = '➡️';
const body = '🟢'

const dirs = [sup, sleft, sdown, sright];

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

    // if (Math.abs(dirs.indexOf(snakeHead.status) - dirs.indexOf(dir)) !== 2){
    //     board[snakeHead.location[1]][snakeHead.location[0]].status = dir;
    // }
    if (Math.abs(dirs.indexOf(lastMove) - dirs.indexOf(dir)) !== 2){
        board[snakeHead.location[1]][snakeHead.location[0]].status = dir;
    }
}


// moveCount = 0;

//moveFrameGap = 8;

function moveSnake(){

    function checkSpace(x, y){
        // Checks if out of bounds
        if (0 > x || x >= board[0].length || 0 > y || y >= board.length){            
            return false;
        }
        // Checks if the space you're moving is the body AND not the tail (you can move to the tail spot)
        else if (board[y][x].status == body && board[y][x].prev != null){
            return false;
        }
        else {            
            return true;
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
        if (snakeHead.status ==sup) {dy = -1; lastMove = sup;}
        if (snakeHead.status ==sleft) {dx = -1; lastMove = sleft;}
        if (snakeHead.status ==sdown) {dy = 1; lastMove = sdown;}
        if (snakeHead.status ==sright) {dx = 1; lastMove = sright;}

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

        // Create new head
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

function createApple(){

    if (!evilMode){
        //Randomly distributes apples until hits max apples
        while (apples.length < maxApples){
            pos = [Math.floor(Math.random() * board[0].length), Math.floor(Math.random() * board.length)];        
            if (board[pos[1]][pos[0]].status == wall){
                board[pos[1]][pos[0]].status = app;
                apples.push([pos[0], pos[1]]); 
            }
        }
    }
    else{
        console.log(maxApples);
        while (apples.length < maxApples){
            let c = evilAppleSpots;
            for (let y = 0; y < board.length; y++) {
                for (let x = 0; x < board.length; x++) {
                    // Check if this cell is on the edge
                    if (board[y][x].status == wall){
                        if (x === 0 || x === board.length - 1 || y === 0 || y === board.length - 1) {
                                // board[y][x].status = app;
                                // apples.push(x, y); 
                            if (Math.ceil(Math.random() * evilAppleSpots) >= c){
                                board[y][x].status = app;
                                apples.push(x, y); 
                                x = board.length;
                                y = board.length;
                            }
                        }
                    }
                    c--;
                }
            }

            // for (let x = 0; x < board.length; x++){
                
            // }
            // if (board[])

            // if (Math.ceil(Math.random * evilAppleSpots) >= c){

            // }
            // pos = [Math.floor(Math.random() * board[0].length), Math.floor(Math.random() * board.length)];        
            // if (board[pos[1]][pos[0]].status == wall){
            //     board[pos[1]][pos[0]].status = app;
            //     apples.push([pos[0], pos[1]]); 
            // }
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
    retryB.style.display = "flex";
}

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

const babyPic = document.getElementById("baby");
const snakePic = document.getElementById("evilsnake")

evilMode = false;

function updateColour(){
    if (!evilMode){
        const r = Math.round((slider.value - 1) * 255 / 4);
        const g = 255 - Math.round((slider.value - 1) * 255 / 4);
        slider.style.accentColor = `rgb(${r}, ${g}, 0)`;

        if (+slider.value == slider.min){
            babyPic.style.display = "block";
        }
        else if (+slider.value == slider.max){
            snakePic.style.display = "block";
        }
        else{
            babyPic.style.display = "none";
            snakePic.style.display = "none";
        }
    }
    else {
        babyPic.style.display = "none";
        snakePic.style.display = "none";
        const c = 255;
        const gb = 255 - Math.round((slider.value - 1) * 255 / 4);        
        slider.style.accentColor = `rgb(${c}, ${gb}, ${gb})`;
    }
}

slider.addEventListener("input", updateColour);

updateColour();

function switchExtreme(){    
    bd.classList.toggle("extremeMenu");

    document.getElementById("playB").classList.toggle("blackonwhite");

    evilMode = !evilMode;

    updateColour();
}

function startGame(){


    //console.log(evilMode);
    retryB.style.display = "none";

    i = 0;

    apples = [];

    board = []

    snake = []  

    lastMove = sdown;

    score = 1;
    scoreBoard.innerText = score;

    moveCount = 0;

    snakeHead = null;
    snakeTail = null;

    lowerText.innerText = "";


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
    moveFrameGap = parseInt(42 - difValue * 7);
    console.log(moveFrameGap);

    home.style.display = "none";
    document.getElementById("gameplay").style.display = "block";
    makeBoard();

    //EVIL STUFF

    evilAppleSpots = board.length * 4 - 4;
    
    //

    gameId = setInterval(update, 17);
}