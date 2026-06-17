import { addUser, getUserBySession, signIn, signOut, changePassword, createLeaderboard, fetchStats, startGame, updateScore, reportGame} from "./api.js";

//Lets snake.js access database
window.handleUpdateScore = handleUpdateScore;
window.handleStartGame = handleStartGame;
window.handleCreateLeaderboard = handleCreateLeaderboard;
window.handleReportGame = handleReportGame;
window.handleFetchStats = handleFetchStats;

async function resetErrors(){
    signInStatus.textContent = "";
    signInStatus.className = "";
    usernameI.style.outlineColor = "rgb(1, 39, 109)";
    passwordI.style.outlineColor = "rgb(1, 39, 109)";
    emailI.style.outlineColor = "rgb(1, 39, 109)";
    loginI.style.outlineColor = "rgb(1, 39, 109)";

    usernameE.textContent = "";
    passwordE.textContent = "";
    emailE.textContent = "";
    loginE.textContent = "";
}

const levels = [
    //bronze 1-5
    0, 10, 50, 100, 200,

    //silver 6-10
    500, 1000, 2000, 3000, 5000,

    //gold 11-15
    10000, 15000, 25000, 35000, 50000,

    //plat 16-20
    100000, 125000, 150000, 200000, 300000

];

function getLevel(xp) {
    let level = 1;
    for (let i = 0; i < levels.length; i++) {
        if (xp >= levels[i]) {
            level = i + 1;
        } else {
            break;
        }
    }

    const prev = levels[level - 1];
    const next = levels[level] ?? Infinity; 

    return {level: level, prev: prev, next: next};
}

async function loginVisual(signIn, username, snakePoints, xp){
    if (signIn){
        loginStatus.style.setProperty("--bgc1", "rgb(121, 218, 83)");
        loginStatus.style.setProperty("--bdc1", "rgb(104, 151, 87)");
        loginStatus.innerHTML = `<a style="position: relative; text-decoration: underline; font-size: 0.7cqw;">Signed in as</a><br>${username}`;
        logoutButton.style.display = "block";
        logoutInverseButton.style.display = "none";
        statsButton.disabled = false;

        //update snake point display here, function should take another var
        snakePointsDisplay.innerHTML = `${snakePoints}<img src="./snakepoint.png" class="snakePointIcon">`;
        snakePointsDisplay.style.display = "block";        

        const lvlInfo = getLevel(xp);
        const lvl = lvlInfo.level;
        console.log("xp:", xp, "level:", lvl);

    // <div class="slider-wrapper" style="width: 500px; height: 20px;">
    //   <div class="slider-bg"></div>
    //   <div class="slider-fill"></div>
    //   <input type="range" id="difficulty" style="pointer-events:fill;" min="1" max="5" step="0.001" value="3">    
    // </div>

        const pct = ((xp - lvlInfo.prev) / (lvlInfo.next - lvlInfo.prev)) * 100;
        const xpSlider = `
        <div class="slider-wrapper" style="position: relative; width: 18cqw; height: 1cqw; margin: 0 auto;">
            <div class="slider-bg"></div>
            <div class="slider-fill shimmer-element" style="width: ${pct}%; accent-color: #0c31ac; --c1: #0c31ac; --c2: #2970db; --c3: #0c31ac; --dur: 15s;"></div>
            <input type="range" min="${lvlInfo.prev}" max="${lvlInfo.next}" step="0.001" value="${xp}" style="pointer-events: none;" disabled tabindex="-1">
        </div>`;
        
        xpDisplay.innerHTML = `<a style="font-size: 0.7cqw; color:rgb(54, 54, 54)"> ${xp} xp </a> <br> ${xpSlider} Level ${lvl}`;
        xpDisplay.style.display = "block";
    }
    else{
        loginStatus.style.setProperty("--bgc1", "rgb(211, 211, 211)");
        loginStatus.style.setProperty("--bdc1", "rgb(161, 161, 161)");
        loginStatus.innerHTML = `Signed out`;
        logoutButton.style.display = "none";
        logoutInverseButton.style.display = "block";
        snakePointsDisplay.style.display = "none";
        xpDisplay.style.display = "none";
        statsButton.disabled = true;
    }
}

async function checkCurSession(){
    const signedIn = await getUserBySession();
    if (signedIn && signedIn.username) {loginVisual(true, signedIn.username, signedIn.sp, signedIn.xp);}
    else {
        loginVisual(false, "");
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        document.cookie = `session_id=${guestId}; Path=/; Max-Age=86400; SameSite=Lax`;
    }    

}

async function handleAddUser(){
    resetErrors();
    try{
        const username = usernameI.value.trim();
        const email = emailI.value.trim().toLowerCase();
        const password = passwordI.value;
        const middleName = bonusI.value;
        
        signInStatus.textContent = "Loading..."; 
        signInStatus.className = "neutralMsg";
        await addUser(username, email, password, middleName);
        signInStatus.textContent = "Successfully added user!";
        signInStatus.className = "ambNoti successMsg";
        resetStats();

        //auto sign in
        try{
            if (await getUserBySession()) {await signOut();}
            const status = await signIn(username, password);                
            loginVisual(true, status.user.username, status.user.sp, status.user.xp);  
        } catch(err){
            console.log("failed automatic sign in");
    }
    } catch(err){
        signInStatus.className = "ambNoti errorMsg";

        if (err.validationErrors){
            const errors = err.validationErrors;
            if (errors.includes("Password must be at least 8 characters long") || errors.includes("Password is required")) {
                passwordI.style.outlineColor = "red";
                passwordE.textContent = "Password must be at least 8 characters long";
            }
            if (errors.includes("Invalid email address")) {
                emailI.style.outlineColor = "red";
                emailE.textContent = "Invalid email address";
            }
            if (errors.includes("Email is already registered")){
                emailI.style.outlineColor = "red";
                emailE.textContent = "Email is already registered";
            }
            if (errors.includes("Username is required")) {
                usernameI.style.outlineColor = "red";          
                usernameE.textContent = "Username is required";      
            }
            if (errors.includes("Username is profane")) {
                usernameI.style.outlineColor = "red";          
                usernameE.textContent = "Username is illegal";      
            }
            if (errors.includes("Username is already taken")) {
                usernameI.style.outlineColor = "red";          
                usernameE.textContent = "Username is already taken";      
            }
        }
        signInStatus.textContent = "Registration failed. Fix highlighted errors before trying again";
        // console.error("Registration error:", err);
    }
}

async function handleSignIn(){
    resetErrors();
    loginButton.disabled = true;
    exitSignInButton.disabled = true;
    signInStatus.textContent = "Loading..."; 
    signInStatus.className = "neutralMsg";
    try{        
        // const email = emailI.value;
        const loginString = loginI.value.trim().toLowerCase();
        const password = passwordI.value;
        const status = await signIn(loginString, password);
        
        createTooltip(0, true, "Successfully signed in!", "tooltip successMsg", "pop fadeOut", null);
        loginVisual(true, status.user.username, status.user.sp, status.user.xp);  
        resetErrors();      
        switchSignIn(false);
    } catch(err){
        // console.error("Sign in error:", err);
        loginI.style.outlineColor = "red";
        passwordI.style.outlineColor = "red";        
        signInStatus.textContent = "Incorrect username or password";
        signInStatus.className = "ambNoti errorMsg";
        
    }
    loginButton.disabled = false;
    exitSignInButton.disabled = false;    
}

async function handleSignOut(){
    logoutButton.disabled = true;
    statsButton.disabled = true;
    resetStats();
    await signOut();
    loginVisual(false, "");
    logoutButton.disabled = false;    
}

//incomplete
async function handleChangePassword(){

}

async function handleCreateLeaderboard(board){
    return await(createLeaderboard(board));
}

async function handleFetchStats(){
    return await(fetchStats());
}

//incomplete
export async function handleStartGame(){
    await(startGame());
}

export async function handleUpdateScore(score, worthXP){  
    const result =  await updateScore(score, worthXP); 
    if (result.success && result.user) {loginVisual(true, result.user.username, Number(result.user.sp), result.user.xp);}
    else {console.log("Could not verify session to update score");}
}

export async function handleReportGame(sTime, score, apples, timestamps, mode, difficulty, won){
    await reportGame(sTime, score, apples, timestamps, mode, difficulty, won);
}

document.getElementById('accountForm').addEventListener('submit', async function(event){
    event.preventDefault();   
    
    const isSignUp = document.getElementById('usernameHolder').style.display !== 'none';

    if (isSignUp){
        await handleAddUser();
    }
    else{
        await handleSignIn();
    }
});
// const fetchButton = document.getElementById("getUsersButton");
// fetchButton.addEventListener('click', getDatabaseData);

//sign out is from home page
const logoutButton = document.getElementById("signOutButton");
logoutButton.addEventListener('click', handleSignOut);
const logoutInverseButton = document.getElementById("signInButton");



//sign in is from sign in page (DIFFERENT THAN SIGN OUT) don't need event listeners anymore because form
const loginButton = document.getElementById("signInReq");
// loginButton.addEventListener('click', handleSignIn);

const registerButton = document.getElementById("registerReq");
// registerButton.addEventListener('click', handleAddUser);

const exitSignInButton = document.getElementById("exitSignIn");
exitSignInButton.addEventListener('click', resetErrors);

const statsButton = document.getElementById('statsButton');

const usernameI = document.getElementById("username");
const emailI = document.getElementById("email");
const passwordI = document.getElementById("password");
const loginI = document.getElementById("loginName");
const bonusI = document.getElementById("middleName");

// e = error / text (next to button)
const passwordE = document.getElementById("passwordE");
const emailE = document.getElementById("emailE");
const usernameE = document.getElementById("usernameE");
const loginE = document.getElementById("loginE");

//island indicators
const loginStatus = document.getElementById("loginStatus");
const snakePointsDisplay = document.getElementById("snakePointsDisplay");
const xpDisplay = document.getElementById("xpDisplay");

checkCurSession();
