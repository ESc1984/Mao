import { removeElement, standardGame, randomGame, modeDecided, playTurn, rulesDecided,
    initializePlayerHand, checkName, diffNames, passTurn, createTopBar, ourGame, hilite, findPlayerIndexFromId } from "./game.js";
import Game from "./game.js";
(function () {
    "use strict";
    let thisGame;

    let ip = window.location.hostname;
    let socket = new WebSocket("ws://" + ip + ":8080/ws");

    document.querySelector("[name=\"userId\"]").value = generateId();
    let id = document.querySelector("[name=\"userId\"]").value;

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
    let playingHand, playerName, rules, textDiff, selected, difficulty, index;
    function updateView(data) {
        if(data.stage){
            if(data.stage === 'name'){
                socket.send(JSON.stringify({
                    action: 'loadNameScreen',
                    mode: data.mode,
                    difficulty: data.difficultyName
                }));
            }
        } else if(data.full) {
            let fullMessage = document.createElement('pre');
            fullMessage.innerHTML = 'Game is Full';
            document.getElementById('overlay').appendChild(fullMessage);
        } else if(data.mode){
            removeElement(document.getElementById('startPage'));
            if(data.mode === 'standard'){
                standardGame();
            } else {
                randomGame();
            }
            modeDecided();
            if(data.difficultyName !== undefined) {
                document.getElementById('seeDiff').style.visibility = 'visible';
                let message = 'DIFFICULTY: ' + data.difficultyName.toUpperCase();
                document.getElementById('seeDiff').innerHTML = message;
            }
            if(data.users !== [] && data.users !== undefined){
                data.users.forEach(user => {
                    users.push({name: user['name'], id: user['id']});
                });
                checkLength();
                let HTML = "<table borderColor='gold'>";
                let counter = 1;
                HTML += "<tr><th>Player</th><th>Name</th></tr>";
                users.forEach(user => {
                    HTML += "<tr>" +
                        "  <td width='100'> " + counter + "</td>" +
                        "  <td width='200'> " + user.name + "</td>" +
                        "</tr>";
                    counter++;
                });
                document.getElementById("activePlayers").innerHTML = HTML;
            }
            let choseName = document.getElementById('choseName');
            if(choseName){
                choseName.addEventListener('click', function() {
                    let inName = document.getElementById('namePlayersPrompt').value;
                    playerName = checkName(inName);
                    window.document.getElementById('choseName').style.display = 'none';
                    removeElement(window.document.getElementById('choseName'));
                    window.document.getElementById('namePlayersPrompt').style.visibility = 'hidden';
                    window.document.getElementById('namePlayers').style.visibility = 'hidden';
                    let selectDifficulty = document.getElementById('numRules');
                    if(selectDifficulty){
                        difficulty = selectDifficulty.options[selectDifficulty.selectedIndex].value;
                        textDiff = selectDifficulty.options[selectDifficulty.selectedIndex].text;
                    }
                    socket.send(JSON.stringify({
                        action: 'choseName',
                        name: playerName,
                        userId: document.querySelector("[name=\"userId\"]").value,
                        difficultyLevel: difficulty,
                        difficultyName: textDiff
                    }));
                    selected = true;
                });
            }
        } else if(data.namePlayer){
            if(data.difficultyLevel !== undefined){
                rulesDecided(data.difficultyLevel);
            }
            if(data.difficultyName !== undefined) {
                document.getElementById('seeDiff').style.visibility = 'visible';
                let message = 'DIFFICULTY: ' + data.difficultyName.toUpperCase();
                document.getElementById('seeDiff').innerHTML = message;
            }
            users.push({name: data.namePlayer, id: data.userId});
            checkLength();
            let HTML = "<table>";
            let counter = 1;
            HTML += "<tr><th>Player</th><th>Name</th></tr>";
            users.forEach(user => {
                HTML += "<tr>" +
                    "  <td width='100'>" + counter + "</td>" +
                    "  <td width='200'>" + user.name + "</td>" +
                    "</tr>";
                counter++;
            });
            document.getElementById("activePlayers").innerHTML = HTML;
            if(counter > 2 && selected){
                let startGame = document.getElementById('startButton');
                startGame.style.visibility = 'visible';
                let warn = document.getElementById('startWarn');
                warn.style.visibility = 'visible';
                let diff = document.getElementById('showDiff');
                startGame.addEventListener('click', function() {
                    let players = diffNames(users);
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
                        rules: thisGame.rules
                    }));
                });
            }
        } else if(data.rules){
            if (window.document.getElementById('startGame') !== null){
                removeElement(window.document.getElementById('startGame'));
            }
            createTopBar(data.topDiscard);
            thisGame = new Game(data.names, data.rules, data.hands, data.deck, data.topDiscard);
            rules = data.rules;
            let counter = 0;
            let playerId;
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
                    name.style.display = 'inline-block';
                    name.style.fontSize = '40px';
                    name.style.margin = '7px';
                    const passBtn = document.createElement("button");
                    passBtn.id = 'passTurn';
                    passBtn.setAttribute('class', 'pass');
                    passBtn.innerHTML = 'Pass Turn';
                    document.getElementById(player).appendChild(passBtn);
                    passBtn.style.display = 'inline-block';
                    passBtn.style.margin = '5px';
                    const playerHand = document.createElement('section');
                    playerHand.setAttribute('class', 'grid playerHand');
                    playerHand.id = 'playerHand';
                    initializePlayerHand(playingHand, playerHand);
                    document.getElementById(player).appendChild(playerHand);
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
                        sevensCount: thisGame.discardPile.sevensCount,
                        deck: thisGame.playDeck,
                        playerName: playerName,
                        playerId: playerId,
                        allPlayers: thisGame.playerNames,
                        playerHands: thisGame.hands,
                        penalties: thisGame.playerList[index].alerts,
                        numPasses: thisGame.numPasses,
                        turnOrder: thisGame.turnOrder,
                        skipList: thisGame.rules.skippedPlayer
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
                       sevensCount: thisGame.discardPile.sevensCount,
                       deck: thisGame.playDeck,
                       playerName: playerName,
                       playerId: playerId,
                       allPlayers: thisGame.playerNames,
                       playerHands: thisGame.hands,
                       penalties: thisGame.playerList[index].alerts,
                       numPasses: thisGame.numPasses,
                       turnOrder: thisGame.turnOrder,
                       skipList: thisGame.rules.skippedPlayer
                   }));
                });
            }
        } else if (data.skippedList) {
            thisGame.updateSkipList(data.skippedList, data.allPlayers, data.turnOrder);
        } else if (data.win) {
            if(data.winner === playerName){
                thisGame.rules.winMessage(data.winner);
            } else {
                thisGame.rules.loseMessage(playerName, data.winner);
            }
        } else {
            thisGame.updateGame(data.hands, data.deck, data.player, data.allPlayers, data.penalties, data.turnOrder, data.passes, data.topDiscard, data.suit, data.sevensCount, data.skipList);
            let counter = 0;
            thisGame.playerList.forEach(player => {
                if(data.hands[player.name].length === 0){
                    socket.send(JSON.stringify({
                        action: "gameWon",
                        name: player.name,
                        win: true
                    }));
                }
                if(player.name === playerName){
                    index = counter;
                    let playerHand = document.getElementById("playerHand");
                    playerHand.innerHTML = "";
                    initializePlayerHand(data.hands[player.name], playerHand);
                } else {
                    let skipPlayer = document.getElementById(`skip${player.name}`);
                    if(skipPlayer){
                        skipPlayer.addEventListener('click', function () {
                            socket.send(JSON.stringify({
                                action: "updateTurns",
                                allPlayers: thisGame.playerNames,
                                turnOrder: thisGame.turnOrder,
                                skippedList: player.name
                            }));
                        });
                    }
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
                counter++;
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
            const numRulesPrompt = document.createElement('label');
            numRulesPrompt.id = 'numRulesPrompt';
            numRulesPrompt.setAttribute('for', 'numRules');
            numRulesPrompt.innerHTML = 'Choose Difficulty Level - ';
            const numRulesResponse = document.createElement('select');
            numRulesResponse.name = 'numRulesPrompt';
            numRulesResponse.id = 'numRules';
            const levels = ['Comprehensible', 'Challenging', 'Convoluted'];
            for (let i = 0; i < levels.length; i++) {
                let option = document.createElement("option");
                option.value = ((i+1) * 3 + 1).toString();
                option.text = levels[i];
                numRulesResponse.add(option);
            }

            let startGame = document.getElementById('startGame');
            const newLine = document.createElement('br');
            startGame.appendChild(numRulesPrompt);
            startGame.appendChild(numRulesResponse);
            startGame.appendChild(newLine);
            startGame.appendChild(newLine);
        });
    }

    function displayDiff(val){
        let find = ((val-1)/3);
        let level;
        if (find === 1) {
            level = 'COMPREHENSIBLE';
        } else if (find === 2) {
            level = 'CHALLENGING';
        } else if (find === 3) {
            level = 'CONVOLUTED';
        }
        let message = 'DIFFICULTY: ' + level;
        document.getElementById('seeDiff').innerHTML = message;
    }

    // if(choseName){
    //     choseName.addEventListener('click', function() {
    //         let inName = document.getElementById('namePlayersPrompt').value;
    //         playerName = checkName(inName);
    //         window.document.getElementById('choseName').style.display = 'none';
    //         removeElement(window.document.getElementById('choseName'));
    //         window.document.getElementById('namePlayersPrompt').style.visibility = 'hidden';
    //         window.document.getElementById('namePlayers').style.visibility = 'hidden';
    //         //removeElement(window.document.getElementById('namePlayers'));
    //         let selectDifficulty = document.getElementById('numRules');
    //         // let showDiff = document.createElement('p');
    //         // showDiff.setAttribute('id', 'showDiff');
    //         // window.document.appendChild(showDiff);
    //         if(selectDifficulty){
    //             difficulty = selectDifficulty.options[selectDifficulty.selectedIndex].value;
    //             //push text as alert at start of game
    //             //showDiff.innerHTML = selectDifficulty.options[selectDifficulty.selectedIndex].text;
    //         }
    //         socket.send(JSON.stringify({
    //             action: 'choseName',
    //             name: playerName,
    //             userId: document.querySelector("[name=\"userId\"]").value,
    //             difficulty: difficulty
    //         }));
    //         selected = true;
    //     });
    // }

    function getHands(){
        let hands = {};
        for(let i = 0; i < ourGame.playerList.length; i++){
            hands[i] = ourGame.playerList[i].hand;
        }
        return hands;
    }

    function checkLength(){
        if(users.length >= 6){
            let nameSubmit = document.getElementById('choseName');
            if(nameSubmit){
                removeElement(nameSubmit);
                socket.send(JSON.stringify({
                    action: "gameFull"
                }));
            }
        }
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