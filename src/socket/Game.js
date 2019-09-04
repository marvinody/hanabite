/* eslint-disable guard-for-in */
import { getUserData } from './utils';

const colors = 'white yellow green blue red'.split(' ');
const initialHandCount = (numPlayers) => {
  if (numPlayers <= 3) {
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

      this.field = colors.reduce((acc, color) => ({
        ...acc, [color]: 0
      }), {}) // all colors start at 0 card
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

      // also need to attach all the event listeners
      this.playerOrder.forEach(socketId => {
        this.addListeners(this.players[socketId])
      })

      // let's set first player to go
      this.currentPlayerIdx = 0;

      // everyone gets some cards
      this.dealHands();

      // and let everyone know what's going on
      this.sendGameInfo();

    }
    // returns [isAI: bool, player: socket]
    // player is undefined is bool is true
    currentPlayer() {
      if (this.currentPlayerIdx < this.playerOrder.length) {
        return [false, this.playerOrder[this.currentPlayerIdx]]
      }
      return [true, undefined]
    }
    // returns true if it is player's turn. false otherwise
    isCurrentTurnFor(player) {
      const current = this.players[this.playerOrder[this.currentPlayerIdx]]
      return player.id === current.id
    }
    // advances play to the next player
    // responsible for sending out updates about everything!
    nextPlayer() {
      this.currentPlayerIdx += 1;
      this.currentPlayerIdx = this.currentPlayerIdx % this.playerOrder.length;
      this.sendGameInfo();
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
      if (!this.isCurrentTurnFor(player)) {
        console.log('not your turn', player.data.name);
        return;
      }
      console.log('playing: ', data)
      const { idx } = data
      const { color, value } = this.removeCardFromHandAndDraw(player, idx)
      if (this.field[color] + 1 !== value) {
        this.tokens.fuse.current--;
      }

      if (!this.checkGameOver()) {
        this.nextPlayer();
      }
    }

    // discard a card to the discard pile
    discard(player, data) {
      console.log('discarding: ', data)
      const { cardIdx } = data
    }

    // will take out idx from hand and give a new one if possible from deck
    removeCardFromHandAndDraw(player, idx) {
      const card = player.data.cards.splice(idx, 1);
      this.dealCardsToPlayer(1, player)
      return card;
    }
    // game over when no fuse left or too many turns when deck is empty
    // changes state where needed and sends out events
    checkGameOver() {
      return false;
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
      const numCards = initialHandCount(this.size);
      this.playerOrder.forEach(playerId => {
        const player = this.players[playerId]
        this.dealCardsToPlayer(numCards, player)
      });
    }

    dealCardsToPlayer(n, player) {
      if (player.data.cards === undefined) {
        player.data.cards = [];
      }
      if (this.deck.length > 0) {
        player.data.cards.push(...this.deck.splice(0, n))
      }
    }

    sendGameInfo() {
      this.sendPublicGameInfo();
      this.sendPrivateGameInfo();
    }

    sendPublicGameInfo() {
      io.to(this.roomCode).emit('game_public_info', this.publicGameInfo())
    }

    publicGameInfo() {
      const currentSocketId = this.playerOrder[this.currentPlayerIdx];
      return {
        tokens: this.tokens,
        field: this.field,
        graveyard: this.graveyard,
        deck: this.deck.length,
        currentPlayer: getUserData(this.players[currentSocketId]),
      }
    }

    sendPrivateGameInfo() {
      const privateInfo = this.privateGameInfo();
      this.playerOrder.forEach(playerId => {
        const playersInfo = privateInfo[playerId];
        io.to(playerId).emit('game_private_info', playersInfo);
      })
    }

    // get an object of all playerId -> cards they see
    privateGameInfo() {
      return this.playerOrder.reduce((acc, playerId) => ({
        ...acc,
        [playerId]: this.privateGameInfoForPlayer(playerId)
      }), {})
    }

    // get an array of the cards the player will be able to see
    privateGameInfoForPlayer(playerHandId) {
      return this.playerOrder.map(playerId => {
        let cards = this.players[playerId].data.cards;
        if (playerHandId === playerId) {
          cards = cards.map(() => cardMaker('grey', '?'))
        }
        return {
          name: this.players[playerId].data.name,
          id: this.players[playerId].data.id,
          cards,
        };
      })
    }
  }

}

const cardMaker = (color, value) => ({
  color, value
})

function deckMaker() {
  // 3 ones, 2 twos, 2 threes...
  const numOfCardPerNumber = [3, 2, 2, 2, 1];
  return colors.flatMap(color => (
    numOfCardPerNumber.flatMap((num, idx) => (
      Array(num).fill(0).map(() => cardMaker(color, idx + 1))
    ))
  ))

}

function shuffleInPlace(arr) {

}
