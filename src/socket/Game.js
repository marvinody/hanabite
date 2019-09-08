/* eslint-disable guard-for-in */
import { getUserData } from './utils';

const allColors = 'white yellow green blue red'.split(' ');
const initialHandCount = (numPlayers) => {
  if (numPlayers <= 3) {
    return 5;
  }
  return 4;
}

// players should be an object of [socket.id] -> socket
export default function (io) {
  return class Game {
    constructor(players, maxSize, roomCode, room) {

      // this is such a cop-out
      this.room = room;

      this.players = players;
      this.size = maxSize;
      this.roomCode = roomCode

      this.field = allColors.reduce((acc, color) => ({
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

    addMessage(message, from = null) {
      this.room.addMessage(message, from)
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

    findSocketByPlayerId(playerId) {
      return Object.values(this.players).find(socket => socket.data.id === playerId)
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
      // guard against other players
      if (!this.isCurrentTurnFor(player)) {
        return;
      }
      // maybe I'll use negations later, but not sure right now
      // would be fairly simple I think with current layout
      // but the problem is how to display negations in the front
      const { type, id: playerId, idx: cardIdx, negation } = data
      // if no info tokens, can't do anything here
      if (this.tokens.info.current <= 0) {
        this.addMessage(`${player.data.name} tried to reveal info without info tokens. Must discard or play a card!`)
        return;
      }
      this.tokens.info.current -= 1

      // grab some stuff
      const infoSocket = this.findSocketByPlayerId(playerId);
      const card = infoSocket.data.cards[cardIdx];

      // curried fn. also assume color initially
      let pred = isSameColor(card)
      if (type === 'value') {
        pred = isSameValue(card)
      }
      // this will return the original card which is perfect
      const matchingCards = infoSocket.data.cards.filter(pred);

      // so for each card that matches the original (including the original)
      // we'll set the known "types" to an array of the orginal's type
      // type could mean color or value depending on what the user selected
      // would need a check for negation if decide to add then
      // and then filter out instead of just setting
      matchingCards.forEach(card => card.known[type + 's'] = [card[type]])

      this.addMessage(`${player.data.name} revealed all the ${card[type]}s in ${infoSocket.data.name}'s hand.`)

      if (!this.checkGameOver()) {
        this.nextPlayer();
      }

    }

    // attempt to play a card on a pile
    playCard(player, data) {
      // guard against other players
      if (!this.isCurrentTurnFor(player)) {
        return;
      }
      const { idx } = data
      const { color, value } = this.removeCardFromHandAndDraw(player, idx)
      if (this.field[color] + 1 !== value) {
        this.addMessage(`${player.data.name} played a ${color} ${value} and messed up! -1 fuse token`)
        this.tokens.fuse.current -= 1;
      } else {
        this.field[color] += 1
        this.addMessage(`${player.data.name} played a ${color} ${value}!`)
      }

      if (!this.checkGameOver()) {
        this.nextPlayer();
      }
    }

    // discard a card to the discard pile
    discard(player, data) {
      // guard against other players
      if (!this.isCurrentTurnFor(player)) {
        return;
      }
      const { idx } = data
      const { color, value } = this.removeCardFromHandAndDraw(player, idx)
      if (this.tokens.info.current === this.tokens.info.starting) {
        this.addMessage(`${player.data.name} discard a ${color} ${value} and gained no extra info tokens!`)
      } else {
        this.tokens.info.current += 1
        this.addMessage(`${player.data.name} discarded a ${color} ${value} and gained an info token!`)
      }

      // always need to check gameover incase players try to cheat the game
      if (!this.checkGameOver()) {
        this.nextPlayer();
      }
    }

    // will take out idx from hand and give a new one if possible from deck
    removeCardFromHandAndDraw(player, idx) {
      const card = player.data.cards.splice(idx, 1)[0];
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
      this.removeListeners(socket)
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
          // this is done to prevent client from knowing exactly what card it is
          // by looking at socket stuff
          cards = cards.map(card => cardMaker('grey', '?', card.known.values, card.known.colors))
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
// known means the possible values the player who owns the card
// should be adusted as info is given
const cardMaker = (color, value, values = [1, 2, 3, 4, 5], colors = allColors.slice()) => ({
  color, value,
  known: {
    values,
    colors,
  }
})

// currying will make code cleaner in a filter
const isSameColor = card1 => card2 => card1.color === card2.color
const isSameValue = card1 => card2 => card1.value === card2.value

function deckMaker() {
  // 3 ones, 2 twos, 2 threes...
  const numOfCardPerNumber = [3, 2, 2, 2, 1];
  return allColors.flatMap(color => (
    numOfCardPerNumber.flatMap((num, idx) => (
      Array(num).fill(0).map(() => cardMaker(color, idx + 1))
    ))
  ))

}

function shuffleInPlace(arr) {

}
