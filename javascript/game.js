
//Card

//values held by cards
let suits = ['H', 'S', 'D', 'C'];
let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', "K"];







//Deck

//hold cards, order cards, give and take cards

let Deck = {};
Deck.cards = [];

//creates array of card objects with values                 //ADD ???
Deck.makeCards = function() {
    suits.forEach((suit, index) => {
        values.forEach( value => {
            Deck.cards.push({suit, value})
        })
    });
};


//randomizes the order of the cards passed in to create deck
Deck.shuffle = function() {
    if (!Deck.isDeck(Deck.cards)) {
        console.log(Deck.isDeck);
        return;
    }
    let currentIndex = Deck.cards.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = Deck.cards[currentIndex];
        Deck.cards[currentIndex] = Deck.cards[randomIndex];
        Deck.cards[randomIndex] = temporaryValue;
    }
    return Deck.cards;
};

//removes card from top of the deck
Deck.draw = function() {
    if( Deck.isDeck() ) {
        return (Deck.cards.splice(0, 1));
    }
};

Deck.isDeck = function() {
    let validDeck = true;
    if(!Array.isArray(Deck.cards)) {
        console.error("Received something that wasn't a deck", Deck.cards);
        validDeck = false;
    }
    return validDeck;
};






//Discard

//know it's contents, order of cards

let discardPile = {};

discardPile.cards = [];

discardPile.addCard = function(card){
    discardPile.cards.unshift(card);
}

// displays the last card played
discardPile.topCard = function(){
    return [0];
}







//Player

//exist, have hand, play card, draw card

class Player {
    constructor (hand, index) {
        this._hand = hand;
        this._playerIndex = index;
        this._turn = false;
    }

    get hand() {
        return this._hand;
    }

    get turn() {
        return this._turn;
    }

    get playerIndex() {
        return this._playerIndex;
    }

    receiveCard(card) {
        this._hand.push(card);
    }

    playCard(i) {
        //later send to check for penalty
        game.discardCard(this._hand.splice(i,1));
        game.updateTurn(this._playerIndex);
        game.updateTurn(this._playerIndex + 1);
        //later add send rules
    }

    set turn(turn) {
        this._turn = turn;
    }

    passTurn() {
        //later send to check for penalty
        game.updateTurn(this._playerIndex);
        game.updateTurn(this._playerIndex + 1);
    }
}







//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

let game = {};
game.playDeck = Deck.shuffle(Deck.makeCards());
game.playerList = [];

// deals cards to all players
game.startGame = function(numPlayers){
    for (let i = 0; i < numPlayers; i++){
        game.playerList.push(new Player(game.dealHand(), i));
    }
    game.playerList[0].turn = true;
};

// creates an array of seven cards to give to a player
game.dealHand = function(){
    let hand = [];
    for (let i = 0; i < 7; i++){
        hand.unshift(Deck.draw(game.playDeck));
    }
    return hand;
};

game.drawCard = function(player) {
    player.receiveCard(Deck.draw(game.playDeck));
}

game.updateTurn = function(playerIndex) {
    let i = playerIndex;
    if(i >= game.playerList.length){
        i = 0;
    }
    if(game.playerList[i].turn) {
        game.playerList[i].turn = false;
    }
    else {
        game.playerList[i].turn = true;
    }
}

game.discardCard = function(card){
   discardPile.addCard(card);
   //checkRules();
}

//function checkRules(card, play)

//function continuePlay()

//cardToPlay - takes card played by player, moves it to discard
//cardToHold - takes card from deck, gives it to player
//whoseTurn - points to active player in order
//creating certain number of players

// for loop of the players
// update turn for whoever is selected
// they act
// update again
// loop up



game.startGame(3);
console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
game.playerList[0].passTurn();
console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
console.log(game.playerList[1].hand);
game.drawCard(game.playerList[1]);
game.playerList[1].playCard(2);
console.log(game.playerList[1].hand);
console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
game.playerList[2].passTurn();
console.log(`${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);