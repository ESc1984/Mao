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
        this._cards.unshift(card);
        this._expectedSuit = card[0].suit;
        this._expectedValue = card[0].value;
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

    set turn(turn) {
        this._turn = turn;
    }

    receiveCard(card) {
        this._hand.push(card);
    }

    passTurn() {
        //rules.passTurnCheckRules(this);
        if (this._turn) {
            this._game._passes++;
            this._game.updateTurn();
        }
    };

    playCard(cardIndex) {
        let card = this._hand[cardIndex];
        //rules.playedCardCheckRules(this, card);
        if (this._turn) {
            if (true /*rules.cardMatch(this, card)*/) {
                this._game._passes = 0;
                this._game.discardCard(this._hand.splice(cardIndex, 1));
            }
            //rules.findWin(this);
            this._game.updateTurn();
        }
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
        player.receiveCard(this._playDeck.deal());
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
            "7": this.sevenPlayed(player, 'HAND'), //declarations TBA
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
        if ((cardsLeft === 1)&&(state.toLowerCase() !== 'mao')){
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
//          game.jackPlayed('D');  //suit determination TBA
//          break;
//  }                       this is probably all going in Rules
// //checkRules();
}










let ourGame = new Game(3);
console.log(ourGame.discardPile._cards);
let player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.passTurn();
player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.passTurn();
player = ourGame.getPlayer(ourGame.getCurrentPlayer());
player.passTurn();
console.log(ourGame.discardPile._cards);
