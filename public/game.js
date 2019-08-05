

let suits = ['S', 'H', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];

class Deck{
    constructor(deck){
        this._cards = this.makeCards(deck);
    }

    makeCards(deck){
        let cards = [];
        if(deck !== undefined){
            cards = deck._cards;
        } else {
            for (let i = 0; i < 250; i++){
                let su = Math.floor(Math.random()*suits.length);
                let val = Math.floor(Math.random()*values.length);
                cards.push({suit: suits[su], value: values[val], num: i})
            }
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

    set sevensCount(sevens){
        this._sevensCount = sevens;
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
    constructor(hand, name, turn, game) {
        this._hand = hand;
        this._name = name;
        this._turn = turn;
        this._game = game;
        this._alerts = [];
    }

    get game() {
        return this._game;
    }

    get hand() {
        return this._hand;
    }

    set hand(hand) {
        this._hand = hand;
    }

    get name() {
        return this._name;
    }

    set name(name){
        this._name = name;
    }

    get turn() {
        return this._turn;
    }

    set turn(turn) {
        this._turn = turn;
    }

    get alerts(){
        return this._alerts;
    }

    set alerts(alerts){
        this._alerts = alerts;
    }

    receiveCard(card) {
        this._hand.push(card);
    }

    passTurn() {
        document.getElementById('played').innerHTML = '- ';
        document.getElementById('played').style.color = '#b0210b';
        this._game.rules.passTurnCheckRules(this);
        if (this._turn) {
            this._game.passes = this._game.numPasses + 1;
            this._game.updateTurn();
            this.alerts.push('passed turn');
        }
        if (document.getElementById(selectedCard) !== null) {
            document.getElementById(selectedCard).classList.toggle('selectedCard');
        }
        selectedCard = '';
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
                this._game.rules.findWin(this);
                this._game.updateTurn();
            }
        }
    }

    sendRuleDeclarations(card, selectedRules){
        let length = this.hand.length;
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
                    let message = 'declared ' + selected + ' out of turn';
                    this.alerts.push(message);
                }
            }
        });

        if(this._game.rules.rulesInPlay.includes('mao') && length === 2 && !this._game.rules.maoRules.played){
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
            this._game.rules.skipChoosePlayed(this, "", this.game);
        }

        this._game.rules.gameRules.forEach(rule => {
            let checkPlayedStatus = rule.function.toString();
            checkPlayedStatus = checkPlayedStatus.substring(0, checkPlayedStatus.indexOf("Played"));
            checkPlayedStatus = checkPlayedStatus + "Rules";
            if(rule.function !== this._game.rules.noRule){
                if( (rule.value === card.value) && (this._game.rules[checkPlayedStatus].played === false) ){
                    if(this._game.rules.rulesInPlay.includes('skipChoose') && this._game.playerList.length > 2 && card.suit === 'H' && card.value === 'A' && checkPlayedStatus === 'skipNextRules'){
                        this._game.rules.skipChoosePlayed(this, "", this.game);
                        this._game.updateTurn();
                    } else {
                        rule.function(this, "");
                    }
                }
            }
        });
    }

}

class Computer extends Player {
    constructor(hand, name, turn, game){
        super(hand, name, turn, game);
        this._knownRules = [];
        if(game.rules.random === false){
            this._knownRules = game.rules.rulesInPlay;
        }
        this._chosenRules = [];
        this._card = null;
        this.ruleAlertPairs = [{rule: 'spade', alert: 'Spades'}, {rule: 'mao', alert: 'Mao'},
            {rule: 'niceDay', alert: 'Have a Nice Day'}, {rule: 'chairwoman', alert: 'All Hail the Chairwoman'},
            {rule: 'chairman', alert: 'All Hail the Chairman'}, {rule: 'pair', alert: 'Pair'}, {rule: 'run', alert: 'Run'},
            {rule: 'wild', alert: 'A Suit'}, {rule: 'S', alert: 'Spades'}, {rule: 'H', alert: 'Hearts'},
            {rule: 'D', alert: 'Diamonds'}, {rule: 'C', alert: 'Clubs'}];
        this._cardIndex = -1;
    }

    set turn(turn){
        this._turn = turn;
    }

    get turn(){
        return this._turn;
    }

    set alerts(alerts){
        this._alerts = alerts;
    }

    get alerts(){
        return this._alerts;
    }

    checkPlay(){
        if(this._turn ){    //|| this.shouldPlay()
            this._card = this.selectCard();
            this.playTurn();
        }
    }

    checkAlerts(){
        if(this._knownRules.length < this._game.rules.rulesInPlay.length){
            if(!this._knownRules.includes('mao')){
                this._knownRules.push('mao');
            }
            alerts.forEach(alert => {
                if(alert.includes('failure to declare')){
                    let check = alert.substring(alert.indexOf('failure to declare') + 18);
                    this.ruleAlertPairs.forEach(pair => {
                       if(pair.alert.toLowerCase() === check.toLowerCase()){
                           if(!this._knownRules.includes(pair.rule)){
                               this._knownRules.push(pair.rule);
                           }
                       }
                    });
                }
            });
        }
    }

    shouldPlay(){

    }

    /*
        -- ShouldPlay: what about reverse and skips?
            -- check last card played for rule, check known rules,
                if known don't play, if not known play
     */

    selectCard(){
        let chosen = null;
        let i = 0;
        this._cardIndex = -1;
        this._hand.forEach(card => {
            if(this._game.rules.cardMatch(card, this)){
                chosen = card;
                this._cardIndex = i;
            }
            i++;
        });
        return chosen;
    }

    selectWild(){
        let suitCount = [{suit: 'S', count: 0}, {suit: 'H', count: 0},
            {suit: 'D', count: 0}, {suit: 'C', count: 0}];
        this._hand.forEach(card => {
           if(card.suit === 'S'){
               suitCount[0].count = suitCount[0].count + 1;
           } else if(card.suit === 'H'){
               suitCount[1].count = suitCount[1].count + 1;
           } else if(card.suit === 'D'){
               suitCount[2].count = suitCount[2].count + 1;
           } else {
               suitCount[3].count = suitCount[3].count + 1;
           }
        });
        let max = suitCount[0].count;
        let suit = suitCount[0].suit;
        for(let i = 1; i < suitCount.length; i++){
            if(suitCount[i].count > max){
                max = suitCount[i].count;
                suit = suitCount[i].suit;
            }
        }
        return suit;
    }

    getStatement(rule){
        let chosen = null;
        this.ruleAlertPairs.forEach(pair => {
           if(pair.rule === rule){
               chosen = pair.alert;
           }
        });
        return chosen;
    }

    selectRules(){
        this._knownRules.forEach(rule => {
            let name = rule + 'Rules';
            if(this._game.rules[name].card === this._card.value){
                if(name === 'wild'){
                    rule = this.selectWild();
                }
                let statement = this.getStatement(rule);
                if(statement !== null){
                    this._chosenRules.push(statement);
                }
            }
        });
    }

    playTurn(){
        if(this._card === null){
            super.passTurn();
        } else {
            this.selectRules();
            super.playCard(this._cardIndex, this._chosenRules);
        }
        this._alerts.forEach(alert => {
            this._game.showAlert(alert, this._name);
        });
        this.checkAlerts();
        this._chosenRules = [];
    }
}







export default class Game {
    constructor(players, rules, hands, deck, topDiscard, againstComp){
        this._playDeck = new Deck(deck);
        this._againstComp = againstComp;
        let card = (topDiscard !== undefined) ? topDiscard : this._playDeck.deal();
        this._discardPile = new DiscardPile(card, this);
        this._rules = new Rules(rules);
        this._playerList = [];
        for (let i = 0; i < players.length; i++){
            let hand = (hands !== undefined) ? hands[i] : this.dealHand();
            if(i === 1 && againstComp === true){
                this._playerList.push(new Computer(hand, players[i],false, this));
            } else {
                this._playerList.push(new Player(hand, players[i],false, this));
            }
        }
        if(players.length === 1){
            this._playerList.push(new Computer(this.dealHand(), 'Computer', false, this));
        }
        this._playerList[0].turn = true;
        this._passes = 0;
    }

     updateGame(hands, deck, player, players, penalties, turnOrder, numPasses, topDiscard, suit, sevens){
        let compIndex = -1;
        for(let i = 0; i < players.length; i++){
            this._playerList[i].name = players[i];
            this._playerList[i].turn = turnOrder[players[i]];
            this._playerList[i].hand = hands[players[i]];
            this._playerList[i].alerts = [];
            if(this._playerList[i].name === 'Computer'){
                compIndex = i;
            }
        }
        this._playDeck = new Deck(deck);
        this._discardPile.addToDiscard(topDiscard);
        this._discardPile.expectedSuit = suit;
        this._discardPile.sevensCount = sevens;
        this._passes = numPasses;
        this.passCount();
        if(penalties !== undefined){
            penalties.forEach(penalty => {
                this.showAlert(penalty, player);
            });
        }
        if(this._againstComp === true){
            this._playerList[compIndex].checkPlay();
        }
    }

    get game(){
        return this;
    }

    get playDeck(){
        return this._playDeck;
    }

    get hands(){
        let hands = {};
        this.playerList.forEach(player => {
            hands[player.name] = player.hand;
        });
        return hands;
    }

    get playerNames(){
        let names = [];
        this.playerList.forEach(player => {
            names.push(player.name);
        });
        return names;
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

    get turnOrder(){
        let turns = {};
        this._playerList.forEach(player => {
            turns[player.name] = player.turn;
        });
        return turns;
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
        player.receiveCard(card);
    }

    updateTurn(){
        let currentPlayer = this.getCurrentPlayer();
        let nextPlayer = currentPlayer + 1 >= this._playerList.length ? 0 : currentPlayer + 1;
        if (this.rules.skippedPlayer.includes(this.getPlayer(nextPlayer).name)){
            let i = this.rules.skippedPlayer.indexOf(this.getPlayer(nextPlayer).name);
            this.disableTurn(nextPlayer);
            if (nextPlayer === this._playerList.length-1){
                nextPlayer = 0;
                console.log(nextPlayer);
            } else {
                nextPlayer++;
                console.log(nextPlayer);
            }
            console.log('new next player: ' + nextPlayer);
            this.rules.skippedPlayer.splice(i, 1);
            console.log(this.rules.skippedPlayer);
        }
        this.disableTurn(currentPlayer);
        this.enableTurn(nextPlayer);
        this.passCount();
    }

    showAlert(message, name){
        if (document.getElementById("alert").innerHTML === ''){
            document.getElementById("alert").insertAdjacentHTML('beforeend', `- ${name.toUpperCase()} -<br>`);
        }
        document.getElementById("alert").insertAdjacentHTML('beforeend', `- ${message.toUpperCase()} -<br>`);
        document.getElementById('alert').classList.toggle('hide');
        setTimeout(function(){
            document.getElementById("alert").innerHTML = '';
            document.getElementById('alert').classList.toggle('hide');
        }, 1600);
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
            runCount = 0;
        }
    }
}







export class Rules{
    constructor(numRules){
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
            {function: this.maoPlayed, name: 'mao'},
            {function: this.niceDayPlayed, name: 'niceDay'},
            {function: this.wildPlayed, name: 'wild'},
            {function: this.chairwomanPlayed, name: 'chairwoman'},
            {function: this.chairmanPlayed, name: 'chairman'},
            {function: this.spadePlayed, name: 'spade'},
            {function: this.pairPlayed, name: 'pair'},
            {function: this.runPlayed, name: 'run'},
            {function: this.reversePlayed, name: 'reverse'},
            {function: this.playAgainPlayed, name: 'playAgain'},
            {function: this.skipChoosePlayed, name: 'skipChoose'},
            {function: this.skipNextPlayed, name: 'skipNext'}
        ];
        this._rulesInPlay = [];
        this._skippedPlayer = [];
        this._random = false;

        this._maoRules = {played: false};
        this._niceDayRules = {played: false};
        this._wildRules = {played: false};
        this._chairwomanRules = {played: false};
        this._chairmanRules = {played: false};
        this._spadeRules = {played: false};
        this._pairRules = {played: false};
        this._runRules = {played: false};
        this._reverseRules = {played: false};
        this._playAgainRules = {played: false};
        this._skipChooseRules = {played: false};
        this._skipNextRules = {played: false};

        if(numRules === false){
            this.normalRules();
        } else if(typeof numRules === 'number') {
            this.pickRules(numRules);
        } else{
            this.givenRules(numRules);
        }
    }

    get random(){
        return this._random;
    }

    set random(val){
        this._random = val;
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
        this.random = true;
        this.gameRules[2].function = this.allRules[0].function;
        let name = this.allRules[0].name + 'Rules';
        this.storeCardRule('', this.allRules[0], name);
        this.allRules.splice(0, 1);
        for(let i = 0; i < num; i++){
            let ruleNum = Math.floor(1 + Math.random() * (this.allRules.length-1));
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
            else if(this.gameRules[cardNum].function === this.noRule){
                this.gameRules[cardNum].function = this.allRules[ruleNum].function;
                let name = this.allRules[ruleNum].name + 'Rules';
                this.storeCardRule(this.gameRules[cardNum], this.allRules[ruleNum], name);
                this.allRules.splice(ruleNum, 1);
            } else {
                i--;
            }
        }
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

    givenRules(rules){
        this.allRules.forEach(rule => {
            let name = "_" + rule.name + 'Rules';
            if(rules._rulesInPlay.includes(rule.name)){
                this.addCardRule(rules[name].card, rule.name, rule.function, rules.random);
            }
        })
    }

    addCardRule(card, ruleName, action, random){
        this.rulesInPlay.push(ruleName);
        if(ruleName === 'skipNext' && random === true){
            this.rulesInPlay.push('skipChoose');
        }
        this[ruleName + 'Rules'].function = action;
        this[ruleName + 'Rules'].card = card;
        this.gameRules.forEach(gameRule => {
            if(gameRule.value === card){
                gameRule.function = action;
            }
        });
    }

    storeCardRule(card, rule, name){
        this.rulesInPlay.push(rule.name);
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
        this._pairRules.played = false;
        this._runRules.played = false;
        this._maoRules.played = false;
        this._reverseRules.played = false;
        this._playAgainRules.played = false;
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
            player.alerts.push('failure to play in turn');
        }
    }

    playedCardCheckRules(card, player){
        if(!player.turn) {
            player.game.drawCard(player);
            if(document.getElementById(selectedCard)){
                document.getElementById(selectedCard).classList.toggle('selectedCard');
            }
            selectedCard = '';
            player.alerts.push('failure to play in turn');
        } else if (!this.cardMatch(card, player)) {
            player.game.drawCard(player);
            document.getElementById(selectedCard).classList.toggle('selectedCard');
            selectedCard = '';
            player.alerts.push('failure to play within proper values');
            player.game.updateTurn();
        }
    }

    noRule(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
        }
    }

    spadePlayed(player, state){
        if(state !== 'Spades'){
            player.game.drawCard(player);
            player.alerts.push('failure to declare spades');
        } else {
            player.game.rules.spadeRules.played = true;
        }
    }

    skipChoosePlayed(player, state, thisGame){
        if (selectedCard.indexOf('H') > -1 && selectedCard.indexOf('A') > -1) {
            if (state !== "") {
                let message = 'declared ' + state + ' out of turn';
                player.alerts.push(message);
                player.game.drawCard(player);
            }
            let prompt = document.createElement('p');
            prompt.classList.add('alert');
            prompt.innerHTML = 'Select the Player you Wish to Skip';
            game.appendChild(prompt);
            const grid = document.createElement('playerNameGrid');
            grid.setAttribute('class', 'grid');
            prompt.appendChild(grid);
            thisGame.playerList.forEach(player => {
                if (thisGame._playerList.indexOf(player) !== thisGame.getCurrentPlayer()) {
                    const gamePlayer = document.createElement('button');
                    gamePlayer.classList.add('ruleButton');
                    gamePlayer.innerHTML = player.name;
                    gamePlayer.onclick = (() => {
                        if (thisGame._playerList.indexOf(player) !== thisGame.getCurrentPlayer()) {
                            player.game.rules.skippedPlayer.push(player.name);
                        } else {
                            thisGame.getPlayer(thisGame._playerList.indexOf(player))._turn = false;
                            let nowplay = thisGame._playerList.indexOf(player) + 1;
                            if (nowplay >= thisGame._playerList.length) {
                                nowplay = 0;
                            }
                            thisGame.getPlayer(nowplay)._turn = true;
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
        if(state !== ""){
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
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
            player.alerts.push('failure to declare have a nice day');
        } else if(state !== 'Have a Nice Day'){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
        }  else{
            if(niceDayCount - 1 !== player.game.discardPile.sevensCount){
                player.game.drawCard(player);
                let penalty = "failure to declare HAVE A " + "VERY ".repeat(player.game.discardPile.sevensCount) + "NICE DAY";
                player.alerts.push(penalty);
            }
            player.game.rules.niceDayRules.played = true;
        }
    }

    reversePlayed(player, state){
        if(state != ""){
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
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
            player.alerts.push('* wild ' + suit + ' *');
        } else {
            player.game.drawCard(player);
            player.alerts.push('failure to declare a suit');
        }
    }

    chairmanPlayed(player, state){
        if (state !== 'All Hail the Chairman') {
            player.game.drawCard(player);
            player.alerts.push('failure to declare all hail the chairman');
        } else {
            player.game.rules.chairmanRules.played = true;
        }
    }

    chairwomanPlayed(player, state){
        if (state !== 'All Hail the Chairwoman') {
            player.game.drawCard(player);
            player.alerts.push('failure to declare all hail the chairwoman');
        } else {
            player.game.rules.chairwomanRules.played = true;
        }
    }

    playAgainPlayed(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
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
            player.alerts.push('failure to declare run');
        } else if (runCount < 1 && state === 'Run'){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
        } else {
            player.game.rules.runRules.played = true;
        }
    }

    pairPlayed(player, state, card){
        if(state === 'Pair'){
            player.game.rules.pairRules.played = true;
        } else {
            player.game.drawCard(player);
            player.alerts.push('failure to declare pair');
        }
    }


    maoPlayed(player, state){
        let cardsLeft = player.hand.length;
        if ((cardsLeft === 2)&&(state.toLowerCase() !== 'mao')) {
            player.game.drawCard(player);
            player.alerts.push('failure to declare mao');
        } else if ((cardsLeft !== 2)&&(state.toLowerCase() === 'mao')){
            player.game.drawCard(player);
            let message = 'declared ' + state + ' out of turn';
            player.alerts.push(message);
        } else {
            player.game.rules.maoRules.played = true;
        }
    }

    findWin(player){
        if (player.hand.length === 0){
            this.winMessage(name);
        }
    }

    winMessage(name){
        document.getElementById('gameBoard').innerHTML = "";
        document.getElementById('alert').style.marginLeft = '0';
        document.getElementById('alert').style.fontSize = '100px';
        document.getElementById('alert').style.top = '10%';
        document.getElementById("alert").innerHTML = '- CONGRATULATIONS, ' + name.toUpperCase() + ' -<br> YOU HAVE WON THIS ROUND OF MAO';
        document.getElementById('redoButton').style.display = 'block';
    }

    loseMessage(name, winner){
        document.getElementById('gameBoard').innerHTML = "";
        document.getElementById('alert').style.marginLeft = '0';
        document.getElementById('alert').style.fontSize = '100px';
        document.getElementById('alert').style.top = '10%';
        document.getElementById("alert").innerHTML = '- SORRY, ' + name.toUpperCase() + " -<br> YOU HAVE LOST THIS ROUND OF MAO. " + winner.toUpperCase() + " HAS WON.";
        document.getElementById('redoButton').style.display = 'block';
    }
}




export let ourGame;
let game;
let ruleNumber = false;
let players;
export let selectedCard = "";
let oldCard = "";
export let playerPlaying;
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

export function randomGame(){
    specialRules = ["Spades", "Hearts", "Clubs", "Diamonds", "Have a Nice Day", "All Hail the Chairwoman", "All Hail the Chairman", "Mao", "Pair", "Run"];
    let startGame = document.getElementById('startGame');
    startGame.style.visibility = 'visible';
}

export function standardGame(){
    let startGame = document.getElementById('startGame');
    startGame.style.visibility = 'visible';
}

export function modeDecided() {
    let startGamePrompt = document.getElementById('startGame');
    let namePrompt = document.createElement('label');
    namePrompt.id = 'namePlayers';
    namePrompt.setAttribute('for', 'namePlayersPrompt');
    namePrompt.innerHTML = `Enter Your Name: `;
    let nameHolder = document.createElement('input');
    nameHolder.name = 'namePlayersPrompt';
    nameHolder.id = 'namePlayersPrompt';
    nameHolder.type = 'text';
    nameHolder.maxLength = 10;
    let newLine = document.createElement('br');

    startGamePrompt.appendChild(namePrompt);
    startGamePrompt.appendChild(newLine);
    startGamePrompt.appendChild(newLine);
    startGamePrompt.appendChild(nameHolder);
    startGamePrompt.appendChild(newLine);
    startGamePrompt.appendChild(newLine);
    let nameDone = document.createElement('button');
    nameDone.class = 'close';
    nameDone.id = 'choseName';
    nameDone.innerHTML = 'OK';

    let activePlayers = document.createElement("table");
    activePlayers.id = 'activePlayers';
    activePlayers.style.borderColor = '#b0210b';
    startGamePrompt.appendChild(activePlayers);

    startGamePrompt.appendChild(nameDone);
    let startButton = document.createElement('button');
    startButton.style.visibility = 'hidden';
    startButton.class ='close';
    startButton.id = 'startButton';
    startGamePrompt.appendChild(startButton);

    let startWarn = document.createElement('p');
    startWarn.setAttribute('id', 'startWarn');
    startWarn.style.position = 'relative';
    startWarn.innerHTML = 'PRESS [START GAME] ONCE ALL PLAYERS HAVE SIGNED ON';
    startWarn.style.visibility = 'hidden';
    startGamePrompt.appendChild(startWarn);
}

export function checkName(entry) {
    let name = entry.trim();
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
        } else if (name === '' || name === null) {
            name = 'x';
        }
        name = name.charAt(0).toUpperCase() + name.substring(1, name.length);
        return name;
}

export function diffNames(names){
    let newPlayers = [];
    if(names.length === 1) {
        newPlayers.push(names[0].name);
    }
    for (let i = 0; i < (names.length - 1); i++){
        let diff = 2;
        for (let j = (i + 1); j < names.length; j++){
            if (names[i].name.toLowerCase() === names[j].name.toLowerCase()){
                names[j].name += ('-'+diff.toString());
                diff++;
            }
        }
        newPlayers.push(names[i].name);
        if (i+2 === names.length){
            newPlayers.push(names[i+1].name);
        }
    }
    ourGame = new Game(newPlayers, ruleNumber);
    if(newPlayers.length === 1){
        return [names[0].name, 'Computer'];
    } else {
        return newPlayers;
    }
}

export function rulesDecided(numRules){
    ruleNumber = parseInt(numRules);
}

export function removeElement(element) {
    element.parentNode.removeChild(element);
}

export function hilite(boop){
    if(boop){
        boop.classList.toggle('highlight');
        setTimeout(function(){
            boop.classList.toggle('highlight');
        }, 1200)
    }
}

export function createTopBar(topDiscard){
    removeElement(window.document.getElementById('startGame'));
    const topGrid = document.createElement('section');
    topGrid.setAttribute('id', 'topGrid');
    topGrid.setAttribute('class', 'grid');
    createDiscardFunctionality(topGrid, topDiscard);
    const playCard = document.createElement('button');
    playCard.setAttribute('id', 'playCard');
    playCard.innerHTML = 'Play<br>Turn';
    topGrid.appendChild(playCard);
    game.appendChild(topGrid);
    const speak = document.createElement('speak');
    speak.setAttribute('id', 'played');
    speak.innerHTML = '- ';
    speak.style.color = '#b0210b';
    game.appendChild(speak);
}

function createDiscardFunctionality(grid, topDiscard){
    const discard = document.createElement('section');
    discard.setAttribute('id', 'discard');
    discard.setAttribute('class', 'grid');
    discard.classList.add('discard');
    grid.appendChild(discard);
    const disPile = addCardsToPlayer(topDiscard, discard);
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

export function initializePlayerHand(hand, grid){
    let sortedHand = hand.sort((a,b) => {
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

export function addCardsToPlayer(card, grid){
    const playCard = document.createElement('div');
    playCard.classList.add('card');
    playCard.setAttribute("id", card.suit + card.value + card.num);
    playCard.style.backgroundImage = `url(images/${card.suit}${card.value}.png)`;
    playCard.onclick = selectCard;
    grid.appendChild(playCard);
}

export function passTurn(name, game) {
    document.getElementById("alert").innerHTML = '';
    game.playerList.forEach(player => {
       if(player.name === name){
           playerPlaying = player;
       }
    });
    playerPlaying.passTurn();
    selectedRules = [];
    niceDayCount = 0;
    declaration = "- ";
}

export function playTurn(game) {
    if(selectedCard != ""){
        let player = findPlayerIndexFromId(playerPlaying, game);
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
    } else if (findPlayerIndexFromId(playerPlaying, game) !== undefined){
        findPlayerIndexFromId(playerPlaying, game).alerts.push('must select card to play turn');
    }
}

export function findPlayerIndexFromId(id, game){
    let playerIndex = -1;
    for (let i = 0; i < game.playerList.length; i++) {
        if (game.playerList[i].name ===  id) {
            playerIndex = i;
            break;
        }
    }
    let player = game.playerList[playerIndex];
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

/*
if playerList length is one, playerList add new computer
computer class:
    same as player class mainly
    add in play card function
        picks card from hand that matches top suit or top value
        if standard game, knows the rules
            goes through rules and selects ones for card (rule list, hand size)
        if chaos game, doesn't know the rules
            as it gets penalties, adds rules to knowledge/rule list
 */