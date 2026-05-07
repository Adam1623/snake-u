import { signIn } from '../api.js';
import * as db from '../db.js'; // Adjust path if your db.js is in a different folder
import crypto from 'crypto';

const actions = {
    addUser: db.addUser,
    signIn: db.signIn,
    signOut: db.signOut,
    changePassword: db.changePassword,
    createLeaderboard: db.createLeaderboard,
    updateScore: db.updateScore
};

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
                if (!username || !email || !password) return res.status(400).json({ error: "All fields are required." });
                if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
            }
            if (action === 'signIn') {                
                const { loginString, password } = params;
                if (!loginString || !password) return res.status(400).json({ error: "Email and password are required." });
                
            }
            
        } else if (req.method === 'GET') {
            // Extract all query parameters EXCEPT 'action'
            const { action: _, ...restParams } = req.query;
            params = restParams;
        } else {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        const result = await fn(params);

        return res.status(200).json(result);

    } catch (err) {        
        return res.status(500).json({ error: err.message || "Internal Server Error" });
    }
}
