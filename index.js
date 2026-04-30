// // /api/index.js
// import * as db from '../db.js'; // Note the '../' because this file is now in the /api folder

// // 1. Define your API actions (identical to your original list)
// const actions = {
//     addUser: db.addUser,
//     signIn: db.signIn,
//     signOut: db.signOut,
//     changePassword: db.changePassword,
//     createLeaderboard: db.createLeaderboard,
//     updateScore: db.updateScore
// };

// // 2. The Serverless Handler
// // Vercel automatically provides 'req' and 'res' with helper methods like .json()
// export default async function handler(req, res) {

//     // if (req.method !== 'POST'){
//     //     return res.status(405).json({ error: 'Method Not Allowed' });
//     // }

//     try {
//         // Vercel handles the URL parsing for you. 
//         // req.query already contains your action and params.
//         const { action, ...params } = req.query;
//         const fn = actions[action];

//         if (!fn) {
//             return res.status(400).json({ error: "Invalid action" });
//         }

//         // Execute the database function from db.js
//         const result = await fn(params);

//         // Send the JSON response
//         res.status(200).json(result);
        
//     } catch (err) {
//         console.error("Handler Error:", err);
//         res.status(500).json({ error: "Database error" });
//     }
// }
// api/index.js
import { signIn } from '../api.js';
import * as db from '../db.js'; // Adjust path if your db.js is in a different folder

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

        // 2. Handle POST vs GET securely
        if (req.method === 'POST') {
            // Vercel ALREADY parsed the body into JSON. No streams required!
            params = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

            console.log("post type");
            console.log(params);

            // --- LAYER 2 SECURITY CHECKS ---
            if (action === 'addUser') {
                const { username, email, password } = params;
                if (!username || !email || !password) return res.status(400).json({ error: "All fields are required." });
                if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
            }
            if (action === 'signIn') {                
                const { email, password } = params;
                if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
                
            }
            
        } else if (req.method === 'GET') {
            // Extract all query parameters EXCEPT 'action'
            const { action: _, ...restParams } = req.query;
            params = restParams;
        } else {
            return res.status(405).json({ error: "Method Not Allowed" });
        }

        // 3. Execute the database logic
        const result = await fn(params);
        return res.status(200).json(result);

    } catch (err) {        
        return res.status(500).json({ error: err.message || "bad, it failed" });
    }
}
