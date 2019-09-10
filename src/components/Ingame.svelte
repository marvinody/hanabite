<script>
  import { game, hands } from "../stores/";
  import Chat from "./Chat";
  import Field from "./game/Board.svelte";
  import Hands from "./game/Hands.svelte";

  $: loaded = $game.loaded && $hands.loaded;
</script>

<style>

</style>

<div class="columns">
  <div class="column">
    <div class="game">
      {#if !loaded}
        <div>Loading...</div>
      {:else}
        <Field />
      {/if}

      {#if !loaded}
        <div>Loading Hands...</div>
      {:else}
        <Hands />
      {/if}
    </div>
  </div>
  <Chat />
</div>
