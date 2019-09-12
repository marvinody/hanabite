<style>
  h1,
  h2 {
    text-align: center;
    margin: 0 auto;
  }
  h1 {
    font-size: 2.8em;
  }
  h2 {
    font-size: 1.5em;
    margin: 0 0 0.5em 0;
  }
  p {
    font-size: 1.2em;
    margin-bottom: 0.3em;
  }
  ul {
    margin-left: 20px;
  }
  li {
    list-style-type: circle;
  }
</style>

<svelte:head>
  <title>Rules</title>
</svelte:head>
<h1>How to play Hanabi</h1>

<p>
  TL;DR, you have colors on the field and then you need to play cards in a
  certain order, the catch being you can't see your own cards but you can see
  all the other's players.
</p>

<h2>
  Taking straight from
  <a href="https://en.wikipedia.org/wiki/Hanabi_(card_game)">Wiki</a>
</h2>
<p>
  The Hanabi deck contains cards in five suits (white, yellow, green, blue, and
  red): three 1's, two each of 2's, 3's, and 4's, and one 5. The game begins
  with 8 available information tokens and 3 fuse tokens. To start the game,
  players are dealt a hand containing five cards (four for 4 or 5 players). As
  in Indian poker, players can see each other's cards but they cannot see their
  own. Play proceeds around the table; each turn, a player must take one of the
  following actions:
</p>
<ul>
  <li>
    <strong>Give information:</strong>
    The player points out the cards of either a given number or a given suit in
    the hand of another player (examples: "This card is your only red card,"
    "These two cards are your only 3's"). The information given must be complete
    and correct. Giving information consumes one information token.
  </li>
  <li>
    <strong>Discard a card:</strong>
    The player chooses a card from his hand and adds it to the discard pile,
    then draws a card to replace it. The discarded card is out of the game and
    can no longer be played. Discarding a card replenishes one information
    token.
  </li>
  <li>
    <strong>Play a card:</strong>
    The player chooses a card from his hand and attempts to add it to the cards
    already played. This is successful if the card is a 1 in a suit that has not
    yet been played, or if it is the next number sequentially in a suit that has
    been played. Otherwise a fuse token is consumed and the misplayed card is
    discarded. Successfully playing a 5 of any suit replenishes one information
    token. Whether the play was successful or not, the player draws a
    replacement card.
  </li>
</ul>
<p>
  Players lose immediately if all fuse tokens are gone, and win immediately if
  all 5's have been played successfully. Otherwise play continues until the deck
  becomes empty, and for one full round after that. At the end of the game, the
  values of the highest cards in each suit are summed, resulting in a total
  score out of a possible 25 points.
</p>
