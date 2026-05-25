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

        const xpSlider = '<input type="range" class="shimmer-element" style="accent-color: #0c31ac; --c1: #0c31ac; --c2: #2970db; --c3: #0c31ac; --dur: 5s; pointer-events: none;" tabindex="-1">';
        xpDisplay.innerHTML = `${xp} xp <br>`;
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
    await signOut();
    loginVisual(false, "");
    logoutButton.disabled = false;    
}

//incomplete
async function handleChangePassword(){

}

async function handleCreateLeaderboard(){
    return await(createLeaderboard());
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

export async function handleReportGame(sTime, score, apples, timestamps, mode, difficulty){
    await reportGame(sTime, score, apples, timestamps, mode, difficulty);
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
