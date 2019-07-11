/*To-Do List
* check game getCurrentPlayer - should it return the player or the index?
* should makeCards be static?
* create statement function(s) for speaking parts? (part of interface)
* interface - determine declarations
* Spades rule
*/







let suits = ['H', 'S', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];

class Deck{
    constructor(){
        this._cards = this.makeCards();
    }

    makeCards(){
        let cards = [];
        for (let i = 0; i < 150; i++){
            let su = Math.floor(Math.random()*4);
            let val = Math.floor(Math.random()*13);
            cards.push({suit: suits[su], value: values[val]})
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
        let disc = document.getElementById("discard");
        this._cards.unshift(card);
        if(! (card.value === 'J' && this._game.playerList[this._game.getCurrentPlayer()]._rules.jRules === true)){
            this._expectedSuit = card.suit;
        }
        this._expectedValue = card.value;
    }
}







class Player {
    constructor(hand, name, game) {
        this._hand = hand;
        this._name = name;
        this._game = game;
        this._rules = new Rules(this);
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
    }

    handSize(){
        return this._hand.length;
    }

    passTurn() {
        this._rules.passTurnCheckRules();
        if (this._turn) {
            this._game.passes = this._game.numPasses + 1;
            this._game.passCount();
            this._game.updateTurn();
        }
    };

    playCard(cardIndex, selectedRules) {
        let card = this._hand[cardIndex];
        this._rules.playedCardCheckRules(card);
        if(this._turn) {
            if(this._rules.cardMatch(card)) {
                this._game.passes = 0;
                this.sendRuleDeclarations(card, selectedRules);
                this._game.discardCard(this._hand.splice(cardIndex,1)[0]);
                this._rules.resetRules();
                // let player = document.querySelector(`#${this.name}`);
                //let grid = player.querySelector(".playerhand");
                //let identifier = "#" + card.suit + card.value;
                //let element = grid.querySelector(identifier);
                //element.parentNode.removeChild(element);
            }
            this._rules.findWin();
            this._game.updateTurn();
        }
    }

    sendRuleDeclarations(card, selectedRules){
        selectedRules.forEach(rule => {
            if(rule === 'Mao'){
                this._rules.mao(this, rule);
            } else if (rule === 'Spades' && !this._rules.sRules && card.suit === 'S') {
                this._rules.gameRules[card.suit](this, rule);
            } else {
                this._rules.gameRules[card.value](this, rule);
            }
        });
        if(this.hand.length === 2 && !this._rules.maoRules){
            this._rules.mao(this, "");
        }
        if((card.value === '7' && !this._rules.sevRules) || (card.value === 'J' && !this._rules.jRules)
            || (card.value === 'Q' && !this._rules.qRules) || (card.value === 'K' && !this._rules.kRules)
            || (card.value !== '7' && card.value !== 'J' && card.value !== 'Q' && card.value !== 'K')){
            this._rules.gameRules[card.value](this, "");
        }
        if(!(card.suit === 'S' && this._rules.sRules)){
            this._rules.gameRules[card.suit](this, "");
        }
    }

    set turn(turn) {
        this._turn = turn;
    }

}







class Game {
    constructor(playerNames){
        this._playDeck = new Deck();
        let card = this._playDeck.deal();
        this._discardPile = new DiscardPile(card, this);
        this._passes = 0;

        this._playerList = [];
        for (let i = 0; i < playerNames.length; i++){
            this._playerList.push(new Player(this.dealHand(), playerNames[i], this));
        }
        this._playerList[0].turn = true;
        this._passes = 0;
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
        //let grid = document.getElementById(player.name).children[(document.getElementById(player.name).children.length)-1];
        //addCardsToPlayer(card, grid);
        player.receiveCard(card);
    }

    updateTurn(){
        let currentPlayer = this.getCurrentPlayer();
        let nextPlayer = currentPlayer + 1 >= this._playerList.length ? 0 : currentPlayer + 1;
        this.disableTurn(currentPlayer);
        this.enableTurn(nextPlayer);
        this.passCount();
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
        }
    }
}







class Rules{
    constructor(player){
        this._player = player;
        this.gameRules = {
            "A": this.acePlayed,
            "2": this.noRule,
            "3": this.noRule,
            "4": this.noRule,
            "5": this.noRule,
            "6": this.noRule,
            "7": this.sevenPlayed, //declarations TBA
            "8": this.eightPlayed,
            "9": this.noRule,
            "X": this.noRule,
            "J": this.jackPlayed,
            "Q": this.queenPlayed,
            "K": this.kingPlayed,
            "S": this.spadePlayed,
            "H": this.noRule,
            "D": this.noRule,
            "C": this.noRule
        };
        this._sevRules = false;
        this._jRules = false;
        this._qRules = false;
        this._kRules = false;
        this._sRules = false;
        this._maoRules = false;
    }

    // get gameRules(){
    //     return this._gameRules;
    // }

    get sevRules(){
        return this._sevRules;
    }

    set sevRules(val){
        this._sevRules = val;
    }

    get jRules(){
        return this._jRules;
    }

    set jRules(val){
        this._jRules = val;
    }

    get qRules(){
        return this._qRules;
    }

    set qRules(val){
        this._qRules = val;
    }

    get kRules(){
        return this._kRules;
    }

    set kRules(val){
        this._kRules = val;
    }

    get sRules(){
        return this._sRules;
    }

    set sRules(val){
        this._sRules = val;
    }

    get maoRules(){
        return this._maoRules;
    }

    set maoRules(val){
        this._maoRules = val;
    }

    resetRules(){
        this._sevRules = false;
        this._jRules = false;
        this._qRules = false;
        this._kRules = false;
        this._sRules = false;
        this._maoRules = false;
    }

    cardMatch(card){
        return ( (card.suit === this._player.game.discardPile.expectedSuit) || (card.value === this._player.game.discardPile.expectedValue))
    }

    passTurnCheckRules(){
        if(!this._player.turn) {
            this._player.game.drawCard(this._player);
            //document.getElementById("alert").innerHTML = '~ Failure to play in turn';                                        --ALERT
        }
    }

    playedCardCheckRules(card){
        if(!this._player.turn) {
            this._player.game.drawCard(this._player);
            //document.getElementById("alert").innerHTML = '~ Failure to play in turn';                                        --ALERT
        } else if (!this.cardMatch(card)) {
            this._player.game.drawCard(this._player);
            //document.getElementById("alert").innerHTML = '~ Failure to play within proper values';                             --ALERT
        }
    }

    noRule(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = '~ Failure to declare in turn'                                            --ALERT
        }
    }

    spadePlayed(player, state){
        if(state !== 'Spades'){
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = '~ Failure to declare Spades';                                                --ALERT
        }
        player._rules._sRules = true;
    }

    acePlayed(player){
        player.game.updateTurn();
    }

    sevenPlayed(player, state){
        if (state !== 'Have a Nice Day') {
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = '~ Failure to declare Have a Nice Day';                                 --ALERT
        }
        player._rules._sevRules = true;
    }

    eightPlayed(player){
        player.game.playerList.reverse();
        if(player.game.playerList.length === 2) {
            player.game.updateTurn();
        }
    }


    jackPlayed(player, suit){
        if ((suit === 'Hearts')||(suit === 'Spades')||(suit ==='Diamonds')||(suit === 'Clubs')){
            player.game.discardPile.expectedSuit = suit.charAt(0);
        } else {
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = ' ~ Failure to declare a suit';                                          --ALERT
        }
        player._rules._jRules = true;
    }

    kingPlayed(player, state){ //requires card?
        if (state !== 'All Hail the Chairman') {
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = '~ Failure to declare All Hail the Chairman';                             --ALERT
        }
        player._rules._kRules = true;
    }

    queenPlayed(player, state){
        if (state !== 'All Hail the Chairwoman') {
            player.game.drawCard(player);
            //document.getElementById("alert").innerHTML = '~ Failure to declare All Hail the Chairwoman';                                 --ALERT
        }
        player._rules._qRules = true;
    }

    mao(player, state){
        let cardsLeft = player.hand.length;
        if ((cardsLeft === 2)&&(state.toLowerCase() !== 'mao') || (cardsLeft !== 2)&&(state.toLowerCase() === 'mao')) {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare Mao';
        }
        player._rules._maoRules = true;
    }

    findWin(){
        if (this._player.hand.length === 0){
            //document.getElementById("alert").innerHTML = 'Congratulations, ' + this._player.name + " - you have won this round of Mao";                     --ALERT
            // for (let i = 0; i < this._player.game.playerList.length; i++){
            //     this._player.game.playerList[i].hand = [];
            // }
        }
    }
}





class StartScene extends Phaser.Scene {
    constructor() {
        super({key: 'StartScene'});
        gameState.eightPlayed = false;
    }

    preload() {
        let suit = ['C', 'D', 'H', 'S'];
        let value = ['2', '3', '4', '5', '6', '7', '8', '9', 'A', 'J', 'K', 'Q', 'X'];
        let key, path;
        for(let s = 0; s < suit.length; s++){
            for(let v = 0; v < value.length; v++){
                key = suit[s] + value[v];
                path = 'images/' + key + '.png';
                this.load.image(key, path);
            }
        }
    }

    update() {
        if(ourGame){
            this.add.text( 150, 250, 'Click to start!', {fill: '#000000', fontSize: '20px'});
            this.input.on('pointerdown', () => {
                this.scene.stop('StarScene');
                this.scene.start('GameScene');
            });
        }
    }
}


class GameScene extends Phaser.Scene {
    constructor() {
        super({key: 'GameScene'});
    }

    create() {
        let discardCard = ourGame.discardPile.topDiscard();
        let discardId = discardCard.suit + discardCard.value;
        gameState.topDiscard = this.add.image(game.config.width/4, 100, discardId);

        gameState.playTurn = this.add.text(800, 100, 'Play Turn');
        gameState.playTurn.setInteractive();
        gameState.playTurn.on('pointerup', () => {
            let cardIndex = -1;
            for(let i = 0; i < gameState.playerPlaying.hand.length; i++){
                if(gameState.playerPlaying.hand[i].suit === gameState.selectedCard.suit && gameState.playerPlaying.hand[i].value === gameState.selectedCard.value) {
                    cardIndex = i;
                    break;
                }
            }
            if(gameState.selectedCard.value === '8'){
                (gameState.eightPlayed === true) ? gameState.eightPlayed = false : gameState.eightPlayed = true;
            }
            gameState.playerPlaying.playCard(cardIndex, gameState.selectedRules);
            gameState.selectedRules =[];
            this.scene.restart();
        });

        let container;
        let playerSpacing = 200;

        let playerList = ourGame.playerList;
        if(gameState.eightPlayed){
            playerList = playerList.slice().reverse();
        } else {
            playerList = ourGame.playerList;
        }
        playerList.forEach(player => {
            gameState[player] = this.add.text(100, playerSpacing, player.name);

            gameState[player].passTurn = this.add.text(900, playerSpacing, 'Pass Turn');
            gameState[player].passTurn.setInteractive();
            gameState[player].passTurn.on('pointerup', () => {
                gameState.playerPlaying = player;
                gameState.playerPlaying.passTurn();
                gameState.selectedRules =[];
                this.scene.restart();
            });

            container = this.add.container(130, playerSpacing + 100);
            let cardSpacing = 20;

            player.hand.forEach(card => {
                let cardId = card.suit + card.value;
                let playCard = this.add.sprite(cardSpacing, 0, cardId);
                playCard.setInteractive();
                playCard.on('pointerup', () => {
                    gameState.selectedCard = card;
                    gameState.playerPlaying = player;
                    gameState.currentHand = container;
                });
                container.add(playCard);

                cardSpacing += 100;
            });
            playerSpacing += 200;
        });

        let ruleContainer = this.add.container(game.config.width/3 + 30, 53);
        gameState.selectedRules = [];
        let width = 10;
        let spades = this.add.text(width, 5, "Spades", {fill: '#ffffff', fontSize: '14px'});
            //spades.setInteractive();
        let hearts = this.add.text(width + 75, 5, "Hearts", {fill: '#ffffff', fontSize: '14px'});
        let clubs = this.add.text(width + 150, 5, "Clubs", {fill: '#ffffff', fontSize: '14px'});
        let diamonds = this.add.text(width + 215, 5, "Diamonds", {fill: '#ffffff', fontSize: '14px'});
        let haveNiceDay = this.add.text(width, 70, "Have a Nice Day", {fill: '#ffffff', fontSize: '14px'});
        let chairman = this.add.text(width + 150, 70, "All Hail the Chairman", {fill: '#ffffff', fontSize: '14px'});
        let chairwoman = this.add.text(width, 36.5, "All Hail the Chairwoman", {fill: '#ffffff', fontSize: '14px'});
        let mao = this.add.text(width + 215, 36.5, "Mao", {fill: '#ffffff', fontSize: '14px'});

        let specialRules = [spades, hearts, clubs, diamonds, haveNiceDay, chairwoman, chairman, mao];
        specialRules.forEach(rule => {
            rule.setInteractive();
            rule.on('pointerup', () => {
                gameState.selectedRules.push(rule.text);
            });
            ruleContainer.add(rule);
        });

    }

    update() {
        let discardCard = ourGame.discardPile.topDiscard();
        let discardId = discardCard.suit + discardCard.value;
        gameState.topDiscard = this.add.image(game.config.width/4, 100, discardId);
    }
}

let gameState = {};

let config = {
    backgroundColor: 0xADD8E6,
    parent: 'mao-game',
    scene: [StartScene, GameScene]
};
const game = new Phaser.Game(config);





let ourGame;
let players;
let gameBoard;

window.onload = function gameLoaded() {
    overlay();
    gameBoard = document.getElementById("gameBoard");
    //document.getElementById("playCard").addEventListener("click", playTurn);
};

function overlay() {
    let el = document.getElementById("overlay");
    el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    window.scrollTo(0, 0);
}

function numPlayersDecided(numPlayers) {
    players = numPlayers;
    if (players > 8){
        players = 8;
    }
    if (players < 2){
        players = 2;
    }
    let startGamePrompt = document.getElementById('startGame');
    for(let i = 0; i < numPlayers; i++){
        let namePrompt = document.createElement('label');
        namePrompt.id = 'namePlayers';
        namePrompt.setAttribute('for', 'namePlayers' + i);
        namePrompt.innerHTML = "Enter Player's Name: ";
        let nameHolder = document.createElement('input');
        nameHolder.name = 'namePlayersPrompt';
        nameHolder.id = 'namePlayers' + i;
        nameHolder.type = 'text';
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

function removeElement(element) {
    element.parentNode.removeChild(element);
}

function saveNames() {
    let num = players;
    players = [];
    for (let i = 0; i < num; i++) {
        players.push(document.getElementById('namePlayers' + i).value);
    }
    overlay();
    ourGame = new Game(players);
}



// function openHand() {
//     let element = this.parentElement.getElementsByClassName('playerhand');
//     if (element.length != 0 && typeof (element) != "undefined") { //giving me warnings i'm concerned about
//         //if(typeof(element) != 'undefined'){
//         //let player = document.querySelector(`#${this.parentNode.name}`);
//         let player = this.parentNode;
//         let pass = player.querySelector('.pass');
//         let playerhand = player.querySelector('.playerhand');
//         //can't read queryselector of player (null) when closing
//         pass.parentNode.removeChild(pass);
//         playerhand.parentNode.removeChild(playerhand);
//         //this.parentElement.removeChild(this.parentElement.getElementsByClassName('playerhand'));
//     } else {
//         playerPlaying = this.parentElement.id;
//         let player = findPlayerIndexFromId();
//         const passBtn = document.createElement("button");
//         passBtn.setAttribute('class', 'pass');
//         passBtn.innerHTML = 'Pass Turn';
//         passBtn.onclick = passTurn;
//         this.parentElement.appendChild(passBtn);
//         const playerhand = document.createElement('section');
//         playerhand.setAttribute('class', 'grid playerhand');
//         initializePlayerHand(player, playerhand);
//         this.parentElement.appendChild(playerhand);
//     }
// }






