/*To-Do List
* check game getCurrentPlayer - should it return the player or the index?
*/



let suits = ['H', 'S', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];

class Deck{
    constructor(){
        this._cards = this.makeCards();
    }

    makeCards(){
        let cards = []
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
        this._expectedSuit = card[0].suit;
        this._expectedValue = card[0].value;
    }
}




//Player

//exist, have hand, play card, draw card

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
        let card = this._hand[cardIndex];
        rules.playedCardCheckRules(this, card);
        if(this._turn) {
            if(rules.cardMatch(this, card)) {
                this._game.discardCard(this._hand.splice(cardIndex,1));
            }
            rules.findWin(this);
            this._game.updateTurn();
        }
    }

    set turn(turn) {
        this._turn = turn;
    }

    passTurn() {
        //game.passTurnCheckRules(this);
        if(this._turn){
            this._game.updateTurn();
        }
    }
}







//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

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
        let playerIndex;
        for(let i = 0; i < this._playerList.length; i++) {
            if(this._playerList[i].turn){
                playerIndex = i;
            }
        }
        return playerIndex;
    }

    discardCard(card){
        let value = card.value;
        this._discardPile.addToDiscard(card);
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
    }
}

let rules = {};

rules.eightPlayed = function(player){
    player.game.playerList.reverse();
};

rules.acePlayed = function(player){
    player.game.updateTurn();

};

rules.cardMatch = function(player, card){
    return ( (card.suit === player.game.discardPile.expectedSuit) || (card.value === player.game.discardPile.expectedValue))
};

rules.passTurnCheckRules = function(player){
    if(!player.turn) {
        player.game.drawCard(player);
    }
    return;
};

rules.playedCardCheckRules = function(player, card){
    if(!player.turn) {
        player.game.drawCard(player);
     } else if (!rules.cardMatch(player, card)) {
         player.game.drawCard(player);
    }
    return;
};


rules.jackPlayed = function(player, suit){
    player.game.discardPile.expectedSuit(suit);
};

rules.findWin = function(player){
    if (player.hand.length === 0){
        console.log('Congratulations, ' + (player.name) + ' - you have won this round of Mao');
        //end game
    }
};


let ourGame = new Game(3);
let card = ourGame.drawCard(ourGame.getPlayer(0));
let player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.playCard(0);
player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.passTurn();
player = ourGame.getPlayer(0);
player.playCard(0);
player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.playCard(2);
player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.playCard(0);