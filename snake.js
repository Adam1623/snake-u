//Main containers (home screen, game screen, timed mode exclusives)
const home = document.getElementById("home");
const gameMain = document.getElementById("gameplay");
const timedInterface = document.getElementById("timedMode");

//Smaller elements (tick count, scoreboard)
const ticks = document.getElementById("ticks");
const scoreBoard = document.getElementById("scoreboard");
const multiplier = document.getElementById("multiplier");
const htmlBoard = document.getElementById("board");
const lowerText = document.getElementById("lowmessage");
const bd = document.body;
const timer = document.getElementById("timer");
const countdown = document.getElementById("countdown");

//Button div containers (retry, home)
const retryB = document.getElementById("retryB");
const homeB = document.getElementById("homeB");




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

function setCostumes(){
    if (!evilMode){
        wall = '🟦';
        app = '🍎';
        app2 = '🍏';
        sup = '⬆️';
        sleft = '⬅️';
        sdown = '⬇️';
        sright = '➡️';
        body = '🟢'
    }
    else if (evilMode){
        wall = '🟥';
        app = '💀';
        app2 = '🍏';
        sup = '⬆️';
        sleft = '⬅️';
        sdown = '⬇️';
        sright = '➡️';
        body = '🟡'
    }
    dirs = [sup, sleft, sdown, sright];
}



function makeBoard(xDim, yDim){
    // 16 x 16 board
    for (let y = 0; y < yDim; y++){
        const row = [];
        for (let x = 0; x < xDim; x++){
            row.push(new cell(wall, [x, y], null, null));            
            // if (y % 2 == 0){
            //     row.push(new cell('#', [x, y]));            
            // }
            // else{
            //     row.push(new cell('X', [x, y]));            
            // }            
            if (x == Math.floor(xDim / 2) && y == Math.floor(yDim / 2) - 2) {
                row[x].status = body;
            }
            if (x == Math.floor(xDim / 2) && y == Math.floor(yDim / 2) - 1) {
                row[x].status = sdown;
            }


        }
        board.push(row)
    }

    snakeTail = board[Math.floor(yDim / 2) - 2][Math.floor(xDim / 2)];
    snakeHead = board[Math.floor(yDim / 2) - 1][Math.floor(xDim / 2)];
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

function handleMovement(dir){
    // 1 up - 2 left - 3 down - 4 right
    // If not going in opposite direction, change directions

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
      
        //EATING APPLE CODE eatapple eat apple
        //if eating an apple, removes apple from list, update score
        if (board[y + dy][x + dx].status == app){               
            apples.splice(apples.indexOf([x + dx, y + dy]), 1);    
            changeScore(1, "add");        

            // this might be a bad idea
            // but snake length is inaccurate for timed mode, it counts # of apples eaten + 1 in reality
            snakeLength++;
                        

            //Special changes if timed mode
            if (isTimed){

                // bad code, but sets threshold initially
                if (snakeLength <= 2){
                    thresh = 3;
                }
                if (!evilMode){
                    if (snakeLength >= thresh && moveFrameGap > 3){
                        moveFrameGap--;
                        thresh += (thresh - 1) / 2;
                    }                    
                    curTime += 1 * Math.exp(-0.08 * (snakeLength - 1)) / (14 / boardX) + 1.5;
                }
                else{
                    if (snakeLength >= thresh && moveFrameGap > 2){
                        moveFrameGap--;
                        thresh += (thresh + 2) / 3;
                    }
                    curTime += 2 * Math.exp(-0.14 * (snakeLength - 1)) / (14 / boardX) + 1;
                }
                
            }
        }
        if (board[y + dy][x + dx].status != app || snakeLength > maxSnakeLength){
            // only removes tail if not eating an apple & less than max length
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

    while (apples.length < maxApples){

        // Edge odds, guaranteed edge apple based on the odds (0 for normal, 30-61 for extreme)
        if (edgeOdds > 0){
            if (Math.random() < edgeOdds / 100){
                let pos = evilAppleSpots[Math.floor(Math.random() * evilAppleSpots.length)];
                if (board[pos[1]][pos[0]].status == wall){
                    board[pos[1]][pos[0]].status = app;
                    apples.push([pos[0], pos[1]]); 
                }
            }
            // repetitive, bad elses
            else {
                let pos = [Math.floor(Math.random() * board[0].length), Math.floor(Math.random() * board.length)];        
                if (board[pos[1]][pos[0]].status == wall){
                    board[pos[1]][pos[0]].status = app;
                    apples.push([pos[0], pos[1]]); 
                }
            }
        }
        else {
            let pos = [Math.floor(Math.random() * board[0].length), Math.floor(Math.random() * board.length)];        
            if (board[pos[1]][pos[0]].status == wall){
                board[pos[1]][pos[0]].status = app;
                apples.push([pos[0], pos[1]]); 
            }
        }
    }
    
}


function changeScore(amt, mode){
    let tempScore = 0;

    // quarter done
    if (snakeLength == Math.floor((boardX * boardY) / 4)){
        baseMult *= 1.25;
    }
    // half done
    if (snakeLength == Math.floor((boardX * boardY) / 2)){
        baseMult *= 1.5;
    }
    // 3 / 4 done?
    if (snakeLength == Math.floor((boardX * boardY) / 1.5)){
        baseMult *= 2;
    }

    if (!evilMode){
        if (snakeLength % Math.floor(((boardX + boardY) / 2)) == 0){
            baseMult *= 1.2;
        }
        if (snakeLength % 10 == 0) baseMult += 0.2;
    }
    if (evilMode){
        if (snakeLength % Math.floor(((boardX + boardY) / 2)) == 0){
            baseMult *= 1.4;
        }
        baseMult += 0.1;
    }
    if (isTimed){
        baseMult += 0.02;
    }
    //how to assign score???

    // Normal, regular
    // +1 per 1 (normal)
    // Multiplier after certain point (maybe +0.1 to multiplier per boardx + boardy score?)

    // 1 add | 2 subtract | 3 multiply | 4 divide
    if (mode == "add" || mode == "1"){
        tempScore += amt;
    }
    if (mode == "subtract" || mode == "2"){
        tempScore -= amt;
    }

    tempScore = tempScore * baseMult;

    score += tempScore;

    scoreBoard.innerText = Number(score.toFixed(5)).toString();

    // fun scoreboard fx
    const fxTime = Math.min(150 + tempScore / 5 , 300);
    const fxSize = Math.min(34 + tempScore * 2, 90);
    scoreBoard.style.transition = `${fxTime}ms`;
    scoreBoard.style.fontSize = `${fxSize}px`;
    setTimeout(() => {
        scoreBoard.style.fontSize = `${40 + snakeLength / 5}px`;
    }, fxTime);
}

function gameOver(){
    //Stops controls
    gameControls.abort();
    lowerText.innerText = "You lost!";     
    clearInterval(gameId);
    if (timerInterval) clearInterval(timerInterval);
    retryB.style.display = "flex";
    homeB.style.display = "flex";
    window.focus();
    //Enables quick restart
    if (quickRestart) window.addEventListener('keydown', handleFastReset);
}

//It's a function??? It's just weird looking
let handleFastReset = function(event){

    if (event.code === 'Space'){
        event.preventDefault();                        
        startGame(null);
        console.log('Spacebar was pressed!'); 
        window.removeEventListener('keydown', handleFastReset);
    }
}

function update(){
    i++;
    ticks.innerText = i;
    drawBoard();
    createApple();
    moveSnake();
}

const dSlider = document.getElementById("difficulty");

const babyPic = document.getElementById("baby");
const snakePic = document.getElementById("evilsnake")

evilMode = false;

function updateColour(){
    if (!evilMode){
        const r = Math.round((dSlider.value - 1) * 255 / 4);
        const g = 255 - Math.round((dSlider.value - 1) * 255 / 4);
        dSlider.style.accentColor = `rgb(${r}, ${g}, 0)`;

        if (+dSlider.value == dSlider.min){
            babyPic.style.display = "block";
        }
        else if (+dSlider.value == dSlider.max){
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
        const gb = 255 - Math.round((dSlider.value - 1) * 255 / 4);        
        dSlider.style.accentColor = `rgb(${c}, ${gb}, ${gb})`;
    }
}

dSlider.addEventListener("input", updateColour);

updateColour();

function switchExtreme(){    
    bd.classList.toggle("extremeMenu");

    document.getElementById("playNormalB").classList.toggle("blackonwhite");
    document.getElementById("playTimedB").classList.toggle("blackonwhite");

    scoreBoard.classList.toggle("blackonwhite");    

    evilMode = !evilMode;

    updateColour();
}

function homeMenu(){
    //Clears reset listener, in case it wasn't pressed (can be reset button or home button)
    window.removeEventListener('keydown', handleFastReset);
    home.style.display = "flex";
    gameMain.style.display = "none";
}

function onScreenCount(c){
    let c2 = c / 1000
    countdown.style.display = "block";
    let countdownInterval = setInterval(() => {
        countdown.innerText = c2.toFixed(2);
        c2 -= 0.01;
        if (c2 <= 0){            
            clearInterval(countdownInterval);            
            countdown.innerText = "0.00";   
            countdown.style.display = "none";                         
        }

    }, 10);
}

function timedManagement(){    
    //curTime

    
    timerInterval = setInterval(() => {
        timer.textContent = curTime.toFixed(2);
        curTime -= 0.01;

        if (curTime <= 3){
            timer.style.fontSize = `${40 + (3 - curTime) * 3}px`;
            timer.style.color = `rgb(${Math.round((3.5 - curTime) * 100)}, 25, 25)`;
        }
        else {
            timer.style.fontSize = "40px";
            timer.style.removeProperty("color");
        }

        if (curTime <= 0){            
            timer.textContent = "0.00";
            gameOver();            
        }

    }, 10);    
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Placeholder, I guess it's a setting you can toggle 
quickRestart = true;

async function startGame(mode){           

    setCostumes();
    retryB.style.display = "none";
    homeB.style.display = "none";

    i = 0;

    apples = [];

    board = []

    snake = []  

    lastMove = sdown;

    snakeLength = 1;
    score = 1;
    scoreBoard.innerText = score;

    moveCount = 0;

    snakeHead = null;
    snakeTail = null;

    lowerText.innerText = "";

    //Score stuff
    baseMult = 1;

    //+ Converts slider.value into a number
    difValue = +dSlider.value;
    // Adjusts slider so max and min values are extreme
    if (difValue == dSlider.min){
        difValue -= 0.01;
    }
    else if (difValue == dSlider.max){
        difValue += 0.01;
        //baseMult += 0.05;
    }

    //Sets max apples and speed based on difficulty slider
    if (!evilMode){
        // Max apples appearing on the board at a time
        maxApples = Math.ceil(6 - difValue);
        // Amount of frames that are drawn before moving (60 FPS tick rate)
        moveFrameGap = parseInt(42 - difValue * 7);
        // Odds apple is guaranteed to spawn on the edge (% of 100)
        edgeOdds = 0;

        boardX = 16;
        boardY = 16;

        //score
        baseMult *= (dSlider.value) / 3;
    }
    else{
        maxApples = Math.ceil(difValue / 2);
        moveFrameGap = Math.floor(6 - difValue / 5);
        console.log(difValue);
        console.log(moveFrameGap);
        edgeOdds = Math.ceil(difValue * 10) + 10;

        boardX = Math.ceil(7 + difValue * 2);
        boardY = Math.ceil(7 + difValue * 2);

        //moveFrameGap = parseInt(24 - difValue * 4);

        //score
        //console.log(baseMult);
        baseMult *= 2 ;//(dSlider.max - dSlider.value) / 3 + 1.5;
    }

    maxSnakeLength = boardX * boardY;

    home.style.display = "none";
    gameMain.style.display = "block";
    makeBoard(boardX, boardY);

    // Finds edges of board, saves the locations to evilAppleSpots
    evilAppleSpots = [];
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board.length; x++) {
                if (x === 0 || x === board.length - 1 || y === 0 || y === board.length - 1) {
                    evilAppleSpots.push([x, y]);
                }
            }
    }        
    

    // The retryB stores whatever mode was last selected. The button returns null if it doesn't change the mode.
    if (!mode){
        mode = retryB.dataset.mode;
    }
    else retryB.dataset.mode = mode;

    //SPECIAL MODE MODIFIERS || 0 = normal || 1 = timed ||
    if (mode == 0 || mode == 'normal'){
        isTimed = false;
        timedInterface.style.display = "none";
    }
    else if (mode == 1 || mode == 'timed'){
        // TIMED MODE
        // Display timer (to 2 decimal places)
        // Start timer
        // Apples make you go faster + add time to timer
        // When the timer runs out without dying, display special message

        moveFrameGap = 12;

        if ((boardX + boardY) / 2 >= 14){
            maxApples = 2;
        }
        else maxApples = 1;

        if (!evilMode){
            moveFrameGap += 1;
            maxSnakeLength = (boardX * boardY) / 8 + (boardX + boardY) / 2
        }
        else{
            moveFrameGap -= 1;
            maxSnakeLength = (boardX * boardY) / 6 
        }
        
        //clean up
        timer.style.removeProperty("color");
        timer.style.removeProperty("font-size");

        curTime = (boardX + boardY) / 4;
        isTimed = true;
        timer.innerText = curTime.toFixed(2);
        timedInterface.style.display = "block";
    }

    timerInterval = null;
    

    gameControls = new AbortController();
    
    document.addEventListener('keydown', function(event){
        event.preventDefault();
        if (event.key === 'w'){               
            handleMovement(sup);
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
            //console.log(evilAppleSpots);
            //console.log(snakeHead);
            // board.forEach(ca =>{
            //     console.log(ca);
            // });
        }
    }, {signal: gameControls.signal});

    //Clears reset listener, in case it wasn't pressed
    window.removeEventListener('keydown', handleFastReset);

    // Displays board, freezes for a second, then starts timer / game loop
    update();

    onScreenCount(1000);
    await sleep(1000);

    if (isTimed) timedManagement();

    gameId = setInterval(update, 17);
}