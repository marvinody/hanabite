const suits = 'white yellow green blue red'.split(' ');
const initialHandCount = (numPlayers) => {
  if (numPlayers === 2 || numPlayers === 3) {
    return 5;
  }
  return 4;
}

// players should be an object of [socket.id] -> socket
export default function (io) {
  return class Game {
    constructor(players, maxSize, roomCode) {
      this.players = players;
      this.size = maxSize;
      this.roomCode = roomCode

      this.field = suits.reduce((acc, suit) => ({
        ...acc, [suit]: 0
      }), {}) // all suits start at 0 card
      this.tokens = {
        info: {
          starting: 8,
          current: 8,
        },
        fuse: {
          starting: 3,
          current: 3,
        }
      }
      this.deck = deckMaker()
      this.graveyard = []
      // preserve ordering so I can use a simple idx to keep track of person
      // just need to remember to update it in places needed
      this.playerOrder = Object.keys(players);
      this.currentPlayerIdx = 0;

      this.dealHands();

      io.to(roomCode).emit('game_public_info', this.publicGameInfo())
    }
    // returns [isAI: bool, player: socket]
    // player is undefined is bool is true
    currentPlayer() {
      if (this.currentPlayerIdx < this.playerOrder.length) {
        return [false, this.playerOrder[this.currentPlayerIdx]]
      }
      return [true, undefined]
    }
    // attach all the needed listeners to one socket
    addListeners(player) {
      player.on('game_give_info', data => this.giveInfo(player, data))
      player.on('game_play_card', data => this.playCard(player, data))
      player.on('game_discard', data => this.discard(player, data))
    }
    // remove yada yada
    removeListeners(player) {
      player.removeListener('game_give_info')
      player.removeListener('game_play_card')
      player.removeListener('game_discard')
    }
    // reveal information about another player's cards
    giveInfo(player, data) {

      const { type, value, negation } = data
    }
    // attempt to play a card on a pile
    playCard(player, data) {
      const { cardIdx } = data
    }
    // discard a card to the discard pile
    discard(player, data) {
      const { cardIdx } = data
    }

    // remove will swap a player to AI and keep playing
    removePlayer(socket) {
      delete this.players[socket.id]
    }
    // swap will change a spectator to a player and remove the original player
    swapPlayers(removing, adding) {

    }
    // add player will swap an AI to a player
    addPlayer(socket) {

    }
    dealHands() {
      const numCards = initialHandCount();
      this.playerOrder.forEach(playerId => {
        const player = this.players[playerId]
        this.dealCardsToPlayer(initialHandCount, player)
      });
    }
    dealCardsToPlayer(n, player) {
      player.data.cards = this.deck.splice(0, n)
    }
    publicGameInfo() {
      return {
        tokens: this.tokens,
        field: this.field,
        graveyard: this.graveyard,
      }
    }
  }

}

const cardMaker = (suit, value) => ({
  suit, value
})

function deckMaker() {
  // 3 ones, 2 twos, 2 threes...
  const numOfCardPerNumber = [3, 2, 2, 2, 1];
  return suits.flatMap(suit => (
    numOfCardPerNumber.flatMap((num, idx) => (
      Array(num).fill(0).map(() => cardMaker(suit, idx + 1))
    ))
  ))

}

function shuffleInPlace(arr) {

}
