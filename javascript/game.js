/*To-Do List
* check game getCurrentPlayer - should it return the player or the index?
* should makeCards be static?
* create statement function(s) for speaking parts? (part of interface)
* interface - determine declarations
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
        disc.removeChild(disc.children[0]);
        addCardsToPlayer(card, disc);
    }
}







class Player {
    constructor(hand, name, game) {
        this._hand = hand;
        this._name = name;
        this._game = game;
        this._rules = new Rules(this);
        this._turn = false;
        //this._passes = 0;
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
                let player = document.querySelector(`#${this.name}`);
                let grid = player.querySelector(".playerhand");
                let identifier = "#" + card.suit + card.value;
                let element = grid.querySelector(identifier);
                element.parentNode.removeChild(element);
            }
            this._rules.findWin();
            this._game.updateTurn();
        }
    }

    sendRuleDeclarations(card, selectedRules){
        selectedRules.forEach(rule => {
            if(rule === 'Mao'){
                this._rules.mao(this, rule);
            } else if (rule === 'Spades' && !this._rules.sRules && card.suit === 'S'){
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

    // sendRuleDeclarations(card, selectedRules){
    //     selectedRules.forEach(rule => {
    //         if(rule === 'Mao'){
    //             this._rules.mao(this, rule);
    //         } else if (rule === 'Spades' && !this._rules.sRules){
    //             this._rules.gameRules[card.suit](this, rule);
    //         } else {
    //             this._rules.gameRules[card.value](this, rule);
    //         }
    //     });
    //     if((card.value === '7' && !this._rules.sevRules) || (card.value === 'J' && !this._rules.jRules)
    //         || (card.value === 'Q' && !this._rules.qRules) || (card.value === 'K' && !this._rules.kRules)
    //         || (card.value !== '7' && card.value !== 'J' && card.value !== 'Q' && card.value !== 'K')){
    //         this._rules.gameRules[card.value](this, "");
    //     }
    //     if(!(card.suit === 'S' && this._rules.sRules)){
    //         this._rules.gameRules[card.suit](this, "");
    //     }
    //     if(this.hand.length === 2 && !this._rules.maoRules){
    //         this._rules.mao(this, "");
    //     }
    // }

    set turn(turn) {
        this._turn = turn;
    }

}







class Game {
    constructor(numPlayers){
        this._playDeck = new Deck();
        let card = this._playDeck.deal();
        this._discardPile = new DiscardPile(card, this);
        //this._passes = 0;

        this._playerList = [];
        for (let i = 0; i < numPlayers; i++){
            this._playerList.push(new Player(this.dealHand(), ('player' + i), this));
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
        let grid = document.getElementById(player.name).children[(document.getElementById(player.name).children.length)-1];
        addCardsToPlayer(card, grid);
        player.receiveCard(card);
        //grid.parentElement.getElementsByClassName('hand').getElementsByClassName('numCards').innerHTML = player.hand.length;
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
// <<<<<<<<< Temporary merge branch 1
//         this._gameRules = {
//             "A": this.acePlayed(player),
//             "7": this.sevenPlayed(player, "HAND"), //declarations TBA
//             "8": this.eightPlayed(player),
//             "J": this.jackPlayed(player, 'D'),
//             "Q": this.queenPlayed(player, "AHCW"),
//             "K": this.kingPlayed(player, "AHCM"),
//             "S": this.spadePlayed(player, "S")
// =========
        this.gameRules = {
            "S": this.spadePlayed,
            "H": this.noRule,
            "D": this.noRule,
            "C": this.noRule,
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
            "K": this.kingPlayed
            // "S": this.spadePlayed,
            // "H": this.noRule,
            // "D": this.noRule,
            // "C": this.noRule
// >>>>>>>>> Temporary merge branch 2
        };
        this._sevRules = false;
        this._jRules = false;
        this._qRules = false;
        this._kRules = false;
        this._sRules = false;
        this._maoRules = false;
        //this._nicecount = 0;
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

    // get niceCount(){
    //     return this._nicecount;
    // }
    //
    // set niceCount(val){
    //     this._nicecount = val;
    // }

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
            document.getElementById("alert").innerHTML = '~ Failure to play in turn';
        }
    }

    // playedCardCheckRules(card){
    //     if(!this._player.turn) {
    //         this._player.game.drawCard(this._player);
    //     } else if (!this.cardMatch(card)) {
    //         this._player.game.drawCard(this._player);
    //     }
    // }

    // noRule(player, state){
    //     if(state !== ""){
    // cardMatch(card){
    //     return ( (card.suit === this._player.game.discardPile.expectedSuit) || (card.value === this._player.game.discardPile.expectedValue))
    // }

    playedCardCheckRules(card){
        if(!this._player.turn) {
            this._player.game.drawCard(this._player);
            document.getElementById("alert").innerHTML = '~ Failure to play in turn';
        } else if (!this.cardMatch(card)) {
            this._player.game.drawCard(this._player);
            document.getElementById("alert").innerHTML = '~ Failure to play within proper values';
        }
    }

    noRule(player, state){
        if(state !== ""){
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare in turn'
        }
    }

    spadePlayed(player, state){
// <<<<<<<<< Temporary merge branch 1
//         if(state !== 'S'){
//             player.game.drawCard();
//             console.log('Failure to declare spades.')
//         } else {
//             console.log(state);
// =========
        if(state !== 'Spades'){
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare Spades';
        }
        player._rules._sRules = true;
    }

    acePlayed(player){
        player.game.updateTurn();
    }

    sevenPlayed(player, state){
        if (state !== 'Have a Nice Day') {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare Have a Nice Day';
        }
        player._rules._sevRules = true;
    }

    eightPlayed(player){
        player.game.playerList.reverse();
        if (player.game.playerList.length === 2){
            player.game.updateTurn();
        }
    }


    jackPlayed(player, suit){
        if ((suit === 'Hearts')||(suit === 'Spades')||(suit ==='Diamonds')||(suit === 'Clubs')){
            player.game.discardPile.expectedSuit = suit.charAt(0);
        } else {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = ' ~ Failure to declare a suit';
        }
        player._rules._jRules = true;
    }

    kingPlayed(player, state){ //requires card?
        if (state !== 'All Hail the Chairman') {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare All Hail the Chairman';
        }
        player._rules._kRules = true;
    }

    queenPlayed(player, state){
        if (state !== 'All Hail the Chairwoman') {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare All Hail the Chairwoman';
        }
        player._rules._qRules = true;
    }

    mao(player, state){
        let cardsLeft = player.hand.length;
        if ((cardsLeft === 2)&&(state.toLowerCase() !== 'mao')||(cardsLeft !== 2)&&(state.toLowerCase() === 'mao')) {
            player.game.drawCard(player);
            document.getElementById("alert").innerHTML = '~ Failure to declare Mao';
        }
        player._rules._maoRules = true;
    }

    findWin(){
        if (this._player.hand.length === 0){
            document.getElementById("alert").innerHTML = 'Congratulations, ' + this._player.name + " - you have won this round of Mao";
            // for (let i = 0; i < this._player.game.playerList.length; i++){
            //     this._player.game.playerList[i].hand = [];
            // }
        }
    }
}




let ourGame;
let game;
let selectedCard;
let playerPlaying;
let specialRules = ["Spades", "Hearts", "Clubs", "Diamonds", "Have a Nice Day", "All Hail the Chairwoman", "All Hail the Chairman", "Mao"];
let selectedRules = [];

window.onload = function gameLoaded() {
    game = document.getElementById("game");
    document.getElementById("playCard").addEventListener("click", playTurn);
};


function displayPlayerHand(playerIndex) {
    document.getElementById("displayHand").innerHTML = ourGame.getPlayer(playerIndex).hand;
}

function startGame(numPlayers) {
    let playCount = numPlayers;
    if (numPlayers > 8){
        playCount = 8;
    }
    if (numPlayers < 2){
        playCount = 2;
    }
    ourGame = new Game(playCount);
    createDiscardFunctionality();
    ourGame.playerList.forEach(player => {
        const gamePlayer = document.createElement('div');
        gamePlayer.classList.add('player');
        gamePlayer.setAttribute("class", "player");
        gamePlayer.setAttribute("id", player.name);
        gamePlayer.dataset.name = player.name;
        //gamePlayer.innerHTML = player.name;
        game.appendChild(gamePlayer);


        // const grid = document.createElement('section');
        // grid.setAttribute('class', 'grid');
        // grid.setAttribute('class', `${player.name}hand`);
        // grid.style.display = 'none';
        // initializePlayerHand(player, grid);
        //
        // gamePlayer.appendChild(grid);

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
        numCards.innerHTML = player.hand.length.toString();
        hand.appendChild(numCards);

        // const passBtn = document.createElement("button");
        // passBtn.setAttribute('class', 'pass');
        // passBtn.innerHTML = 'Pass Turn';
        // passBtn.onclick = passTurn;
        // gamePlayer.appendChild(passBtn);


        // const grid = document.createElement('section');
        // grid.setAttribute('class', 'grid');
        // grid.setAttribute('class', `${player.name}hand`);
        //initializePlayerHand(player, grid);

        //gamePlayer.appendChild(grid);
    });
}

function createDiscardFunctionality(){
    const discard = document.createElement('section');
    discard.setAttribute('id', 'discard');
    discard.setAttribute('class', 'grid');
    game.appendChild(discard);
    const disPile = addCardsToPlayer(ourGame.discardPile.topDiscard(), discard);
    const ruleButtonGrid = document.createElement('section');
    ruleButtonGrid.setAttribute('id', 'ruleButtonGrid');
    ruleButtonGrid.setAttribute('class', 'grid');
    game.appendChild(ruleButtonGrid);
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
    // if (specialRule === 'Have a Nice Day'){
    //     let newCount = ourGame._rules.niceCount + 1;
    //     ruleBtn.onclick = (ourGame._rules.niceCount(newCount));
    // }
    //ruleBtn.onclick = document.getElementById("played").innerHTML = '-"' + specialRule + '"-';
    grid.appendChild(ruleBtn);
}

function selectedRule(){
    selectedRules.unshift(this.innerHTML);
}

function initializePlayerHand(player, grid){
    //const gameGrid = grid;
    player.hand.forEach(card => {
        addCardsToPlayer(card, grid);
        grid.classList.add('cardhand')
    });
}

function openHand() {
    let element = this.parentElement.getElementsByClassName('playerhand');
    if (element.length != 0 && typeof(element) != "undefined"){ //giving me warnings i'm concerned about
    //if(typeof(element) != 'undefined'){
        //let player = document.querySelector(`#${this.parentNode.name}`);
        let player = this.parentNode;
        let pass = player.querySelector('.pass');
        let playerhand = player.querySelector('.playerhand');
        //can't read queryselector of player (null) when closing
        pass.parentNode.removeChild(pass);
        playerhand.parentNode.removeChild(playerhand);
        //this.parentElement.removeChild(this.parentElement.getElementsByClassName('playerhand'));
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


    // if(typeof(element) === 'undefined'){
    //     //functional-ish
    //     playerPlaying = this.parentElement.id;
    //     let player = findPlayerIndexFromId();
    //     const grid = document.createElement('section');
    //     grid.setAttribute('class', 'playerhand');
    //     initializePlayerHand(player, grid);
    //     this.parentElement.appendChild(grid);
    // } else {
    //     this.parentElement.removeChild(this.parentElement.children[this.parentElement.children.length - 1]);
    // }




    //this.parentElement.getElementsByClassName('hand').onclick = ;

    //now make it go away
    //onclick, set to none
    //update penalties



    // for (let i = 0; i < x.length; i++) {
    //     x[i].style.visibility = "hidden";
    // }
    // this.style.visibility = 'visible';
    //document.getElementById(hand).style.visibility = "visible";


    //playerPlaying = this.parentElement.id;
    //let player = findPlayerIndexFromId();
    //player.passTurn();
    //selectedRules = [];
}


// playerPlaying = this.parentElement.id;
// let player = findPlayerIndexFromId();
// player.passTurn();


// function unappear(){
//     let thing = this.parentElement.getElementsByClassName('grid');
//     if (thing.style.display === "none") {
//         thing.style.display = "block";
//     } else {
//         thing.style.display = "none";
//     }
// }

function addCardsToPlayer(card, grid){
    const playCard = document.createElement('div');
    playCard.classList.add('card');
    playCard.setAttribute("id", card.suit + card.value);
    playCard.style.backgroundImage = `url(images/${card.suit}${card.value}.png)`;
    playCard.onclick = selectCard;
    //let newCards = grid.parentElement.getElementsByClassName('numCards').innerHTML;
    //grid.parentElement.getElementsByClassName('numCards').innerHTML = newCards.toString();
    grid.appendChild(playCard);
    //grid.parentElement.getElementsByClassName('numCards').innerHTML =
    // let newCards = grid.parentElement.getElementsByClassName('numCards').innerHTML.parseInt + 1;
    // grid.parentElement.getElementsByClassName('numCards').innerHTML = newCards.toString();
        //numCards.innerHTML = player.hand.length.toString();
}

function passTurn() {
    document.getElementById("alert").innerHTML = '';
    //document.getElementById("played").innerHTML = '';
    playerPlaying = this.parentElement.id;
    let player = findPlayerIndexFromId();
    player.passTurn();
    selectedRules = [];
}

function playTurn() {
    let player = findPlayerIndexFromId();
    let cardIndex = -1;
    for(let i = 0; i < player.hand.length; i++){
        if(player.hand[i].suit === selectedCard.charAt(0) && player.hand[i].value === selectedCard.charAt(1)){
            cardIndex = i;
        }
    }
    player.playCard(cardIndex, selectedRules);
    selectedRules = [];
}

function findPlayerIndexFromId(){
    let playerIndex = -1;
    for (let i = 0; i < ourGame.playerList.length; i++) {
        if (ourGame.playerList[i].name === playerPlaying) {
            playerIndex = i;
        }
    }
    let player = ourGame.playerList[playerIndex];
    return player;
}


function selectCard() {
    playerPlaying = this.parentElement.parentElement.id;
    selectedCard = this.id;
    document.getElementById("alert").innerHTML = '';
    //document.getElementById("played").innerHTML = '';
}


function removeVisibility(object) {
    object.style.visibility = "hidden";
}
