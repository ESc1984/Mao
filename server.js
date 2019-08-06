
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

let users = [];
let stage = 'start';
let mode = undefined;
let difficulty = undefined;

function accept(req, res) {
    try {
        if (req.url == '/ws' && req.headers.upgrade &&
            req.headers.upgrade.toLowerCase() == 'websocket' &&
            req.headers.connection.match(/\bupgrade\b/i)) {
            wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
        } else if (req.url === '/') {
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
        } else {
            res.writeHead(404);
            res.end();
        }
    } catch(error) {
        console.error(error);
        res.writeHead(500);
        res.end();
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    console.log(`new connection`);

    let user = {};
    ws.on('message', function (message) {
        console.log(`message received: ${message}`);

        let msg = {};

        try {
            msg = JSON.parse(message);
        } catch (e) {
            console.warn("Recieved a malformed message.");
            msg = {};
        }

        if (!msg.action) {
            return ws.send("You need to tell me what you want from me! ERROR: No action defined.");
        }

        if(msg.action === 'loadStartScreen'){
            return ws.send(JSON.stringify({
                stage: stage,
                mode: mode,
                difficultyName: difficulty
            }));
        }

        if(msg.action === 'loadNameScreen'){
            return ws.send(JSON.stringify({
                mode: msg.mode,
                users: users,
                difficultyName: msg.difficulty
            }));
            if(msg.difficulty !== undefined){
                difficulty = msg.difficultyName;
            }
            mode = msg.mode;
            stage = 'name';
        }

        if (msg.action === 'modeSelected'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    mode: msg.mode,
                    difficultyName: difficulty
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
                    difficultyLevel: msg.difficultyLevel,
                    difficultyName: msg.difficultyName
                }));
            });
            user.name = msg.name;
            user.id = msg.userId;
            users.push(user);
            stage = 'name';
            if(msg.difficultyName !== undefined){
                difficulty = msg.difficultyName;
            }
        }

        if(msg.action === 'gameFull'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    full: true,
                    users: users
                }));
            });
            stage = 'start';
            difficulty = undefined;
            users = [];
        }

        if (msg.action === 'startGame'){
            clients.forEach(client => {
                return client.send(JSON.stringify({
                    names: msg.names,
                    playerId: msg.playerId,
                    againstComp: msg.againstComputer,
                    hands: msg.playingHands,
                    deck: msg.playDeck,
                    topDiscard: msg.topDiscard,
                    rules: msg.rules,
                    random: msg.random
                }));
            });
            stage = 'start';
            difficulty = undefined;
            users = [];
        }

        if (msg.action === 'playTurn'){
            clients.forEach(client => {
               return client.send(JSON.stringify({
                   topDiscard: msg.topDiscard,
                   suit: msg.suit,
                   sevensCount: msg.sevensCount,
                   deck: msg.deck,
                   player: msg.playerName,
                   playerId: msg. playerId,
                   allPlayers: msg.allPlayers,
                   hands: msg.playerHands,
                   penalties: msg.penalties,
                   passes: msg.numPasses,
                   turnOrder: msg.turnOrder,
                   skipList: msg.skipList
               }));
            });
        }

        if (msg.action === 'updateTurns'){
            clients.forEach(client => {
               return client.send(JSON.stringify({
                   allPlayers: msg.allPlayers,
                   turnOrder: msg.turnOrder,
                   skippedList: msg.skippedList
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
        stage = 'start';
        difficulty = undefined;
        users = [];
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
    let log = function () {};
    exports.accept = accept;
}