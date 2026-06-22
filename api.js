export async function addUser(username, email, password, middleName) {
    let errors = [];
    if (!username) errors.push("Username is required");
    if (!password) errors.push("Password is required");
    
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push("Invalid email address");
    }

    if (errors.length > 0) throw {validationErrors: errors};


    const res = await fetch('/api?action=addUser', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        middleName: middleName
    })});

    if (!res.ok) {        
        const errorData = await res.json().catch(() => ({}));
        throw {validationErrors: errorData ? [errorData.error] : []};
        // throw new Error(errorData.error || "User registration failed");
    }

    return res.json();

}

export async function getUserBySession(){
    const res = await fetch('/api?action=getUserBySession', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    return res.json();
}

export async function signIn(loginString, password){
    const res = await fetch('/api?action=signIn', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            loginString: loginString,
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

export async function signOut(){
    const res = await fetch('/api?action=signOut', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    return res.json();
}

//incomplete
export async function changePassword(){

}

export async function createLeaderboard(board){
    const res = await fetch('/api?action=createLeaderboard', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            board: board            
        })
    });

    return res.json();
}

export async function fetchStats(){
    const res = await fetch('/api?action=fetchStats', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
    return res.json();
}

export async function startGame(){
    const res = await fetch('/api?action=startGame', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });

    return res.json();
}

export async function updateScore(score, worthXP){
    const res = await fetch('/api?action=updateScore', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            score: score,
            worthXP: worthXP
        })
    });

    return res.json();
}

export async function reportGame(sTime, score, apples, timestamps, mode, difficulty, won, isMobile){
    const res = await fetch('/api?action=reportGame', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sTime: sTime,
            score: score,
            apples: apples,
            timestamps: timestamps,
            mode: mode,
            difficulty: difficulty,
            won: won,
            isMobile: isMobile
        })
    });
    return res.json();
}
