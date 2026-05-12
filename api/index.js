// import { signIn } from '../api.js';
import * as db from '../db.js'; // Adjust path if your db.js is in a different folder
import crypto from 'crypto';
import { profanity } from '@2toad/profanity';

const actions = {
    addUser: db.addUser,
    createSession: db.createSession,    
    getUserBySession: db.getUserBySession,
    signIn: db.signIn,
    signOut: db.signOut,
    changePassword: db.changePassword,
    createLeaderboard: db.createLeaderboard,
    updateScore: db.updateScore    
};

function getCookie(req, name) {
    const cookies = req.headers.cookie || '';
    const match = cookies.split(';').find(c => c.trim().startsWith(`${name}=`));
    return match ? match.split('=')[1].trim() : null;
}

// profanity filter helper functions vvv
profanity.removeWords(['ass', 'hell'])

function normalizeUsername(username) {
  return username
    .toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/\$/g, 's').replace(/@/g, 'a')
    .replace(/[^a-z0-9]/g, '');
}

function isUsernameAllowed(username) {    
  const normalized = normalizeUsername(username);
  return profanity.exists(username) || profanity.exists(normalized);
}
// profanity filter helper functions ^^^

export default async function handler(req, res) {
    try {        
        // 1. Get the action directly from Vercel's parsed query object
        const action = req.query.action;
        const fn = actions[action];

        if (!fn) {
            return res.status(400).json({ error: "Invalid action" });
        }

        let params = {};

        if (req.method === 'POST') {
            params = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;            

            //security checks
            if (action === 'addUser') {
                const { username, email, password } = params;
                if (!username || !email || !password) return res.status(400).json({error: "All fields are required."});
                if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters."});
                if (isUsernameAllowed(username)) return res.status(400).json({error: "Username is profane"});
            }
            if (action === 'signIn') {                
                const { loginString, password } = params;
                if (!loginString || !password) return res.status(400).json({ error: "Email and password are required." });                
            }
            if (action === 'signOut'){
                params = {sessionId: getCookie(req, 'session_id')};
                //removes cookie
                res.setHeader('Set-Cookie', `session_id=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);
            }
            if (action === 'getUserBySession'){
                params = {sessionId: getCookie(req, 'session_id')};
            }
            
        } else if (req.method === 'GET') {
            // Extract all query parameters EXCEPT 'action'
            const { action: _, ...restParams } = req.query;
            params = restParams;
        } else {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        const result = await fn(params);

        if (action === 'signIn' && result.success){
            const sessionId = crypto.randomUUID();
            await db.createSession({sessionId, userId: result.user.id});
            res.setHeader('Set-Cookie', 
                `session_id=${sessionId}; Max-Age=86400; Path=/; HttpOnly; Secure; SameSite=Lax`);
        }

        return res.status(200).json(result);

    } catch (err) {        
        return res.status(500).json({ error: err.error || "Internal Server Error" });
    }
}
