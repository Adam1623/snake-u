window.switchSignIn = switchSignIn;
window.createTooltip = createTooltip;

//Main containers (home screen, game screen, timed mode exclusives)
const home = document.getElementById("home");
const gameMain = document.getElementById("gameplay");
const timedInterface = document.getElementById("timedMode");
const footer = document.querySelector('footer');
const signInMenu = document.getElementById("signInMenu");
const leaderboardMenu = document.getElementById("leaderboardMenu");

//Smaller elements (tick count, scoreboard)
const ticks = document.getElementById("ticks");
const scoreBoard = document.getElementById("scoreboard");
const multiplier = document.getElementById("multiplier");
const htmlBoard = document.getElementById("board");
const lowerText = document.getElementById("lowmessage");
const bd = document.body;
const timer = document.getElementById("timer");
const countdown = document.getElementById("countdown");
const gameReport = document.getElementById("gameReport");

const tooltip1 = document.getElementById("tooltip1");
const tooltips = [tooltip1];

//Button div containers (retry, home)
const retryB = document.getElementById("retryB");
const homeB = document.getElementById("homeB");

const evilBg = document.getElementById("evilBg");

const dSlider = document.getElementById("difficulty");

const babyPic = document.getElementById("baby");
const snakePic = document.getElementById("evilsnake");

//Mobile controls
const mobileControls = document.getElementById("mobileControls");
const innerJoystick = document.getElementById("innerJoystick");


evilMode = false;

// debug event listener for testing
document.addEventListener('keydown', function(event){    
        if (event.key === 'p'){
            createTooltip(0, true, "Successfully signed in!", "tooltip successMsg", "pop fadeOut", null);
            // tooltip1.innerHTML = "<button class='tooltipClose' onclick='closeTooltip(0)'>close</button><h2> Pro tip! </h2> press space bar <br> to restart instantly";
            // tooltip1.style.display == "flex" ? tooltip1.style.display = "none": tooltip1.style.display = "flex";            
        }});

function cell (status, location, prev, next) {
    this.status = status;
    this.location = location;
    this.prev = prev;
    this.next = next;
}

async function createTooltip(id, closeable, content, classes, anims, styles){
    let tip = tooltips[id];

    if (classes) tip.classList = classes;
    if (styles) Object.assign(tip.style, {styles});    

    let temphtml = "";
    
    if (closeable) temphtml += `<button tabindex='0' class='tooltipClose' onclick='closeTooltip(${id})' style="color:rgb(129, 129, 129) ">X</button>`;
    temphtml += content;    

    tip.innerHTML = temphtml; 
    tip.style.display = 'flex';    

    const animList = anims.split(" ");

    if (animList.includes('pop')){
        tip.classList.toggle('pop');
        await sleep(500);
        tip.classList.toggle('pop');
    }
    if (animList.includes('fadeOut')){
        tip.classList.toggle('fadeOut');
        await sleep(1500);
        closeTooltip(id);
    }
}

function closeTooltip(id){
    tooltips[id].style.display = 'none';
}

function setCostumes(){
    if (!evilMode){
        wall = '⬛'; //🟦
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

            appleInfo.push({time: Date.now(), mult: baseMult});                        

            //Special changes if timed mode
            if (isTimed){

                // bad code, but sets threshold initially
                if (snakeLength <= 2){
                    thresh = 3;
                }
                if (!evilMode){
                    if (snakeLength >= thresh && moveFrameGap > 3){
                        moveFrameGap--;
                        thresh += thresh;
                    }                    
                    curTime += 1 * Math.exp(-0.06 * (snakeLength - 1)) / (14 / ((boardX + boardY) / 2)) + 1.5;
                }
                else{
                    if (snakeLength >= thresh && moveFrameGap > 2){
                        moveFrameGap--;
                        thresh += thresh;
                    }
                    curTime += 2 * Math.exp(-0.06 * (snakeLength - 1)) / (14 / ((boardX + boardY) / 2)) + 0.5;
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

function changeMult(amt, mode){
    let tempMult = 0;
    // 1 add | 2 subtract | 3 multiply | 4 divide
    if (mode == "add" || mode == "1"){
        tempMult += amt;
    }
    else if (mode == "subtract" || mode == "2"){
        tempMult -= amt;
    }
    else if (mode == "multiply" || mode == "3"){
        tempMult = baseMult * amt - baseMult;        
    }

    baseMult += tempMult;    

}

function changeScore(amt, mode){
    let tempScore = 0;    
    // Normal, regular
    // +1 per 1 (normal)
    // Multiplier after certain point (maybe +0.1 to multiplier per boardx + boardy score?)

    // 1 add | 2 subtract | 3 multiply | 4 divide | 5 flat (no mult add)
    if (mode == "add" || mode == "1"){
        tempScore += amt;
    }
    else if (mode == "subtract" || mode == "2"){
        tempScore -= amt;
    }
    // adds ignoring baseMult
    else if (mode == "flat" || mode == "5"){
        score += amt;
    }

    tempScore = tempScore * baseMult;

    score += tempScore;

    // quarter done
    if (snakeLength == Math.floor((boardX * boardY) / 4)){        
        changeMult(1.25, "multiply");
    }
    // half done
    else if (snakeLength == Math.floor((boardX * boardY) / 2)){
        changeMult(1.5, "multiply");
    }
    // 3 / 4 done?
    else if (snakeLength == Math.floor((boardX * boardY) / 1.5)){
        changeMult(2, "multiply");
    }

    if (!isTimed){
        if (!evilMode){
            if (snakeLength % Math.floor(((boardX + boardY) / 2)) == 0){
                changeMult(1.2, "multiply");
            }
            if (snakeLength % 5 == 0) changeMult(0.1, "add");
        }
        if (evilMode){
            if (snakeLength % Math.floor(((boardX + boardY) / 2)) == 0){
                // baseMult *= 1.4;
                changeMult(1.4, "multiply");
            }
            changeMult(0.1, "add");
        }
    }

    if (isTimed && amt != 0){        
        changeMult(0.025 + difValue / 40, "add");
    }

    scoreBoard.innerText = Number(score.toFixed(5)).toString();

    const multColourChangeThresh = 5;

    let r = Math.min(240, baseMult * (240 / multColourChangeThresh));
    let g = Math.min(200, baseMult * (200 / multColourChangeThresh));
    let b = 0;
    if (evilMode){
        r = baseMult * (255 / multColourChangeThresh);
        g = r;
        b = r;
    }
    const multColour = `rgb(${r}, ${g}, ${b})`;    

    // Makes multiplier shiny once you hit the threshold
    if (baseMult >= multColourChangeThresh){
        multiplier.style.removeProperty("color");
        if (!multiplier.classList.contains("shimmer-text")) {multiplier.classList.add("shimmer-text");}
        if (!evilMode){
            multiplier.style.setProperty("--c1", "#b18700");
            multiplier.style.setProperty("--c2", "#ffe77d");
            multiplier.style.setProperty("--c3", "#b18700");
        }
        else{
            multiplier.style.setProperty("--c1", "#ffffff");
            multiplier.style.setProperty("--c2", "#797979");
            multiplier.style.setProperty("--c3", "#ffffff");
        }
    } 
    else {multiplier.style.color = multColour;}
    //multiplier.style.color = "#FFFFFF";

    multiplier.style.fontSize = `${Math.min(baseMult * 2 + 14, 35)}px`
    multiplier.innerText = `x${baseMult.toFixed(2)}`;
    multiplier.style.left = `${scoreBoard.getBoundingClientRect().width + 15 + multiplier.getBoundingClientRect().width / 2}px`;
    multiplier.style.top = `${(scoreBoard.getBoundingClientRect().height / 2) - multiplier.getBoundingClientRect().height / 1.8}px`;

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

    //Stops updating game
    clearInterval(gameId);

    //Stops timer if needed
    if (timerInterval) clearInterval(timerInterval);

    window.handleUpdateScore(Math.floor(score), true);    
    //Shows loss ui
    retryB.style.display = "flex";
    homeB.style.display = "flex";

    //Fixes quick restart
    window.focus();

    //Reset joystick
    if (isMobile){
        mobileControls.style.display = "none";
        mobileControls.style.left = "75%";
        mobileControls.style.top = "30%";
        innerJoystick.style.left = "25%";        
        innerJoystick.style.top = "25%";
        mobileControls.opacity = 0.8;
    }
    //show quick restart tip (not on mobile though)
    else
    {
        createTooltip(0, true, "<h2> Pro tip! </h2> press space bar <br> to restart instantly", "tooltip", "pop", "font-family: 'Pixels'");
    }

    const gameEndTime = performance.now();
    const survivalTime = (gameEndTime - gameStartTime) / 1000;
    gameReport.innerHTML = `Survived for ${Math.round(survivalTime)} seconds <br>Earned ${Math.floor(score)} Snake Points<br> Collected ${snakeLength - 1} apples`;
    gameReport.style.display = 'block';    
    //saves game stats to table
    handleReportGame(Math.round(survivalTime), Math.floor(score), snakeLength - 1, appleInfo);
    //Enables quick restart
    if (quickRestart) window.addEventListener('keydown', handleFastReset);
}

//It's a function??? It's just weird looking
let handleFastReset = function(event){

    if (event.code === 'Space'){
        event.preventDefault();                        
        startGame(null);
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
    //lil bonus to update bg fire image 
    evilBg.style.opacity = evilMode === true ? dSlider.value / 4 - 0.25: 0.0;
}

dSlider.addEventListener("input", updateColour);

document.getElementById("extremeB").addEventListener("click", () => {
    document.getElementById("extremeB").classList.toggle("extremeButtonON");
});

updateColour();

function switchExtreme(){    
    bd.classList.toggle("extremeMenu");

    document.getElementById("playNormalB").classList.toggle("blackonwhite");
    document.getElementById("playTimedB").classList.toggle("blackonwhite");
    document.getElementById("shopButton").classList.toggle("blackonwhite");
    document.getElementById("customizeButton").classList.toggle("blackonwhite");
    document.getElementById("signInButton").classList.toggle("blackonwhite");
    document.getElementById("signOutButton").classList.toggle("blackonwhite");
    document.getElementById("settingsButton").classList.toggle("blackonwhite");
    document.getElementById("createAccountButton").classList.toggle("blackonwhite");
    document.getElementById("leaderboardButton").classList.toggle("blackonwhite");
    document.getElementById("statsButton").classList.toggle("blackonwhite");
    
    scoreBoard.classList.toggle("blackonwhite");    

    evilMode = !evilMode;

    updateColour();
}

//MENU STUFF
function switchSignIn(register){    
    home.style.display = home.style.display == "none" ? "flex": "none";
    signInMenu.style.display = signInMenu.style.display == "none" ? "flex": "none";

    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginName").value = "";

    document.getElementById("signInReq").style.display = register ? "none" : "block";
    document.getElementById("registerReq").style.display = register ? "block" : "none";
    document.getElementById("usernameHolder").style.display = register ? "block" : "none"; 
    document.getElementById("loginHolder").style.display = register ? "none" : "block";      
}

let leaderboardEntries = null;

async function switchLeaderboard(){
    home.style.display = home.style.display == "none" ? "flex": "none";
    leaderboardMenu.style.display = leaderboardMenu.style.display == "none" ? "flex": "none";
    if (!leaderboardEntries) leaderboardEntries = await handleCreateLeaderboard();    

    let listContent = "";
    let count = 0;
    for (entry of leaderboardEntries.leaderboard){
        count++;
        uName = entry.username.length > 25 ? `${entry.username.slice(0, 25)}...` : entry.username;
        if (count <= 3){
            if (count == 1){
                listContent += `<li class='shimmer-text' style='margin-bottom: 15px; font-size: 50px; --c1: #ca9c06; --c2: #f8dd64; --c3: #ca9c06; '>${count}. ${uName} — ${entry.xp} XP</li>`;
            }
            else if (count == 2){
                listContent += `<li class='shimmer-text' style='margin-bottom: 10px; font-size: 40px;'>${count}. ${uName} — ${entry.xp} XP</li>`;
            }
            else if (count === 3){
                listContent += `<li class='shimmer-text' style='margin-bottom: 8px; font-size: 25px; --c1: #66350d; --c2: #b96016; --c3: #66350d; '>${count}. ${uName} — ${entry.xp} XP</li>`;
            }    
        }
        else listContent += `<li>${count}. ${uName} — ${entry.xp} XP</li>`;
    }

    document.getElementById("leaderboardList").innerHTML = listContent;
}
//END OF MENU STUFF

const sliderStep = 0.5;

function homeMenu(){
    //Clears reset listener, in case it wasn't pressed (can be reset button or home button)
    window.removeEventListener('keydown', handleFastReset);
    home.style.display = "flex";
    footer.style.display = "block";
    gameMain.style.display = "none";
    mobileControls.style.display = "none";
    tooltips.forEach(tip => {
        tip.style.display = "none";
    });   

    homeControls = new AbortController();

    dSlider.addEventListener('keydown', function(event){
        if (event.key === 'ArrowLeft'){               
            event.preventDefault();
            dSlider.value = Math.max(dSlider.min, Number(dSlider.value) - sliderStep);
            dSlider.dispatchEvent(new Event("input"));
        }

        if (event.key === 'ArrowRight'){               
            event.preventDefault();
            dSlider.value = Math.min(dSlider.max, Number(dSlider.value) + sliderStep);
            dSlider.dispatchEvent(new Event("input"));
        }
    }, {signal: homeControls.signal});    
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
    footer.style.display = "none";
    gameReport.style.display = "none";
    gameReport.innerHTML = "";

    tooltips.forEach(tip => {
        tip.style.display = "none";
    });   

    //list of apple times + points earned
    appleInfo = [];
    
    homeControls.abort();

    i = 0;

    apples = [];

    board = []

    snake = []  

    lastMove = sdown;

    snakeLength = 1;
    score = 0;
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
        changeMult(0.1, "add");        
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
        changeMult(dSlider.value / 6 - 0.5, "add");        
    }
    else{
        maxApples = Math.ceil(difValue / 2);
        moveFrameGap = Math.floor(6 - difValue / 5);

        edgeOdds = Math.ceil(difValue * 10) + 10;

        boardX = Math.ceil(7 + difValue * 2);
        boardY = Math.ceil(7 + difValue * 2);

        //moveFrameGap = parseInt(24 - difValue * 4);

        //score
        changeMult(2.5, "multiply");        
    }

    maxSnakeLength = boardX * boardY;

    home.style.display = "none";
    gameMain.style.display = "block";

    isMobile = navigator.userAgentData.mobile;
    // isMobile = true;
    if (isMobile){
        mobileControls.style.display = "block";
    }
    else {mobileControls.style.display = "none";}

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
        htmlBoard.style.marginTop = "85px";
    }
    else if (mode == 1 || mode == 'timed'){
        // TIMED MODE

        htmlBoard.style.marginTop = "130px";

        if ((boardX + boardY) / 2 >= 14){
            maxApples = 2;
        }
        else maxApples = 1;

        moveFrameGap = 12;
        if (!evilMode){
            moveFrameGap += 1;
            maxSnakeLength = (boardX * boardY) / 8 + (boardX + boardY) / 2 + Math.floor(difValue);
        }
        else{
            moveFrameGap -= 3;
            maxSnakeLength = (boardX * boardY) / 6 + Math.floor(difValue * 2);
        }
        
        //clean up
        timer.style.removeProperty("color");
        timer.style.removeProperty("font-size");
        
        curTime = Math.floor((boardX + boardY) / 6);
        if (!evilMode) {curTime += Math.floor(dSlider.max - difValue) + 5; baseMult = Math.min(Math.max(baseMult, 0.9), 1.1);} 
        else {curTime += Math.floor((difValue - 1)); changeMult(0.5, "multiply"); changeMult((dSlider.max - difValue / 2) / 5, "add");}
        isTimed = true;
        timer.innerText = curTime.toFixed(2);
        timedInterface.style.display = "block";
    }

    timerInterval = null;
    

    gameControls = new AbortController();
    
    document.addEventListener('keydown', function(event){
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
            //debug button
        }
    }, {signal: gameControls.signal});

    //Mobile controls, only appear if mobile detected
    if (isMobile){

        function moveInnerJoystick(event){
            //gets outer circle (joystick container)
            const rect = mobileControls.getBoundingClientRect();

            const magX = Math.max(-1, Math.min( 1, ((event.touches[0].clientX - rect.left) / rect.width) * 2 - 1));
            const magY = Math.max(-1, Math.min( 1, ((event.touches[0].clientY - rect.top) / rect.height) * 2 - 1));

            //calculates based on joystick position on screen
            const x = Math.floor(rect.width / 2 * magX + rect.width / 2) / 2;
            const y = Math.floor(rect.height / 2 * magY + rect.height / 2) / 2;
           
            innerJoystick.style.left = x + "px";
            innerJoystick.style.top = y + "px";

            // Check which direction is stronger, so only 4 directions are considered
            // Nested if simulates deadzone, can be increased / decreased
            if (Math.abs(magX) > Math.abs(magY)){ //more x than y, so left / right
                if (Math.abs(magX) > 0.2) magX >= 0 ? handleMovement(sright): handleMovement(sleft);
            }
            else{ //more y than x, so up / down
                if (Math.abs(magY) > 0.2) magY >= 0 ? handleMovement(sdown): handleMovement(sup);
            }
        }

        document.addEventListener('touchmove', function(event){
            event.preventDefault();
            moveInnerJoystick(event);
        }, {signal: gameControls.signal, passive: false});

        //moves joystick to touched position
        document.addEventListener('touchstart', function(event){
            event.preventDefault();

            const x = event.touches[0].clientX;
            const y = event.touches[0].clientY;

            const rect = mobileControls.getBoundingClientRect();
            const left = rect.left;
            const right = rect.right;
            const top = rect.top;
            const bottom = rect.bottom;

            //If outside joystick area, move it to cursor
            if (x > right || x < left || y < top || y > bottom){
                mobileControls.style.left = event.touches[0].clientX - (mobileControls.getBoundingClientRect().width / 2);
                mobileControls.style.top = event.touches[0].clientY - (mobileControls.getBoundingClientRect().height / 2);
                innerJoystick.style.left = "25%";        
                innerJoystick.style.top = "25%";
            }            
            else {moveInnerJoystick(event);}

            mobileControls.style.opacity = 0.7;
        }, {signal: gameControls.signal, passive: false});

        // resets joystick position after releasing
        document.addEventListener('touchend', function(event){
            innerJoystick.style.left = "25%";        
            innerJoystick.style.top = "25%";
            mobileControls.style.opacity = 0.2;
        }, {signal: gameControls.signal, passive: false});
    }

    //Clears reset listener, in case it wasn't pressed
    window.removeEventListener('keydown', handleFastReset);

    // Displays board, freezes for a second, then starts timer / game loop
    update();

    changeScore(0, 'flat')


    //handshake with server
    gameStartTime = performance.now();
    window.handleStartGame();    

    onScreenCount(1000);
    await sleep(1000);

    if (isTimed) timedManagement();

    //1000 / 60 = 17 frame refresh of ~17 milliseconds is around 60fps
    gameId = setInterval(update, 17);
}

//Calls home menu to ensure home controls are enabled
homeMenu();
