/*jshint node: true, esnext: true */
const http = require('http');
const ws = require('ws');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser");
const express = require('express');
const ip = require('ip');
let app = express();
const util = require('util');

const wss = new ws.Server({
    noServer: true
});

const clients = new Set();

/* Hold all the users in memory.
   Ideally this would be some kind of persitent storage object
*/

function accept(req, res) {
    try {
        if (req.url == '/ws' && req.headers.upgrade &&
            req.headers.upgrade.toLowerCase() == 'websocket' &&
            req.headers.connection.match(/\bupgrade\b/i)) {
            wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
        } else if (req.url === '/') { // index.html
            fs.createReadStream('mao.html').pipe(res);
        } else if (req.url.match("\.js")) {
            let jsPath = path.join(__dirname, 'public', req.url);
            let fileStream = fs.createReadStream(jsPath, "UTF-8");
            res.writeHead(200, {"Content-Type": "text/javascript"});
            fileStream.pipe(res);
        } else if (req.url.match("\.css$")) {
            let cssPath = path.join(__dirname, 'public', req.url);
            let fileStream = fs.createReadStream(cssPath, "UTF-8");
            res.writeHead(200, {"Content-Type": "text/css"});
            fileStream.pipe(res);
        } else if (req.url.match("\.png$")) {
            let imagePath = path.join(__dirname, 'public', req.url);
            let fileStream = fs.createReadStream(imagePath);
            res.writeHead(200, {"Content-Type": "image/png"});
            fileStream.pipe(res);
        } else { // page not found
            res.writeHead(404);
            res.end();
        }
    } catch(error) {
        console.error(error);
        res.writeHead(500);
        res.end();
    }
}

let users = [];
let stage = 'start';
let mode = undefined;
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

        if(msg.action === 'loadStartScreen'){
            return ws.send(JSON.stringify({
                stage: stage,
                mode: mode
            }));
        }

        if(msg.action === 'loadNameScreen'){
            return ws.send(JSON.stringify({
                mode: msg.mode,
                //users: users
            }));
            mode = msg.mode;
            stage = 'name';
        }

        if (msg.action === 'modeSelected'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    mode: msg.mode
                }));
            });
            mode = msg.mode;
            stage = 'name';
        }

        if (msg.action === 'choseName'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    namePlayer: msg.name,
                    userId: msg.userId,
                }));
            });
            //users.push({name: msg.name, id: msg.userId});
            stage = 'name';
        }

        if (msg.action === 'startGame'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    names: msg.names,
                    playerId: msg.playerId,
                    hands: msg.playingHands,
                    deck: msg.playDeck,
                    topDiscard: msg.topDiscard,
                    rules: msg.rules
                }));
            });
            stage = 'start';
        }

        if (msg.action === 'playTurn'){
            clients.forEach(client => {
               return client.send(JSON.stringify({
                   topDiscard: msg.topDiscard,
                   suit: msg.suit,
                   deck: msg.deck,
                   player: msg.playerName,
                   playerId: msg. playerId,
                   allPlayers: msg.allPlayers,
                   hands: msg.playerHands,
                   penalties: msg.penalties,
                   passes: msg.numPasses,
                   turnOrder: msg.turnOrder
               }));
            });
        }

        if (msg.action === 'gameWon'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    winner: msg.name,
                    win: msg.name
                }));
            });
        }
    });

    ws.on('close', function () {
        console.log(`connection closed`);
        clients.delete(ws);
    });

    ws.on('error', function(err) {
        console.error(err);
    })
}

if (!module.parent) {
    http.createServer(function(request, response){
        accept(request, response);
    }).listen(8080);
    console.log("••• Listening on: " + ip.address() + ":8080 •••");
} else {
    // to embed into javascript.info
    let log = function () {};
    // log = console.log;
    exports.accept = accept;
}