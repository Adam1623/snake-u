import * as db from '../db.js';
import crypto from 'crypto';
import { profanity } from '@2toad/profanity';
import { fetchStats } from '../api.js';

const publicActions = {
    addUser: db.addUser,
    signIn: db.signIn,
    getUserBySession: db.getUserBySession,
    createLeaderboard: db.createLeaderboard
};

const actions = {
    addUser: db.addUser,
    createSession: db.createSession,    
    getUserBySession: db.getUserBySession,
    signIn: db.signIn,
    signOut: db.signOut,
    changePassword: db.changePassword,
    createLeaderboard: db.createLeaderboard,
    fetchStats: db.fetchStats,
    startGame: db.startGame,
    updateScore: db.updateScore,
    reportGame: db.reportGame
};

function getCookie(req, name) {
    const cookies = req.headers.cookie || '';
    const match = cookies.split(';').find(c => c.trim().startsWith(`${name}=`));
    return match ? match.split('=')[1].trim() : null;
}

// profanity filter helper functions vvv
profanity.removeWords(['ass', 'hell']);

function normalizeUsername(username) {
  return username
    .toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/\$/g, 's').replace(/@/g, 'a')
    .replace(/[^a-z0-9]/g, '');
}

function isUsernameBad(username) {    
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
            
            //stops external post requests
            if (req.headers['sec-fetch-site'] !== 'same-origin' || req.headers['sec-fetch-mode'] !== 'cors') {
                return res.status(403).json({ error: "Direct API access forbidden." });
            }

            let sessionId = getCookie(req, 'session_id');
            let curUser;
            let isGuest = sessionId && sessionId.startsWith('guest_');

            //checks if they have a stale cookie, clears it 
            if (sessionId && !isGuest) {
                    curUser = await db.getUserBySession({ sessionId: sessionId });
                    
                    // If it's not found in the sessions table, it's a ghost session!
                    if (!curUser) {
                        // Force reset the sessionId variable to null so the generator below triggers
                        sessionId = null; 
                    }
            }

            //checks if they have no cookie at all
            if (!sessionId){
                sessionId = 'guest_' + crypto.randomUUID().split('-')[0];
                res.setHeader('Set-Cookie', `session_id=${sessionId}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`);
            }

            //verifies guest status again
            isGuest = sessionId && sessionId.startsWith('guest_');
            
            //verifies current sign in status for private (signed in) actions
            if (!publicActions[action] && !isGuest) {
                curUser = await db.getUserBySession({sessionId: sessionId});
                if (!curUser) return res.status(401).json({success: false});
            }             

            //guest routing layer
            if (isGuest){
                if (action === 'getUserBySession'){
                    return res.status(200).json(false);
                }
                if (action === 'startGame'){
                    return res.status(200).json({success: true});
                }
                if (action === 'updateScore'){
                    return res.status(200).json({success: false});
                }
                if (action === 'reportGame'){
                    return res.status(200).json({success: true});
                }
                if (action === 'fetchStats'){
                    return res.status(200).json({success: false});
                }
            }

            //security checks
            if (action === 'addUser') {
                const { username, email, password, middleName } = params;
                if (!username || !email || !password) return res.status(400).json({error: "All fields are required."});
                if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters."});
                if (isUsernameBad(username)) return res.status(400).json({error: "Username is profane"});
                if (middleName) return res.status(200).json({success: true});
            }
            if (action === 'signIn') {                
                const { loginString, password } = params;
                if (!loginString || !password) return res.status(400).json({ error: "Email and password are required." });                
            }

            if (action === 'signOut'){
                params = {sessionId: sessionId};
                res.setHeader('Set-Cookie', `session_id=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`);                                
            }
            if (action === 'getUserBySession'){                
                params = {sessionId: sessionId};
                //if no cookie, automatically return without accessing db
                if (!params.sessionId) {return res.status(200).json(false);}
            }
            if (action === 'startGame') {
                params = {sessionId: sessionId};
                // if (!params.sessionId) {return res.status(200).json(false);}                
            }
            if (action === 'updateScore'){
                const startTime = await db.getGameStart({sessionId: sessionId});

                if (!startTime) return res.status(400).json({ error: "No active game found"});

                const secondsPlayed = Math.max(0.1, (Date.now() - startTime) / 1000);

                const maxScore = secondsPlayed * 15;                
                if (Number(params.score) > maxScore){
                    console.warn("Suspicious amount of points blocked, flagging account.");
                    return res.status(403).json({error: "Suspicious points blocked"});
                }
                params.username = curUser.username;
            }
            if (action === 'reportGame'){
                params.id = curUser.id;
                params.username = curUser.username;
                params.avg_pps = params.score / params.sTime;                
            }
            if (action === 'fetchStats'){
                params.username = curUser.username;
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
