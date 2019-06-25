
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

//randomizes the order of the cards passed in to create deck
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

let discardPile = [];

function takeDiscard(pile, card){
    pile.push(card);
}

// displays the last card played
function currentTopCard(pile){
    return pile[0];
}



//Player

//exist, have hand, play card, draw card

class Player {
    constructor (hand, index) {
        this._hand = hand;
        this._turn = false;
        this._playerIndex = index;
    }

    get displayHand() {
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
        discardCard(this._hand.splice(i,1));
        updateTurn(this._playerIndex);
        updateTurn(this._playerIndex + 1);
        //later add send rules
    }

    set turn(turn) {
        this._turn = turn;
    }
}

//Game

//have players, have deck, give cards to players, take cards from players, establish turn order and active players, track rules

let playerList = [];
const deck = () => shuffle(makeCards());

let playDeck = deck();

// deals cards to all players
function startGame(numPlayers, deck){
    for (let i = 0; i < numPlayers; i++){
        playerList.unshift(new Player(dealHand(deck), i));
    }
}

// creates an array of seven cards to give to a player
function dealHand(deck){
    let hand = [];
    for (let i = 0; i < 7; i++){
        hand.unshift(draw(deck));
    }
    return hand;
}

function drawCard(deck, i) {
    playerList[i].receiveCard(draw(deck));
}

function updateTurn(playerIndex) {
    let i = playerIndex;
    if(i >= playerList.length){
        i = 0;
    }
    if(playerList[i].turn) {
        playerList[i].turn(false);
    }
    else {
        playerList[i].turn(true);
    }
}

function discardCard(card){
   takeDiscard(discardPile, card);
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

//function whosPlaying(playerlist){
// for (looping through each player continuously)
// set person's isturn to true
//they take their turn
//set to false when done
//include conditions for 8s, aces, etc.
//win conditions
//out of turn actions
//}