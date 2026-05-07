import { addUser, getUserBySession, signIn, signOut, changePassword, createLeaderboard, updateScore } from "./api.js";

//Lets snake.js access database
window.updateScore = updateScore;

// async function getDatabaseData() {
//     try {        

//         const data = await getUsers();
//         console.log("Data received:", data);
        
//         // 2. Check if the element exists before trying to update it
//         const outputElement = document.getElementById('output');
//         if (outputElement) {
//             outputElement.textContent = JSON.stringify(data, null, 2);
//         }
//     } catch (err) {
//         console.error("Fetch error:", err);
//     }
// }
async function resetErrors(){
    signInStatus.textContent = "";
    signInStatus.className = "";
    usernameI.style.outlineColor = "rgb(1, 39, 109)";
    passwordI.style.outlineColor = "rgb(1, 39, 109)";
    emailI.style.outlineColor = "rgb(1, 39, 109)";
    loginI.style.outlineColor = "rgb(1, 39, 109)";
}

async function loginVisual(signIn, username){
    if (signIn){
        loginStatus.style.setProperty("--bgc1", "rgb(121, 218, 83)");
        loginStatus.style.setProperty("--bdc1", "rgb(104, 151, 87)");
        loginStatus.innerHTML = `<a style="position: relative; text-decoration: underline; font-size: 0.7cqw;">Signed in as</a><br>${username}`;
        logoutButton.style.display = "block";
        logoutInverseButton.style.display = "none";

        //update snake point display here, function should take another var
        snakePointsDisplay.style.display = "block";        
    }
    else{
        loginStatus.style.setProperty("--bgc1", "rgb(211, 211, 211)");
        loginStatus.style.setProperty("--bdc1", "rgb(161, 161, 161)");
        loginStatus.innerHTML = `Signed out`;
        logoutButton.style.display = "none";
        logoutInverseButton.style.display = "block";
        snakePointsDisplay.style.display = "none";
    }
}

async function checkCurSession(){
    const signedIn = await getUserBySession();
    signedIn ? loginVisual(true, signedIn.username) : loginVisual(false, "");
}

async function handleAddUser(){
    resetErrors();
    try{
        const username = usernameI.value;
        const email = emailI.value;
        const password = passwordI.value;
        await addUser(username, email, password);
        // console.log("THE NAME:" + username);
        // console.log("THE EMAIL:" + email);
        // console.log("THE PASSWORD:" + password);
        signInStatus.textContent = "Successfully added user!";
        signInStatus.className = "successMsg";
    } catch(err){
        signInStatus.className = "errorMsg";

        if (err.validationErrors){
            const errors = err.validationErrors;
            if (errors.includes("Password must be at least 8 characters long") || errors.includes("Password is required")) {
                passwordI.style.outlineColor = "red";
            }
            if (errors.includes("Invalid email address")) {
                emailI.style.outlineColor = "red";
            }
            if (errors.includes("Username is required")) {
                usernameI.style.outlineColor = "red";
            }
        }
        signInStatus.textContent = "Registration failed. Fix highlighted errors before trying again";
        console.error("Registration error:", err);
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
        const loginString = loginI.value;
        const password = passwordI.value;
        const status = await signIn(loginString, password);
        // console.log("THE NAME:" + username);
        // console.log("THE EMAIL:" + email);
        // console.log("THE PASSWORD:" + password);        
        signInStatus.textContent = "Successfully signed in!";
        signInStatus.className = "ambNoti successMsg";        
        // document.cookie = `userSession=${status.user.username}`;
        loginVisual(true, status.user.username);

    } catch(err){
        console.error("Sign in error:", err);
        loginI.style.outlineColor = "red";
        passwordI.style.outlineColor = "red";
        signInStatus.textContent = "Incorrect username or password";
        signInStatus.className = "ambNoti errorMsg";
        
    }
    loginButton.disabled = false;
    exitSignInButton.disabled = false;
}

async function handleSignOut(){
    await signOut();
    loginVisual(false, "");
    
}

//incomplete
async function handleChangePassword(){

}

//incomplete
async function handleCreateLeaderboard(){

}



// const fetchButton = document.getElementById("getUsersButton");
// fetchButton.addEventListener('click', getDatabaseData);

//sign out is from home page
const logoutButton = document.getElementById("signOutButton");
logoutButton.addEventListener('click', handleSignOut);
const logoutInverseButton = document.getElementById("signInButton");



//sign in is from sign in page (DIFFERENT THAN SIGN OUT)
const loginButton = document.getElementById("signInReq");
loginButton.addEventListener('click', handleSignIn);

const registerButton = document.getElementById("registerReq");
registerButton.addEventListener('click', handleAddUser);

const exitSignInButton = document.getElementById("exitSignIn");
exitSignInButton.addEventListener('click', resetErrors);


const usernameI = document.getElementById("username");
const emailI = document.getElementById("email");
const passwordI = document.getElementById("password");
const loginI = document.getElementById("loginName");

//island indicators
const loginStatus = document.getElementById("loginStatus");
const snakePointsDisplay = document.getElementById("snakePointsDisplay");

checkCurSession();
