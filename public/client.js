import { removeElement, standardGame, randomGame, numRulesDecided, numPlayersDecided,
    selectedCard, playerPlaying, saveNames, ourGame } from "./game.js";
(function () {
    "use strict";

    /* Assign this user an id */
    //document.querySelector("[name=\"userId\"]").value = generateId();

    /* Do the websocket communication stuffs. */
    let socket = new WebSocket("ws://139.126.184.73:8080/ws");
    /*Check IP*/
    /*ask it to run with certain parameters, grab ip, create code/id to join, ideal final product would have a web address*/
    /*grab the computer's ip, tell buds (create join code?*/

    // socket.onopen = function (evt) {    //onopen prompt user for name
    //     socket.send(JSON.stringify({
    //         action: "getView"      //get game
    //     }));
    // };

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

    /* Update the list of users */
    function updateView(data) { //change this to update based on game info
        if(data.mode){
            removeElement(document.getElementById('startPage'));
            if(data.mode === 'standard'){
                standardGame();
            } else {
                randomGame();
            }
            let numPlayers = document.getElementById('numPlayersSubmit');
            if(numPlayers){
                numPlayers.addEventListener('click', function () {
                    socket.send(JSON.stringify({
                        action: "numPlayersDecided",
                        numPlayers: document.getElementById('numPlayers').value,
                    }));
                });
            }
        } else if (data.numPlayers){
            numPlayersDecided(data.numPlayers);
            removeElement(document.getElementById('numPlayersSubmit'));
            removeElement(document.getElementById('numPlayersPrompt'));
            removeElement(document.getElementById('numPlayers'));
            if(document.getElementById('numRules')){
                numRulesDecided(document.getElementById('numRules').value);
                removeElement(document.getElementById('numRulesPrompt'));
                removeElement(document.getElementById('numRules'));
            }
            let startGame = document.getElementById('startButton');
            if(startGame){
                startGame.addEventListener('click', function() {
                    socket.send(JSON.stringify({
                        action: 'startGame',
                        users: ourGame.playerList
                    }));
                });
            }
        } else{
            let activeUsersElem = document.querySelector(".active-users");
            if (activeUsersElem) {
                let HTML = "<table>";
                HTML += "<tr><th>User Id</th><th>Name</th><th>Quest</th><th>Color</th></tr>";

                data.users.forEach(function (user) {
                    HTML += "<tr>" +
                        "  <td>" + user.id + "</td>" +
                        "  <td>" + user.name + "</td>" +
                        "  <td>" + user.quest + "</td>" +
                        "  <td>" + user.color + "</td>" +
                        "</tr>";
                });
            }
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

    /* Wire up the click action for submit */
    let submitButton = document.querySelector("#playCard");
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            socket.send(JSON.stringify({
                action: "playCard"      //add action to server.js, send card, send player
            }));
        });
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