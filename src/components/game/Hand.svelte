<script>
  export let cards = [];
  export let id = "";
  export let name = "";

  import Card from "./Card.svelte";
</script>

<style>
  .hand {
    display: flex;
    justify-content: space-around;
  }
</style>

<div class="hand" alt="{name}'s cards">
  {#each cards as { color, value }}
    <Card {color} value={value === 0 ? '' : value} />
  {/each}
</div>
