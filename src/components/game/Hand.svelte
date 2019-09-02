<script>
  export let cards = [];
  export let id = "";
  export let name = "";

  import { self } from "../../stores";
  $: console.log($self, id);
  import Card from "./Card.svelte";
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
</style>

<div class="hand">
  <div class="cards">
    {#each cards as { color, value }}
      <Card {color} {value} />
    {/each}
  </div>
  <div class="name" class:self={$self.id === id}>{name}</div>
</div>
