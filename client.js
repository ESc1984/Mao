(function () {
    "use strict";

    /* Assign this user an id */
    document.querySelector("[name=\"userId\"]").value = generateId();

    /* Do the websocket communication stuffs. */
    // let socket = new WebSocket("ws://139.126.184.10:8080/");
    let socket = new WebSocket("ws://localhost:8080/");
    /*Check IP*/
    /*ask it to run with certain parameters, grab ip, create code/id to join, ideal final product would have a web address*/
    /*grab the computer's ip, tell buds (create join code?*/

    socket.onopen = function (evt) {    //onopen prompt user for name
        socket.send(JSON.stringify({
            action: "getUsers"
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
        console.error("[error] " + error.message);
    };

    /* Update the list of users */
    function updateView(data) { //change this or change it in onmessage?

        /* Print out the active users */
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

    /* Wire up the click action for submit */
    let submitButton = document.querySelector("#playCard");
    if (submitButton) {
        submitButton.addEventListener("click", function () {
            socket.send(JSON.stringify({
                action: "playCard"      //add action to server.js
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