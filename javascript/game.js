
//Card

//values held by cards
let suits = ['H', 'S', 'D', 'C'];
//let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];
let values = ['J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J', 'J']; // just for jack testing






//Deck

//hold cards, order cards, give and take cards

let Deck = {};
Deck.cards = [];

//creates array of card objects with values
Deck.makeCards = function() {
    suits.forEach((suit, index) => {
        values.forEach( value => {
            Deck.cards.push({suit, value})
        })
    });
};

//  Deck.getSuit = function(card){
//      return card.suit;
// };
//
// Deck.getValue = function(card){
//     return card.value;
// };


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
        return (Deck.cards.shift());
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

discardPile.expected = {
    suit: '',
    value: ''
};

discardPile.setExpected = function(card){
    discardPile.expected.suit = card.suit;
    discardPile.expected.value = card.value;
}

discardPile.cards = [];

discardPile.addCard = function(card){
    discardPile.cards.unshift(card);
    discardPile.expected.suit = card.suit;
    discardPile.expected.value = card.value;
};

// displays the last card played
discardPile.topCard = function(){
    return discardPile.cards[0];


};







//Player

//exist, have hand, play card, draw card

class Player {
    constructor (hand, index, name) {
        this._hand = hand;
        this._playerIndex = index;
        this._playerName = name;
        this._turn = false;
    }

    get hand() {
        return this._hand;
    }

    get name() {
        return this._playerName;
    }

    get turn() {
        return this._turn;
    }

    get playerIndex() {
        return this._playerIndex;
    }

    set playerIndex(i) {
        this._playerIndex = i;
    }

    receiveCard(card) {
        this._hand.push(card);
    }

    playCard(i) {
        let card = this._hand[i];
        game.penaltyPlayedCard(this._playerIndex, card);
        if(this._turn) {
            if(game.cardMatch(card)) {
                game.discardCard(this._hand.splice(i, 1)[0]);
            }
            game.updateTurn(this._playerIndex);
            game.updateTurn(this._playerIndex + 1);
        }
    }

    set turn(turn) {
        this._turn = turn;
    }

    passTurn() {
        game.penaltyNoPlay(this._playerIndex);
        if(this._turn){
            game.updateTurn(this._playerIndex);
            game.updateTurn(this._playerIndex + 1);
        }
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
        game.playerList.push(new Player(game.dealHand(), i, ('player' + i)));
    }
    game.playerList[0].turn = true;
    var firstCard = Deck.draw();
    discardPile.setExpected(firstCard);
    discardPile.cards.push(firstCard);
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
};

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
};

game.findWhoseTurn = function(){
    let playerIndex;
    for(let i = 0; i < game.playerList.length; i++) {
        if(game.playerList[i].turn){
            playerIndex = i;
        }
    }
    return playerIndex;
};

game.eightPlayed = function(){
    let runLength = game.playerList.length / 2;
    for(let i = 0; i < runLength; i++){
        let temp = game.playerList[i];
        game.playerList[i] = game.playerList[game.playerList.length - i - 1];
        game.playerList[game.playerList.length - i - 1] = temp;
    }
    for(let i = 0; i < game.playerList.length; i++){
        game.playerList[i].playerIndex = i;
    }
};

game.discardCard = function(card){
    let value = card.value;
    discardPile.addCard(card);
    switch(value) { //currently undefined -- why?
        case 'A':
            break;
        case '8':
            game.eightPlayed();
            break;
        case 'J':
            game.jackPlayed('test');  //suit determination TBA
            break;
    }
   //checkRules();
};

game.cardMatch = function(card){
    return ( (card.suit === discardPile.expected.suit) || (card.value === discardPile.expected.value))
};

game.penaltyNoPlay = function(i){
    let player = game.playerList[i];
    if(!player.turn) {
        game.drawCard(player);
        return;
    } else {
        return;
    }
};

game.penaltyPlayedCard = function(i, card){
    let player = game.playerList[i];
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


//jacks test code
console.log('');
game.startGame(2);
console.log('hand: ' + JSON.stringify(game.playerList[0].hand));
console.log('');
console.log('card :' + JSON.stringify(game.playerList[0].hand[0]));
console.log('');
console.log('discard before play: ' + JSON.stringify(discardPile.cards));
game.playerList[0].playCard(0);
console.log('');
console.log('discard after play: ' + JSON.stringify(discardPile.cards));
console.log('');
console.log(discardPile.expected.suit)
console.log('');
console.log('hand: ' + JSON.stringify(game.playerList[0].hand));

//8 is played testing code
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
// console.log(`Player Index List: ${game.playerList[0].playerIndex} + ${game.playerList[1].playerIndex} + ${game.playerList[2].playerIndex}`);
// console.log(game.playerList[0].hand[0]);
// game.discardCard(game.playerList[0].hand[0]);
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
// game.startGame(3);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);
// console.log("Top Card in Discard:");
// console.log("Card Selected for Play:");
// console.log(game.playerList[0].hand[0]);
// console.log(discardPile.topCard());
// console.log("Player's Hand Before Turn:");
// console.log(game.playerList[0].hand);
// game.playerList[0].playCard(0);
// console.log("Player's Hand After Turn:");
// console.log(game.playerList[0].hand);
// console.log("Top Card in Discard:");
// console.log(discardPile.topCard());
// console.log("Second Card in Discard:");
// console.log(discardPile.cards[1]);
// console.log(`Player Turn List: ${game.playerList[0].turn} + ${game.playerList[1].turn} + ${game.playerList[2].turn}`);


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


