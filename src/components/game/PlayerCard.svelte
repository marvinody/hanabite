<script>
  export let id = "";
  export let color = "grey";
  export let value = "?";

  import { self, game } from "../../stores";
  import Card from "./Card.svelte";
</script>

<style>
  .player-card:hover {
    margin-top: 0px;
  }
  .player-card {
    margin-top: 20px;
    cursor: pointer;
    transition: margin-top 0.3s ease-in-out;
  }
</style>

<div class:player-card={$game.currentPlayer.id === $self.id}>
  <Card {color} {value} />
</div>
