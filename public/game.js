

let suits = ['S', 'H', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];

class Deck{
    constructor(){
        this._cards = this.makeCards();
    }

    makeCards(){
        let cards = [];
        for (let i = 0; i < 250; i++){
            let su = Math.floor(Math.random()*suits.length);
            let val = Math.floor(Math.random()*values.length);
            cards.push({suit: suits[su], value: values[val], num: i})
        }
        return cards;
    }

    isDeckValid(){
        let validDeck = true;
        if(!Array.isArray(this._cards)) {
            console.error("Received something that wasn't a deck", this._cards);
            validDeck = false;
        }
        return validDeck;
    }

    deal() {
        if( this.isDeckValid() ) {
            return (this._cards.shift());
        }
    }
}







class DiscardPile {
    constructor (card, game){
        this._cards = [card];
        this._expectedSuit = card.suit;
        this._expectedValue = card.value;
        this._game = game;
        this._sevensCount = 0;
    }

    get sevensCount(){
        return this._sevensCount;
    }

    get cards() {
        return this._cards;
    }

    get expectedSuit() {
        return this._expectedSuit;
    }

    set expectedSuit(newSuit){
        this._expectedSuit = newSuit;
    }

    get expectedValue() {
        return this._expectedValue;
    }

    set expectedValue(newVal) {
        this._expectedValue = newVal;
    }

    topDiscard(){
        return this._cards[0];
    }

    addToDiscard(card){
        if(card.value === this._game.rules.niceDayRules.card){
            this._sevensCount++;
        } else {
            this._sevensCount = 0;
        }
        if(this.findValue(card.value) === (this.findValue(this.expectedValue)+1)){
            runCount++;
        } else {
            runCount = 0;
        }
        let disc = document.getElementById("discard");
        this._cards.unshift(card);
        if(! ( (this._game.rules.wildRules.card === card.suit ||this._game.rules.wildRules.card === card.value) && this._game.rules.wildRules.played === true ) ){
            this._expectedSuit = card.suit;
        }
        this._expectedValue = card.value;
        disc.removeChild(disc.children[0]);
        addCardsToPlayer(card, disc);
    }

    findValue(value){
        const faces = ['A','X','J','Q','K'];
        const trans = [1, 10, 11, 12, 13];
        let val = value;
        if (faces.includes(val)) {
            for (let i = 0; i < faces.length; i++) {
                if (val === faces[i]) {
                    val = trans[i];
                }
            }
        } else {
            val = parseInt(val);
        }
        return val;
    }
}







class Player {
    constructor(hand, name, game) {
        this._hand = hand;
        this._name = name;
        this._game = game;
        this._turn = false;
    }

    get game() {
        return this._game;
    }

    get hand() {
        return this._hand;
    }

    get name() {
        return this._name;
    }

    get turn() {
        return this._turn;
    }

    receiveCard(card) {
        this._hand.push(card);
        //this.hilite(document.getElementById(this.name + 'show'));
    }

    handSize(){
        return this._hand.length;
    }

    updateNumCards(){
        let player = game.querySelector(`#${this.name}`);
        let display = player.getElementsByClassName('hand')[0];
        let element = display.parentElement.getElementsByClassName('playerhand');
        if (element.length !== 0 && typeof (element) != "undefined") {
            let playerhand = player.querySelector('.playerhand');
            if (playerhand.children.length === 1) {
                playerhand.parentNode.children[0].children[0].innerHTML = (playerhand.children.length + ' card');
            } else {
                playerhand.parentNode.children[0].children[0].innerHTML = (playerhand.children.length + ' cards');
            }
        }
    }

    passTurn() {
        document.getElementById('played').innerHTML = '- ';
        document.getElementById('played').style.color = '#b0210b';
        this._game.rules.passTurnCheckRules(this);
        if (this._turn) {
            this._game.passes = this._game.numPasses + 1;
            this._game.updateTurn();
        }
        this.updateNumCards();
        if (document.getElementById(selectedCard) !== null) {
            document.getElementById(selectedCard).classList.toggle('selectedCard');
        }
        selectedCard = '';
        this.hilite(document.getElementById(this.name + 'show'));
    };

    playCard(cardIndex, selectedRules) {
        document.getElementById('played').innerHTML = '- ';
        document.getElementById('played').style.color = '#b0210b';
        let card = this._hand[cardIndex];
        this._game.rules.playedCardCheckRules(card, this);
        if(this._turn) {
            if (this._game.rules.cardMatch(card, this)) {
                this._game.passes = 0;
                this.sendRuleDeclarations(card, selectedRules);
                this._game.discardCard(this._hand.splice(cardIndex, 1)[0]);
                this._game.rules.resetRules();
                let player = game.querySelector(`#${this.name}`);
                let grid = player.querySelector(".playerhand");
                let identifier = "#" + card.suit + card.value + card.num;
                let element = grid.querySelector(identifier);
                element.parentNode.removeChild(element);

                this._game.rules.findWin(this);
                this._game.updateTurn();
            }
        }
        this.updateNumCards();
        this.hilite(document.getElementById(this.name + 'show'));
    }

    hilite(boop){
        boop.classList.toggle('highlight');
        setTimeout(function(){
            boop.classList.toggle('highlight');
        }, 1200)
    }

    sendRuleDeclarations(card, selectedRules){
        selectedRules.forEach(selected => {
            if(selected === 'Mao' && this._game.rules.maoRules.played === false && this._game.rules.rulesInPlay.includes('mao')){
                this._game.rules.maoPlayed(this, selected);
            } else if(selected === 'Spades' && !this._game.rules.spadeRules.played && card.suit === 'S' && this._game.rules.rulesInPlay.includes('spade')) {
                this._game.rules.gameRules[0].function(this, selected, card);
            } else if(selected === 'Pair' && this._game.rules.pairRules.played === false &&
                    this._game.rules.rulesInPlay.includes('pair') && card.value === this._game.discardPile.expectedValue) {
                this._game.rules['pairPlayed'](this, selected, card);
            } else if(selected === 'Run' && this._game.rules.runRules.played === false &&
                this._game.rules.rulesInPlay.includes('run') && (this._game.discardPile.findValue(card.value) === (this._game.discardPile.findValue(this._game.discardPile.expectedValue)+1))){
                this._game.rules.gameRules[1].function(this, selected, card);
            }
            else {
                let sent = false;
                this._game.rules.rulesInPlay.forEach(rule => {
                    if(sent === false && rule !== 'spade' && rule !== 'pair' && rule !== 'run' &&
                        (this._game.rules[rule + 'Rules'].card === card.value || this._game.rules[rule + 'Rules'].card === card.suit) ){
                        if(this._game.rules[rule + 'Rules'].played === false){
                            this._game.rules[rule + 'Played'](this, selected);
                            sent = true;
                        }
                    }
                });
                if(sent === false){
                    this._game.drawCard(this);
                    let message = 'declared ' + selected.toUpperCase() + ' out of turn';
                    this.showAlert(message);
                }
            }
        });

        if(this._game.rules.rulesInPlay.includes('mao') && this.hand.length === 2 && !this._game.rules.maoRules.played){
            this._game.rules.maoPlayed(this, "");
        }

        if(this._game.rules.rulesInPlay.includes('spade') && card.suit === 'S' && this._game.rules.spadeRules.played === false){
            this._game.rules.gameRules[0].function(this, "");
        }

        if(this._game.rules.rulesInPlay.includes('pair') && card.value === this._game.discardPile.expectedValue && this._game.rules.pairRules.played === false){
            this._game.rules.gameRules[2].function(this, "", card);
        }

        if(this._game.rules.rulesInPlay.includes('run') && this._game.discardPile.findValue(card.value) === (this._game.discardPile.findValue(this._game.discardPile.expectedValue)+1)
            && this._game.rules.runRules.played === false){
            this._game.rules.gameRules[3].function(this, "");
        }

        if(this._game.rules.rulesInPlay.includes('skipChoose') && card.suit === 'H' && card.value === 'A'){
            this._game.rules.skipChoosePlayed(this, "");
            //this._game.rules.gameRules[1].function(this, "");
            //this._game.updateTurn();
        }


        this._game.rules.gameRules.forEach(rule => {
            let checkPlayedStatus = rule.function.toString();
            checkPlayedStatus = checkPlayedStatus.substring(0, checkPlayedStatus.indexOf("Played"));
            checkPlayedStatus = checkPlayedStatus + "Rules";
            if(rule.function !== this._game.rules.noRule){
                if( (rule.value === card.value) && (this._game.rules[checkPlayedStatus].played === false) ){
                    if(this._game.rules.rulesInPlay.includes('skipChoose') && card.suit === 'H' && card.value === 'A' && checkPlayedStatus === 'skipNextRules'){
                        this._game.rules.skipChoosePlayed(this, "");
                        this._game.updateTurn();
                    } else {
                        rule.function(this, "");
                    }
                }
            }
        });
    }

    // callout(){
    //     if (document.getElementById("alert").innerHTML === ''){
    //         document.getElementById("alert").insertAdjacentHTML('beforeend', `- ${this._name.toUpperCase()} -<br>`);
    //     }
    // }

    showAlert(message){
        if (document.getElementById("alert").innerHTML === ''){
            document.getElementById("alert").insertAdjacentHTML('beforeend', `- ${this._name.toUpperCase()} -<br>`);
        }
        document.getElementById("alert").insertAdjacentHTML('beforeend', `- ${message.toUpperCase()} -<br>`);
        document.getElementById('alert').classList.toggle('hide');
        setTimeout(function(){
            document.getElementById("alert").innerHTML = '';
            document.getElementById('alert').classList.toggle('hide');
        }, 1600);
    }

    set turn(turn) {
        this._turn = turn;
    }

}







class Game {
    constructor(playerList, numRules){
        this._playDeck = new Deck();
        let card = this._playDeck.deal();
        this._discardPile = new DiscardPile(card, this);
        this._rules = new Rules(this, numRules);
        this._playerList = [];
        for (let i = 0; i < playerList.length; i++){
            this._playerList.push(new Player(this.dealHand(), playerList[i], this, numRules));
        }
        this._playerList[0].turn = true;
        this._passes = 0;
    }

    get rules(){
        return this._rules;
    }

    getPlayer(index){
        return this._playerList[index];
    }

    get playerList(){
        return this._playerList;
    }

    get discardPile(){
        return this._discardPile;
    }

    get numPasses(){
        return this._passes;
    }

    set passes(numPasses) {
        this._passes = numPasses;
    }

    dealHand(){
        let hand = [];
        for (let i = 0; i < 7; i++){
            hand.unshift(this._playDeck.deal());
        }
        return hand;
    }

    drawCard(player){
        let card = this._playDeck.deal();
        let grid = document.getElementById(player.name).children[(document.getElementById(player.name).children.length)-1];
        addCardsToPlayer(card, grid);
        player.receiveCard(card);
    }

    updateTurn(){
        let currentPlayer = this.getCurrentPlayer();
        let nextPlayer = currentPlayer + 1 >= this._playerList.length ? 0 : currentPlayer + 1;
        //this.checkNext(currentPlayer, nextPlayer);
        if (this.rules.skippedPlayer.includes(this.getPlayer(nextPlayer).name)){
            let i = this.rules.skippedPlayer.indexOf(this.getPlayer(nextPlayer).name);
            //this.rules.skippedPlayer.splice(i, 1);
            //relocation
            this.disableTurn(nextPlayer);
            if (nextPlayer === this._playerList.length-1){
                nextPlayer = 0;
                console.log(nextPlayer);
            } else {
                nextPlayer++;
                console.log(nextPlayer);
            }
            //nextPlayer = currentPlayer + 2 >= this._playerList.length ? 0 : currentPlayer + 2;
            console.log('new next player: ' + nextPlayer);
            this.rules.skippedPlayer.splice(i, 1);
            console.log(this.rules.skippedPlayer);
        }
        this.disableTurn(currentPlayer);
        this.enableTurn(nextPlayer);
        this.passCount();
        // if(this.rules.skippedPlayer.includes(this.getPlayer(nextPlayer).name)){
        //     let i = this.rules.skippedPlayer.indexOf(this.getPlayer(nextPlayer).name);
        //     this.rules.skippedPlayer.splice(i, 1);
        //     this.updateTurn();
        // }
    }

    disableTurn(playerIndex){
        this.getPlayer(playerIndex).turn = false;
    }

    enableTurn(playerIndex){
        this.getPlayer(playerIndex).turn = true;
    }

    getCurrentPlayer(){
        let playerIndex;
        for(let i = 0; i < this._playerList.length; i++) {
            if(this._playerList[i].turn){
                playerIndex = i;
                break;
            }
        }
        return playerIndex;
    }

    discardCard(card){
        this._discardPile.addToDiscard(card);
    }

    passCount(){
        if (this._passes >= this.playerList.length){
            this._discardPile.addToDiscard(this._playDeck.deal());
            this._passes = 0;
            //runCount = save;
            runCount = 0;
            //is this right?
        }
    }
}







class Rules{
    constructor(player, numRules){
        this.gameRules = [
            {value:"S", function: this.noRule},
            {value:"H", function: this.noRule},
            {value:"D", function: this.noRule},
            {value:"C", function: this.noRule},
            {value:"A", function: this.noRule},
            {value:"2", function: this.noRule},
            {value:"3", function: this.noRule},
            {value:"4", function: this.noRule},
            {value:"5", function: this.noRule},
            {value:"6", function: this.noRule},
            {value:"7", function: this.noRule},
            {value:"8", function: this.noRule},
            {value:"9", function: this.noRule},
            {value:"X", function: this.noRule},
            {value:"J", function: this.noRule},
            {value:"Q", function: this.noRule},
            {value:"K", function: this.noRule}
        ];
        this.allRules = [
            {function: this.niceDayPlayed, name: 'niceDay'},
            {function: this.wildPlayed, name: 'wild'},
            {function: this.chairwomanPlayed, name: 'chairwoman'},
            {function: this.chairmanPlayed, name: 'chairman'},
            {function: this.spadePlayed, name: 'spade'},
            {function: this.reversePlayed, name: 'reverse'},
            {function: this.playAgainPlayed, name: 'playAgain'},
            {function: this.pairPlayed, name: 'pair'},
            {function: this.runPlayed, name: 'run'},
            {function: this.maoPlayed, name: 'mao'},
            {function: this.skipChoosePlayed, name: 'skipChoose'},
            {function: this.skipNextPlayed, name: 'skipNext'}
        ];
        this._rulesInPlay = [];
        this._skippedPlayer = [];

        this._niceDayRules = {played: false};
        this._wildRules = {played: false};
        this._chairwomanRules = {played: false};
        this._chairmanRules = {played: false};
        this._spadeRules = {played: false};
        this._maoRules = {played: false};
        this._reverseRules = {played: false};
        this._playAgainRules = {played: false};
        this._pairRules = {played: false};
        this._runRules = {played: false};
        this._skipChooseRules = {played: false};
        this._skipNextRules = {played: false};

        if(numRules === false){
            this.normalRules();
        } else {
            this.pickRules(numRules);
        }
    }

    get rulesInPlay(){
        return this._rulesInPlay;
    }

    get skippedPlayer(){
        return this._skippedPlayer;
    }

    get niceDayRules(){
        return this._niceDayRules;
    }

    get wildRules(){
        return this._wildRules;
    }

    get chairwomanRules(){
        return this._chairwomanRules;
    }

    get chairmanRules(){
        return this._chairmanRules;
    }

    get spadeRules(){
        return this._spadeRules;
    }

    get maoRules(){
        return this._maoRules;
    }

    get reverseRules(){
        return this._reverseRules;
    }

    get skipNextRules(){
        return this._skipNextRules;
    }

    get playAgainRules(){
        return this._playAgainRules;
    }

    get skipChooseRules(){
        return this._skipChooseRules;
    }

    get pairRules(){
        return this._pairRules;
    }

    get runRules(){
        return this._runRules;
    }

    pickRules(num){
        for(let i = 0; i < num; i++){
            let ruleNum = Math.floor(Math.random() * this.allRules.length);
            let cardNum = Math.floor(Math.random() * 13 + 4);
            if (this.allRules[ruleNum].name === 'pair'){
                this.gameRules[2].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule("", this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            }
            else if (this.allRules[ruleNum].name === 'run'){
                this.gameRules[3].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule("", this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            }
            else if (this.allRules[ruleNum].name === 'spade'){
                this.gameRules[0].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule(this.gameRules[0], this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            }
            else if (this.allRules[ruleNum].name === 'skipChoose'){
                this.gameRules[1].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule("", this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            }
            else if(this.gameRules[cardNum].name === 'mao'){
                this.gameRules[2].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule('', this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            }
            else if(this.gameRules[cardNum].function === this.noRule){
                this.gameRules[cardNum].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule(this.gameRules[cardNum], this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            } else {
                i--;
            }
        }
        console.log(this.rulesInPlay);
    }

    normalRules(){
        this.gameRules = [
            {value:"S", function: this.spadePlayed},
            {value:"H", function: this.noRule},
            {value:"D", function: this.noRule},
            {value:"C", function: this.noRule},
            {value:"A", function: this.skipNextPlayed},
            {value:"2", function: this.playAgainPlayed},
            {value:"3", function: this.noRule},
            {value:"4", function: this.noRule},
            {value:"5", function: this.noRule},
            {value:"6", function: this.noRule},
            {value:"7", function: this.niceDayPlayed},
            {value:"8", function: this.reversePlayed},
            {value:"9", function: this.noRule},
            {value:"X", function: this.noRule},
            {value:"J", function: this.wildPlayed},
            {value:"Q", function: this.chairwomanPlayed},
            {value:"K", function: this.chairmanPlayed}
        ];
        this._rulesInPlay = ['niceDay', 'wild',
            'chairwoman', 'chairman', 'spade', 'skipNext', 'reverse', 'playAgain', 'mao'];
        this.niceDayRules.card = '7';
        this.wildRules.card = 'J';
        this.chairwomanRules.card = 'Q';
        this.chairmanRules.card = 'K';
        this.spadeRules.card = 'S';
        this.skipNextRules.card = 'A';
        this.reverseRules.card = '8';
        this.playAgainRules.card = '2';
    }

    storeCardRule(card, rule, name){
        this.rulesInPlay.push(rule.name);
        // if(rule.name === 'skipNext'){
        //     //include randomization
        //     this.rulesInPlay.push('skipChoose');
        // }
        if(card !== ""){
            this[name]['card'] = card.value;
        }
        else{
            this[name]['card'] = true;
        }
    }

    resetRules(){
        this._niceDayRules.played = false;
        this._wildRules.played = false;
        this._chairwomanRules.played = false;
        this._chairmanRules.played = false;
        this._spadeRules.played = false;
        this._maoRules.played = false;
        this._reverseRules.played = false;
        this._playAgainRules.played = false;
        this._pairRules.played = false;
        this._runRules.played = false;
        this._skipChooseRules.played = false;
        this._skipNextRules.played = false;
    }

    cardMatch(card, player){
        return ( (card.suit === player.game.discardPile.expectedSuit) || (card.value === player.game.discardPile.expectedValue))
    }

    passTurnCheckRules(player){
        if(!player.turn) {
            player.game.drawCard(player);
            if(selectedCard !== ""){
                document.getElementById(selectedCard).classList.toggle('selectedCard');
                selectedCard = '';
            }
            player.showAlert('failure to play in turn');
        }
    }

    playedCardCheckRules(card, player){
        if(!player.turn) {
            player.game.drawCard(player);
            document.getElementById(selectedCard).classList.toggle('selectedCard');
            selectedCard = '';
            player.showAlert('failure to play in turn');
        } else if (!this.cardMatch(card, player)) {
            player.game.drawCard(player);
            document.getElementById(selectedCard).classList.toggle('selectedCard');
            selectedCard = '';
            player.showAlert('failure to play within proper values');
            player.game.updateTurn();
        }
    }

    noRule(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
        }
    }

    spadePlayed(player, state){
        if(state !== 'Spades'){
            player.game.drawCard(player);
            player.showAlert('failure to declare spades');
        } else {
            player.game.rules.spadeRules.played = true;
        }
    }

    skipChoosePlayed(player, state){
        if (selectedCard.indexOf('H') > -1 && selectedCard.indexOf('A') > -1) {
            if (state !== "") {
                let message = 'declared ' + state + ' out of turn';
                player.showAlert(message);
                player.game.drawCard(player);
            }
            let prompt = document.createElement('p');
            prompt.classList.add('alert');
            prompt.innerHTML = 'Select the Player you Wish to Skip';
            game.appendChild(prompt);
            const grid = document.createElement('playerNameGrid');
            grid.setAttribute('class', 'grid');
            prompt.appendChild(grid);
            ourGame.playerList.forEach(player => {
                if (ourGame._playerList.indexOf(player) !== ourGame.getCurrentPlayer()) {
                    const gamePlayer = document.createElement('button');
                    gamePlayer.classList.add('ruleButton');
                    gamePlayer.innerHTML = player.name;
                    gamePlayer.onclick = (() => {
                        // let checker = ourGame._playerList.indexOf(player);
                        // let checkee = ourGame.getCurrentPlayer();
                        //fremulon
                        //let checkplayer = ourGame.getPlayer(ourGame._playerList.indexOf(player));
                        //ourGame.getPlayer(ourGame._playerList.indexOf(player))._turn = false;
                        //if(ourGame._playerList.indexOf(player) !== ourGame.getCurrentPlayer() - 1){
                        if (ourGame._playerList.indexOf(player) !== ourGame.getCurrentPlayer()) {
                            player.game.rules.skippedPlayer.push(player.name);
                            // this.nextSkip = false;
                        } else {
                            // this.nextSkip = true;
                            ourGame.getPlayer(ourGame._playerList.indexOf(player))._turn = false;
                            let nowplay = ourGame._playerList.indexOf(player) + 1;
                            if (nowplay >= ourGame._playerList.length) {
                                nowplay = 0;
                            }
                            ourGame.getPlayer(nowplay)._turn = true;
                        }
                        prompt.parentNode.removeChild(prompt);
                    });
                    grid.appendChild(gamePlayer);
                }
            });
            player.game.rules.skipChoosePlayed.played = true;
        }
    }

    skipNextPlayed(player, state){
        if(state != ""){
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
            player.game.drawCard(player);
        }
        if(player.game.rules.rulesInPlay.includes('skipChoose') && this.skipChooseRules !== undefined){
            if(this.skipChooseRules.played === false){
                //|| this.nextSkip === true) {
                player.game.updateTurn();
                player.game.rules.skipNextRules.played = true;
            }
        } else {
            player.game.updateTurn();
            player.game.rules.skipNextRules.played = true;
        }
    }

    niceDayPlayed(player, state){
        if (state === "") {
            player.game.drawCard(player);
            player.showAlert('failure to declare have a nice day');
        } else if(state !== 'Have a Nice Day'){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
        }  else{
            if(niceDayCount - 1 !== player.game.discardPile.sevensCount){
                player.game.drawCard(player);
                let penalty = "failure to declare HAVE A " + "VERY ".repeat(player.game.discardPile.sevensCount) + "NICE DAY";
                player.showAlert(penalty);
            }
            player.game.rules.niceDayRules.played = true;
        }
    }

    reversePlayed(player, state){
        if(state != ""){
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
            player.game.drawCard(player);
        }
        player.game.playerList.reverse();
        if (player.game.playerList.length === 2){
            player.game.updateTurn();
        }
        player.game.rules.reverseRules.played = true;
    }


    wildPlayed(player, suit){
        if ((suit === 'Hearts')||(suit === 'Spades')||(suit ==='Diamonds')||(suit === 'Clubs')){
            player.game.discardPile.expectedSuit = suit.charAt(0);
            player.game.rules.wildRules.played = true;
            player.showAlert('* wild ' + suit + ' *');
        } else {
            player.game.drawCard(player);
            player.showAlert('failure to declare a suit');
        }
    }

    chairmanPlayed(player, state){
        if (state !== 'All Hail the Chairman') {
            player.game.drawCard(player);
            player.showAlert('failure to declare all hail the chairman');
        } else {
            player.game.rules.chairmanRules.played = true;
        }
    }

    chairwomanPlayed(player, state){
        if (state !== 'All Hail the Chairwoman') {
            player.game.drawCard(player);
            player.showAlert('failure to declare all hail the chairwoman');
        } else {
            player.game.rules.chairwomanRules.played = true;
        }
    }

    playAgainPlayed(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
        } else {
            let currentPlayer = player.game.getCurrentPlayer();
            player.game.playerList[currentPlayer].turn = false;
            let nextPlayer = currentPlayer - 1;
            if(currentPlayer === 0){
                nextPlayer = player.game.playerList.length - 1;
            }
            player.game.playerList[nextPlayer].turn = true;
            player.game.rules.playAgainRules.played = true;
        }
    }

    runPlayed(player, state){
        if(runCount >= 1 && state !== 'Run'){
            player.game.drawCard(player);
            player.showAlert('failure to declare run');
        } else if (runCount < 1 && state === 'Run'){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
        } else {
            player.game.rules.runRules.played = true;
        }
    }

    pairPlayed(player, state, card){
        if(state === 'Pair'){
            player.game.rules.pairRules.played = true;
        } else {
            player.game.drawCard(player);
            player.showAlert('failure to declare pair');
        }
    }


    maoPlayed(player, state){
        let cardsLeft = player.hand.length;
        if ((cardsLeft === 2)&&(state.toLowerCase() !== 'mao')) {
            player.game.drawCard(player);
            player.showAlert('failure to declare mao');
        } else if ((cardsLeft !== 2)&&(state.toLowerCase() === 'mao')){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.showAlert(message);
        } else {
            player.game.rules.maoRules.played = true;
        }
    }

    findWin(player){
        if (player.hand.length === 0){
            document.getElementById('gameBoard').innerHTML = "";
            document.getElementById('alert').style.marginLeft = '0';
            document.getElementById('alert').style.fontSize = '100px';
            document.getElementById('alert').style.top = '10%';
            document.getElementById("alert").innerHTML = '- CONGRATULATIONS, ' + player.name.toUpperCase() + ' -<br> YOU HAVE WON THIS ROUND OF MAO';
            document.getElementById('redoButton').style.display = 'block';
        }
    }
}




let ourGame;
let game;
let ruleNumber = false;
let players;
let selectedCard = "";
let oldCard = "";
let playerPlaying;
let specialRules = ["Spades", "Hearts", "Clubs", "Diamonds", "Have a Nice Day", "All Hail the Chairwoman", "All Hail the Chairman", "Mao"];
let selectedRules = [];
let niceDayCount = 0;
let runCount = 0;
let declaration = "- ";

window.onload = function gameLoaded() {
    game = document.getElementById("gameBoard");
    overlay();
};

function overlay() {
    let el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility === "visible") ? "hidden" : "visible";
    window.scrollTo(0, 0);
    if(el.style.visibility === 'hidden'){
        removeElement(el);
    }
}

function submitButton(parent, random){
    const submitButton = document.createElement('button');
    submitButton.id = 'numPlayersSubmit';
    submitButton.classList.add('submit');
    submitButton.innerHTML = 'Submit';
    submitButton.onclick = () => {
        removeElement(submitButton);
        numPlayersDecided(document.getElementById('numPlayers').value);
        removeElement(document.getElementById('numPlayersPrompt'));
        removeElement(document.getElementById('numPlayers'));
        if(random === true){
            numRulesDecided(document.getElementById('numRules').value);
            removeElement(document.getElementById('numRulesPrompt'));
            removeElement(document.getElementById('numRules'));
        }
    };
    parent.appendChild(submitButton);
}

function namePrompt(parent){
    const numPlayersPrompt = document.createElement('label');
    numPlayersPrompt.id = 'numPlayersPrompt';
    numPlayersPrompt.setAttribute('for', 'numPlayers');
    numPlayersPrompt.innerHTML = "Enter Number of Players (2-6) ";

    const numPlayersResponse = document.createElement('input');
    numPlayersResponse.name = 'numPlayersPrompt';
    numPlayersResponse.id = 'numPlayers';
    numPlayersResponse.type = 'number';
    const newLine = document.createElement('br');

    parent.appendChild(numPlayersPrompt);
    parent.appendChild(numPlayersResponse);
    parent.appendChild(newLine);
    parent.appendChild(newLine);
}

export function randomGame(){
    specialRules = ["Spades", "Hearts", "Clubs", "Diamonds", "Have a Nice Day", "All Hail the Chairwoman", "All Hail the Chairman", "Mao", "Pair", "Run"];
    let startGame = document.getElementById('startGame');
    startGame.style.visibility = 'visible';
    namePrompt(startGame);
    const numRulesPrompt = document.createElement('label');
    numRulesPrompt.id = 'numRulesPrompt';
    numRulesPrompt.setAttribute('for', 'numRules');
    numRulesPrompt.innerHTML = 'Choose Difficulty Level - ';
    const numRulesResponse = document.createElement('select');
    numRulesResponse.classList.add('select');
    numRulesResponse.name = 'numRulesPrompt';
    numRulesResponse.id = 'numRules';
    //numRulesResponse.type = 'option';
    const levels = ['Comprehensible', 'Challenging', 'Convoluted', 'Climactic'];
    for (let i = 0; i < levels.length; i++) {
        let option = document.createElement("option");
        option.classList.add('option');
        option.value = ((i+1) * 3).toString();
        option.text = levels[i];
        numRulesResponse.add(option);
    }
    const newLine = document.createElement('br');
    startGame.appendChild(numRulesPrompt);
    startGame.appendChild(numRulesResponse);
    startGame.appendChild(newLine);
    submitButton(startGame, true);
}

export function standardGame(){
    let startGame = document.getElementById('startGame');
    startGame.style.visibility = 'visible';
    namePrompt(startGame);
    submitButton(startGame, false);
}

function numPlayersDecided(numPlayers) {
    if (numPlayers > 6) {
        players = 6;
    } else if (numPlayers < 2 || numPlayers === null){
        players = 2;
    } else {
        players = numPlayers;
    }
    let startGamePrompt = document.getElementById('startGame');
    for(let i = 0; i < players; i++){
        let namePrompt = document.createElement('label');
        namePrompt.id = 'namePlayers';
        namePrompt.setAttribute('for', 'namePlayers' + i);
        namePrompt.innerHTML = `Enter Player ${i+1}'s Name: `;
        let nameHolder = document.createElement('input');
        nameHolder.name = 'namePlayersPrompt';
        nameHolder.id = 'namePlayers' + i;
        nameHolder.type = 'text';
        nameHolder.maxLength = 10;
        let newLine = document.createElement('br');

        startGamePrompt.appendChild(namePrompt);
        startGamePrompt.appendChild(newLine);
        startGamePrompt.appendChild(newLine);
        startGamePrompt.appendChild(nameHolder);
        startGamePrompt.appendChild(newLine);
        startGamePrompt.appendChild(newLine);
    }
    let startButton = document.createElement('button');
    startButton.class ='close';
    startButton.id = 'startButton';
    startButton.innerHTML = 'Start Game';
    startButton.onclick = saveNames;
    startGamePrompt.appendChild(startButton);
}

function saveNames() {
    let num = parseInt(players);
    let newPlayers = [];
    let toCheck = [];
    for (let h = 0; h < num; h++) {
        let name = document.getElementById('namePlayers' + h).value.trim();
        if (name.length > 0){
            if (name.indexOf(' ') > -1){
                let squish = '';
                for (let i = 0; i < name.length; i++){
                    if (name.charAt(i) !== ' '){
                        squish += name.charAt(i);
                    } else {
                        squish += '-';
                    }
                }
                name = squish;
            }
            let nums = ['1','2','3','4','5','6','7','8','9','0'];
            for (let n = 0; n < nums.length; n++){
                if (name.charAt(0) === nums[n]){
                    name = 'x' + name;
                }
            }
            let prof = ['fxxx', 'sxxx', 'axx', 'cxxx', 'dxxx', 'bxxxx'];
            let good = ['fork', 'shirt', 'ash', 'crab', 'ding', 'bench'];
            let checker = name.toLowerCase();
            for (let b = 0; b < prof.length; b++){
                if (checker.includes(prof[b])){
                    let censor = '';
                    for (let i = 0; i < checker.length; i++){
                        if (checker.charAt(i) === prof[b].charAt(0)){
                            let start = i;
                            let end = 0;
                            let found = true;
                            for (let w = start; w < start + prof[b].length; w++){
                                if (checker.charAt(w) !== prof[b].charAt(w-start)){
                                    found = false;
                                } else {
                                    end = w + 1;
                                }
                            }
                            if (found = true){
                                censor = name.substring(0, start) + good[b] + name.substring(end, name.length+1);
                            }
                        }
                    }
                    name = censor;
                }
            }
            name = name.charAt(0).toUpperCase() + name.substring(1, name.length);
             toCheck.push(name);
        } else if (name === '' || name === null) {
            toCheck.push('x');
        }
    }

    for (let i = 0; i < (toCheck.length - 1); i++){
        let diff = 2;
        for (let j = (i + 1); j < toCheck.length; j++){
            if (toCheck[i].toLowerCase() === toCheck[j].toLowerCase()){
                toCheck[j] += ('-'+diff.toString());
                diff++;
            }
        }
        newPlayers.push(toCheck[i]);
        if (i+2 === toCheck.length){
            newPlayers.push(toCheck[i+1]);
        }
    }
    overlay();
    startGame(newPlayers);
}

function numRulesDecided(numRules){
    if(numRules > specialRules.length - 1){
        ruleNumber = specialRules.length -1;
    } else if (numRules < 2) {
        ruleNumber = 2;
    } else {
        ruleNumber = numRules;
    }
}

export function removeElement(element) {
    element.parentNode.removeChild(element);
}

function displayPlayerHand(playerIndex) {
    document.getElementById("displayHand").innerHTML = ourGame.getPlayer(playerIndex).hand;
}

function startGame(players) {
    ourGame = new Game(players, ruleNumber);
    createTopBar();
    const speak = document.createElement('speak');
    speak.setAttribute('id', 'played');
    speak.innerHTML = '- ';
    speak.style.color = '#b0210b';
    game.appendChild(speak);
    ourGame.playerList.forEach(player => {
        const gamePlayer = document.createElement('div');
        gamePlayer.classList.add('player');
        gamePlayer.setAttribute("class", "player");
        gamePlayer.setAttribute("id", player.name);
        gamePlayer.dataset.name = player.name;
        game.appendChild(gamePlayer);

        const hand = document.createElement('button');
        hand.setAttribute('class', 'hand');
        hand.setAttribute('id', `${player.name}show`);
        hand.innerHTML = player.name;
        hand.onclick = openHand;
        gamePlayer.appendChild(hand);

        let numCards = document.createElement('h3');
        numCards.classList.add('numCards');
        numCards.setAttribute('class', 'numCards');
        numCards.setAttribute('id', `${player.name}numCards`);
        numCards.innerHTML = player.hand.length.toString() + ' cards';
        hand.appendChild(numCards);
    });
}



function createTopBar(){
    const topGrid = document.createElement('section');
    topGrid.setAttribute('id', 'topGrid');
    topGrid.setAttribute('class', 'grid');
    createDiscardFunctionality(topGrid);
    const playCard = document.createElement('button');
    playCard.setAttribute('id', 'playCard');
    playCard.innerHTML = 'Play<br>Turn';
    playCard.onclick = playTurn;
    topGrid.appendChild(playCard);
    game.appendChild(topGrid);
}

function createDiscardFunctionality(grid){
    const discard = document.createElement('section');
    discard.setAttribute('id', 'discard');
    discard.setAttribute('class', 'grid');
    discard.classList.add('discard');
    grid.appendChild(discard);
    const disPile = addCardsToPlayer(ourGame.discardPile.topDiscard(), discard);
    const ruleButtonGrid = document.createElement('section');
    ruleButtonGrid.setAttribute('id', 'ruleButtonGrid');
    ruleButtonGrid.setAttribute('class', 'grid');
    grid.appendChild(ruleButtonGrid);
    specialRules.forEach(rule => {
        createRuleButtons(ruleButtonGrid, rule);
    });
}

function createRuleButtons(grid, specialRule){
    const ruleBtn = document.createElement('button');
    ruleBtn.setAttribute('class', 'ruleButton');
    ruleBtn.setAttribute('id', specialRule);
    ruleBtn.innerHTML = specialRule;
    ruleBtn.onclick = selectedRule;
    grid.appendChild(ruleBtn);
}

function selectedRule(){
    let rule = this.innerHTML;
    if(rule === "Have a Nice Day"){
        rule = "Have a " + "Very ".repeat(niceDayCount) + "Nice Day";
        niceDayCount++;
        if(niceDayCount <= 1){
            selectedRules.unshift(rule);
        }
        document.getElementById('played').innerHTML = declaration;
    } else {
        selectedRules.unshift(rule);
        declaration = `${declaration}${rule} - `;
    }
    document.getElementById('played').insertAdjacentHTML("beforeend", rule + ' - ');
    document.getElementById('played').style.color = 'gold';
}

function initializePlayerHand(player, grid){
    let sortedHand = player.hand.sort((a,b) => {
        let x = a.suit.toLowerCase();
        let y = b.suit.toLowerCase();
        if(x < y) {return -1;}
        if(x > y) {return 1;}
        x = a.value;
        if(x === 'A') {x = '1';}
        else if(x === 'X') {x = '10';}
        else if(x === 'J') {x = '11';}
        else if(x === 'Q') {x = '12';}
        else if(x === 'K') {x = '13';}
        x = parseInt(x, 10);
        y = b.value;
        if(y === 'A') {y = '1';}
        else if(y === 'X') {y = '10';}
        else if(y === 'J') {y = '11';}
        else if(y === 'Q') {y = '12';}
        else if(y === 'K') {y = '13';}
        y = parseInt(y, 10);
        return x - y;
    });
    sortedHand.forEach(card => {
        addCardsToPlayer(card, grid);
        grid.classList.add('cardhand')
    });
}

function openHand() {
    let element = this.parentElement.getElementsByClassName('playerhand');
    if (element.length !== 0 && typeof (element) != "undefined") {
        let player = this.parentNode;
        let pass = player.querySelector('.pass');
        let playerhand = player.querySelector('.playerhand');
        pass.parentNode.removeChild(pass);
        playerhand.parentNode.removeChild(playerhand);
    } else {
        playerPlaying = this.parentElement.id;
        let player = findPlayerIndexFromId();
        const passBtn = document.createElement("button");
        passBtn.setAttribute('class', 'pass');
        passBtn.innerHTML = 'Pass Turn';
        passBtn.onclick = passTurn;
        this.parentElement.appendChild(passBtn);
        const playerhand = document.createElement('section');
        playerhand.setAttribute('class', 'grid playerhand');
        initializePlayerHand(player, playerhand);
        this.parentElement.appendChild(playerhand);
    }
}

function addCardsToPlayer(card, grid){
    const playCard = document.createElement('div');
    playCard.classList.add('card');
    playCard.setAttribute("id", card.suit + card.value + card.num);
    playCard.style.backgroundImage = `url(images/${card.suit}${card.value}.png)`;
    playCard.onclick = selectCard;
    grid.appendChild(playCard);
}

function passTurn() {
    document.getElementById("alert").innerHTML = '';
    playerPlaying = this.parentElement.id;
    let player = findPlayerIndexFromId();
    player.passTurn();
    selectedRules = [];
    niceDayCount = 0;
    //change?
    declaration = "- ";
    document.getElementById('played').innerHTML = '- ';
    document.getElementById('played').style.color = '#b0210b';
    //player.hilite(document.getElementById(player.name+'show'));
}

function playTurn() {
    if(selectedCard != ""){
        let player = findPlayerIndexFromId();
        let cardIndex = -1;
        for(let i = 0; i < player.hand.length; i++){
            if(player.hand[i].suit === selectedCard.charAt(0) && player.hand[i].value === selectedCard.charAt(1) && player.hand[i].num.toString() === selectedCard.substring(2)){
                cardIndex = i;
                break;
            }
        }
        player.playCard(cardIndex, selectedRules);
        selectedCard = "";
        selectedRules = [];
        niceDayCount = 0;
        declaration = "- ";
        //player.hilite(document.getElementById(player.name + 'show'));
    } else if (findPlayerIndexFromId() !== undefined){
        findPlayerIndexFromId().showAlert('must select card to play turn');
    }
}

function findPlayerIndexFromId(){
    let playerIndex = -1;
    for (let i = 0; i < ourGame.playerList.length; i++) {
        if (ourGame.playerList[i].name === playerPlaying) {
            playerIndex = i;
            break;
        }
    }
    let player = ourGame.playerList[playerIndex];
    return player;
}


function selectCard() {
    document.getElementById("alert").innerHTML = '';
    oldCard = selectedCard;
    playerPlaying = this.parentElement.parentElement.id;
    selectedCard = this.id;
    document.getElementById(this.id).classList.toggle('selectedCard');
    if (oldCard !== "" && oldCard !== null) {
        document.getElementById(oldCard).classList.toggle('selectedCard');
    }
}


function removeVisibility(object) {
    object.style.visibility = "hidden";
}