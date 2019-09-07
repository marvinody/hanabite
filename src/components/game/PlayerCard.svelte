<script>
  export let id = "";
  export let idx = -1;
  export let color = "grey";
  export let value = "?";
  export let known = {
    colors: [],
    values: []
  };

  import { self, game, selectedCard, toggleCardSelect } from "../../stores/";
  import Card from "./Card.svelte";

  $: selected = idx === $selectedCard.idx && id === $selectedCard.id;
  $: playable = $game.currentPlayer.id === $self.id;
  $: selfHand = id === $self.id;
  $: {
    // handle setting colors to a correct color if player should know it
    if (selfHand && known.colors.length === 1) {
      color = known.colors[0];
    }
    if (selfHand && known.values.length === 1) {
      value = known.values[0];
    }
  }
</script>

<style>
  .player-card {
    margin-top: 20px;
    cursor: pointer;
    transition: margin-top 0.3s ease-in-out;
  }
  .playable:hover {
    margin-top: 10px;
  }
  /* the double class is needed for specificity because hover has level 2. so by doubling class we can also achieve level 2 */
  .selected.selected {
    margin-top: 0px;
  }
</style>

<div
  class="player-card"
  class:playable
  class:selected
  on:click={() => playable && toggleCardSelect(id, idx)}>
  <Card {color} {value} />
</div>
