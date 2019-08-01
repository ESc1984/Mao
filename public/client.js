import { removeElement, standardGame, randomGame, modeDecided, playTurn,
    initializePlayerHand, saveNames, passTurn, createTopBar, ourGame, hilite } from "./game.js";
import Game from "./game.js";
(function () {
    "use strict";
    let thisGame;

    let ip = window.location.hostname;
    let socket = new WebSocket("ws://" + ip + ":8080/ws");

    document.querySelector("[name=\"userId\"]").value = generateId();

    socket.onopen = function (evt) {    //onopen prompt user for name
        socket.send(JSON.stringify({
            action: "loadStartScreen"
        }));
    };

    socket.onmessage = function (event) {
        console.log("[message] Data received.");
        updateView(JSON.parse(event.data));
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log("[close] Connection closed cleanly, code=" + event.code + " reason=" + event.reason);
        } else {
            console.info("[close] Connection died");
        }
    };

    socket.onerror = function (error) {
        console.log("[error] " + error.message);
    };

    let users = [];
    let playingHand, playerName, rules;
    function updateView(data) {
        if(data.stage){
            if(data.stage === 'start'){
                socket = new WebSocket("ws://" + ip + ":8080/ws");
            } else {
                socket.send(JSON.stringify({
                    action: 'loadNameScreen',
                    mode: data.mode
                }));
            }
        } else if(data.mode){
            removeElement(document.getElementById('startPage'));
            if(data.mode === 'standard'){
                standardGame();
            } else {
                randomGame();
            }
            modeDecided();
            let choseName = document.getElementById('choseName');
            if(choseName){
                choseName.addEventListener('click', function() {
                    let playerName = document.getElementById('namePlayersPrompt').value;
                    removeElement(window.document.getElementById('choseName'));
                    socket.send(JSON.stringify({
                        action: 'choseName',
                        name: playerName,
                        userId: document.querySelector("[name=\"userId\"]").value
                    }));
                });
            }
        } else if(data.namePlayer){
            users.push({name: data.namePlayer, id: data.userId});
            let HTML = "<table>";
            let counter = 1;
            HTML += "<tr><th>Player Number</th><th>Name</th></tr>";
            users.forEach(user => {
                HTML += "<tr>" +
                    "  <td>" + counter + "</td>" +
                    "  <td>" + user.name + "</td>" +
                    "</tr>";
                counter++;
            });
            document.getElementById("activePlayers").innerHTML = HTML;
            if(counter > 2){
                let startGame = document.getElementById('startButton');
                startGame.style.visibility = 'visible';
                startGame.addEventListener('click', function() {
                    let players = saveNames(users);
                    let playingHands = getHands();
                    thisGame = ourGame.game;
                    let topDiscard = thisGame.discardPile.topDiscard();
                    socket.send(JSON.stringify({
                        action: 'startGame',
                        names: players,
                        playerId: users,
                        playingHands: playingHands,
                        playDeck: thisGame.playDeck,
                        topDiscard: topDiscard,
                        rules: thisGame.rules,
                    }));
                });
            }
        } else if(data.rules){
            createTopBar(data.topDiscard);
            thisGame = new Game(data.names, data.rules, data.hands, data.deck, data.topDiscard);
            rules = data.rules;
            let counter = 0;
            let index, playerId;
            let game = document.getElementById("gameBoard");
            const gamePlayer = document.createElement('div');
            gamePlayer.classList.add('player');
            gamePlayer.setAttribute("class", "player");
            game.appendChild(gamePlayer);
            let otherPlayers = document.createElement('section');
            otherPlayers.setAttribute('class', 'grid');
            otherPlayers.id = 'otherPlayersGrid';
            data.names.forEach(player => {
                if(data.playerId[counter].id === window.document.querySelector("[name=\"userId\"]").value){
                    index = counter;
                    playerId = users[index].id;
                    playingHand = data.hands[counter];
                    playerName = player;
                    gamePlayer.setAttribute("id", player);
                    gamePlayer.dataset.name = player;
                    let name = document.createElement('h1');
                    name.setAttribute('class', 'numCards');
                    name.innerHTML = player;
                    document.getElementById(player).appendChild(name);
                    const playerHand = document.createElement('section');
                    playerHand.setAttribute('class', 'grid playerHand');
                    playerHand.id = 'playerHand';
                    initializePlayerHand(playingHand, playerHand);
                    document.getElementById(player).appendChild(playerHand);
                    const passBtn = document.createElement("button");
                    passBtn.id = 'passTurn';
                    passBtn.setAttribute('class', 'pass');
                    passBtn.innerHTML = 'Pass Turn';
                    document.getElementById(player).appendChild(passBtn);
                    document.getElementById(player).appendChild(otherPlayers);
                } else {
                    const gamePlayer = document.createElement('div');
                    gamePlayer.classList.add('player');
                    gamePlayer.setAttribute("class", "player");
                    gamePlayer.setAttribute("id", player);
                    gamePlayer.dataset.name = player;
                    otherPlayers.appendChild(gamePlayer);

                    const hand = document.createElement('button');
                    hand.setAttribute('class', 'hand');
                    hand.setAttribute('id', `${player}show`);
                    hand.innerHTML = player;
                    gamePlayer.appendChild(hand);

                    let numCards = document.createElement('h3');
                    numCards.classList.add('numCards');
                    numCards.setAttribute('class', 'numCards');
                    numCards.setAttribute('id', `${player}numCards`);
                    numCards.innerHTML = data.hands[counter].length.toString() + ' cards';
                    hand.appendChild(numCards);
                }
                counter++;
            });
            let playButton = document.getElementById('playCard');
            if(playButton){
                playButton.addEventListener('click', function () {
                    playTurn(thisGame);
                    socket.send(JSON.stringify({
                        action: "playTurn",
                        topDiscard: thisGame.discardPile.topDiscard(),
                        suit: thisGame.discardPile.expectedSuit,
                        deck: thisGame.playDeck,
                        playerName: playerName,
                        playerId: playerId,
                        allPlayers: thisGame.playerNames,
                        playerHands: thisGame.hands,
                        penalties: thisGame.playerList[index].alerts,
                        numPasses: thisGame.numPasses,
                        turnOrder: thisGame.turnOrder
                    }));
                });
            }
            let passButton = document.getElementById('passTurn');
            if(passButton){
                passButton.addEventListener('click', function () {
                   passTurn(playerName, thisGame);
                   socket.send(JSON.stringify({
                       action: "playTurn",
                       topDiscard: thisGame.discardPile.topDiscard(),
                       suit: thisGame.discardPile.expectedSuit,
                       deck: thisGame.playDeck,
                       playerName: playerName,
                       playerId: playerId,
                       allPlayers: thisGame.playerNames,
                       playerHands: thisGame.hands,
                       penalties: thisGame.playerList[index].alerts,
                       numPasses: thisGame.numPasses,
                       turnOrder: thisGame.turnOrder
                   }));
                });
            }
        } else if (data.win) {
            if(data.winner === playerName){
                thisGame.rules.winMessage(data.winner);
            } else {
                thisGame.rules.loseMessage(playerName, data.winner);
            }
        } else {
            thisGame.updateGame(data.hands, data.deck, data.player, data.allPlayers, data.penalties, data.turnOrder, data.passes, data.topDiscard, data.suit);
            thisGame.playerList.forEach(player => {
                if(data.hands[player.name].length === 0){
                    socket.send(JSON.stringify({
                        action: "gameWon",
                        name: player.name,
                        win: true
                    }));
                }
                if(player.name === playerName){
                    let playerHand = document.getElementById("playerHand");
                    playerHand.innerHTML = "";
                    initializePlayerHand(data.hands[player.name], playerHand);
                } else {
                    let otherPlayer = document.getElementById(player.name);
                    otherPlayer.innerHTML = "";

                    const hand = document.createElement('button');
                    hand.setAttribute('class', 'hand');
                    hand.setAttribute('id', `${player.name}show`);
                    hand.innerHTML = player.name;
                    otherPlayer.appendChild(hand);

                    let numCards = document.createElement('h3');
                    numCards.classList.add('numCards');
                    numCards.setAttribute('class', 'numCards');
                    numCards.setAttribute('id', `${player.name}numCards`);
                    numCards.innerHTML = data.hands[player.name].length.toString() + ' cards';
                    hand.appendChild(numCards);
                    hilite(document.getElementById(data.player + 'show'));
                }
            });
        }
    }

    let standardMode = document.getElementById('standardGame');
    if(standardMode){
        standardMode.addEventListener('click', function () {
            socket.send(JSON.stringify({
                action: "modeSelected",
                mode: "standard"
            }));
        });
    }
    let chaosMode = document.getElementById('randomGame');
    if(chaosMode){
        chaosMode.addEventListener('click', function () {
            socket.send(JSON.stringify({
                action: "modeSelected",
                mode: "chaos"
            }));
        });
    }

    function getHands(){
        let hands = {};
        for(let i = 0; i < ourGame.playerList.length; i++){
            hands[i] = ourGame.playerList[i].hand;
        }
        return hands;
    }

    function generateId(len) {
        let ret = "";
        let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let i;
        len = len || 37;

        for (i = 0; i < len; i++) {
            if (i === 0) {
                ret += (chars.split("")[Math.floor(Math.random() * 26)]);
            } else if (i % 6 === 0 && i !== 0) {
                ret += "-";
            } else {
                ret += (chars.split("")[Math.floor(Math.random() * chars.length)]);
            }
        }
        if (ret.substr(ret.length - 1) === "-") {
            ret = ret.substr(0, ret.length - 1);
        }
        return ret;
    }
}());