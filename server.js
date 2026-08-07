/**
 * JanSetu AI - Live Central Backend REST API Server
 * Handles static web serving and REST API endpoints for cross-device mobile & desktop data synchronization.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize database file if missing
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.geojson': 'application/json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

const server = http.createServer((req, res) => {
    // Enable CORS for mobile devices & cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const reqUrl = req.url.split('?')[0];
    console.log(`[HTTP] ${req.method} ${reqUrl}`);

    // REST API Endpoint: Get Reports
    if (reqUrl === '/api/reports' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to read database' }));
        }
        return;
    }

    // REST API Endpoint: Save New Report
    if (reqUrl === '/api/reports' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const newReport = JSON.parse(body);
                if (!newReport.id) {
                    newReport.id = 'NMC-' + Math.floor(100000 + Math.random() * 900000);
                }
                if (!newReport.timestamp) {
                    newReport.timestamp = new Date().toISOString();
                }

                const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
                currentDb.unshift(newReport);
                fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2));

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, report: newReport }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // REST API Endpoint: Update Report Status (Pending / In Progress / Completed)
    if (reqUrl === '/api/reports/update-status' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { id, status } = JSON.parse(body);
                const currentDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
                const reportIndex = currentDb.findIndex(item => item.id === id);

                if (reportIndex !== -1) {
                    currentDb[reportIndex].status = status || 'Completed';
                    currentDb[reportIndex].lastUpdated = new Date().toISOString();
                    fs.writeFileSync(DB_FILE, JSON.stringify(currentDb, null, 2));

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, report: currentDb[reportIndex] }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Report not found' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // REST API Endpoint: Clear / Delete All Complaint Data
    if (reqUrl === '/api/reports/clear-all' && (req.method === 'POST' || req.method === 'DELETE')) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'All complaint data deleted successfully' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to clear database' }));
        }
        return;
    }

    // Serve Static Web Files
    let filePath = path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl);
    const exists = fs.existsSync(filePath);
    if (!exists || (exists && fs.statSync(filePath).isDirectory())) {
        filePath = path.join(__dirname, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const localIp = getLocalIp();
    console.log(`=======================================================`);
    console.log(`🚀 JanSetu AI Live Backend Server Running!`);
    console.log(`💻 Desktop Access: http://localhost:${PORT}`);
    console.log(`📱 Mobile Access:  http://${localIp}:${PORT}`);
    console.log(`=======================================================`);
});
