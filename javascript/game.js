
//Card

//values held by cards
let suits = ['H', 'S', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];
//let values = ['J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J']; // just for jack testing






//Deck

//hold cards, order cards, give and take cards

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

    draw() {
        if( this.isDeckValid() ) {
            return (this._cards.shift());
        }
    }
}



//Discard

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
    constructor (hand, name) {
        this._hand = hand;
        this._name = name;
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

    // playCard(cardIndex) {
    //     let card = this._hand[cardIndex];
    //     //playedCardCheckRules(this, card);
    //     if(this._turn) {
    //         if(/*cardMatch(card)*/) {
    //             game.discardCard(this._hand.splice(cardIndex,1));
    //         }
    //         game.findWin(this);
    //         game.updateTurn();
    //     }
    // }

    set turn(turn) {
        this._turn = turn;
    }

    // passTurn() {
    //     game.passTurnCheckRules(this);
    //     if(this._turn){
    //         game.updateTurn();
    //     }
    // }
}







//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

class Game {
    constructor(numPlayers){
        this._playDeck = new Deck().shuffle();
        this._playerList = [];
        let card = this._playDeck.draw();
        this._discardPile = new DiscardPile(card);
        for (let i = 0; i < numPlayers; i++){
            this._playerList.push(new Player(this.dealHand(), ('player' + i)));
        }
        this._playerList[0].turn = true;
    }

    dealHand(){
        let hand = [];
        for (let i = 0; i < 7; i++){
            hand.unshift(this._playDeck.draw());
        }
        return hand;
    }

    drawCard(player){
        player.receiveCard(this._playDeck.draw());
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

    findWhoseTurn(){
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


let game = {};

game.eightPlayed = function(){
    game.playerList.reverse();
};

game.acePlayed = function(){
    game.updateTurn();

};

game.cardMatch = function(card){
    return ( (card.suit === discardPile.expected.suit) || (card.value === discardPile.expected.value))
};

game.passTurnCheckRules = function(player){
    if(!player.turn) {
        game.drawCard(player);
        return;
    } else {
        return;
    }
};

game.playedCardCheckRules = function(player, card){
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

game.jackPlayed = function(suit){
    discardPile.expected.suit = suit;
};

game.findWin = function(player){
    if (player.hand.length === 0){
        console.log('Congratulations, ' + (player._playerName) + ' - you have won this round of Mao');
        //end game
    }
};


//function checkRules(card, play)

//function continuePlay()

//cardToPlay - takes card played by player, moves it to discard
//cardToHold - takes card from deck, gives it to player
//whoseTurn - points to active player in order
//creating certain number of players


//if game.playdeck.length <= 0, add new deck
//if everyone passes, place a new card from the deck

//if cardMatch doesn't pass, don't allow card to be discarded, give penalty



// game.startGame(3);
// console.log(game.playerList[1].hand);
// console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[1].playCard(0);
// console.log(game.playerList[1].hand);
// console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[0].passTurn();
// console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log(game.cardMatch(game.playerList[1].hand[2]));
// game.playerList[1].playCard(2);
// console.log(discardPile.cards);
// console.log(discardPile.topCard());
//  console.log(discardPile.cards[1]);
// console.log(game.playerList[1].hand);
// console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[2].passTurn();
// console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);

let ourDeck = new Deck;
let playCard = ourDeck.draw();
let ourDiscard = new DiscardPile(playCard);
let ourGame = new Game(3);
console.log(playCard);
console.log(ourDiscard);

//jacks test code
// console.log('');
// game.startGame(2);
// console.log('hand: ' + JSON.stringify(game.playerList[0].hand));
// console.log('');
// console.log('card :' + JSON.stringify(game.playerList[0].hand[0]));
// console.log('');
// console.log('discard before play: ' + JSON.stringify(discardPile.cards));
// game.playerList[0].playCard(0);
// console.log('');
// console.log('discard after play: ' + JSON.stringify(discardPile.cards));
// console.log('');
// console.log(discardPile.expected.suit)
// console.log('');
// console.log('hand: ' + JSON.stringify(game.playerList[0].hand));
//
// //8 is played testing code
// game.startGame(3);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log(`Player Name List: ${game.playerList[0].name} + ${game.playerList[1].name} + ${game.playerList[2].name}`);
// console.log(`Player Index List: ${game.playerList[0].playerIndex} + ${game.playerList[1].playerIndex} + ${game.playerList[2].playerIndex}`);
// game.discardCard(game.playerList[0].hand[0]);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log(`Player Name List: ${game.playerList[0].name} + ${game.playerList[1].name} + ${game.playerList[2].name}`);
// console.log(`Player Index List: ${game.playerList[0].playerIndex} + ${game.playerList[1].playerIndex} + ${game.playerList[2].playerIndex}`);




//Testing Code

//8 is played testing code (keep running until it plays an 8)
// game.startGame(3);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log(`Player Name List: ${game.playerList[0].name} + ${game.playerList[1].name} + ${game.playerList[2].name}`);
// let cardToDiscard = game.playerList[0].hand.splice(0,1);
// console.log(cardToDiscard);
// game.playerList[0].playCard();
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log(`Player Name List: ${game.playerList[0].name} + ${game.playerList[1].name} + ${game.playerList[2].name}`);
// console.log(`Player Index List: ${game.playerList[0].playerIndex} + ${game.playerList[1].playerIndex} + ${game.playerList[2].playerIndex}`);

//turn order testing code
// game.startGame(3);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[0].passTurn();
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[1].passTurn();
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// game.playerList[2].passTurn();
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);


//receiving a penalty for playing out of turn test
// game.startGame(3);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log("Player's Original Hand:");
// console.log(game.playerList[1].hand);
// game.playerList[1].playCard(0);
// console.log("Player's New Hand:");
// console.log(game.playerList[1].hand);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);


//playing a card (either will work or will receive a penalty)
game.startGame(3);
console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
console.log("Top Card in Discard:");
console.log("Card Selected for Play:");
console.log(game.playerList[0].hand[0]);
console.log(discardPile.topCard());
console.log("Player's Hand Before Turn:");
console.log(game.playerList[0].hand);
game.playerList[0].playCard(0);
console.log("Player's Hand After Turn:");
console.log(game.playerList[0].hand);
console.log("Top Card in Discard:");
console.log(discardPile.topCard());
console.log("Second Card in Discard:");
console.log(discardPile.cards[1]);
console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);


//card match test code
// game.startGame(3);
// console.log("Top Card in Discard:");
// console.log(discardPile.topCard());
// console.log('Card Chosen to Play:');
// console.log(game.playerList[0].hand[0]);
// console.log("Player's Hand Before Turn:");
// console.log(game.playerList[0].hand);
// console.log(`Card Match: ${game.cardMatch(game.playerList[0].hand[0])}`);
// game.playerList[0].playCard(0);
// console.log("Player's Hand After Turn:");
// console.log(game.playerList[0].hand);
// console.log("Top Card in Discard:");
// console.log(discardPile.topCard());
// console.log("Second Card in Discard:");
// console.log(discardPile.cards[1]);


// for (let i = 0; i < game.playerList[0].hand.length; i++){
//     let suit = game.playerList[0].hand[i][0].suit;
//     if (suit === 'J'){
//         game.playerList[0].playCard(i);
//         console.log(discardPile.topCard());
//         break;
//     }
// }

//eights - use function to reverse the order of playerList, find current player, move along
//kings, queens, sevens - use button press before sending in, treat message as a second parameter
    //nice days - start counter with first seven played, next person must press button once more than the last
    //OR have a separate button for verys
//ace - turn skipping already exists, right?
//jacks - pass in new suit as a second parameter (like the above), add invisible card to discard, value 'none' suit (new suit)

//Notes
    //function checkRules(card, play)

    //function continuePlay()

    //cardToPlay - takes card played by player, moves it to discard

    //cardToHold - takes card from deck, gives it to player

    //whoseTurn - points to active player in order

    //creating certain number of players

    //if game.playdeck.length <= 0, add new deck



//Rule List
    //eights - use function to reverse the order of playerList, find current player, move along
    //kings, queens, sevens - use button press before sending in, treat message as a second parameter
        //nice days - start counter with first seven played, next person must press button once more than the last
        //OR have a separate button for verys
    //ace - turn skipping already exists, right?
    //jacks - pass in new suit as a second parameter (like the above), add invisible card to discard, value 'none' suit (new suit)


