<script>
  import Card from "./Card.svelte";
  import Tokens from "./Tokens.svelte";

  import { game } from "../../stores";
  $: field = Object.entries($game.field);
</script>

<style>
  .field {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
</style>

<div class="board">
  <div class="field">
    {#each field as [color, value] (color)}
      <Card {color} {value} />
    {/each}
  </div>
  <Tokens />

</div>
