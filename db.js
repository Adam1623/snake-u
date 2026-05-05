import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function addUser(params){
    const {username, email, password} = params;

    const hashed_password = await bcrypt.hash(password, 12);
    const startingSp = 0;
    const startingXp = 0;

    const res = await pool.query(`
        INSERT INTO users (username, email, password_hash, sp, xp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`, [username, email, hashed_password, startingSp, startingXp]);

    return {success: true, updated: res.rows[0]};
}

async function signIn(params){
    const {loginString, password} = params; 

    const res = await pool.query('SELECT id, username, password_hash FROM users WHERE (username = $1 OR email = $1)', [loginString]);

    if (res.rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = res.rows[0];
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
    return {success: true, updated: res.rowCount};
}

//incomplete
async function changePassword(){
    return {success: true, updated: res.rowCount};
}

//incomplete
async function createLeaderboard(){
    return {success: true, updated: res.rowCount};
}

async function updateScore(params){
    const {username, score} = params;    
    const res = await pool.query("UPDATE users SET sp = sp + $1 WHERE username = $2", [score, username]);

    return { success: true, updated: res.rowCount };
}

// NECESSARY FUNCTIONS:
// add user, sign out, addToInventory, changePassword, createLeaderboard

export {addUser, signIn, signOut, changePassword, createLeaderboard, updateScore};