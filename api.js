// export async function getUsers() {
//     const res = await fetch("/api?action=getUsers");
//     if (!res.ok) throw new Error("Failed to fetch users");
//     return res.json();
// }

//addUser, signIn, signOut, changePassword, createLeaderboard, updateScore

export async function addUser(username, email, password) {
    let errors = [];
    if (!username) errors.push("Username is required");
    // if (!email) errors.push("Email address is required");
    if (!password) errors.push("Password is required");
    
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Invalid email address");
    }

    if (errors.length > 0) throw {validationErrors: errors};

    // We send the data as a JSON object in the body, NOT in the URL
    const res = await fetch('/api?action=addUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password 
        })
    });

    if (!res.ok) {
        // Try to get the specific error message from your backend if possible
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "User registration failed");
    }

    return res.json();
}

export async function signIn(email, password){
    const res = await fetch('/api?action=signIn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password 
        })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status >= 500){
            throw new Error("Server error from api.js");    
        }
        throw new Error(errorData.error || "Incorrect username or password");
    }

    return res.json();
}

//incomplete
export async function signOut(){
    
}

//incomplete
export async function changePassword(){

}

//incomplete
export async function createLeaderboard(){

}

export async function updateScore(username, score){
    const res = await fetch(`/api?action=updateScore&username=${encodeURIComponent(username)}&score=${Math.floor(score)}`);
    return res.json();
}