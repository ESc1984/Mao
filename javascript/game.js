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
        for (let i = 0; i < 100; i++){
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
    constructor (card){
        this._cards = [card];
        this._expectedSuit = card.suit;
        this._expectedValue = card.value;
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
        this._expectedSuit = card.suit;
        this._expectedValue = card.value;
        disc.removeChild(disc.children[0]);
        addCardsToPlayer(card, disc);
    }
}







class Player {
    constructor(hand, name, game, rules) {
        this._hand = hand;
        this._name = name;
        this._game = game;
        this._rules = rules;
        this._turn = false;
        this._passes = 0;
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

    passTurn() {
        rules.passTurnCheckRules(this);
        if (this._turn) {
            this._game._passes++;
            this._game.updateTurn();
        }
    };

    playCard(cardIndex) {
        let card = this._hand[cardIndex];
        rules.playedCardCheckRules(this, card);
        if(this._turn) {
            if(rules.cardMatch(this, card)) {
                this._game._passes = 0;
                this._game.discardCard(this._hand.splice(cardIndex,1)[0]);

                let player = document.querySelector(`#${this.name}`);
                let grid = player.querySelector(".grid");
                let identifier = "#" + card.suit + card.value;
                let element = grid.querySelector(identifier);
                element.parentNode.removeChild(element);

                // let player = document.getElementById(this.name);
                // let grid = player.children[1];
                // let element = grid.querySelector(`#${card.suit}${card.value}`);
                // element.parentNode.removeChild(element);
            }
            rules.findWin(this);
            this._game.updateTurn();
        }
    }

    set turn(turn) {
        this._turn = turn;
    }

}







class Game {
    constructor(numPlayers){
        this._playDeck = new Deck();
        let card = this._playDeck.deal();
        this._discardPile = new DiscardPile(card);

        this._playerList = [];
        for (let i = 0; i < numPlayers; i++){
            this._playerList.push(new Player(this.dealHand(), ('player' + i), this));
        }
        this._playerList[0].turn = true;
        this._passes = 0;
        console.log('This game of Mao is officially in session.')
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

    dealHand(){
        let hand = [];
        for (let i = 0; i < 7; i++){
            hand.unshift(this._playDeck.deal());
        }
        return hand;
    }

    drawCard(player){
        let card = this._playDeck.deal();
        let grid = document.getElementById(player.name).children[1];
        addCardsToPlayer(card,grid);
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
        this._gameRules = {
            "A": this.acePlayed(player),
            "7": this.sevenPlayed(player, "HAND"), //declarations TBA
            "8": this.eightPlayed(player),
            "J": this.jackPlayed(player, 'D'),
            "Q": this.queenPlayed(player, "AHCW"),
            "K": this.kingPlayed(player, "AHCM"),
            "S": this.spadePlayed(player, "spades")
        };
    }

    cardMatch(player, card){
        return ( (card.suit === player.game.discardPile.expectedSuit) || (card.value === player.game.discardPile.expectedValue))
    }

    passTurnCheckRules(player){
        if(!player.turn) {
            player.game.drawCard(player);
        }
    }

    playedCardCheckRules(player, card){
        if(!player.turn) {
            player.game.drawCard(player);
        } else if (!rules.cardMatch(player, card)) {
            player.game.drawCard(player);
        }
    }

    spadePlayed(player, state){
        if(state !== 'spades'){
            player.game.drawCard();
            console.log('Failure to declare spades.')
        } else {
            console.log(state);
        }
    }

    acePlayed(player){
        player.game.updateTurn();
    }

    sevenPlayed(player, state){
        if (state !== 'HAND') {
            player.game.drawCard(player);
            console.log('Failure to say Have a Nice Day');
        } else {
            console.log(state);
        }
    }

    eightPlayed(player){
        player.game.playerList.reverse();
    }


    jackPlayed(player, suit){
        if ((suit === 'H')||(suit === 'S')||(suit ==='D')||(suit === 'C')){
            player.game.discardPile.expectedSuit(suit);
            console.log('New suit: ' + suit)
        } else {
            player.game.drawCard();
            console.log('Failure to declare a suit');
        }
    }

    kingPlayed(player, state){ //requires card?
        if (state !== 'AHCM'){
            player.game.drawCard(player);
            console.log('Failure to declare All Hail the Chairman');
        } else {
            console.log(state);
        }
    }

    queenPlayed(player, state){
        if (state !== 'AHCW'){
            player.game.drawCard(player);
            console.log('Failure to declare All Hail the Chairwoman');
        } else {
            console.log(state);
        }
    }

    mao(player, state){
        let cardsLeft = player.hand.length;
        if ((cardsLeft === 2)&&(state.toLowerCase() !== 'mao')){
            player.game.drawCard(player);
            console.log('Failure to declare Mao');
        } else {
            console.log(state);
        }
    }

    findWin(player){
        if (player.hand.length === 0){
            console.log('Congratulations, ' + (player.name) + ' - you have won this round of Mao');
            //end game
        }
    }
}




let ourGame;
let game;
let selectedCard;
let playerPlaying;

window.onload = function gameLoaded() {
    game = document.getElementById("game");
    document.getElementById("playCard").addEventListener("click", playTurn);
};


function displayPlayerHand(playerIndex) {
    document.getElementById("displayHand").innerHTML = ourGame.getPlayer(playerIndex).hand;
}

function startGame(numPlayers) {
    ourGame = new Game(numPlayers);
    const discard = document.createElement('section');
    discard.setAttribute('id', 'discard');
    discard.setAttribute('class', 'grid');
    game.appendChild(discard);
    const disPile = addCardsToPlayer(ourGame.discardPile.topDiscard(), discard);
    ourGame.playerList.forEach(player => {
        const gamePlayer = document.createElement('div');
        gamePlayer.classList.add('player');
        gamePlayer.setAttribute("class", "player");
        gamePlayer.setAttribute("id", player.name);
        gamePlayer.dataset.name = player.name;
        gamePlayer.innerHTML = player.name;
        game.appendChild(gamePlayer);
        const passBtn = document.createElement("button");
        passBtn.setAttribute('class', 'pass');
        passBtn.innerHTML = 'Pass Turn';
        passBtn.onclick = passTurn;
        gamePlayer.appendChild(passBtn);
        const grid = document.createElement('section');
        grid.setAttribute('class', 'grid');
        gamePlayer.appendChild(grid);
        initializePlayerHand(player, grid);
    });
}

function initializePlayerHand(player, grid){
    const gameGrid = grid;
    player.hand.forEach(card => {
        addCardsToPlayer(card, grid)
    });
}


function addCardsToPlayer(card, grid){
    const playCard = document.createElement('div');
    playCard.classList.add('card');
    playCard.setAttribute("id", card.suit + card.value);
    playCard.style.backgroundImage = `url(images/${card.suit}${card.value}.png)`;
    playCard.onclick = selectCard;
    grid.appendChild(playCard);
}

function passTurn() {
    playerPlaying = this.parentElement.id;
    let player = findPlayerIndexFromId();
    player.passTurn();
}

function playTurn() {
    let player = findPlayerIndexFromId();
    let cardIndex = -1;
    for(let i = 0; i < player.hand.length; i++){
        if(player.hand[i].suit === selectedCard.charAt(0) && player.hand[i].value === selectedCard.charAt(1)){
            cardIndex = i;
        }
    }
    player.playCard(cardIndex);
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
}

function removeVisibility(object) {
    object.style.visibility = "hidden";
}



// let ourGame = new Game(3);
// let player = ourGame.getPlayer(ourGame.getCurrentPlayer());
// player.playCard(0);
// player = ourGame.getPlayer(ourGame.getCurrentPlayer());
// player.passTurn();
// player = ourGame.getPlayer(0);
// player.playCard(0);
// player = ourGame.getPlayer(ourGame.getCurrentPlayer());
// player.playCard(2);
// player = ourGame.getPlayer(ourGame.getCurrentPlayer());
// player.playCard(6);