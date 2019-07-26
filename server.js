/*jshint node: true, esnext: true */
const http = require('http');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const express = require('express');
const ip = require('ip');
let app = express();

const wss = new ws.Server({
    noServer: true
});

const clients = new Set();

/* Hold all the users in memory.
   Ideally this would be some kind of persitent storage object
*/
let mode;

function accept(req, res) {
    if (req.url == '/ws' && req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() == 'websocket' &&
        req.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    } else if (req.url === '/') { // index.html
        fs.createReadStream('mao.html').pipe(res);
    } else if(req.url.match("\.js")){
        let jsPath = path.join(__dirname, 'public', req.url);
        let fileStream = fs.createReadStream(jsPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/javascript"});
        fileStream.pipe(res);
    } else if(req.url.match("\.css$")){
        let cssPath = path.join(__dirname, 'public', req.url);
        let fileStream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {"Content-Type": "text/css"});
        fileStream.pipe(res);
    } else if(req.url.match("\.png$")){
        let imagePath = path.join(__dirname, 'public', req.url);
        let fileStream = fs.createReadStream(imagePath);
        res.writeHead(200, {"Content-Type": "image/png"});
        fileStream.pipe(res);
    } else { // page not found
        res.writeHead(404);
        res.end();
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    console.log(`new connection`);

    ws.on('message', function (message) {
        console.log(`message received: ${message}`);

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

        // if (msg.action === 'modeSelection'){
        //     if(msg.mode){
        //         mode = msg.mode;
        //     }
        // }

        if (msg.action === "setUser") {
            if (msg.userId) {
                user = users.find(u => {
                    return u.id === msg.userId;
                });
            }

            if (!user || !user.id) {
                console.console.log("New player has entered the game!");
                user = {
                    id: msg.userId
                };
                users.push(user);
            }

            user.name = msg.name;
            user.quest = msg.quest;
            user.color = msg.color;
        }


        clients.forEach(client => {     //probably change -- figure out what the client is
            return client.send(JSON.stringify({
                users: users
            }));
        });
    });

    ws.on('close', function () {
        console.log(`connection closed`);
        clients.delete(ws);
    });
}

if (!module.parent) {
    http.createServer(function(request, response){
        //accept(request, response);
        http.createServer(accept).listen(8080);
        console.log("••• Listening on: " + ip.address() + ":8080 •••");
    }).listen(8080);
} else {
    // to embed into javascript.info
    let log = function () {};
    // log = console.log;
    exports.accept = accept;
}
