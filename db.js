import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function addUser(params){
    const {username, email, password} = params;

    const hashed_password = await bcrypt.hash(password, 12);
    const rows = await sql`
        INSERT INTO users (username, email, password_hash, sp, xp)
        VALUES (${username}, ${email}, ${hashed_password}, 0, 0)
        RETURNING *`;

    return {success: true, updated: rows[0]};
}

async function signIn(params){
    const {loginString, password} = params; 

    const rows = await sql`
        SELECT id, username, password_hash FROM users 
        WHERE (username = ${loginString} OR email = ${loginString})`;

    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = rows[0];
    const checkPassword = await bcrypt.compare(password, user.password_hash);

    if(!checkPassword){
        throw new Error("Invalid email or password");
    }

    delete user.password_hash;

    return {success: true, user: user};
}

//incomplete
async function signOut(){
    //something with cookies    
    return {success: true, updated: rows.count};
}

//incomplete
async function changePassword(){
    return {success: true, updated: rows.count};
}

//incomplete
async function createLeaderboard(){
    return {success: true, updated: rows.count};
}

async function updateScore(params){
    const {username, score} = params;    
    const rows = await sql`UPDATE users SET sp = sp + ${score} WHERE username = ${username}`;

    return { success: true, updated: rows.count};
}

// NECESSARY FUNCTIONS:
// add user, sign out, addToInventory, changePassword, createLeaderboard

export {addUser, signIn, signOut, changePassword, createLeaderboard, updateScore};