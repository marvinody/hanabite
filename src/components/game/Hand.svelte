<script>
  export let cards = [];
  export let id = "";
  export let name = "";

  import { self, game } from "../../stores/";
  import PlayerCard from "./PlayerCard.svelte";
</script>

<style>
  .hand {
    display: flex;
    flex-direction: column;
    padding-top: 30px;
    border-top: 1px solid black;
  }

  .name.self {
    font-weight: bold;
  }
  .name.self::after {
    margin-left: 10px;
    content: "(you)";
  }

  .cards {
    display: flex;
    justify-content: space-around;
  }
  .cards > div {
    cursor: pointer;
  }
  .chevron {
    opacity: 0;
  }
  .chevron.active {
    opacity: 1;
  }
</style>

<div class="hand">
  <div class="cards">
    {#each cards as { color, value }, idx (idx)}
      <PlayerCard {color} {value} {id} {idx} />
    {/each}
  </div>
  <div class="name" class:self={$self.id === id}>
    <i
      class="fa fa-chevron-right chevron"
      class:active={$game.currentPlayer.id === id} />
    {name}
  </div>
</div>
