import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Helper to send JSON responses (fixes the "res.json is not a function" issue)
const sendJson = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

// 2. MIME type map to fix the "Strict MIME type checking" error
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
};

// 3. Define your API actions
const actions = {
    addUser: db.addUser,
    signIn: db.signIn,
    signOut: db.signOut,
    changePassword: db.changePassword,
    createLeaderboard: db.createLeaderboard,
    updateScore: db.updateScore
    // add more actions here as you build your wishlist (e.g., addItem: db.addItem)
};

// Add this above your handler function
const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        // As data chunks arrive over the internet, add them together
        req.on('data', chunk => {
            body += chunk.toString();
        });
        // When the request finishes downloading, parse it as JSON
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                reject(err);
            }
        });
    });
};

// 4. The API Handler
async function handler(req, res) {
    try {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        
        // Always get the action from the URL
        const action = parsedUrl.searchParams.get('action'); 
        const fn = actions[action];

        if (!fn) {
            return sendJson(res, 400, { error: "Invalid action" });
        }

        let params = {};

        // If it's a POST request, securely read the body data
        if (req.method === 'POST') {
            params = await getRequestBody(req);
            let errors = [];
            // --- LAYER 2 SECURITY CHECKS (Crucial for Registration) ---
            if (action === 'addUser') {
                const { username, email, password } = params;

                if (!username) errors.push("Username is required");
                // if (!email) errors.push("Email address is required");
                if (!password) errors.push("Password is required");
                if (password.length < 8) {
                    return sendJson(res, 400, { error: "Password must be at least 8 characters long" });
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return sendJson(res, 400, { error: "Invalid email address" });
                }
            }

            if (action === 'signIn'){
                const {email, password} = params;

                if (!email || !password){
                    return sendJson(res, 400, { error: "Incorrect username or password" });
                }
            }
            
        } else {
            // If it's a GET request, pull params from the URL (Safe for non-sensitive data)
            const query = Object.fromEntries(parsedUrl.searchParams);
            const { action: _, ...restParams } = query; 
            params = restParams;
        }

        // Pass the params down to db.js (e.g., db.addUser)
        const result = await fn(params);
        sendJson(res, 200, result);

    } catch (err) {
        console.error("Handler Error:", err);
        // Check for Neon/Postgres unique constraint error
        if (err.code === '23505') {
            return sendJson(res, 409, { error: "Username or Email already exists." });
        }
        sendJson(res, 500, { error: "Database error" });
    }
}

// 4. The API Handler
// async function handler(req, res) {
//     try {
//         const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
//         const query = Object.fromEntries(parsedUrl.searchParams);
        
//         const { action, ...params } = query;
//         const fn = actions[action];

//         if (!fn) {
//             return sendJson(res, 400, { error: "Invalid action" });
//         }

//         const result = await fn(params);
//         sendJson(res, 200, result);
//     } catch (err) {
//         console.error("Handler Error:", err);
//         sendJson(res, 500, { error: "Database error" });
//     }
// }

// 5. The Server
const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

    // Route API requests
    if (parsedUrl.pathname === "/api") {
        return handler(req, res);
    }

    // Route Static Files (index.html, main.js, etc.)
    const filename = req.url === '/' ? 'index.html' : req.url;
    const page = path.join(__dirname, filename);
    
    const ext = path.extname(page).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(page, (err, content) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        // This header tells the browser it's okay to run the module script
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

//allows other connection on the same network, given they have your ip address
// server.listen(3000, "0.0.0.0");