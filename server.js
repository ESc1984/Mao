/*jshint node: true, esnext: true */
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const log = console.log;

const express = require('express'),app = express();
app.use(express.static(path.join(__dirname)));
const wss = new WebSocket.Server({
    noServer: true
});

const clients = new Set();

/* Hold all the users in memory.
   Ideally this would be some kind of persitent storage object
*/
let users = [];

function accept(req, res) {
    if (req.url == '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() == 'websocket' &&
        req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if (req.url === '/') { // index.html
        fs.createReadStream('mao.html').pipe(res);
    } else { // page not found
        res.writeHead(404);
        res.end();
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    log(`new connection`);

    ws.on('message', function (message) {
        log(`message received: ${message}`);

        let msg = {};

        try {
            msg = JSON.parse(message);
        } catch (e) {
            console.warn("Recieved a malformed message.");
            msg = {};
        }

        /* Determine the user action */
        if (!msg.action) {
            return ws.send("You need to tell me what you want from me! ERROR: No action defined.");
        }

        let user = {};

        if (msg.action === "getUsers") {
            return ws.send(JSON.stringify({
                users: users
            }));
        }

        if (msg.action === "setUser") {
            if (msg.userId) {
                user = users.find(u => {
                    return u.id === msg.userId;
                });
            }

            if (!user || !user.id) {
                console.log("New player has entered the game!");
                user = {
                    id: msg.userId
                };
                users.push(user);
            }

            user.name = msg.name;
            user.quest = msg.quest;
            user.color = msg.color;
        }


        clients.forEach(client => {
            return client.send(JSON.stringify({
                users: users
            }));
        });
    });

    ws.on('close', function () {
        log(`connection closed`);
        clients.delete(ws);
    });
}

if (!module.parent) {
    http.createServer(function(request, response){
        accept(request, response);
    }).listen(8080);
} else {
    // to embed into javascript.info
    log = function () {};
    // log = console.log;
    exports.accept = accept;
}
