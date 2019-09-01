<script>
  import Card from "./Card.svelte";
  import Tokens from "./Tokens.svelte";

  export let field = {};
  export let tokens = {};
  const { info, fuse } = tokens;
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
    {#each Object.entries(field) as [color, value] (color)}
      <Card {color} {value} />
    {/each}
  </div>
  <Tokens {info} {fuse} />

</div>
