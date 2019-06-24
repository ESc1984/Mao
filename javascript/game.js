
//Card

//hold a value

//values held by cards
var suits = ['H', 'S', 'D', 'C'];
var values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', "K"];

//creates array of card objects with values
function makeCards(){
    let cards = [];
    suits.forEach((suit, index) => {
        values.forEach( value => {
            cards.push({suit, value})
        })
    })
    return cards;
}





//Deck

//hold cards, order cards, give and take cards

//takes in array of card objects, shuffles them
// function getDeck(){
// //     let newDeck = card.cards;
// //     shuffle(newDeck);
// //     return newDeck;
// // }

//the deck used in the round
let deck;

//randomizes the order of the cards
function shuffle(deck) {
    var currentIndex = deck.length;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = deck[currentIndex];
        deck[currentIndex] = deck[randomIndex];
        deck[randomIndex] = temporaryValue;
    }

    return deck;
}

//removes card from top of the deck
function draw(deck){
    return (deck.splice(0,1));
}





//Discard

//know it's contents, order of cards

// array of card objects previously used by players
// let pile = [];
//
// function holdCard(pile){
//     pile.push(bleh);
// }

// displays the last card played
// function topCard(pile){
//     return pile[pile.length];
// }





//Player

//exist, have hand, play card, draw card

function Player(hand){
    this.hand = hand;
    this.receiveCard = function(card) {
        hand.push(card);
    }
    this.playCard = function(index) {
        return hand.splice(index, 1);
    }
}




//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

// creates an array of seven cards to give to a player
function dealHand(deck, player){
    let hand = [];
    for (let i = 0; i < 7; i++){
        /*deck.*/draw(deck);
    }
    return hand;
}

//cardToPlay - takes card played by player, moves it to discard
//cardToHold - takes card from deck, gives it to player
//whoseTurn - points to active player in order

//creating certain number of players