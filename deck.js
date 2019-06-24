
var suits = ['H', 'S', 'D', 'C'];
var values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', "K"];

function getDeck(){
    let deck = [];
    suits.forEach((suit, index) => {
        values.forEach( value => {
            deck.push({suit, value})
        })
    })
    return deck;
}

var deck = getDeck();
var discard = [];

var playercount = 4;
//create players at a point

function dealHand(deck/*, hand, player*/){
    let hand = [];
    shuffle(deck);
    for (let i = 0; i < 7; i++){
        draw(deck, hand);
    }
    return hand;
}

var hand1 = dealHand(deck);
console.log(hand1);
console.log('');
let hand2 = draw(deck, hand1);
console.log(hand2);


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

function draw(deck, hand){
    hand.push(deck.splice(0,1));
    return hand;
}

function playCard(hand, i){
    discard.push(hand.splice(i, 1));
}