
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
