
// function getDeck(){
// //     let newDeck = import{cards} from 'card';
// //     shuffle(newDeck);
// //     return newDeck;
// // }

import  allCards from "./card.js";
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


