import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function addUser(params){
    const {username, email, password} = params;

    const hashed_password = await bcrypt.hash(password, 12);
    const rows = await sql`
        INSERT INTO users (username, email, password_hash, sp, xp)
        VALUES (${username}, ${email}, ${hashed_password}, 0, 0)
        RETURNING id, username, sp, xp`;

    return {success: true, updated: rows[0]};
}

async function createSession(params){
    const {sessionId, userId} = params;
    await sql`INSERT INTO sessions (session_id, user_id) VALUES (${sessionId}, ${userId})`;
    return {success: true};
}

//cleanup, cleans every time a user session is gathered
async function deleteExpiredSessions(){
    await sql`DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '1 day'`;
}

async function getUserBySession(params){
    await deleteExpiredSessions();
    const {sessionId} = params;
    const rows = await sql`
    SELECT users.id, users.username, users.email, users.sp, users.xp
        FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.session_id = ${sessionId}
        AND sessions.created_at > NOW() - INTERVAL '1 day'`;
    return rows[0] || false;
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
async function signOut(params){
    //something with cookies   
    const {sessionId} = params;
    await sql`DELETE FROM sessions WHERE session_id = ${sessionId}`;
    return {success: true};
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

export {addUser, createSession, getUserBySession, signIn, signOut, changePassword, createLeaderboard, updateScore};