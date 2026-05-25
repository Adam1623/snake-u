import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);

async function addUser(params){
    const {username, email, password} = params;

    const hashed_password = await bcrypt.hash(password, 12);

    const rows = await sql`
    INSERT INTO users (username, username_lower, email, password_hash, sp, xp)
    VALUES (${username}, ${username.toLowerCase()}, ${email}, ${hashed_password}, 0, 0)
    RETURNING id, username, sp, xp`
    .catch(err => {
        if (err.code === '23505') {
            if (err.constraint === 'users_username_lower_unique' || err.constraint === 'users_username_key') throw { error: 'Username is already taken' };
            if (err.constraint === 'users_email_key') throw { error: 'Email is already registered' };            
    } else throw { error: 'DB error' };});

    return {success: true};    
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
    SELECT users.id, users.username, users.sp, users.xp
        FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.session_id = ${sessionId}
        AND sessions.created_at > NOW() - INTERVAL '1 day'`;
    return rows[0] || false;
}

async function signIn(params){
    const {loginString, password} = params; 

    const rows = await sql`
        SELECT id, username, sp, xp, password_hash FROM users 
        WHERE (LOWER(username) = ${loginString} OR email = ${loginString})`;

    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }

    const user = rows[0];
    const checkPassword = await bcrypt.compare(password, user.password_hash);

    if(!checkPassword){
        throw new Error("Invalid email or password");
    }

    delete user.password_hash;
    // delete user.id;

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
    return {success: true};
}

async function createLeaderboard() {
    const leaderboard = await sql`
        SELECT username, xp
        FROM users
        ORDER BY xp DESC LIMIT 10        
    `;
    return { success: true, leaderboard};
}

async function fetchStats(params) {
    const {username} = params;
    const rows = await sql`
        SELECT *
        FROM user_stats   
        WHERE username = ${username}
    `;
    if (!rows[0]) return {success: false};

    const stats = rows[0];
    delete stats.user_id;
    delete stats.username;
    return { success: true, stats};
}

//start game timer, count to see if they're a cheater
async function startGame(params){
    const {sessionId} = params;

    await sql`
        UPDATE sessions 
        SET last_game_start = NOW() 
        WHERE session_id = ${sessionId}`;

    return {success: true};
}

async function getGameStart(params){
    const {sessionId} = params;
    // const rows = await sql`
    //     SELECT last_game_start 
    //     FROM sessions 
    //     WHERE session_id = ${sessionId}`;
    

    const rows = await sql`
        WITH old_session AS (
            SELECT last_game_start 
            FROM sessions 
            WHERE session_id = ${sessionId}
        )
        UPDATE sessions 
        SET last_game_start = NULL 
        WHERE session_id = ${sessionId}
        RETURNING EXTRACT(EPOCH FROM (SELECT last_game_start FROM old_session)) * 1000 AS last_game_start`;

    if (!rows[0] || !rows[0].last_game_start) return false;

    return Math.floor(Number(rows[0].last_game_start));
}

async function updateScore(params){
    const {username, score, worthXP} = params;    
    const rows = await sql`
            UPDATE users 
            SET 
                sp = sp + ${Number(score)},
                xp = xp + (CASE WHEN ${!!worthXP} THEN ${Number(score)} ELSE 0 END)
            WHERE username = ${username}
            RETURNING username, sp, xp`;

    return { success: true, user: rows[0] };
}

async function reportGame(params){
    const {id, username, apples, avg_pps, sTime, timestamps, score, mode, difficulty} = params;

    await sql`
        INSERT INTO global_game_stats (username, apples, survival_time, avg_pps, apple_log, score, game_mode, difficulty)
        VALUES (
            ${username},
            ${apples},
            ${sTime},
            ${avg_pps},
            ${JSON.stringify(timestamps)},
            ${score},
            ${mode},
            ${difficulty}
        )
    `;
    
    const modePath = `{"${mode}"}`;

    //BONUS FEATURE: saves the stats separately, for stats menu
    await sql`
        INSERT INTO user_stats (user_id, username, high_score, high_score_mode, time_played, rounds_played, apples_collected, mode_counts)
        VALUES (        
            ${id},
            ${username},
            ${score},
            ${mode},
            ${sTime},
            1,
            ${apples},
            ${JSON.stringify({ [mode]: 1 })}
        )
        ON CONFLICT (user_id) DO UPDATE SET
            high_score       = GREATEST(user_stats.high_score, ${score}),
            high_score_mode  = CASE WHEN ${score} > user_stats.high_score THEN ${mode} ELSE user_stats.high_score_mode END,
            time_played      = user_stats.time_played + ${sTime},
            rounds_played    = user_stats.rounds_played + 1,
            apples_collected = user_stats.apples_collected + ${apples},
            mode_counts      = jsonb_set(
                COALESCE(user_stats.mode_counts, '{}'),
                ${modePath},
                (COALESCE(user_stats.mode_counts->>${ mode}, '0')::int + 1)::text::jsonb
            )
    `;

    
    return {success: true};

}

// NECESSARY FUNCTIONS:
// add user, sign out, addToInventory, changePassword, createLeaderboard

export {addUser, createSession, getUserBySession, signIn, signOut, changePassword, createLeaderboard, fetchStats, startGame, getGameStart, updateScore, reportGame};