import { addUser, signIn, signOut, changePassword, createLeaderboard, updateScore } from "./api.js";

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
}


async function handleAddUser(){
    resetErrors();
    try{
        const username = usernameI.value;
        const email = emailI.value;
        const password = passwordI.value;
        const status = await addUser(username, email, password);
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
    try{        
        // const email = emailI.value;
        const loginString = loginI.value;
        const password = passwordI.value;
        const status = await signIn(loginString, password);
        // console.log("THE NAME:" + username);
        // console.log("THE EMAIL:" + email);
        // console.log("THE PASSWORD:" + password);        
        signInStatus.textContent = "Successfully signed in!";
        signInStatus.className = "successMsg";
    } catch(err){
        console.error("Sign in error:", err);
        emailI.style.outlineColor = "red";
        passwordI.style.outlineColor = "red";
        signInStatus.textContent = "Incorrect username or password";
        signInStatus.className = "errorMsg";
        
    }
}

//incomplete 
async function handleSignOut(){

}

//incomplete
async function handleChangePassword(){

}

//incomplete
async function handleCreateLeaderboard(){

}



// const fetchButton = document.getElementById("getUsersButton");
// fetchButton.addEventListener('click', getDatabaseData);

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

const signInStatus = document.getElementById("signInStatus");
