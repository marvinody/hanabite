<script>
  import { room, self, game } from "../stores";
  import Chat from "./Chat";
  import Field from "./game/Board.svelte";

  $: ({ field, tokens } = $game);
</script>

<style>

</style>

<div class="columns">
  <div class="column">
    {#if !$game.loaded}
      <div>Loading...</div>
    {:else}
      <div class="game">
        <Field {field} {tokens} />
      </div>
    {/if}
  </div>
  <Chat />
</div>
