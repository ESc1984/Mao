/*To-Do List
* check game getCurrentPlayer - should it return the player or the index?
* should makeCards be static?
* create statement function(s) for speaking parts? (part of interface)
* penalizing failure to declare a suit with jack
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
        this._cards.unshift(card);
        this._expectedSuit = card.suit;
        this._expectedValue = card.value;
    }
}







class Player {
    constructor (hand, name, game) {
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
    }

    //how do you reference game in player? Do you?

    playCard(cardIndex) {
        console.log("play card");
        let card = this._hand[cardIndex];
        rules.playedCardCheckRules(this, card);
        if(this._turn) {
            if(rules.cardMatch(this, card)) {
                this._game.discardCard(this._hand.splice(cardIndex,1)[0]);
                let element = document.getElementById(`${card.suit} ${card.value}`);
                element.parentNode.removeChild(element);
            }
            rules.findWin(this);
            this._game.updateTurn();
        }
    }

    set turn(turn) {
        this._turn = turn;
    }

    passTurn() {
        console.log('turn passed');
        rules.passTurnCheckRules(this);
        if(this._turn){
            this._game.updateTurn();
        }
    }
}






class Game {
    constructor(numPlayers){
        console.log(numPlayers);
        this._playDeck = new Deck();
        let card = this._playDeck.deal();
        this._discardPile = new DiscardPile(card);

        this._playerList = [];
        for (let i = 0; i < numPlayers; i++){
            this._playerList.push(new Player(this.dealHand(), ('player' + i), this));
        }
        this._playerList[0].turn = true;
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
        player.receiveCard(this._playDeck.deal());
    }

    updateTurn(){
        let currentPlayer = this.getCurrentPlayer();
        let nextPlayer = currentPlayer + 1 >= this._playerList.length ? 0 : currentPlayer + 1;
        this.disableTurn(currentPlayer);
        this.enableTurn(nextPlayer);
    }

    disableTurn(playerIndex){
        this.getPlayer(playerIndex).turn = false;
    }

    enableTurn(playerIndex){
        this.getPlayer(playerIndex).turn = true;
    }

    getCurrentPlayer(){
        console.log('getCurrentPlayer');
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
}







/*
class Rules{
constructor(game){
this._game = game;
}
}
 */

let rules = {};

rules.cardMatch = function(player, card){
    return ( (card.suit === player.game.discardPile.expectedSuit) || (card.value === player.game.discardPile.expectedValue))
};

rules.passTurnCheckRules = function(player){
    if(!player.turn) {
        player.game.drawCard(player);
    }
};

rules.playedCardCheckRules = function(player, card){
    if(!player.turn) {
        player.game.drawCard(player);
     } else if (!rules.cardMatch(player, card)) {
         player.game.drawCard(player);
    }
};

rules.acePlayed = function(player){
    player.game.updateTurn();
};

rules.sevenPlayed = function(player, greet){
    if (greet !== 'HAND'){
        player.game.drawCard(player);
    }
};

rules.eightPlayed = function(player){
    player.game.playerList.reverse();
};


rules.jackPlayed = function(player, suit){
    if ((suit === 'H')||(suit === 'S')||(suit ==='D')||(suit === 'C')){
        player.game.discardPile.expectedSuit(suit);
    } else {
        player.game.drawCard();
    }
};

rules.kingPlayed = function(player, hail){ //requires card?
    if (hail !== 'AHCM'){
        player.game.drawCard(player);
    }
};

rules.queenPlayed = function(player, hail){
    if (hail !== 'AHCW'){
        player.game.drawCard(player);
    }
};

rules.mao = function(player, state){
    let cardsLeft = player.hand.length;
    if ((cardsLeft === 2)&&(state !== 'mao')){
        player.game.drawCard(player);
    }
};

rules.findWin = function(player){
    if (player.hand.length === 0){
        console.log('Congratulations, ' + (player.name) + ' - you have won this round of Mao');
        //end game
    }
};

//  switch(value) {
//      case 'A':
//          game.acePlayed();
//          break;
//      case '8':
//          game.eightPlayed();
//          break;
//      default:
//          break;
//      case 'J':
//          game.jackPlayed('test');  //suit determination TBA
//          break;
//  }                       this is probably all going in Rules
// //checkRules();

let ourGame;
let game;
let selectedCard;
let playerPlaying;

window.onload = function gameLoaded() {
    game = document.getElementById("game");
    document.getElementById("passTurn").addEventListener("click", passTurn);
    document.getElementById("playCard").addEventListener("click", playTurn);
};


function displayPlayerHand(playerIndex) {
    document.getElementById("displayHand").innerHTML = ourGame.getPlayer(playerIndex).hand;
}

function startGame(numPlayers) {
    ourGame = new Game(numPlayers);
    ourGame.playerList.forEach(player => {
        const gamePlayer = document.createElement('div');
        gamePlayer.classList.add('player');
        gamePlayer.setAttribute("class", "player");
        gamePlayer.setAttribute("id", player.name);
        gamePlayer.dataset.name = player.name;
        gamePlayer.innerHTML = player.name;
        game.appendChild(gamePlayer);
        const grid = document.createElement('section');
        grid.setAttribute('class', 'grid');
        gamePlayer.appendChild(grid);
        addCardsToPlayer(player, grid);
    });
}

function addCardsToPlayer(player, grid){
    const gameGrid = grid;
    player.hand.forEach(card => {
        const playCard = document.createElement('div');
        playCard.classList.add('card');
        playCard.setAttribute("id", card.suit + " " + card.value);
        playCard.style.backgroundImage = `url(images/${card.suit}${card.value}.png)`;
        playCard.onclick = selectCard;
        gameGrid.appendChild(playCard);
    });
}

function passTurn() {
    ourGame.getPlayer(1).passTurn();
}

function playTurn() {
    let playerIndex = -1;
    for(let i = 0; i < ourGame.playerList.length; i++){
        if(ourGame.playerList[i].name === playerPlaying){
            playerIndex = i;
        }
    }
    let player = ourGame.playerList[playerIndex];
    let cardIndex = -1;
    for(let i = 0; i < player.hand.length; i++){
        if(player.hand[i].suit === selectedCard.charAt(0) && player.hand[i].value === selectedCard.charAt(2)){
            cardIndex = i;
        }
    }
    player.playCard(cardIndex);
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