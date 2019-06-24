
//Card

//hold a value


var suits = ['H', 'S', 'D', 'C'];
var values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', "K"];

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

// function getDeck(){
// //     let newDeck = import{cards} from 'card';
// //     shuffle(newDeck);
// //     return newDeck;
// // }

let deck = allCards;

function dealHand(deck){
    let hand = [];
    shuffle(deck);
    for (let i = 0; i < 7; i++){
        draw(deck, hand);
    }
    return hand;
}

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

function draw(deck){
    return (deck.splice(0,1));
}





//Discard

//know it's contents, order of cards





//Player

//exist, have hand, play card, draw card

let hand = [];

function drawCard(hand, card){

}

function playCard(hand, i){
    discard.push(hand.splice(i, 1));
}





//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

// function startGame(){
//     for (let i = 0; i < players.length; i++){
//         hand
//     }
// }