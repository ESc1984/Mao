/*To-Do List
* extract deck building from deck constructor
* truly randomize deckmaking
* --get rid of shuffle
*check game getCurrentPlayer - should it return the player or the index?
*
*
*
*/








let suits = ['H', 'S', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];







class Deck{
    constructor(){
        this._cards = [];
        suits.forEach((suit, index) => {
            values.forEach( value => {
                this._cards.push({suit, value})
            })
        });
    }

    shuffle(){
        if (!this.isDeckValid()) {
            console.log(this.isDeckValid());
            return;
        }
        let currentIndex = this._cards.length;
        let temporaryValue;
        let randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = this._cards[currentIndex];
            this._cards[currentIndex] = this._cards[randomIndex];
            this._cards[randomIndex] = temporaryValue;
        }
        return this._cards;
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




//Player

//exist, have hand, play card, draw card

class Player {
    constructor (hand, name, game) {
        this._hand = hand;
        this._name = name;
        this._game = game;
        this._turn = false;
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
            if(true /*cardMatch(card)*/) {
                game.discardCard(this._hand.splice(cardIndex,1));
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
        this._playDeck.shuffle();
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
        let currentPlayerIndex = this.findWhoseTurn();
        let nextPlayerIndex = currentPlayerIndex + 1 >= this._playerList.length ? 0 : currentPlayerIndex + 1;
        this.disableTurn(currentPlayerIndex);
        this.enableTurn(nextPlayerIndex);
    }

    disableTurn(playerIndex){
        this._playerList[playerIndex].turn = false;
    }

    enableTurn(playerIndex){
        this._playerList[playerIndex].turn = true;
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

let rules = {}

rules.eightPlayed = function(){
    game.playerList.reverse();
};

rules.acePlayed = function(){
    game.updateTurn();

};

rules.cardMatch = function(card){
    return ( (card.suit === discardPile.expected.suit) || (card.value === discardPile.expected.value))
};

rules.passTurnCheckRules = function(player){
    if(!player.turn) {
        game.drawCard(player);
        return;
    } else {
        return;
    }
};

rules.playedCardCheckRules = function(player, card){
    if(!player.turn) {
        game.drawCard(player);
        return;
    } else if (!game.cardMatch(card)){
        game.drawCard(player);
        return;
    } else {
        return;
    }
};

rules.jackPlayed = function(suit){
    discardPile.expected.suit = suit;
};

rules.findWin = function(player){
    if (player.hand.length === 0){
        console.log('Congratulations, ' + (player._playerName) + ' - you have won this round of Mao');
        //end game
    }
};


let ourGame = new Game(3);
let card = ourGame.drawCard(ourGame.getPlayer(0));
let test = 'test';