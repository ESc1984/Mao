
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

export let allCards = makeCards();


//hold a value