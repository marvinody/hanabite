/* eslint-disable guard-for-in */
import idGen from '../id';
import nameGen from './name';
import { getUserData } from './utils';

const allColors = 'white yellow green blue red'.split(' ');
const initialHandCount = (numPlayers) => {
  if (numPlayers <= 3) {
    return 5;
  }
  return 4;
}

const generateAI = () => ({
  data: {
    id: idGen(),
    name: nameGen() + ' - AI',
    isAI: true,
    handIdx: -1,
  }
})

// players should be an object of [socket.id] -> socket
export default function (io) {
  return class Game {
    constructor(players, maxSize, roomCode, room) {

      // this is such a cop-out
      this.room = room;

      this.players = players;
      this.size = maxSize;
      this.roomCode = roomCode

      this.turnsSinceEmptyDeck = 0;

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

      // also need to attach all the event listeners
      Object.values(this.players).forEach(socket => {
        this.addListeners(socket)
      })

      // let's set first player to go
      this.currentPlayerIdx = 0;
      this.currentHandIdx = 0;

      // everyone gets some cards
      this.dealHands();

      // assign hand Idxs
      this.assignIdxs();

      // make AI players to account for everyone minus 1
      this.generateAI();

      // and let everyone know what's going on
      this.sendGameInfo();

    }

    generateAI() {
      const numMaxAI = this.size - 1;
      const numPlayers = Object.keys(this.players).length;
      this.ai = Array(numMaxAI).fill(1).map(() => generateAI());
      const numAI = this.size - numPlayers;
      // set the ai's hand to the correct one
      for (let i = 0; i < numAI; i++) {
        // if size=2, 1 player, then ai should have hand of [1]
        this.ai[i].data.handIdx = numPlayers + i;
      }
    }


    addMessage(message, from = null) {
      this.room.addMessage(message, from)
    }

    // gets the userData for current player. used to send to players
    currentPlayerData() {
      return this.getPlayerDataForHandIdx(this.currentHandIdx)
    }

    // returns true if it is player's turn. false otherwise
    isCurrentTurnFor(player) {
      return player.data.handIdx === this.currentHandIdx
    }

    // advances play to the next player
    // responsible for sending out updates about everything!
    // also responsible for letting AI play
    nextPlayer() {
      this.currentHandIdx += 1;
      this.currentHandIdx = this.currentHandIdx % this.size;
      this.sendGameInfo();
      const nextPlayer = this.getPlayerForHandIdx(this.currentHandIdx)
      if (nextPlayer.data.isAI) {
        this.AIMove()
      }
    }

    // TODO make this smarter.
    // but this works right nows
    AIMove() {
      const ai = this.getPlayerForHandIdx(this.currentHandIdx)
      this.playCard(ai, { idx: 0 })
    }

    // will search for .data.id within players and ai
    findSocketByPlayerId(playerId) {
      const pred = player => player.data.id === playerId
      let player = Object.values(this.players).find(pred)
      if (player === undefined) {
        player = this.ai.find(pred)
      }
      return player
    }

    // attach all the needed listeners to one socket
    addListeners(player) {
      player.on('game_give_info', data => this.giveInfo(player, data))
      player.on('game_play_card', data => this.playCard(player, data))
      player.on('game_discard', data => this.discard(player, data))
    }
    // remove yada yada
    removeListeners(player) {
      player.removeAllListeners('game_give_info')
      player.removeAllListeners('game_play_card')
      player.removeAllListeners('game_discard')
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
      const cards = this.hands[infoSocket.data.handIdx];
      const wantedCard = cards[cardIdx];

      // curried fn. also assume color initially
      let pred = isSameColor(wantedCard)
      if (type === 'value') {
        pred = isSameValue(wantedCard)
      }
      // this will return the original card which is perfect
      const matchingCards = cards.filter(pred);

      // so for each card that matches the original (including the original)
      // we'll set the known "types" to an array of the orginal's type
      // type could mean color or value depending on what the user selected
      // would need a check for negation if decide to add then
      // and then filter out instead of just setting
      matchingCards.forEach(card => card.known[type + 's'] = [card[type]])

      this.addMessage(`${player.data.name} revealed all the ${wantedCard[type]}s in ${infoSocket.data.name}'s hand.`)

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
      const cards = this.hands[player.data.handIdx];
      const card = cards.splice(idx, 1)[0];
      cards.push(...this.dealCards(1))
      return card;
    }

    // game over when no fuse left or too many turns when deck is empty
    // changes state where needed and sends out events
    // this also assumes it's only called once per turn
    checkGameOver() {
      if (this.tokens.fuse.current === 0) {
        this.issueGameOver()
        return true;
      }
      if (this.deck.length === 0) {
        this.turnsSinceEmptyDeck += 1
      }
      if (this.turnsSinceEmptyDeck === this.size + 1) {
        this.issueGameOver()
        return true
      }

      return false
    }

    issueGameOver() {
      // remove listeners so game doesn't get confused later
      Object.values(this.players).forEach(socket => {
        this.removeListeners(socket)
        delete socket.data.handIdx
      })
      const score = Object.values(this.field).reduce((acc, cur) => acc + cur, 0)

      this.addMessage(`Game over! Score: ${score}/25`)

      // and let's let the room handle everything
      this.room.setToPregameState()
    }

    // remove will swap a player to AI and keep playing
    removePlayer(socket) {
      this.removeListeners(socket)
      delete this.players[socket.id]

      // if no more players, then don't bother with rest
      // game will close shortly
      if (Object.keys(this.players) === 0) {
        return
      }

      const unusedAI = this.ai.find(ai => ai.data.handIdx === -1)

      const handIdx = socket.data.handIdx
      delete socket.data.handIdx
      unusedAI.data.handIdx = handIdx

      this.addMessage(`${socket.data.name} left and got replaced by a ${unusedAI.data.name}`)
      // incase the player that left didn't play their turn
      if (this.isCurrentTurnFor(unusedAI)) {
        this.AIMove()
      } else {
        this.sendGameInfo()
      }
    }
    // swap will change a spe ctator to a player and remove the original player
    swapPlayers(removing, adding) {
      const handIdx = removing.data.handIdx
      delete removing.data.handIdx
      adding.data.handIdx = handIdx

      this.removeListeners(removing)
      this.addListeners(adding)

      this.addMessage(`${removing.data.name} left and got replaced by ${adding.data.name}`)
      this.sendGameInfo()
    }

    // add player will swap an AI to a player
    addPlayer(socket) {
      const playingAI = this.ai.find(ai => ai.data.handIdx > -1)
      const handIdx = playingAI.data.handIdx
      playingAI.data.handIdx = -1
      socket.data.handIdx = handIdx
      this.addListeners(socket)
      this.sendGameInfo()
    }

    dealHands() {
      const numCards = initialHandCount(this.size);
      this.hands = Array(this.size).fill(0).map(() => this.dealCards(numCards));
    }

    // this will deal an empty set if no more cards which is ok!
    dealCards(n) {
      return this.deck.splice(0, n)
    }

    // each player will have a hand assigned to them via an index
    // each turn, we'll check if the hand has a player, if they do, it's a player
    // if not, we'll know it's an ai and play for them
    assignIdxs() {
      Object.values(this.players).forEach((socket, idx) => {
        socket.data.handIdx = idx;
      })
    }

    sendGameInfo() {
      this.sendPublicGameInfo();
      this.sendPrivateGameInfo();
      this.sendSpectatorGameInfo();
    }

    sendPublicGameInfo() {
      io.to(this.roomCode).emit('game_public_info', this.publicGameInfo())
    }

    publicGameInfo() {
      return {
        tokens: this.tokens,
        field: this.field,
        graveyard: this.graveyard,
        deck: this.deck.length,
        currentPlayer: this.currentPlayerData(),
      }
    }

    sendPrivateGameInfo() {
      const privateInfo = this.privateGameInfo();
      Object.keys(privateInfo).forEach(socketId => {
        const playersInfo = privateInfo[socketId];
        io.to(socketId).emit('game_private_info', playersInfo);
      })
    }

    // get an object of all playerId -> cards they see
    privateGameInfo() {
      return Object.values(this.players).reduce((acc, socket) => ({
        ...acc,
        [socket.id]: this.privateGameInfoForPlayer(socket)
      }), {})
    }

    getPlayerForHandIdx(idx) {
      const players = Object.values(this.players)
      let player = players.find(p => p.data.handIdx === idx)
      if (player === undefined) {
        player = this.ai.find(ai => ai.data.handIdx === idx)
      }
      return player;
    }

    getPlayerDataForHandIdx(idx) {
      const player = this.getPlayerForHandIdx(idx)
      return getUserData(player)
    }

    // get an array of the cards the player will be able to see
    privateGameInfoForPlayer(player) {
      return this.hands.map((cards, idx) => {
        const current = this.getPlayerDataForHandIdx(idx)
        if (player.data.id === current.id) {
          // this is done to prevent client from knowing exactly what card it is
          // by looking at socket stuff
          cards = cards.map(card => cardMaker('grey', '?', card.known.values, card.known.colors))
        }
        return {
          ...current,
          cards,
        };
      })
    }
    sendSpectatorGameInfo() {
      // this fn could be done with a spectator-only room
      // but currently, there is no book-keeping for that currently
      // so just iterating over peeps should be fine?
      const data = this.spectatorInfo()
      Object.keys(this.room.spectators).forEach(socket => {
        io.to(socket).emit('game_private_info', data)
      })
    }
    spectatorInfo() {
      const dummyPlayer = {
        data: { id: -1 }
      }
      // this could let us conceal all the hands essentially so if the spectator joins in, no cheating will happen
      // right now, we are sending the full hands to the player
      // makes for better viewing?
      const data = this.privateGameInfoForPlayer(dummyPlayer)
      return data
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
